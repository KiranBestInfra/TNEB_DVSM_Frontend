import React, { useState, useRef, useEffect } from 'react';
import styles from '../styles/Dashboard.module.css';

const SelectDropdown = ({ options, onChange, selected, placeholder, icon }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState(selected || '');
    const dropdownRef = useRef(null);

    useEffect(() => {
        // Handle clicks outside the dropdown to close it
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSelectOption = (option) => {
        setSelectedOption(option.value);
        setIsOpen(false);
        if (onChange) {
            onChange(option.value);
        }
    };

    return (
        <div className={styles.time_range_select_dropdown} ref={dropdownRef}>
            <div
                className={styles.time_range_select}
                onClick={() => setIsOpen(!isOpen)}
            >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <span>
                        {selectedOption
                            ? options.find(option => option.value === selectedOption)?.label
                            : placeholder || 'Select'}
                    </span>
                    {icon && (
                        <span style={{ marginLeft: '8px' }}>
                            {icon}
                        </span>
                    )}
                </div>
            </div>

            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 5px)',
                    left: '0',
                    backgroundColor: 'var(--white)',
                    border: '1px solid var(--primary-bg)',
                    borderRadius: '0.5rem',
                    width: '100%',
                    zIndex: '10',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
                }}>
                    {options.map((option) => (
                        <div
                            key={option.value}
                            onClick={() => handleSelectOption(option)}
                            style={{
                                padding: '0.5rem 1rem',
                                cursor: 'pointer',
                                backgroundColor: selectedOption === option.value ? 'var(--primary-bg)' : 'transparent',
                                borderRadius: '0.25rem',
                                margin: '0.25rem'
                            }}
                        >
                            {option.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SelectDropdown; 