import React from 'react';

const Carousel = ({ currentSlide, totalSlides, moveSlide, goToSlide }) => {
    return (
        <section className="carousel">
            <div className="carousel-container">
                {/* Slide 1 */}
                <div className={`carousel-item ${currentSlide === 0 ? 'active' : ''}`}>
                    <div className="carousel-text">
                        <span className="tag">Welcome</span>
                        <h1>Selamat Datang!</h1>
                        <p>Gabung di Business Incubator Satya Terra Bhinneka University dan ubah ide kreatifmu menjadi peluang bisnis nyata!</p>
                        <a href="/login.js" className="cta-button">Mulai Sekarang <i className="fas fa-arrow-right"></i></a>
                    </div>
                    <div className="carousel-image">
                        <img src="/img/s1.jpg" alt="Business Incubator" />
                    </div>
                </div>
                
                {/* Slide 2 */}
                <div className={`carousel-item ${currentSlide === 1 ? 'active' : ''}`}>
                    <div className="carousel-text">
                        <span className="tag">Growth</span>
                        <h1>Berkembang Bersama</h1>
                        <p>Kami membantumu mengembangkan bisnis dengan mentoring dan dukungan dari para ahli.</p>
                        <a href="https://example.com" className="cta-button">Pelajari Lebih Lanjut <i className="fas fa-arrow-right"></i></a>
                    </div>
                    <div className="carousel-image">
                    <img src={`${process.env.PUBLIC_URL}/EDUV Admin Dashboard.png`} alt="Mentoring" />
                    </div>
                </div>
                
                {/* Slide 3 */}
                <div className={`carousel-item ${currentSlide === 2 ? 'active' : ''}`}>
                    <div className="carousel-text">
                        <span className="tag">Community</span>
                        <h1>Jadilah Bagian dari Kami</h1>
                        <p>Wujudkan startup impianmu dan jadilah pengusaha sukses bersama komunitas kami.</p>
                        <a href="https://example.com" className="cta-button">Bergabung <i className="fas fa-arrow-right"></i></a>
                    </div>
                    <div className="carousel-image">
                        <img src={`${process.env.PUBLIC_URL}/img/Community-1.jpg`} alt="Startup Community" />
                    </div>
                </div>
            </div>
            
            <div className="carousel-controls">
                <div className="carousel-nav">
                    {Array.from({ length: totalSlides }).map((_, index) => (
                        <div 
                            key={index}
                            className={`carousel-dot ${currentSlide === index ? 'active' : ''}`}
                            aria-label={`Slide ${index + 1}`}
                            onClick={() => goToSlide(index)}
                            tabIndex="0"
                        ></div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Carousel; 