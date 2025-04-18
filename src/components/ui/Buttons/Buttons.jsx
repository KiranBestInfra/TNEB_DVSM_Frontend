import React from 'react';
import styles from '../Buttons/Buttons.module.css';

const Buttons = ({
    label,
    onClick,
    type = 'button',
    disabled = false,
    variant = 'primary',
    className,
}) => {
    return (
        <button
            type={type}
            className={`${styles.button} ${styles[variant]} ${className || ''}`}
            onClick={onClick}
            disabled={disabled}>
            <span className={styles.label}>{label}</span>
        </button>
    );
};

export default Buttons;