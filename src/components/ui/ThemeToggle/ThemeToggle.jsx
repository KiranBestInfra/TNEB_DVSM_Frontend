
import { useState, useEffect } from 'react';
import styles from './ThemeToggle.module.css';

const ThemeToggle = () => {
  const [isDarkMode, setIsDarkMode] = useState(
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  // Initial theme setup
  useEffect(() => {
    const body = document.body;
    body.classList.add(isDarkMode ? 'dark-theme' : 'light-theme');
    return () => {
      body.classList.remove('dark-theme', 'light-theme');
    };
  }, []);

  // Theme toggle effect
  useEffect(() => {
    const body = document.body;
    if (isDarkMode) {
      body.classList.remove('light-theme');
      body.classList.add('dark-theme');
    } else {
      body.classList.remove('dark-theme');
      body.classList.add('light-theme');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className={styles.toggleSwitch}>
      <input
        type='checkbox'
        className={styles.themeToggle}
        id='themeToggle'
        checked={isDarkMode}
        onChange={toggleTheme}
      />
      <label htmlFor='themeToggle' className={styles.toggleLabel}>
        <span className={styles.toggleIcon}>
          {isDarkMode ? (
            <img src='/icons/light.svg' alt='sun' />
          ) : (
            <img src='/icons/dark.svg' alt='moon' />
          )}
        </span>
      </label>
    </div>
  );
};

export default ThemeToggle;
