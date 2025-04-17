import styles from '../Logo/Logo.module.css';
const Logo = ({ width = 100 }) => {
    return (
        <div className={styles.logo}>
            <img src="images/bestinfra.png" alt="Logo" width={width} className={styles.logo_bestinfra} />
        </div>
    );
};

export default Logo;
