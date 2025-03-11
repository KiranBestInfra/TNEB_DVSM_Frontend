import React from 'react';
import styles from './Modal.module.css';
import Buttons from '../Buttons/Buttons';

const Modal = ({ isOpen, onClose, title, children, onConfirm, confirmLabel = 'Confirm', showActions = true }) => {
    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modal}>
                <div className={styles.modalHeader}>
                    <div className="title">{title}</div>
                    <span className="icons" onClick={onClose}>
                        <img src="icons/close.svg" alt="close" />
                    </span>
                </div>
                <div className={styles.modalContent}>
                    {children}
                </div>
                {showActions && (
                    <div className={styles.modalActions}>
                        <Buttons
                            label="Cancel"
                            onClick={onClose}
                            variant="outline"
                        />
                        <Buttons
                            label={confirmLabel}
                            onClick={onConfirm}
                            variant="primary"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Modal; 