'use client';
import { useSession } from "next-auth/react";

function Dashboard () {

    const auth = {
        isAuth: false,
        name: null,
        email: null,
        roles: []
    };

    const { data: session } = useSession();
    if (session?.user) {
        auth.isAuth = true;
        auth.name = session.user.name;
        auth.email = session.user.email;
        auth.roles = session.user.roles;
    }

    return (
        <>
            <p>Dashboard</p>
            {
                auth.isAuth ? (
                    <>
                        {auth.roles.map((role, index) => (
                            <p key={index}>{role}</p>
                        ))}
                    </>
                ) : (
                    <>No role found</>
                )
            }
        </>
    );
}

export default Dashboard;