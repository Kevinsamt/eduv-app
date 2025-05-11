import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';
import LoginHeader from '../components/LoginHeader';
import config from '../config';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isDarkTheme, setIsDarkTheme] = useState(
        localStorage.getItem("theme") === "dark" || 
        (localStorage.getItem("theme") === null && 
        window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)
    );
    const navigate = useNavigate();

    const toggleTheme = () => {
        const newThemeState = !isDarkTheme;
        setIsDarkTheme(newThemeState);
        
        if (newThemeState) {
            document.body.classList.add("dark-theme");
            localStorage.setItem("theme", "dark");
        } else {
            document.body.classList.remove("dark-theme");
            localStorage.setItem("theme", "light");
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Basic validation
            if (!formData.email || !formData.password) {
                setError('Please enter both email and password');
                setLoading(false);
                return;
            }

            const response = await fetch(`${config.API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                // Store user data in localStorage
                localStorage.setItem('token', data.token);
                
                // Make sure we have all required user data
                const userData = {
                    email: formData.email,
                    name: data.name || '',
                    nim: data.nim || '',
                    university: data.university || '',
                    origin: data.origin || '',
                    isTalentIncubator: Boolean(data.isTalentIncubator),
                    isLoggedIn: true,
                    lastLogin: new Date().toISOString()
                };
                
                localStorage.setItem('user', JSON.stringify(userData));
                
                // Redirect to Talent Account page
                navigate('/talent-account');
            } else {
                setError(data.message || 'Login failed. Please check your credentials.');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('Connection error. Please check your internet connection and try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`login-page-container ${isDarkTheme ? 'dark-theme' : ''}`}>
            <LoginHeader toggleTheme={toggleTheme} isDarkTheme={isDarkTheme} />
            <div className="login-container">
                <div className="login-box">
                    <h2>Login</h2>
                    {error && <div className="error-message">{error}</div>}
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                disabled={loading}
                                placeholder="Enter your email"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                disabled={loading}
                                placeholder="Enter your password"
                            />
                        </div>
                        <button 
                            type="submit" 
                            className="login-button"
                            disabled={loading}
                        >
                            {loading ? 'Logging in...' : 'Login'}
                        </button>
                    </form>
                    <p className="register-link">
                        Don't have an account? <a href="/register">Register here</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
