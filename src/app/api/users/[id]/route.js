import { dbConnect } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function PUT (req, {params}) {
    const { id } = params;

    try {
        // Connect to the database, update the user, and then disconnect.
        const client = dbConnect();
        const response = await client.query("UPDATE users SET verified = true WHERE id = $1 RETURNING *", [id]);
        client.end();

        // Return the user
        const updatedUser = response.rows[0];
        return NextResponse.json({
            user: updatedUser
        }, {
            status: 200
        });
    } catch (error) {
        return NextResponse.json({
            error: error
        }, {
            status: 500
        });
    }
}

export async function PATCH (req, {params}) {
    const { id } = params;
    const { password } = await req.json();

    try {
        // Connect to the database, update the user, and then disconnect.
        const client = dbConnect();
        const response = await client.query("UPDATE users SET password = $1 WHERE id = $2 RETURNING *", [password, id]);
        client.end();

        // Return the user
        const updatedUser = response.rows[0];
        return NextResponse.json({
            user: updatedUser
        }, {
            status: 200
        })
    } catch (error) {
        return NextResponse.json({
            error: error
        }, {
            status: 500
        });
    }
}