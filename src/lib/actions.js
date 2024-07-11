'use server';
import { dbConnect } from './db';
// import nodemailer from "nodemailer";
import { MailtrapClient } from 'mailtrap';
import jwt from "jsonwebtoken";

const { BASE_URL, PORT } = process.env;

export async function getUserById(id) {
    // Connect to the database, try to retrieve the user, and then disconnect.
    const client = dbConnect();
    const response = await client.query("SELECT * FROM users WHERE id = $1", [id]);
    client.end();

    // Return the user if found, otherwise return null
    const user = response.rows[0];
    return user ? user : null;
}

export async function usernameExists(username) {
    // Connect to the database, try to retrieve the user, and then disconnect.
    const client = dbConnect();
    const response = await client.query("SELECT * FROM users WHERE username = $1", [username]);
    client.end();

    // Return true if a user was found and false otherwise.
    const user = response.rows[0];
    return user ? true : false;
}

export async function getUserByEmail(email) {

    try {
        // Connect to the database, try to retrieve the user, and then disconnect.
        const client = dbConnect();
        const response = await client.query("SELECT * FROM users WHERE email = $1", [email]);
        client.end();
    
        // Return false if no user was found, otherwise return the user.
        const user = response.rows[0];
        if (!user) return false;
        return user;
        
    } catch (error) {
        // Log any errors to the console and return false.
        console.log(error);
        return false;
    }
}

export async function emailExists(email) {
    // Connect to the database, try to retrieve the user, and then disconnect.  
    const client = dbConnect();
    const response = await client.query("SELECT * FROM users WHERE email = $1", [email]);
    client.end();

    // Return true if a user was found and false otherwise.
    const user = response.rows[0];
    return user ? true : false;
}

function getMTClient() {
    return [
        new MailtrapClient({
            endpoint: "https://send.api.mailtrap.io/",
            token: "a52f931f4a3ad218b81415457a5be501"
        }),
        {
            email: "noreply@robhoek.nl",
            name: "RobHoek.nl"
        }
    ];
}

export async function sendVerificationEmail(newUser) {
    // Create a token
    const token = jwt.sign({ userId: newUser.id }, process.env.VERIFY_SECRET, { expiresIn: '24h' });

    // Send verification email
    const [ client, MTFrom ] = getMTClient();

    const result = await client.send({
        from: MTFrom,
        to: [{email: newUser.email}],
        template_uuid: "fb8240c8-b306-4923-8e86-a995146ad7b4",
        template_variables: {
            "username": newUser.username,
            "url": `${BASE_URL}:${PORT}/verify/${token}`
        }
    });

    return result;
}

export async function sendPasswordResetEmail(user) {
    // Create a token
    const token = jwt.sign({ data: user.id, exp: Math.floor(Date.now() / 1000) + 60 * 10 }, process.env.RESET_SECRET);

    // Send reset email
    const [ client, MTFrom ] = getMTClient();

    const result = await client.send({
        from: MTFrom,
        to: [{ email: user.email }],
        template_uuid: "3c1abc8e-80b7-44dd-aa60-d364169e6548",
        template_variables: {
            "username": user.username,
            "url": `${BASE_URL}:${PORT}/reset-password/${token}`
        }
    });

    return result;
}

export async function verifyToken(token) {
    // Verify the token and decode the userId.
    try {
        const { data, exp } = jwt.verify(token, process.env.RESET_SECRET);
        if (exp < Date.now() / 1000) {
            return { userId: null, error: "Expired"};
        }

        return { userId: data, error: null };

    // Return any errors that occur
    } catch (error) {
        console.log(error);
        return { userId: null, error: error.message };
    }
}