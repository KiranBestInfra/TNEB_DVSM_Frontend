import React from 'react';
import styles from '../Buttons/Buttons.module.css';

const Buttons = ({
    label,
    onClick,
    type = 'button',
    disabled = false,
    variant = 'primary',
}) => {
    return (
        <button
            type={type}
            className={`${styles.button} ${styles[variant]}`}
            onClick={onClick}
            disabled={disabled}>
            <span className={styles.label}>{label}</span>
        </button>
    );
};

export default Buttons;
