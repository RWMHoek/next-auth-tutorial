import jwt from "jsonwebtoken";

async function Verify({params}) {
    const { token } = params;

    try {
        // Decode the token
        const userId = await jwt.verify(token, process.env.VERIFY_SECRET, (error, data) => {
            if (error) {
                console.log(error);
                if (error.name === "TokenExpiredError") {
                    return (
                        <p>
                            Your verification link has expired!
                        </p>
                    );
                }
            } else {
                return data.userId;
            }
        });

        // Send request for database update to verify user
        const response = await fetch(`${process.env.BASE_URL}:${process.env.PORT}/api/users/${userId}`, {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                userId: userId
            })
        });
        const jsonResponse = await response.json();

        if(!response.ok) {
            throw new Error(jsonResponse.message);
        }

        return(
            <p>
                Thank you {jsonResponse.user.username}. Your account is now verified!
            </p>
        );
        
    } catch (error) {
        console.log(error);
        return(
            <p>Something went wrong</p>
        );
    }
}

export default Verify;