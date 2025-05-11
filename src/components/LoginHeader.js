import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/LoginHeader.css';

const LoginHeader = ({ toggleTheme, isDarkTheme }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <header className="login-header">
            <div className="login-header-container">
                <div className="login-logo">
                    <img src="/img/logo.png" alt="EduVation Logo" />
                    <span>EduVation</span>
                </div>
                
                <div className="login-nav-container">
                    <div className={`login-hamburger ${isMenuOpen ? 'active' : ''}`} onClick={toggleMenu}>
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                    
                    <nav className={`login-nav ${isMenuOpen ? 'open' : ''}`}>
                        <ul>
                            <li><Link to="/" onClick={() => setIsMenuOpen(false)}>Home</Link></li>
                            <li><Link to="/about" onClick={() => setIsMenuOpen(false)}>About</Link></li>
                            <li><Link to="/event" onClick={() => setIsMenuOpen(false)}>Event</Link></li>
                        </ul>
                    </nav>
                </div>
                
                <div className="theme-toggle" onClick={toggleTheme} title={isDarkTheme ? "Switch to Light Mode" : "Switch to Dark Mode"}>
                    <i className={`fas ${isDarkTheme ? 'fa-sun' : 'fa-moon'}`}></i>
                </div>
            </div>
        </header>
    );
};

export default LoginHeader; 