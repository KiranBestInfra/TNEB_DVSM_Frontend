import React from 'react';
import styles from './Loader.module.css';

const Loader = () => {
    return (
        <div className={styles.loader_container}>
            <div className={styles.spinner}>
                <span className={styles.visually_hidden}>Loading...</span>
            </div>
        </div>
    );
};

export default Loader;
