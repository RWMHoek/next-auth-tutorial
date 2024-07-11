'use client';
import styles from './resetPassword.module.css';
import PasswordResetForm from '@/components/passwordResetForm'
import { verifyToken } from '@/lib/actions';
import { useEffect, useState } from 'react';

function ResetPassword({params}) {
    const { token } = params;
    const [ userId, setUserId ] = useState(null);
    const [ loading, setLoading ] = useState(true);
    const [ error, setError ] = useState(null);

    useEffect(() => {

        async function verify() {
            // Verify the token.
            const result = await verifyToken(token);
            console.log(result);
            // If token is not verified, set the error state
            if (result.error) {
                setError(result.error);

            } else {
                // If the token is verified, set the userId in the state.
                setUserId(result.userId);
            }

            // Set the loading state to false.
            setLoading(false);
        }

        verify();
    }, []);

    
    if (loading) {
        return (
            <>
                <h1>Verifying Reset Token...</h1>
                <p>This shouldn't take long</p>
            </>
        )
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
                <PasswordResetForm userId={userId} />
            );
        }
    }
    
    
}

export default ResetPassword;