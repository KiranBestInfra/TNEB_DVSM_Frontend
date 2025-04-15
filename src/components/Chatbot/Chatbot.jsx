import { useState } from "react";
import { useAuth } from "../../components/AuthProvider";
import styles from "../../styles/Chatbot.module.css";
import SectionHeader from "../SectionHeader/SectionHeader";

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("home");
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hello! How can I help you today?", type: "received" },
    { text: "I need help with my account", type: "sent" },
    {
      text: "Sure, I can help you with that. What specific issue are you facing?",
      type: "received",
    },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const { user } = useAuth();

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleNavClick = (navItem) => {
    setActiveNav(navItem);
  };

  const handleEAssistClick = () => {
    setShowChat(true);
  };

  const handleHomeClick = () => {
    setShowChat(false);
    setActiveNav("home");
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setMessages([...messages, { text: newMessage, type: "sent" }]);
      setNewMessage("");
      // Simulate response after 1 second
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            text: "Thank you for your message. Our team will get back to you shortly.",
            type: "received",
          },
        ]);
      }, 1000);
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return "just now";
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
  };

  // Create a timestamp 20 minutes ago
  const lastMessageTime = new Date(Date.now() - 20 * 60 * 1000);

  return (
    <div className={styles.chatbot_container}>
      {isOpen && (
        <div className={styles.chat_window}>
          <div className={styles.chat_header}>
            <SectionHeader
              title={
                <span className={styles.chatbot_title}>{`${
                  user?.name || "Admin"
                } - Chat Support`}</span>
              }
            >
              <div className={styles.action_cont}>
                <svg
                  className={styles.header_icon}
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  onClick={handleHomeClick}
                  style={{ cursor: "pointer" }}
                >
                  <path
                    d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M9 22V12H15V22"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </SectionHeader>
          </div>
          {!showChat ? (
            <>
              <div className={styles.welcome_message}>
                We are Here to Help you
              </div>
              <div
                className={styles.e_assist_section}
                onClick={handleEAssistClick}
              >
                <span className={styles.company_logo}>
                  <img src="images/tange.svg" alt="companyLogo" />
                </span>
                <div className={styles.chat_details}>
                  <div className={styles.e_assist_name}>
                    <div>E-Assist</div>
                    <div className={styles.timestamp}>
                      {formatTimeAgo(lastMessageTime)}
                    </div>
                  </div>
                  <div className={styles.timestamp_details}>
                    <div>What's Your Region Name</div>
                    <div className={styles.chat_direction}>
                      <span className={styles.company_logo}>
                        <img src="icons/arrow-right.svg" alt="companyLogo" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles.call_now}>
                <svg
                  className={styles.call_icon}
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M22 16.92V19.92C22.0001 20.1989 21.9042 20.4703 21.7283 20.6896C21.5524 20.9089 21.3067 21.0628 21.033 21.126C20.13 21.337 19.2 21.442 18.27 21.442C9.9 21.442 2.56 14.102 2.56 5.732C2.56 4.802 2.665 3.872 2.876 2.969C2.93924 2.69528 3.09312 2.44959 3.31242 2.27368C3.53172 2.09777 3.80314 2.00191 4.082 2.002H7.082C7.46123 1.99799 7.81135 2.18816 8.021 2.502C8.289 2.902 8.5 3.342 8.66 3.802C8.804 4.219 8.8 4.658 8.65 5.072L7.55 8.112C7.44121 8.39563 7.43704 8.71176 7.53823 8.99795C7.63943 9.28413 7.83868 9.52119 8.1 9.672C9.406 10.378 10.708 11.094 11.92 11.932C12.178 12.121 12.45 12.292 12.73 12.442C13.123 12.65 13.56 12.658 13.93 12.462L16.93 11.362C17.338 11.209 17.77 11.208 18.179 11.36C18.619 11.52 19.059 11.73 19.459 12C19.7728 12.2096 19.963 12.5597 19.959 12.939V15.939C19.959 16.219 19.863 16.488 19.69 16.7C19.517 16.912 19.277 17.054 19.012 17.102C18.39 17.21 17.78 17.378 17.19 17.602C16.8836 17.7257 16.6361 17.9602 16.4983 18.2573C16.3605 18.5544 16.3423 18.8916 16.448 19.202L17.21 21.242C17.288 21.47 17.28 21.72 17.19 21.94C17.1 22.16 16.93 22.34 16.71 22.45"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Call Now
              </div>
            </>
          ) : (
            <div
              className={`${styles.chat_interface} ${
                showChat ? styles.active : ""
              }`}
            >
              <div className={styles.chat_messages}>
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`${styles.message} ${styles[message.type]}`}
                  >
                    {message.text}
                  </div>
                ))}
              </div>
              <div className={styles.chat_input}>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                />
                <button
                  className={styles.send_button}
                  onClick={handleSendMessage}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M22 2L11 13"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M22 2L15 22L11 13L2 9L22 2Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Send
                </button>
              </div>
            </div>
          )}
          {!showChat && (
            <div className={styles.navigation}>
              <a
                href="/"
                className={`${styles.nav_item} ${
                  activeNav === "home" ? styles.active : ""
                }`}
                onClick={() => handleNavClick("home")}
              >
                <svg
                  className={styles.nav_icon}
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M9 22V12H15V22"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className={styles.nav_text}>Home</span>
              </a>
              <a
                href="/conversation"
                className={`${styles.nav_item} ${
                  activeNav === "conversation" ? styles.active : ""
                }`}
                // onClick={() => handleNavClick('conversation')}
              >
                <svg
                  className={styles.nav_icon}
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className={styles.nav_text}>Conversation</span>
              </a>
            </div>
          )}
        </div>
      )}
      <button onClick={toggleChat} className={styles.chat_button}>
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
};

export default Chatbot;
