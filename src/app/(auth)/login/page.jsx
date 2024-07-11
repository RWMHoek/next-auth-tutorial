'use client'
import styles from "./login.module.css";
import { useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

function Login () {

    // Set up router
    const router = useRouter();

    // Check whether user is already logged in and redirect to the homepage if so
    const { data: session } = useSession()
    if (session?.user) router.push('/');

    // Set up state for form data and error messages
    const [ formData, setFormData ] = useState({
        username: "",
        password: ""
    });
    const [ errorMsg, setErrorMsg ] = useState("");

    // Change handler for form data
    function handleChange({target}) {
        const {name, value} = target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    }

    // Submit handler for form data
    async function handleSubmit(e) {
        e.preventDefault();

        try {
            const response = await signIn('credentials', {
                username: formData.username,
                password: formData.password
            });

            if (!response.error) {          // If successfully logged in, redirect to the home page
                router.push("/");
            } else {                        // If log in was unsuccessfull, show error message
                setErrorMsg(response.error);
            }
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <>
            <form className={styles.form} action="submit" onSubmit={(e) => handleSubmit(e)}>
                <h1>Log in</h1>
                <input
                    className={styles.usernameInput}
                    type="text"
                    name="username"
                    id="username"
                    placeholder="Username"
                    value={formData.username}
                    onChange={handleChange}
                />
                <input
                    className={styles.passwordInput} 
                    type="password"
                    name="password"
                    id="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                />

                <input className={styles.submitButton} type="submit" value="Log In" />

                {errorMsg && (<p className={styles.error}>{errorMsg}</p>)}
            </form>
            <Link href="/register">Register</Link><br />
            <Link href="/reset-password">Forgot Password?</Link>
        </>
    );
}

export default Login;