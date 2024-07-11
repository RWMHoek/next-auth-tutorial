import { Client } from 'pg';


export function dbConnect() {
    // Create a new client.
    const client = new Client();

    // Try connecting to the database and return the client if successfull.
    try {
        client.connect();
        return client;
    // Log any errors to the console and then throw the error.    
    } catch (error) {
        console.log(error);
        throw new Error(error.message);
    }

}