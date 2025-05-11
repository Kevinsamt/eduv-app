import React, { useState, useEffect } from 'react';
import './styles.css';
import Header from './components/Header'; // Import Header component
import Footer from './components/Footer'; // Import Footer component
import Carousel from './components/Carousel'; // Import Carousel component
import About from './pages/About';
import Event from './pages/event'; // Import Event component
import Login from './pages/Login';
import Register from './pages/Register';
import TalentAccount from './pages/TalentAccount'; // Import TalentAccount component
import AdminLogin from './pages/AdminLogin'; // Import AdminLogin component
import AdminDashboard from './pages/AdminDashboard'; // Import AdminDashboard component
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom'; // Import Router and useLocation

function App() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isDarkTheme, setIsDarkTheme] = useState(
        localStorage.getItem("theme") === "dark" || 
        (localStorage.getItem("theme") === null && 
        window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)
    );
    
    // Total number of slides
    const totalSlides = 3;

    // Initialize theme on component mount
    useEffect(() => {
        // Set the initial theme state based on localStorage or system preference
        if (isDarkTheme) {
            document.body.classList.add("dark-theme");
        } else {
            document.body.classList.remove("dark-theme");
        }

        // Listen for system theme preference changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e) => {
            if (localStorage.getItem("theme") === null) {
                setIsDarkTheme(e.matches);
                if (e.matches) {
                    document.body.classList.add("dark-theme");
                } else {
                    document.body.classList.remove("dark-theme");
                }
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [isDarkTheme]);

    // Toggle theme function
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

    // Move to previous or next slide
    const moveSlide = (direction) => {
        let newSlide = currentSlide + direction;

        if (newSlide < 0) {
            newSlide = totalSlides - 1; // Loop to last slide
        } else if (newSlide >= totalSlides) {
            newSlide = 0; // Loop to first slide
        }

        setCurrentSlide(newSlide);
    };

    // Go to a specific slide
    const goToSlide = (index) => {
        if (index >= 0 && index < totalSlides) {
            setCurrentSlide(index);
        }
    };

    // Auto-slide effect
    useEffect(() => {
        const interval = setInterval(() => {
            moveSlide(1);
        }, 5000);
        
        // Clean up interval on component unmount
        return () => clearInterval(interval);
    }, [currentSlide]);

    // Handle menu toggle for mobile
    const toggleMobileMenu = () => {
        const navLinks = document.querySelector('.nav-links');
        navLinks.classList.toggle('show');
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        // Handle form submission
    };

    return (
        <Router>
            <AppContent 
                isDarkTheme={isDarkTheme}
                toggleTheme={toggleTheme}
                toggleMobileMenu={toggleMobileMenu}
                currentSlide={currentSlide}
                totalSlides={totalSlides}
                moveSlide={moveSlide}
                goToSlide={goToSlide}
                handleSubmit={handleSubmit}
            />
        </Router>
    );
}

// Create a separate component to access useLocation
function AppContent({ isDarkTheme, toggleTheme, toggleMobileMenu, currentSlide, totalSlides, moveSlide, goToSlide, handleSubmit }) {
    const location = useLocation();
    
    // Check if we're on the login page or other pages that shouldn't use the main header
    const hideHeader = ['/login', '/admin/login', '/talent-account', '/admin/dashboard', '/admin/dashboard/usermanagement', '/admin/dashboard/settings'].includes(location.pathname);
    
    // Log current path for debugging
    console.log('Current path:', location.pathname, 'Header hidden:', hideHeader);

    return (
        <div className={`app-container ${isDarkTheme ? 'dark-theme' : ''}`}>
            {!hideHeader && <Header toggleTheme={toggleTheme} isDarkTheme={isDarkTheme} toggleMobileMenu={toggleMobileMenu} />}
            <main className={`${hideHeader ? 'no-header' : ''}`}>
                <Routes>
                    <Route path="/about" element={<About />} />
                    <Route path="/event" element={<Event />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/talent-account" element={<TalentAccount />} />
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    <Route path="/admin/dashboard/usermanagement" element={<AdminDashboard initialSection="users" />} />
                    <Route path="/admin/dashboard/settings" element={<AdminDashboard initialSection="settings" />} />
                    <Route path="/" element={
                        <Carousel 
                            currentSlide={currentSlide} 
                            totalSlides={totalSlides} 
                            moveSlide={moveSlide} 
                            goToSlide={goToSlide} 
                        />
                    } />
                </Routes>
            </main>
            <Footer handleSubmit={handleSubmit} />
        </div>
    );
}

export default App;