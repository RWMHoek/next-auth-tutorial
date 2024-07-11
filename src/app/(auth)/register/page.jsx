'use client';
import { useState } from 'react';
import styles from './register.module.css';
import FormErrors from '@/components/FormErrors';
import { genSaltSync, hashSync } from 'bcrypt-ts';
import { usernameExists, emailExists } from '@/lib/actions';
import { useRouter } from 'next/navigation';

function Register () {

    // Set up the router
    const router = useRouter();

    // Set up state for the form data, form errors, and to keep track of which fields have been visited.
    const [ data, setData ] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [validationErrors, setValidationErrors ] = useState({
        username: [],
        email: [],
        password: [],
        confirmPassword: [],
    });

    const [ blurred, setBlurred ] = useState({
        password: false,
        confirmPassword: false
    });

    // Handle form submission
    async function handleSubmit(e) {
        e.preventDefault();

        // Check for any form errors and return if any are found.
        const valid = Object.values(validationErrors).reduce((prev, curr) => prev && curr.length === 0, true);
        if (!valid) return;

        // Continue if no errors are found.
        try {
            const hashedPassword = hashSync(data.password, genSaltSync(10));        // Hash the password.
            
            // Post the new user data to the database.
            const response = await fetch("http://localhost:3000/api/users", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: data.username,
                    email: data.email,
                    password: hashedPassword
                })
            });
            const jsonResponse = await response.json();

            // Handle any errors during the fetch process.
            if(!response.ok) {
                throw new Error(jsonResponse.message)
            }

            // Log the new user to the console and redirect to the log in page upon successfull registration.
            console.log(jsonResponse.newUser);
            router.push('/login');
            
        } catch (error) {
            console.log(error);
        }
    }

    // Change handler for form data.
    function handleChange({target}) {
        const { name, value } = target;
        setData(prev => ({
            ...prev,
            [name]: value
        }));
    }

    // Handle data from visited fields.
    function handleBlur({target}) {
        const { name, value } = target;

        // Keep track of which of the password fields have been visited.
        if (name === "password" || name === "confirmPassword") {
            setBlurred(prev => ({
                ...prev,
                [name]: true
            }));
        }

        // Validate data.
        validator(name, value);
    }

    
    return (
        <form className={styles.form} action="submit" onSubmit={handleSubmit}>
            <h1>Register</h1>

            <input
                type="text"
                name="username"
                id="username"
                placeholder="Username"
                value={data.username}
                onChange={handleChange}
                onBlur={handleBlur}
                />
            <FormErrors errors={validationErrors.username}></FormErrors>

            <input
                type="email"
                name="email"
                id="email"
                placeholder="Email Address"
                value={data.email}
                onChange={handleChange}
                onBlur={handleBlur}
                />
            <FormErrors errors={validationErrors.email}></FormErrors>

            <input
                type="password"
                name="password"
                id="password"
                placeholder="password"
                value={data.password}
                onChange={handleChange}
                onBlur={handleBlur}
                />
            <FormErrors errors={validationErrors.password}></FormErrors>

            <input
                type="password"
                name="confirmPassword"
                id="confirmPassword"
                placeholder="confirmPassword"
                value={data.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                />
            <FormErrors errors={validationErrors.confirmPassword}></FormErrors>

            <input type="submit" value="Register" />
        </form>
    );

    // Validate form data
    async function validator(name, value) {
        let errors = []
        
        // All fields are required.
        if (!value) {
            errors.push("This field is required!");
        } else {

            // Check field specific rules
            switch (name) {
                case "username":
                    const usernameCheck = await usernameExists(value);
                    if (usernameCheck) errors.push("Username already exists!");                                                         // Check whether username is available.
                    if (value.length < 8 || value.length > 30) errors.push("Username must be between 8 and 30 characters long!");       // Check username length.
                    break;
                case "email":
                    const emailCheck = await emailExists(value);
                    if (emailCheck) errors.push("Email address already used!");                                                         // Check whether email address has been used.
                    if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value)) errors.push("Not a valid email address!");                     // Check whether email is formatted correctly.
                    break;
                case "password":
                    if (value.length < 8) errors.push("Password must be at least 8 characters!");                                       // Check password length.
                    if (!/[a-z]+/.test(value)) errors.push("Password must contain at least one lower case letter!");                    // Check whether password is formatted correctly.
                    if (!/[A-Z]+/.test(value)) errors.push("Password must contain at least one upper case letter!");
                    if (!/[0-9]+/.test(value)) errors.push("Password must contain at least one number!");
                    if (!/[!#$%&*+,\-./:;><=?@[\]^_{|}~]+/.test(value)) errors.push("Password must contain at least one special character! The following special characters are allowed: !#$%&*+,-./\\:;><=?@[]^_{|}~.");
                    break;
                default:
                    break;
            }
            
            // Once both password fields have been visited, check whether passwords match.
            if (blurred.password && blurred.confirmPassword) {
                if(data.password !== data.confirmPassword) {
                    setValidationErrors(prev => ({
                        ...prev,
                        confirmPassword: ["Passwords don't match!"]
                    }));
                } else {    // Remove the warning once passwords match.
                    setValidationErrors(prev => ({
                        ...prev,
                        confirmPassword: []
                    }));
                }
            }
        }
        
        // Set any error messages for errors found during the validation process.
        setValidationErrors(prev => ({  
            ...prev,
            [name]: errors
        }));
    }
}

export default Register;