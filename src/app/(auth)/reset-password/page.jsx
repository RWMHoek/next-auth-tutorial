'use client';
import { useState } from 'react';
import styles from './forgotPassword.module.css';
import { getUserByEmail, sendPasswordResetEmail } from '@/lib/actions';

function ForgotPassword() {

    const [ email, setEmail ] = useState("");
    const [ message, setMessage ] = useState("");

    function handleChange({target}) {
        setEmail(target.value);
    }

    async function handleSubmit(e) {
        e.preventDefault();

        const user = await getUserByEmail(email);
        if (user) {
            console.log(user);
            const result = await sendPasswordResetEmail(user);
        }

        setMessage("An email has been sent to the provided email address with a password-reset link. Please be sure to check your spam folder if you don't receive it shortly.");
    }

    return (
        <form className={styles.form} action="submit" onSubmit={handleSubmit}>
            <h1>Send Password Reset Link</h1>
            <input
                type="email"
                name="email"
                id='email'
                placeholder='Email Address'
                value={email}
                onChange={handleChange}
            />

            <input type="submit" value="Reset Password" />
            {message && (<p className={styles.message}>{message}</p>)}
        </form>
    );
}

export default ForgotPassword;