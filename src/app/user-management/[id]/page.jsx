'use client';

import { useEffect } from "react";
import { getUserById } from '@/lib/actions';
import { useLoadingErrorState } from '@/lib/hooks';

function UserPage({ params }) {

    const { id } = params;

    const [ user, setUser, loading, setLoading, error, setError ] = useLoadingErrorState({
        id: 0,
        username: "",
        email: "",
        createdAt: "",
        verified: false
    });

    useEffect(() => {

        async function getUser(id) {

            const response = await getUserById(id);

            if (!response) {
                setError("No user found!");
            }

            setUser(prev => ({
                ...prev,
                id: response.id,
                username: response.username,
                email: response.email,
                createdAt: response.created_at.toString(),
                verified: response.verified.toString()
            }));
            setLoading(false);
        }

        getUser(id);

    }, [])

    if (loading) {
        return (
            <p>Loading...</p>
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
                <>
                    <h1>{user.username}</h1>
                    <p>Email Address: {user.email}</p>
                    <p>Created at: {user.createdAt}</p>
                    <p>Verified: {user.verified}</p>
                </>
            );
        }
    }
}

export default UserPage;