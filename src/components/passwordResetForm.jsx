import styles from './passwordResetForm.module.css';
import { useState } from 'react';
import FormErrors from './FormErrors';
import { genSaltSync, hashSync } from 'bcrypt-ts';
import { useRouter } from 'next/navigation';

function PasswordResetForm ({userId}) {
    // Set up router for redirection
    const router = useRouter();

    // Set up state for form data, errors, and to keep track of which fields are visited.
    const [ data, setData ] = useState({
        password: "",
        confirmPassword: ""
    });

    const [ errors, setErrors ] = useState({
        password: [],
        confirmPassword: []
    });
    
    const [ visited, setVisited ] = useState({
        password: false,
        confirmPassword: false
    });

    function handleChange({target}) {
        const { name, value } = target;

        setData(prev => ({
            ...prev,
            [name]: value
        }));
    }

    function handleBlur({target}) {
        const { name, value } = target;

        // Update which fields have been visited.
        setVisited(prev => ({
            ...prev,
            [name]: true
        }));

        // Validate the data.
        validate(name, value);
    }

    async function handleSubmit(e) {
        e.preventDefault();

        // Check for any form errors and return if any are found.
        const valid = Object.values(errors).reduce((prev, curr) => prev && curr.length === 0, true);
        if (!valid) return;

        try {
            // Hash the password.
            const hashedPassword = hashSync(data.password, genSaltSync(10));

            // Submit an update request to the api.
            const response = await fetch(`http://localhost:3000/api/users/${userId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    password: hashedPassword
                })
            });
            const jsonResponse = await response.json();

            // Pass error to error handler
            if (!response.ok) {
                throw new Error(jsonResponse.error);
            }

            // Log the success response to the console and redirect to the log in page.
            console.log(jsonResponse.user);
            router.push('/login');

        } catch (error) {
            console.log(error);
        }
    }

    return (
        <form className={styles.form} action="submit" onSubmit={handleSubmit}>
            <h1>Choose a new password</h1>
            <input
                type='password'
                name='password'
                id='password'
                placeholder='Password'
                value={data.password}
                onChange={handleChange}
                onBlur={handleBlur}
            />
            <FormErrors errors={errors.password} />
            
            <input
                type='password'
                name='confirmPassword'
                id='confirmPassword'
                placeholder='Confirm Password'
                value={data.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
            />
            <FormErrors errors={errors.confirmPassword} />

            <input type="submit" value="Reset Password" />
        </form>
    );

    function validate(name, value) {
        let errors = [];

        // First check if the visited field is empty.
        if (!value) {
            errors.push("This field is required!");

        } else {
            // If not empty, in case it was the password field, validate the value.
            if (name === 'password') {
                if (value.length < 8) errors.push("Password must be at least 8 characters!");                                       // Check password length.
                if (!/[a-z]+/.test(value)) errors.push("Password must contain at least one lower case letter!");                    // Check whether password is formatted correctly.
                if (!/[A-Z]+/.test(value)) errors.push("Password must contain at least one upper case letter!");
                if (!/[0-9]+/.test(value)) errors.push("Password must contain at least one number!");
                if (!/[!#$%&*+,\-./:;><=?@[\]^_{|}~]+/.test(value)) errors.push("Password must contain at least one special character! The following special characters are allowed: !#$%&*+,-./\\:;><=?@[]^_{|}~.");
            }
            
            if (visited.password && visited.confirmPassword) {
                // If both fields have been visited, check whether the passwords match.
                if (data.password === data.confirmPassword) {
                    setErrors(prev => ({
                        ...prev,
                        confirmPassword: []
                    }));
                } else {
                    setErrors(prev => ({
                        ...prev,
                        confirmPassword: ["Passwords don't match!"]
                    }));
                }
            }
        } 

        // Update the errors state
        setErrors(prev => ({
            ...prev,
            [name]: errors
        }));
    }
}

export default PasswordResetForm;