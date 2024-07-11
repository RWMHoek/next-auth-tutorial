'use client';
import { useEffect } from "react";
import { useState } from "react";
import Link from "next/link";

function UserList() {

    const [ users, setUsers ] = useState([]);
    const [ loading, setLoading ] = useState(true);
    const [ error, setError ] = useState(false);

    useEffect(() => {
        async function getUsers() {

            try {
                const response = await fetch('http://localhost:3000/api/users', {
                    method: 'GET'
                });
                const jsonResponse = await response.json();

                if (!response.ok) {
                    console.log(response, jsonResponse);
                }

                setUsers(jsonResponse.users);
                setLoading(false);
            } catch (error) {
                console.log(error);
                setError(error);
            }
        }

        getUsers();
    }, []);

    if(loading) {
        return (
            <p>
                Loading...
            </p>
        );
    } else {
        if (error) {
            return (
                <>
                    <h1>Something Went Wrong...</h1>
                    <p>Error information: {error}</p>
                </>
            );
        } else {
            return (
                <ul>
                    {users.map((user, index) => (
                        <li key={index}>
                            <Link href={`/user-management/${user.id}`}>{user.username}</Link>
                        </li>
                    ))}
                </ul>
            );
        }
    }
}

export default UserList;