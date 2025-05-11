import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';
import config from '../config';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        origin: '',
        nim: '',
        university: '',
        email: '',
        password: '',
        confirmPassword: '',
        isTalentIncubator: false
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const validateEmail = (email, university) => {
        if (!email) return false;
        
        if (university === 'Universitas Satya Terra Bhinneka') {
            return email.endsWith('@students.satyaterrabhinneka.ac.id');
        }
        
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Validate required fields
            const requiredFields = ['name', 'nim', 'university', 'email', 'password', 'confirmPassword'];
            for (const field of requiredFields) {
                if (!formData[field]) {
                    setError(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
                    setLoading(false);
                    return;
                }
            }
            
            // Validate passwords match
            if (formData.password !== formData.confirmPassword) {
                setError('Passwords do not match');
                setLoading(false);
                return;
            }
            
            // Password length check
            if (formData.password.length < 6) {
                setError('Password must be at least 6 characters long');
                setLoading(false);
                return;
            }

            // Validate email
            if (!validateEmail(formData.email, formData.university)) {
                if (formData.university === 'Universitas Satya Terra Bhinneka') {
                    setError('Students from Universitas Satya Terra Bhinneka must use @students.satyaterrabhinneka.ac.id email');
                } else {
                    setError('Please enter a valid email address');
                }
                setLoading(false);
                return;
            }

            const response = await fetch(`${config.API_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    origin: formData.origin,
                    nim: formData.nim,
                    university: formData.university,
                    email: formData.email,
                    password: formData.password,
                    isTalentIncubator: formData.isTalentIncubator
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Store user data in localStorage
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify({
                    name: formData.name,
                    origin: formData.origin,
                    email: formData.email,
                    nim: formData.nim,
                    university: formData.university,
                    isTalentIncubator: formData.isTalentIncubator,
                    isLoggedIn: true,
                    registrationDate: new Date().toISOString()
                }));
                // Redirect to Talent Account page
                navigate('/talent-account');
            } else {
                setError(data.message || 'Registration failed. Please try again.');
            }
        } catch (err) {
            console.error('Registration error:', err);
            setError('Connection error. Please check your internet connection and try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h2>Register</h2>
                {error && <div className="error-message">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">Full Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="origin">Origin/Address</label>
                        <input
                            type="text"
                            id="origin"
                            name="origin"
                            value={formData.origin}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="nim">NIM</label>
                        <input
                            type="text"
                            id="nim"
                            name="nim"
                            value={formData.nim}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="university">University</label>
                        <input
                            type="text"
                            id="university"
                            name="university"
                            value={formData.university}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        />
                    </div>
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
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        />
                    </div>
                    <div className="form-group checkbox-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                id="isTalentIncubator"
                                name="isTalentIncubator"
                                checked={formData.isTalentIncubator}
                                onChange={handleChange}
                                disabled={loading}
                            />
                            Join Talent Incubator Program
                        </label>
                    </div>
                    <button 
                        type="submit" 
                        className="login-button"
                        disabled={loading}
                    >
                        {loading ? 'Registering...' : 'Register'}
                    </button>
                </form>
                <p className="register-link">
                    Already have an account? <a href="/login">Login here</a>
                </p>
            </div>
        </div>
    );
};

export default Register; 