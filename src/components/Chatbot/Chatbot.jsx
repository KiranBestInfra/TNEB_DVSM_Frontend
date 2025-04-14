import { useState } from 'react';
import styles from '../../styles/Chatbot.module.css';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className={styles.chatbot_container}>
            {isOpen && (
                <div className={styles.chat_window}>
                    <div className={styles.chat_header}>
                        <h3>Chat Support</h3>
                        <button onClick={toggleChat} className={styles.close_button}>
                            ×
                        </button>
                    </div>
                    <div className={styles.chat_messages}>
                        <div className={styles.message}>
                            <p>Hello! Need help?</p>
                        </div>
                        <div className={styles.message}>
                            <p>How can I assist you today?</p>
                        </div>
                    </div>
                </div>
            )}
            <button onClick={toggleChat} className={styles.chat_button}>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
            </button>
        </div>
    );
};

export default Chatbot; 