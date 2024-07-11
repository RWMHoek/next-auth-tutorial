import nextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { dbConnect } from "@/lib/db";
import { compareSync } from "bcrypt-ts";

const authOptions = {
    secret: process.env.NEXTAUTH_SECRET,
    pages: {signIn: '/login'},
    callbacks: {
        async signIn({user}) {
            // Connect to the database, retrieve all roles for the user, then disconnect.
            const client = dbConnect();
            const result = await client.query('SELECT * FROM users_roles WHERE user_id = $1', [user.id]);
            client.end();
            // Stop sign when user has no roles
            if (result.rowCount === 0) {
                console.log("no roles");
                return '/no-roles';
            } else {
                return true;
            }
        },
        async jwt({token, user}) {

            if (user) {
                // Connect to the database, retrieve all roles for the user, then disconnect.
                const client = dbConnect();
                const result = await client.query('SELECT roles.name FROM users_roles JOIN roles ON users_roles.role_id = roles.id WHERE user_id = $1', [user.id]);
                client.end();

                
                // Assign the roles to the token.
                const roles = result.rows.map(role => role.name);
                // if (roles.length === 0) {
                //     throw new Error("No roles assigned to this user! Contact your system administrator.");
                // }
                token.id = user.id
                token.roles = roles;
            }
            
            return token;
        },
        async session({ session, token }) {
            // Assign the roles to the user
            session.user.id = token.id
            session.user.roles = token.roles;

            return session;
        }
    },
    providers: [
        Credentials({
            credentials: {
                username: { label: "Username", type: "text", placeholder: "Username"},
                password: { label: "Password", type: "password", placeholder: "Password"}
            },
            authorize: async (credentials) => {
                const { username, password } = credentials;
                
                try {
                    // Retrieve the user from the database.
                    const client = dbConnect();
                    const response = await client.query("SELECT * FROM users WHERE username = $1;", [username]);
                    client.end();
                    const user = response.rows[0];

                    // Throw an error if no user was found.
                    if (!user) {
                        throw new Error("User not found!");
                    }

                    // Throw an error if the user hasn't verified their email address yet.
                    if (!user.verified) {
                        throw new Error("User not verified!");
                    }

                    // If the user was found, check the password and throw an error if it is not correct.
                    const passwordsMatch = compareSync(password, user.password);
                    if (!passwordsMatch) {
                        throw new Error("Password incorrect!");
                    }

                    // If the user doesn't have a name, copy the username into the name. Then return the user.
                    if(!user.name) user.name = user.username;
                    return user;

                } catch (error) {
                    throw new Error(error.message);
                }

            }
        }),
        GithubProvider({
            clientId: process.env.GITHUB_ID,
            clientSecret: process.env.GITHUB_SECRET
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET
        })
    ]
}

const handler = nextAuth(authOptions);

export { handler as GET, handler as POST };