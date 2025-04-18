import React from 'react';
import styles from '../Buttons/Buttons.module.css';

const Buttons = ({
    label,
    onClick,
    type = 'button',
    disabled = false,
    variant = 'primary',
    className,
    icon,
    iconPosition = 'left',
    alt,
}) => {
    return (
        <button
            type={type}
            className={`${styles.button} ${styles[variant]} ${className || ''} ${!label ? styles.icon_only : ''}`}
            onClick={onClick}
            disabled={disabled}
            title={alt}>
            {icon && iconPosition === 'left' && (
                <img src={icon} alt={alt} className={styles.icon} />
            )}
            {label && <span className={styles.label}>{label}</span>}
            {icon && iconPosition === 'right' && (
                <img src={icon} alt={alt} className={styles.icon} />
            )}
        </button>
    );
};

export default Buttons;
