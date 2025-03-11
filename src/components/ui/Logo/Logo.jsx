import styles from '../Logo/Logo.module.css';
const Logo = ({ width = 170 }) => {
    return (
        <div className={styles.logo}>
            <img src="images/logo.png" alt="Logo" width={width} />
        </div>
    );
};

export default Logo;
