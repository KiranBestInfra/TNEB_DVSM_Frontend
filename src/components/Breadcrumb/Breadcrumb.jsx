import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Breadcrumb.module.css';

const Breadcrumb = ({ items }) => {
  return (
    <nav className={styles.breadcrumb} aria-label="breadcrumb">
      <ol className={styles.breadcrumb_list}>
        {items.map((item, index) => (
          <li key={index} className={styles.breadcrumb_item}>
            {index === items.length - 1 ? (
              <span className={styles.breadcrumb_current}>{item.label}</span>
            ) : (
              <>
                <Link to={item.path} className={styles.breadcrumb_link}>
                  {item.label}
                </Link>
                <span className={styles.breadcrumb_separator}>/</span>
              </>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb; 