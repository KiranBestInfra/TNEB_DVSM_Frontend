import { useState, useEffect } from 'react';
import styles from './ThemeToggle.module.css';

const ThemeToggle = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });


  useEffect(() => {
    const body = document.body;
    body.classList.add(isDarkMode ? 'dark-theme' : 'light-theme');
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    return () => {
      body.classList.remove('dark-theme', 'light-theme');
    };
  }, []);

  useEffect(() => {
    const body = document.body;
    if (isDarkMode) {
      body.classList.remove('light-theme');
      body.classList.add('dark-theme');
    } else {
      body.classList.remove('dark-theme');
      body.classList.add('light-theme');
    }
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
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
            <img src='icons/moon.svg' alt='sun' />
          ) : (
            <img src='icons/sun.svg' alt='moon' />
          )}
        </span>
      </label>
    </div>
  );
};

export default ThemeToggle;
