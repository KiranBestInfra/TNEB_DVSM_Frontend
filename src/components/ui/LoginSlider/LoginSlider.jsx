import { useState, useEffect } from 'react';
import styles from '../LoginSlider/LoginSlider.module.css';

const LoginSlider = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [fadeIn, setFadeIn] = useState(true);

    const slides = [
        {
            image: 'images/smart-comm.png',
            title: 'Smarter Energy Management',
            description: 'Optimize energy use with real-time monitoring, anomaly detection, and a centralized dashboard for smarter, cost-effective decisions.'
        },
        {
            image: 'images/energy-analytics.jpg',
            title: 'Stay Connected, Stay Informed',
            description: 'Access billing history, payment details, and real-time updates. Get instant reminders and manage energy anytime with complete flexibility.'
        },
        {
            image: 'images/electric-usage.jpg',
            title: 'Your Energy, Your Control',
            description: 'Track usage, monitor savings, and stay in charge with intuitive dashboards, instant insights, and easy access anytime, anywhere.'
        },
        {
            image: 'images/meter-eval.jpg',
            title: 'Powering Your Experience, Effortlessly',
            description: 'Manage your account, track bills, and control energy usage—all in one seamless dashboard with real-time insights and secure access.'
        },
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setFadeIn(false);
            setTimeout(() => {
                setCurrentSlide((prevSlide) => {
                    return prevSlide === slides.length - 1 ? 0 : prevSlide + 1;
                });
                setFadeIn(true);
            }, 300); // Wait for fade out before changing slide
        }, 3000);

        return () => clearInterval(timer);
    }, []);

    const handleSlideChange = (index) => {
        setFadeIn(false);
        setTimeout(() => {
            setCurrentSlide(index);
            setFadeIn(true);
        }, 300);
    };

    return (
        <div className={styles.slider_container}>
            <div className={`${styles.slides_wrapper} ${fadeIn ? styles.fadeIn : styles.fadeOut}`}>
                <div className={styles.slide}>
                    <img src={slides[currentSlide].image} alt={slides[currentSlide].title} />
                    <div className={styles.slide_content}>
                        <h2>{slides[currentSlide].title}</h2>
                        <p>{slides[currentSlide].description}</p>
                    </div>
                </div>
            </div>
            <div className={styles.dots}>
                {slides.map((_, index) => (
                    <button
                        key={index}
                        className={`${styles.dot} ${currentSlide === index ? styles.active : ''}`}
                        onClick={() => handleSlideChange(index)}
                    />
                ))}
            </div>
        </div>
    );
};

export default LoginSlider;
