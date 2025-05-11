import React, { useState, useEffect, useRef } from 'react';
import './event.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faClock, faCalendar, faArrowRight, faStar, faTimes, faUser, faUpload, faMoneyBill, faBuilding, faCity } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

function Event() {
  const [countdown, setCountdown] = useState([]);
  const [events, setEvents] = useState([]);
  const [filterActive, setFilterActive] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [registrationData, setRegistrationData] = useState({
    name: '',
    nim: '',
    origin: '',
    city: '',
    university: '',
    programStudi: '',
    participantType: 'general', // 'talent' or 'general'
    email: '',
    phone: ''
  });
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registrationError, setRegistrationError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [paymentProof, setPaymentProof] = useState(null);
  const fileInputRef = useRef(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const checkLoginStatus = () => {
      try {
        const userString = localStorage.getItem('user');
        if (userString) {
          const user = JSON.parse(userString);
          if (user && user.isLoggedIn) {
            setIsLoggedIn(true);
            setUserData(user);
            setRegistrationData(prevData => ({
              ...prevData,
              name: user.name || '',
              nim: user.nim || '',
              origin: user.origin || '',
              university: user.university || '',
              city: user.city || '',
              email: user.email || '',
              participantType: user.isTalentIncubator ? 'talent' : 'general'
            }));
          } else {
            setIsLoggedIn(false);
            setUserData(null);
          }
        } else {
          setIsLoggedIn(false);
          setUserData(null);
        }
      } catch (error) {
        console.error('Error checking login status:', error);
        setIsLoggedIn(false);
        setUserData(null);
      }
    };
    
    checkLoginStatus();
    
    // Load events from localStorage if available
    const loadEvents = () => {
      try {
        const savedEvents = localStorage.getItem('events');
        if (savedEvents) {
          const parsedEvents = JSON.parse(savedEvents);
          // Convert string dates to Date objects
          const formattedEvents = parsedEvents.map(event => ({
            ...event,
            date: new Date(event.date),
            // If no flyer is provided, use a default
            flyer: event.flyer || "/img/placeholder.jpg",
            featured: false // Default for admin-added events
          }));
          
          // Merge with default events
          setEvents(prevEvents => {
            // Create a map of existing IDs to avoid duplicates
            const existingIds = new Set(prevEvents.map(e => e.id));
            // Filter out any saved events that might have the same IDs as our defaults
            const uniqueSavedEvents = formattedEvents.filter(e => !existingIds.has(e.id));
            // Combine and sort by date
            return [...prevEvents, ...uniqueSavedEvents].sort((a, b) => a.date - b.date);
          });
        }
      } catch (error) {
        console.error('Error loading events from localStorage:', error);
      }
    };

    loadEvents();
  }, []);

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const updatedCountdown = events.map(event => {
        const timeLeft = event.date - now;
        return {
          id: event.id,
          timeLeft: timeLeft > 0 ? timeLeft : 0,
        };
      });
      setCountdown(updatedCountdown);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [events]);

  const formatTime = (time) => {
    const seconds = Math.floor((time / 1000) % 60);
    const minutes = Math.floor((time / 1000 / 60) % 60);
    const hours = Math.floor((time / 1000 / 60 / 60) % 24);
    const days = Math.floor(time / (1000 * 60 * 60 * 24));
    
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  };

  const formatDate = (date) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('id-ID', options);
  };

  const filteredEvents = filterActive === 'all' 
    ? events 
    : filterActive === 'upcoming' 
      ? events.filter(event => event.date > new Date()) 
      : events.filter(event => event.featured);
      
  const handleRegisterClick = (event) => {
    // Save selected event ID in localStorage so we can return to it after login
    localStorage.setItem('pendingEventRegistration', event.id);
    
    // Redirect to login page
    navigate('/login');
  };
  
  const closeRegistrationForm = () => {
    setShowRegistrationForm(false);
  };
  
  const closeLoginPrompt = () => {
    setShowLoginPrompt(false);
    setSelectedEvent(null); // Reset selected event when closing login prompt
  };
  
  const handleLoginRedirect = () => {
    // Save selected event ID in localStorage so we can return to it after login
    if (selectedEvent) {
      localStorage.setItem('pendingEventRegistration', selectedEvent.id);
    }
    
    // Redirect to login page
    navigate('/login');
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRegistrationData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handlePaymentProofUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // For demo purposes, store the file name
      setPaymentProof(file.name);
      
      // In a real app, you would upload the file to a server and get a URL
      // For now, we'll just simulate success
      console.log("Payment proof selected:", file.name);
    }
  };
  
  const handleRegistrationSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!registrationData.name || !registrationData.university || !registrationData.city || !registrationData.email) {
      setRegistrationError('Mohon isi semua field yang diperlukan.');
      return;
    }
    
    // For events requiring payment, ensure payment proof is uploaded
    if (selectedEvent.requiresPayment && !paymentProof) {
      setRegistrationError('Mohon upload bukti pembayaran untuk event ini.');
      return;
    }
    
    try {
      // Generate QR data - contains attendee info and event id
      const qrData = JSON.stringify({
        eventId: selectedEvent.id,
        eventTitle: selectedEvent.title,
        attendee: registrationData.name,
        nim: registrationData.nim,
        origin: registrationData.origin,
        city: registrationData.city,
        university: registrationData.university,
        programStudi: registrationData.programStudi || '-',
        participantType: registrationData.participantType,
        registrationTime: new Date().toISOString()
      });
      
      // Create registration object
      const registration = {
        id: Date.now(),
        eventId: selectedEvent.id,
        eventTitle: selectedEvent.title,
        peserta: registrationData.name,
        nim: registrationData.nim,
        universitas: registrationData.university,
        kota: registrationData.city,
        tipePeserta: registrationData.participantType === 'talent' ? 'Eduvation Talent' : 'Umum',
        programStudi: registrationData.programStudi || '-',
        email: registrationData.email,
        phone: registrationData.phone,
        status: 'pending',
        registered: new Date().toISOString(),
        attended: false,
        qrData: qrData,
        buktiPembayaran: selectedEvent.requiresPayment ? (paymentProof ? paymentProof : 'Menunggu Konfirmasi') : 'Tidak ada'
      };
      
      // Save to registrations in localStorage
      const savedRegistrations = localStorage.getItem('registrations');
      let registrations = savedRegistrations ? JSON.parse(savedRegistrations) : [];
      registrations.push(registration);
      localStorage.setItem('registrations', JSON.stringify(registrations));
      
      // Create news item for the user to see in their dashboard
      const newsItem = {
        id: Date.now(),
        title: `Pendaftaran Event: ${selectedEvent.title}`,
        content: `Anda telah berhasil mendaftar untuk event ${selectedEvent.title}.`,
        date: new Date().toISOString(),
        type: 'registration',
        details: {
          peserta: registrationData.name,
          nim: registrationData.nim,
          universitas: registrationData.university,
          kota: registrationData.city,
          programStudi: registrationData.programStudi || '-',
          tipePeserta: registrationData.participantType === 'talent' ? 'Eduvation Talent' : 'Umum',
          qrData: qrData,
          buktiPembayaran: selectedEvent.requiresPayment ? (paymentProof ? paymentProof : 'Menunggu Konfirmasi') : 'Tidak ada'
        }
      };
      
      // Add news to user's dashboard
      const savedNews = localStorage.getItem('news');
      let news = savedNews ? JSON.parse(savedNews) : [];
      news = [newsItem, ...news]; // Add new registration at the top
      localStorage.setItem('news', JSON.stringify(news));
      
      // Show success message
      setRegistrationSuccess(true);
      setRegistrationError('');
      
      // Reset payment proof
      setPaymentProof(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Clear form after 3 seconds and close the modal
      setTimeout(() => {
        setRegistrationSuccess(false);
        setShowRegistrationForm(false);
      }, 3000);
    } catch (error) {
      console.error('Error during registration:', error);
      setRegistrationError('Terjadi kesalahan saat mendaftar.');
    }
  };

  // Add useEffect to check for pending registration after login
  useEffect(() => {
    // Check if there's a pending event registration and user is now logged in
    if (isLoggedIn) {
      const pendingEventId = localStorage.getItem('pendingEventRegistration');
      if (pendingEventId) {
        // Find the event with the saved ID
        const event = events.find(e => e.id.toString() === pendingEventId);
        if (event) {
          // Clear the pending registration
          localStorage.removeItem('pendingEventRegistration');
          // Open the registration form for this event
          setSelectedEvent(event);
          setShowRegistrationForm(true);
          setRegistrationSuccess(false);
          setRegistrationError('');
        }
      }
    }
  }, [isLoggedIn, events]);

  return (
    <div className="event-page">
      <div className="event-hero">
        <div className="container">
          <h1 className="event-hero-title">EDUV Events</h1>
          <p className="event-hero-description">
            Join our exclusive workshops, hackathons, and masterclasses to enhance your skills and expand your network
          </p>
        </div>
      </div>
      
      <div className="container">
        <div className="event-filters">
          <button 
            className={`filter-button ${filterActive === 'all' ? 'active' : ''}`}
            onClick={() => setFilterActive('all')}
          >
            All Events
          </button>
          <button 
            className={`filter-button ${filterActive === 'upcoming' ? 'active' : ''}`}
            onClick={() => setFilterActive('upcoming')}
          >
            Upcoming Events
          </button>
          <button 
            className={`filter-button ${filterActive === 'featured' ? 'active' : ''}`}
            onClick={() => setFilterActive('featured')}
          >
            Featured Events
          </button>
        </div>
        
        {filteredEvents.length === 0 ? (
          <div className="no-events-message">
            <h3>No events found</h3>
            <p>Check back later for upcoming events.</p>
          </div>
        ) : (
          <div className="events-container">
            {filteredEvents.map(event => {
              const currentCountdown = countdown.find(c => c.id === event.id)?.timeLeft || 0;
              const isExpired = currentCountdown <= 0;
              
              return (
                <div className={`event-card ${event.featured ? 'featured' : ''} ${isExpired ? 'expired' : ''}`} key={event.id}>
                  {event.featured && (
                    <div className="featured-badge">
                      <FontAwesomeIcon icon={faStar} /> Featured
                    </div>
                  )}
                  
                  <div className="event-image-container">
                    <img 
                      src={event.flyer} 
                      alt={`${event.title} flyer`} 
                      className="event-flyer"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/img/placeholder.jpg";
                      }}
                    />
                    <div className="event-overlay">
                      <div className="event-date-badge">
                        <span className="date-day">{event.date.getDate()}</span>
                        <span className="date-month">{event.date.toLocaleString('default', { month: 'short' })}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="event-content">
                    <h2 className="event-title">{event.title}</h2>
                    
                    <div className="event-meta">
                      <div className="event-meta-item">
                        <FontAwesomeIcon icon={faCalendar} />
                        <span>{formatDate(event.date)}</span>
                      </div>
                      <div className="event-meta-item">
                        <FontAwesomeIcon icon={faMapMarkerAlt} />
                        <span>{event.location}</span>
                      </div>
                      <div className="event-meta-item">
                        <FontAwesomeIcon icon={faClock} />
                        <span>{event.time}</span>
                      </div>
                    </div>
                    
                    <p className="event-description">{event.description}</p>
                    
                    <div className="event-footer">
                      <div className={`event-countdown ${isExpired ? 'expired' : ''}`}>
                        {isExpired ? (
                          <span>Event has ended</span>
                        ) : (
                          <>
                            <span className="countdown-label">Starting in:</span>
                            <span className="countdown-time">{formatTime(currentCountdown)}</span>
                          </>
                        )}
                      </div>
                      
                      <button 
                        className={`register-button ${isExpired ? 'disabled' : ''}`}
                        disabled={isExpired}
                        onClick={() => !isExpired && handleRegisterClick(event)}
                      >
                        {isExpired ? 'Event Ended' : 'Register Now'} 
                        {!isExpired && <FontAwesomeIcon icon={faArrowRight} />}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Registration Modal - Only show if logged in */}
      
    </div>
  );
}

export default Event;