'use client';
import styles from "./FormErrors.module.css";

function FormErrors({errors}) {

    if (errors.length !== 0) {
        return (
            <ul className={styles.list}>
                {
                    errors.map((error, index) => (
                        <li key={index}>{error}</li>
                    ))
                }
            </ul>
        );
    } else {
        return (<div></div>);
    }
}

export default FormErrors;