import Buttons from '../components/ui/Buttons/Buttons';
import styles from '../styles/Login.module.css';
import { useState } from 'react';
import { validateLogin } from '../schemas/auth/loginSchema';
import { authService } from '../api/services/auth.service';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../components/ui/Logo/Logo';
import { jwtDecode } from 'jwt-decode';
import { useAuth } from '../components/AuthProvider';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        remember: true,
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const { updateUserFromToken } = useAuth();

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));

        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: null }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const { error, value } = await validateLogin(formData);

            if (error) {
                const errorMap = {};
                error.forEach((err) => {
                    errorMap[err.field] = err.message;
                });
                setErrors(errorMap);
                return;
            }

            const response = await authService.login({
                email: value.email,
                password: value.password,
                rememberMe: value.remember,
            });

            if (response.status === 'error') {
                setErrors({
                    submit:
                        response.message || 'Login failed. Please try again.',
                });
                return;
            }

            let token;
            while (!token) {
                token = document.cookie
                    .split('; ')
                    .find((row) => row.startsWith('accessTokenDuplicate='));
                if (!token)
                    await new Promise((resolve) => setTimeout(resolve, 100));
            }
            token = token.split('=')[1];

            try {
                const decoded = jwtDecode(token);
                updateUserFromToken(token);

                let region = null;
                if (decoded.region) {
                    region = decoded.region;
                } else if (decoded.userRegion) {
                    region = decoded.userRegion;
                } else if (decoded.userId && decoded.userId.includes('_')) {
                    region = decoded.userId.split('_')[0].toLowerCase();
                }

                region = region ? region.toLowerCase() : 'kancheepuram';
                navigate(`/user/${region}/dashboard`);
            } catch (err) {
                console.error('Error decoding token:', err);
                navigate('/user/dashboard');
            }
        } catch (err) {
            setErrors({
                submit: err.message || 'Login failed. Please try again.',
            });
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <div className={styles.login_container}>
            <div className="logo">
                <Logo width={150} />
            </div>
            <form className={styles.form_login_cont} onSubmit={handleSubmit}>
                {Object.entries(errors).map(
                    ([field, message]) =>
                        message && (
                            <div key={field} className={styles.error_message}>
                                {message}
                            </div>
                        )
                )}
                <div>
                    <label htmlFor="email" className="visually-hidden">
                        Username or Email Address
                    </label>
                    <input
                        type="text"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="Username or Email Address"
                        className={errors.email ? 'error' : ''}
                    />
                </div>
                <div>
                    <label htmlFor="password" className="visually-hidden">
                        Password
                    </label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        placeholder="Password"
                        className={errors.password ? 'error' : ''}
                    />
                </div>
                <div className={styles.remember_forgot_cont}>
                    <label>
                        <input
                            type="checkbox"
                            id="remember"
                            name="remember"
                            className={styles.remember_checkbox}
                            checked={formData.remember}
                            onChange={handleChange}
                        />
                        Remember Me
                    </label>
                    <Link to="/auth/forgot-password">Forgot Password?</Link>
                </div>
                <Buttons
                    label="Login"
                    variant="primary"
                    alt="Login"
                    type="submit"
                    isLoading={isLoading}
                />
            </form>
        </div>
    );
};

export default Login;
