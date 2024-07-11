'use client';
import { useSession, signIn, signOut } from "next-auth/react";
import styles from "./header.module.css";

function Header () {

    const auth = {
        isAuth: false,
        name: null,
        email: null,
        roles: null
    };

    const { data: session } = useSession();
    if (session?.user) {
        auth.isAuth = true;
        auth.name = session.user.name;
        auth.email = session.user.email;
        auth.roles = session.user.roles;
    }

    return (
        <header className={styles.header}>
            <h1>Next Auth Tutorial</h1>
            <div className={styles.auth}>
                {
                    auth.isAuth ? (
                        <>
                            <p>Name: {auth.name}</p>
                            <p>Email: {auth.email}</p>
                            <p>Role: {auth.roles[0]}</p>
                            <button onClick={signOut}>Log Out</button>
                        </>
                    ) : (
                        <button className={styles.login} onClick={signIn}>Log In</button>
                    )
                }
            </div>
        </header>
    );
}

export default Header;