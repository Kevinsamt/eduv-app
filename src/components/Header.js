import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Header = ({ toggleTheme, isDarkTheme, toggleMobileMenu }) => {
    const [isNavbarOpen, setNavbarOpen] = useState(false);

    const toggleNavbar = () => {
        setNavbarOpen(!isNavbarOpen);
    };

    return (
        <header>
            <nav className={isNavbarOpen ? "open" : "closed"}>
                <div className="logo">
                    <img src="/img/logo.png" alt="EduVation Logo" />
                    <span>EduVation</span>
                </div>
                <ul className={`nav-links ${isNavbarOpen ? 'show' : ''}`}>
                    <li><Link to="/" className="nav-link active"><i className="fas fa-home"></i> Home</Link></li>
                    <li><Link to="/about" className="nav-link" onClick={toggleNavbar}><i className="fas fa-info-circle"></i> About</Link></li>
                    <li><Link to="/event" className="nav-link" onClick={toggleNavbar}><i className="fas fa-calendar-alt"></i> Event</Link></li>
                    <li><Link to="/login" className="login" onClick={toggleNavbar}><i className="fas fa-sign-in-alt"></i> Login</Link></li>
                </ul>
                <div className="theme-toggle" onClick={toggleTheme} title={isDarkTheme ? "Switch to Light Mode" : "Switch to Dark Mode"}>
                    <i className={`fas ${isDarkTheme ? 'fa-sun' : 'fa-moon'}`} id="theme-toggle-icon"></i>
                </div>
                <div className="menu-toggle" onClick={() => { toggleNavbar(); toggleMobileMenu(); }}>
                    <i className="fas fa-bars"></i>
                </div>
            </nav>
        </header>
    );
};

export default Header; 