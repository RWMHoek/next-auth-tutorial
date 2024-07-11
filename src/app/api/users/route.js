import { dbConnect } from "@/lib/db";
import { NextResponse } from "next/server";
import { sendVerificationEmail } from "@/lib/actions";

export async function GET (req) {
    try {
        // Connect to the database, insert the new user, and disconnect.
        const client = dbConnect();
        const { rows: users } = await client.query("SELECT id, username FROM users;");
        client.end();        

        // Return the user list.
        return NextResponse.json({
            users
        }, {
            status: 200
        });
    } catch (error) {
        // Log any errors to the console and return the error.
        console.log(error);

        return NextResponse.json({
            message: error.message,
            SQLState: error.code
        }, {
            status: 500
        })
    }

}

export async function POST (req) {
    const { username, password, email } = await req.json();

    try {
        // Connect to the database, insert the new user, and disconnect.
        const client = dbConnect();
        const response = await client.query("INSERT INTO users (username, password, email) VALUES ($1, $2, $3) RETURNING *;", [username, password, email]);
        client.end();

        // Retrieve the new user
        const newUser = response.rows[0];

        // Send verfication email
        const result = await sendVerificationEmail(newUser);
        console.log(result);

        // Return the new user
        return NextResponse.json({
            newUser: newUser
        }, {
            status: 201
        });
        
        // Log any errors to the console and return the error information.
    } catch (error) {
        console.log(error);

        return NextResponse.json({
            message: error.message,
            SQLState: error.code
        }, {
            status: error.status ? error.status : 500
        });
    }
}