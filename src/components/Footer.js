import React from 'react';

const Footer = ({ handleSubmit }) => {
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="contact-info">
                    <i className="fas fa-envelope"></i>
                    <p>inkubatorbisnis@satyaterrabhinneka.ac.id</p>
                    <p>Kampus Utama</p>
                    <p>Jl. Sunggal Gg. Bakul, Sunggal, Kec. Medan Sunggal, Kota Medan, Sumatera Utara 20128</p>
                    <p>Telepon: 0813-7359-0144</p>
                </div>
                <div className="social-links">
                    <a href="https://example.com" aria-label="Instagram" className="social-icon"><i className="fab fa-instagram"></i></a>
                    <a href="https://example.com" aria-label="LinkedIn" className="social-icon"><i className="fab fa-linkedin"></i></a>
                    <a href="https://example.com" aria-label="YouTube" className="social-icon"><i className="fab fa-youtube"></i></a>
                </div>
                <div className="suggestions">
                    <h3>Saran dan Pratnership</h3>
                    <form onSubmit={handleSubmit}>
                        <input type="email" placeholder="Email Anda" required />
                        <textarea placeholder="Pesan Anda" required></textarea>
                        <button type="submit">Kirim</button>
                    </form>
                </div>
            </div>
            <div className="map-container">
                <iframe 
                    title="Unique Title"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3151.835434509123!2d110.4381253153183!3d-7.001123794440052!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e7a1f1c1c1c1c1c%3A0x1234567890abcdef!2sBhinneka%20University!5e0!3m2!1sen!2sid!4v1616161616161!5m2!1sen!2sid" 
                    loading="lazy">
                </iframe>
            </div>
        </footer>
    );
};

export default Footer; 