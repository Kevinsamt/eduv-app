import React from 'react';
import { Link } from 'react-router-dom';
import '../styles.css';

const NotFound = () => {
  return (
    <div className="not-found-container">
      <h1>404</h1>
      <h2>PAGE NOT FOUND</h2>
      <p>The page you are looking for does not exist or has been moved.</p>
      <Link to="/" className="return-home-btn">
        Kembali Ke Halaman App.js
      </Link>
    </div>
  );
};

export default NotFound; 