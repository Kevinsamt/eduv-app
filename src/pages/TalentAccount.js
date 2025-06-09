import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/TalentAccount.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faClock, faCalendar, faArrowRight, faTimes, faChevronLeft, faChevronRight, faUser, faNewspaper, faBook, faCalendarAlt, faCertificate, faCog, faSignOutAlt, faSun, faMoon, faChartLine, faComments, faPlus, faUsers, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { QRCodeSVG } from 'qrcode.react';

const TalentAccount = () => {
    const [userData, setUserData] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [activeSection, setActiveSection] = useState('account');
    const [news, setNews] = useState([]);
    const [expandedNews, setExpandedNews] = useState({});
    const [isSidebarMinimized, setIsSidebarMinimized] = useState(() => {
        // Check localStorage for saved sidebar state
        const savedState = localStorage.getItem('sidebarMinimized');
        return savedState === 'true';
    });
    // State untuk sidebar di mobile
    const [sidebarOpen, setSidebarOpen] = useState(false);
    // State for my events
    const [myEvents, setMyEvents] = useState([]);
    // State for all available events
    const [allEvents, setAllEvents] = useState([]);
    // State for active event tab
    const [activeEventTab, setActiveEventTab] = useState('all');
    
    // State for courses and progress
    const [myCourses, setMyCourses] = useState([]);
    const [allCourses, setAllCourses] = useState([]);
    
    // State for certificates
    const [myCertificates, setMyCertificates] = useState([]);
    
    // State untuk light/dark mode
    const [isLightMode, setIsLightMode] = useState(() => {
        const savedMode = localStorage.getItem('talentThemeMode');
        return savedMode ? savedMode === 'light' : true;
    });
    
    // State for registration modal
    const [showRegistrationModal, setShowRegistrationModal] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [registrationForm, setRegistrationForm] = useState({
        peserta: '',
        email: '',
        university: '',
        programStudi: '',
        tipePeserta: 'Umum',
        buktiPembayaran: 'Tidak ada'
    });
    
    // Chat related states
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [activeChat, setActiveChat] = useState(null);
    const [chats, setChats] = useState([]);
    const [showNewChatModal, setShowNewChatModal] = useState(false);
    const [newChatForm, setNewChatForm] = useState({
        name: '',
        type: 'private',
        participants: []
    });
    const [availableUsers, setAvailableUsers] = useState([]);
    const [selectedParticipants, setSelectedParticipants] = useState([]);
    const [floatingMessages, setFloatingMessages] = useState([]);
    
    // Add these new state variables at the top with other chat states
    const [typingUsers, setTypingUsers] = useState({});
    const [messageReactions, setMessageReactions] = useState({});
    const [showReactionPicker, setShowReactionPicker] = useState(null);
    
    const navigate = useNavigate();

    // Update toggle function untuk mendukung tampilan mobile
    const toggleSidebar = () => {
        if (window.innerWidth <= 768) {
            // Untuk tampilan mobile, toggle open/close
            setSidebarOpen(!sidebarOpen);
        } else {
            // Untuk tampilan desktop, toggle minimized/expanded
            const newState = !isSidebarMinimized;
            setIsSidebarMinimized(newState);
            // Save state to localStorage
            localStorage.setItem('sidebarMinimized', newState.toString());
        }
    };
    
    // Toggle theme function
    const toggleTheme = () => {
        const newMode = !isLightMode;
        setIsLightMode(newMode);
        document.body.className = newMode ? 'light-theme' : '';
        localStorage.setItem('talentThemeMode', newMode ? 'light' : 'dark');
    };
    
    // Fungsi untuk menutup sidebar saat mengklik overlay
    const handleOverlayClick = () => {
        setSidebarOpen(false);
    };
    
    // Fungsi untuk menutup sidebar saat memilih menu di mobile
    const handleMenuClick = (sectionName) => {
        setActiveSection(sectionName);
        if (window.innerWidth <= 768) {
            setSidebarOpen(false);
        }
    };
    
    // Apply theme effect
    useEffect(() => {
        document.body.className = isLightMode ? 'light-theme' : '';
    }, [isLightMode]);

    useEffect(() => {
        try {
            // Check if user is logged in
            const userString = localStorage.getItem('user');
            if (!userString) {
                setError('User session not found');
                navigate('/login');
                return;
            }

            const user = JSON.parse(userString);
            if (!user || !user.isLoggedIn) {
                setError('User not logged in');
                navigate('/login');
                return;
            }

            setUserData(user);
            
            // Add this user to the talents list for admin dashboard
            const savedTalents = localStorage.getItem('talents');
            let talents = [];
            
            if (savedTalents) {
                talents = JSON.parse(savedTalents);
                
                // Check if this user already exists in the talents array
                const existingTalentIndex = talents.findIndex(t => t.email === user.email);
                
                if (existingTalentIndex !== -1) {
                    // Update existing talent
                    talents[existingTalentIndex] = {
                        ...talents[existingTalentIndex],
                        name: user.name || 'Unknown',
                        email: user.email,
                        specialization: user.university || 'Not specified',
                        status: 'active'
                    };
                } else {
                    // Add new talent
                    talents.push({
                        id: Date.now(),
                        name: user.name || 'Unknown',
                        email: user.email,
                        specialization: user.university || 'Not specified',
                        status: 'active'
                    });
                }
            } else {
                // Create new talents array with this user
                talents = [{
                    id: Date.now(),
                    name: user.name || 'Unknown',
                    email: user.email,
                    specialization: user.university || 'Not specified',
                    status: 'active'
                }];
            }
            
            // Save updated talents array
            localStorage.setItem('talents', JSON.stringify(talents));
            
        } catch (err) {
            console.error('Error loading user data:', err);
            setError('Failed to load user data');
            // Don't navigate away if there's an error parsing data
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        // Load news from localStorage
        const loadNews = () => {
            try {
                const savedNews = localStorage.getItem('news');
                if (savedNews) {
                    setNews(JSON.parse(savedNews));
                }
            } catch (error) {
                console.error('Error loading news:', error);
            }
        };

        loadNews();
        
        // Load user's registered events
        const loadMyEvents = () => {
            try {
                if (!userData?.email) return;
                
                const savedRegistrations = localStorage.getItem('registrations');
                if (!savedRegistrations) return;
                
                const parsedRegistrations = JSON.parse(savedRegistrations);
                // Filter registrations for this user
                const userRegistrations = parsedRegistrations.filter(reg => 
                    reg.email === userData.email
                );
                
                // Get full event data
                const savedEvents = localStorage.getItem('events');
                let eventsData = [];
                if (savedEvents) {
                    eventsData = JSON.parse(savedEvents);
                }
                
                // Combine registration data with full event details
                const userEventsWithDetails = userRegistrations.map(reg => {
                    const eventDetails = eventsData.find(e => e.id === reg.eventId) || {};
                    return {
                        ...reg,
                        eventDetails
                    };
                });
                
                setMyEvents(userEventsWithDetails);
            } catch (error) {
                console.error('Error loading registered events:', error);
            }
        };
        
        loadMyEvents();
        
        // Load all available events
        const loadAllEvents = () => {
            try {
                const savedEvents = localStorage.getItem('events');
                if (savedEvents) {
                    const parsedEvents = JSON.parse(savedEvents);
                    // Convert string dates to Date objects
                    const formattedEvents = parsedEvents.map(event => ({
                        ...event,
                        date: new Date(event.date)
                    }));
                    setAllEvents(formattedEvents);
                }
            } catch (error) {
                console.error('Error loading events:', error);
            }
        };
        
        loadAllEvents();
        
        // Load all available courses
        const loadAllCourses = () => {
            try {
                const savedCourses = localStorage.getItem('courses');
                if (savedCourses) {
                    const parsedCourses = JSON.parse(savedCourses);
                    setAllCourses(parsedCourses);
                    
                    // For demo, we'll set 2-3 courses as "enrolled" for this user
                    if (parsedCourses.length > 0) {
                        // Randomly select up to 3 courses
                        const maxCourses = Math.min(3, parsedCourses.length);
                        const userCourses = parsedCourses
                            .slice(0, maxCourses)
                            .map(course => ({
                                ...course,
                                progress: Math.floor(Math.random() * 100), // Random progress 0-100%
                                enrolledDate: new Date().toISOString()
                            }));
                        
                        setMyCourses(userCourses);
                    }
                }
            } catch (error) {
                console.error('Error loading courses:', error);
            }
        };
        
        loadAllCourses();
        
        // Load certificates
        const loadCertificates = () => {
            try {
                const savedCertificates = localStorage.getItem('certificates');
                if (savedCertificates) {
                    const parsedCertificates = JSON.parse(savedCertificates);
                    
                    // For demo, we'll show certificates for completed courses (progress >= 90%)
                    const completedCourseIds = myCourses
                        .filter(course => course.progress >= 90)
                        .map(course => course.id);
                    
                    // Filter certificates related to user's completed courses
                    const userCertificates = parsedCertificates.filter(cert => 
                        !cert.forCourse || completedCourseIds.includes(parseInt(cert.forCourse))
                    );
                    
                    setMyCertificates(userCertificates);
                }
            } catch (error) {
                console.error('Error loading certificates:', error);
            }
        };
        
        loadCertificates();
    }, [userData, myCourses]);

    const handleLogout = () => {
        try {
            // Set this user's talent status to inactive in the talents list
            const userEmail = userData?.email;
            if (userEmail) {
                const savedTalents = localStorage.getItem('talents');
                if (savedTalents) {
                    const talents = JSON.parse(savedTalents);
                    const updatedTalents = talents.map(talent => {
                        if (talent.email === userEmail) {
                            return {
                                ...talent,
                                status: 'inactive'
                            };
                        }
                        return talent;
                    });
                    localStorage.setItem('talents', JSON.stringify(updatedTalents));
                }
            }
            
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/login');
        } catch (err) {
            console.error('Error during logout:', err);
            setError('Failed to log out properly');
        }
    };

    const toggleNewsDetails = (newsId) => {
        setExpandedNews(prev => ({
            ...prev,
            [newsId]: !prev[newsId]
        }));
    };

    // Handle form input changes
    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setRegistrationForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Navigate to login for event registration
    const handleRegisterEvent = (event) => {
        // If user is not logged in, redirect to login
        if (!userData) {
            // Save selected event ID in localStorage so we can return to it after login
            localStorage.setItem('pendingEventRegistration', event.id);
            // Redirect to login page
            navigate('/login');
            return;
        }
        
        // Otherwise, show registration modal
        setSelectedEvent(event);
        setRegistrationForm(prev => ({
            ...prev,
            peserta: userData.name || '',
            email: userData.email || '',
            university: userData.university || ''
        }));
        setShowRegistrationModal(true);
    };
    
    // Close registration modal
    const handleCloseModal = () => {
        setShowRegistrationModal(false);
        setSelectedEvent(null);
    };
    
    // Submit registration form
    const handleSubmitRegistration = (e) => {
        e.preventDefault();
        
        if (!selectedEvent || !userData) return;
        
        try {
            // Generate unique registration ID
            const registrationId = Date.now();
            
            // Generate QR data for verification
            const qrData = `EVENT_REG:${selectedEvent.id}:${userData.email}:${registrationId}`;
            
            // Create registration object
            const registration = {
                id: registrationId,
                eventId: selectedEvent.id,
                eventTitle: selectedEvent.title,
                email: userData.email,
                peserta: registrationForm.peserta,
                universitas: registrationForm.university,
                programStudi: registrationForm.programStudi,
                tipePeserta: registrationForm.tipePeserta,
                buktiPembayaran: registrationForm.buktiPembayaran,
                registrationDate: new Date().toISOString(),
                status: 'pending',
                attended: false,
                qrData: qrData
            };
            
            // Save registration to localStorage
            const savedRegistrations = localStorage.getItem('registrations');
            let registrations = [];
            
            if (savedRegistrations) {
                registrations = JSON.parse(savedRegistrations);
            }
            
            registrations.push(registration);
            localStorage.setItem('registrations', JSON.stringify(registrations));
            
            // Create a news item for this registration
            const newsItem = {
                id: Date.now(),
                title: `Pendaftaran Event: ${selectedEvent.title}`,
                content: `Anda telah berhasil mendaftar untuk event ${selectedEvent.title}.`,
                date: new Date().toISOString(),
                type: 'registration',
                details: {
                    peserta: registrationForm.peserta,
                    universitas: registrationForm.university,
                    programStudi: registrationForm.programStudi,
                    tipePeserta: registrationForm.tipePeserta,
                    buktiPembayaran: registrationForm.buktiPembayaran,
                    qrData: qrData
                }
            };
            
            // Add news item to existing news
            const updatedNews = [newsItem, ...news];
            setNews(updatedNews);
            localStorage.setItem('news', JSON.stringify(updatedNews));
            
            // Update myEvents with the new registration
            const newRegistration = {
                ...registration,
                eventDetails: selectedEvent
            };
            setMyEvents(prev => [newRegistration, ...prev]);
            
            // Close modal
            handleCloseModal();
            
            // Switch to my events tab
            setActiveEventTab('my');
            
        } catch (error) {
            console.error('Error registering for event:', error);
            setError('Failed to register for event');
        }
    };

    // Format date function
    const formatDate = (date) => {
        if (!date) return '';
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('id-ID', options);
    };

    // Toggle between all events and registered events
    const toggleEventTab = (tab) => {
        setActiveEventTab(tab);
    };

    // Chat related functions
    const handleSendMessage = () => {
        if (!newMessage.trim() || !activeChat || !userData) return;
        
        const message = {
            id: Date.now(),
            chatId: activeChat.id,
            content: newMessage,
            senderId: userData.email,
            senderName: userData.name,
            timestamp: new Date().toISOString()
        };
        
        // Add message to messages list
        setMessages(prev => [...prev, message]);
        
        // Update last message in chat
        setChats(prev => prev.map(chat => 
            chat.id === activeChat.id 
                ? { ...chat, lastMessage: newMessage }
                : chat
        ));
        
        // Create floating message
        const floatingMessage = {
            id: Date.now(),
            content: newMessage,
            sender: userData.name,
            position: {
                x: Math.random() * (window.innerWidth - 200),
                y: Math.random() * (window.innerHeight - 100)
            }
        };
        
        setFloatingMessages(prev => [...prev, floatingMessage]);
        
        // Remove floating message after 5 seconds
        setTimeout(() => {
            setFloatingMessages(prev => prev.filter(msg => msg.id !== floatingMessage.id));
        }, 5000);
        
        // Clear input
        setNewMessage('');
    };
    
    const handleCreateChat = (e) => {
        e.preventDefault();
        
        if (!userData) return;
        
        const newChat = {
            id: Date.now(),
            type: newChatForm.type,
            name: newChatForm.type === 'group' 
                ? newChatForm.name 
                : availableUsers.find(u => u.email === selectedParticipants[0])?.name || 'New Chat',
            participants: [...selectedParticipants, userData.email],
            lastMessage: null,
            createdAt: new Date().toISOString()
        };
        
        setChats(prev => [...prev, newChat]);
        setShowNewChatModal(false);
        setNewChatForm({
            name: '',
            type: 'private',
            participants: []
        });
        setSelectedParticipants([]);
    };
    
    const toggleParticipant = (email) => {
        setSelectedParticipants(prev => {
            if (prev.includes(email)) {
                return prev.filter(e => e !== email);
            } else {
                return [...prev, email];
            }
        });
    };
    
    // Load available users for chat
    useEffect(() => {
        const loadAvailableUsers = () => {
            try {
                const savedTalents = localStorage.getItem('talents');
                if (savedTalents) {
                    const talents = JSON.parse(savedTalents);
                    setAvailableUsers(talents.filter(t => t.email !== userData?.email));
                }
            } catch (error) {
                console.error('Error loading available users:', error);
            }
        };
        
        loadAvailableUsers();
    }, [userData]);
    
    // Load existing chats
    useEffect(() => {
        const loadChats = () => {
            try {
                const savedChats = localStorage.getItem('chats');
                if (savedChats) {
                    setChats(JSON.parse(savedChats));
                }
            } catch (error) {
                console.error('Error loading chats:', error);
            }
        };
        
        loadChats();
    }, []);
    
    // Save chats to localStorage when updated
    useEffect(() => {
        if (chats.length > 0) {
            localStorage.setItem('chats', JSON.stringify(chats));
        }
    }, [chats]);
    
    // Load messages for active chat
    useEffect(() => {
        const loadMessages = () => {
            try {
                const savedMessages = localStorage.getItem('messages');
                if (savedMessages) {
                    setMessages(JSON.parse(savedMessages));
                }
            } catch (error) {
                console.error('Error loading messages:', error);
            }
        };
        
        loadMessages();
    }, []);
    
    // Save messages to localStorage when updated
    useEffect(() => {
        if (messages.length > 0) {
            localStorage.setItem('messages', JSON.stringify(messages));
        }
    }, [messages]);

    // Add these new functions after other chat functions
    const handleTyping = () => {
        if (!activeChat || !userData) return;
        
        // Notify other users that this user is typing
        const typingData = {
            chatId: activeChat.id,
            userId: userData.email,
            userName: userData.name
        };
        
        // In a real app, this would be sent to a server
        // For demo, we'll just update local state
        setTypingUsers(prev => ({
            ...prev,
            [activeChat.id]: {
                ...prev[activeChat.id],
                [userData.email]: {
                    name: userData.name,
                    timestamp: Date.now()
                }
            }
        }));
        
        // Clear typing indicator after 3 seconds
        setTimeout(() => {
            setTypingUsers(prev => {
                const newState = { ...prev };
                if (newState[activeChat.id]?.[userData.email]) {
                    delete newState[activeChat.id][userData.email];
                }
                return newState;
            });
        }, 3000);
    };
    
    const handleReaction = (messageId, reaction) => {
        if (!userData) return;
        
        setMessageReactions(prev => {
            const messageReactions = prev[messageId] || {};
            const userReactions = messageReactions[userData.email] || [];
            
            // Toggle reaction if user already reacted with this emoji
            if (userReactions.includes(reaction)) {
                const newUserReactions = userReactions.filter(r => r !== reaction);
                if (newUserReactions.length === 0) {
                    delete messageReactions[userData.email];
                } else {
                    messageReactions[userData.email] = newUserReactions;
                }
            } else {
                messageReactions[userData.email] = [...userReactions, reaction];
            }
            
            return {
                ...prev,
                [messageId]: messageReactions
            };
        });
    };
    
    const getReactionCount = (messageId, reaction) => {
        const reactions = messageReactions[messageId] || {};
        return Object.values(reactions).flat().filter(r => r === reaction).length;
    };
    
    const getUserReactions = (messageId) => {
        if (!userData) return [];
        return messageReactions[messageId]?.[userData.email] || [];
    };
    
    // Modify the message input section in the chat interface
    const renderMessageInput = () => (
        <div className="message-input">
            <input
                type="text"
                value={newMessage}
                onChange={(e) => {
                    setNewMessage(e.target.value);
                    handleTyping();
                }}
                placeholder="Type a message..."
                onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                        handleSendMessage();
                    }
                }}
            />
            <button onClick={handleSendMessage}>
                <FontAwesomeIcon icon={faPaperPlane} />
            </button>
        </div>
    );
    
    // Modify the message rendering to include reactions
    const renderMessage = (message) => (
        <div 
            key={message.id}
            className={`message ${message.senderId === userData?.email ? 'sent' : 'received'}`}
        >
            <div className="message-content">
                <p>{message.content}</p>
                <div className="message-reactions">
                    {['👍', '❤️', '😂', '😮', '😢', '👏'].map(emoji => {
                        const count = getReactionCount(message.id, emoji);
                        if (count > 0) {
                            return (
                                <span 
                                    key={emoji}
                                    className={`reaction ${getUserReactions(message.id).includes(emoji) ? 'user-reacted' : ''}`}
                                    onClick={() => handleReaction(message.id, emoji)}
                                >
                                    {emoji} {count}
                                </span>
                            );
                        }
                        return null;
                    })}
                    <button 
                        className="add-reaction"
                        onClick={() => setShowReactionPicker(message.id)}
                    >
                        +
                    </button>
                </div>
                <span className="message-time">
                    {new Date(message.timestamp).toLocaleTimeString()}
                </span>
            </div>
        </div>
    );
    
    // Add reaction picker component
    const renderReactionPicker = () => {
        if (!showReactionPicker) return null;
        
        return (
            <div 
                className="reaction-picker"
                style={{
                    position: 'absolute',
                    bottom: '100%',
                    right: '0',
                    background: 'white',
                    padding: '10px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                    zIndex: 1000
                }}
            >
                {['👍', '❤️', '😂', '😮', '😢', '👏'].map(emoji => (
                    <button
                        key={emoji}
                        className="reaction-emoji"
                        onClick={() => {
                            handleReaction(showReactionPicker, emoji);
                            setShowReactionPicker(null);
                        }}
                    >
                        {emoji}
                    </button>
                ))}
            </div>
        );
    };
    
    // Add typing indicator component
    const renderTypingIndicator = () => {
        if (!activeChat) return null;
        
        const typingUsers = Object.values(typingUsers[activeChat.id] || {})
            .filter(user => user.userId !== userData?.email)
            .map(user => user.userName);
        
        if (typingUsers.length === 0) return null;
        
        return (
            <div className="typing-indicator">
                {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
            </div>
        );
    };
    
    // Update the messages container in the chat interface
    const renderMessagesContainer = () => (
        <div className="messages-container">
            {messages
                .filter(msg => msg.chatId === activeChat.id)
                .map(renderMessage)}
            {renderTypingIndicator()}
            {renderReactionPicker()}
        </div>
    );

    if (loading) {
        return <div className="loading">Loading user data...</div>;
    }

    if (error) {
        return (
            <div className="login-container">
                <div className="login-box">
                    <div className="error-message">{error}</div>
                    <button onClick={() => navigate('/login')} className="login-button">Go to Login</button>
                </div>
            </div>
        );
    }

    if (!userData) {
        return (
            <div className="login-container">
                <div className="login-box">
                    <div className="error-message">User data not available</div>
                    <button onClick={() => navigate('/login')} className="login-button">Go to Login</button>
                </div>
            </div>
        );
    }

    // Content renderer based on active section
    const renderContent = () => {
        switch(activeSection) {
            case 'account':
                return (
                    <div className="content-section">
                        <h2>Informasi Akun</h2>
                        <div className="account-details">
                            <div className="detail-item">
                                <span className="detail-label">Name:</span>
                                <span className="detail-value">{userData.name || 'Not provided'}</span>
                            </div>
                            {userData.origin && (
                                <div className="detail-item">
                                    <span className="detail-label">Origin:</span>
                                    <span className="detail-value">{userData.origin}</span>
                                </div>
                            )}
                            {userData.nim && (
                                <div className="detail-item">
                                    <span className="detail-label">NIM:</span>
                                    <span className="detail-value">{userData.nim}</span>
                                </div>
                            )}
                            {userData.university && (
                                <div className="detail-item">
                                    <span className="detail-label">University:</span>
                                    <span className="detail-value">{userData.university}</span>
                                </div>
                            )}
                            <div className="detail-item">
                                <span className="detail-label">Email:</span>
                                <span className="detail-value">{userData.email || 'Not provided'}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Talent Incubator:</span>
                                <span className="detail-value">{userData.isTalentIncubator ? 'Yes' : 'No'}</span>
                            </div>
                        </div>
                    </div>
                );
            case 'news':
                return (
                    <div className="content-section">
                        <h2>Info Berita</h2>
                        <div className="news-container">
                            {news.length === 0 ? (
                                <div className="no-news-message">
                                    <h3>Belum ada berita</h3>
                                    <p>Berita akan muncul di sini.</p>
                                </div>
                            ) : (
                                news.map(item => (
                                    <div className={`news-item ${item.type === 'registration' ? 'registration-news' : ''}`} key={item.id}>
                                        <div className="news-header">
                                            <h3>{item.title}</h3>
                                        </div>
                                        {item.type === 'registration' && item.details ? (
                                            <div className="registration-details">
                                                <div className="registration-info">
                                                    <div className="registration-card">
                                                        <div className="registration-header">
                                                            <h4>Informasi Pendaftar</h4>
                                                        </div>
                                                        <div className="registration-body">
                                                            <div className="detail-row">
                                                                <span className="detail-label">Nama Lengkap:</span>
                                                                <span className="detail-value">{item.details.peserta}</span>
                                                            </div>
                                                            <div className="detail-row">
                                                                <span className="detail-label">Universitas:</span>
                                                                <span className="detail-value">{item.details.universitas}</span>
                                                            </div>
                                                            <div className="detail-row">
                                                                <span className="detail-label">Program Studi:</span>
                                                                <span className="detail-value">{item.details.programStudi || '-'}</span>
                                                            </div>
                                                            <div className="detail-row">
                                                                <span className="detail-label">Tipe Peserta:</span>
                                                                <span className="detail-value">{item.details.tipePeserta}</span>
                                                            </div>
                                                            {item.details.buktiPembayaran && item.details.buktiPembayaran !== 'Tidak ada' && (
                                                                <div className="detail-row">
                                                                    <span className="detail-label">Bukti Pembayaran:</span>
                                                                    <span className="detail-value payment-status">{item.details.buktiPembayaran}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="registration-qr">
                                                    <div className="qr-card">
                                                        <h4>QR Code Pendaftaran</h4>
                                                        <div className="qr-wrapper">
                                                            <QRCodeSVG 
                                                                value={item.details.qrData}
                                                                size={150}
                                                            />
                                                        </div>
                                                        <p className="qr-note">Simpan QR Code ini sebagai bukti pendaftaran</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <p>{item.content}</p>
                                        )}
                                        <div className="news-footer">
                                            <span className="news-date">
                                                {new Date(item.date).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                );
            case 'chat':
                return (
                    <div className="content-section chat-section">
                        <h2>Chat</h2>
                        <div className="chat-container">
                            <div className="chat-sidebar">
                                <div className="chat-header">
                                    <h3>Conversations</h3>
                                    <button 
                                        className="new-chat-button"
                                        onClick={() => setShowNewChatModal(true)}
                                    >
                                        <FontAwesomeIcon icon={faPlus} />
                                    </button>
                                </div>
                                
                                <div className="chat-list">
                                    {chats.length === 0 ? (
                                        <div className="no-chats-message">
                                            <p>No conversations yet</p>
                                            <button 
                                                className="start-chat-button"
                                                onClick={() => setShowNewChatModal(true)}
                                            >
                                                Start a New Chat
                                            </button>
                                        </div>
                                    ) : (
                                        chats.map(chat => (
                                            <div 
                                                key={chat.id}
                                                className={`chat-item ${activeChat?.id === chat.id ? 'active' : ''}`}
                                                onClick={() => setActiveChat(chat)}
                                            >
                                                <div className="chat-item-avatar">
                                                    {chat.type === 'group' ? (
                                                        <FontAwesomeIcon icon={faUsers} />
                                                    ) : (
                                                        <span>{chat.name.charAt(0)}</span>
                                                    )}
                                                </div>
                                                <div className="chat-item-info">
                                                    <h4>{chat.name}</h4>
                                                    <p>{chat.lastMessage || 'No messages yet'}</p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                            
                            <div className="chat-main">
                                {activeChat ? (
                                    <>
                                        <div className="chat-header">
                                            <h3>{activeChat.name}</h3>
                                            {activeChat.type === 'group' && (
                                                <button className="group-info-button">
                                                    <FontAwesomeIcon icon={faUsers} />
                                                </button>
                                            )}
                                        </div>
                                        
                                        {renderMessagesContainer()}
                                        
                                        {renderMessageInput()}
                                    </>
                                ) : (
                                    <div className="no-chat-selected">
                                        <FontAwesomeIcon icon={faComments} size="3x" />
                                        <h3>Select a conversation or start a new one</h3>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {/* New Chat Modal */}
                        {showNewChatModal && (
                            <div className="modal-overlay">
                                <div className="modal-content">
                                    <button className="close-button" onClick={() => setShowNewChatModal(false)}>
                                        <FontAwesomeIcon icon={faTimes} />
                                    </button>
                                    
                                    <h2>New Conversation</h2>
                                    
                                    <form onSubmit={handleCreateChat}>
                                        <div className="form-group">
                                            <label>Chat Type</label>
                                            <select
                                                value={newChatForm.type}
                                                onChange={(e) => setNewChatForm(prev => ({
                                                    ...prev,
                                                    type: e.target.value
                                                }))}
                                            >
                                                <option value="private">Private Chat</option>
                                                <option value="group">Group Chat</option>
                                            </select>
                                        </div>
                                        
                                        {newChatForm.type === 'group' && (
                                            <div className="form-group">
                                                <label>Group Name</label>
                                                <input
                                                    type="text"
                                                    value={newChatForm.name}
                                                    onChange={(e) => setNewChatForm(prev => ({
                                                        ...prev,
                                                        name: e.target.value
                                                    }))}
                                                    required
                                                />
                                            </div>
                                        )}
                                        
                                        <div className="form-group">
                                            <label>Select Participants</label>
                                            <div className="participants-list">
                                                {availableUsers.map(user => (
                                                    <div 
                                                        key={user.email}
                                                        className={`participant-item ${selectedParticipants.includes(user.email) ? 'selected' : ''}`}
                                                        onClick={() => toggleParticipant(user.email)}
                                                    >
                                                        <span className="participant-avatar">
                                                            {user.name.charAt(0)}
                                                        </span>
                                                        <span className="participant-name">{user.name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        
                                        <div className="form-actions">
                                            <button type="button" className="cancel-button" onClick={() => setShowNewChatModal(false)}>
                                                Cancel
                                            </button>
                                            <button type="submit" className="submit-button">
                                                Create Chat
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                        
                        {/* Floating Messages */}
                        {floatingMessages.map(message => (
                            <div 
                                key={message.id}
                                className="floating-message"
                                style={{
                                    left: `${message.position.x}px`,
                                    top: `${message.position.y}px`
                                }}
                            >
                                <div className="floating-message-content">
                                    <p>{message.content}</p>
                                    <span className="floating-message-sender">{message.sender}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                );
            case 'events':
                return (
                    <div className="content-section">
                        <h2>Event</h2>
                        <div className="my-events-container">
                            <div className="events-tabs">
                                <button 
                                    className={`events-tab ${activeEventTab === 'all' ? 'active' : ''}`}
                                    onClick={() => toggleEventTab('all')}
                                >
                                    Semua Event
                                </button>
                                <button 
                                    className={`events-tab ${activeEventTab === 'my' ? 'active' : ''}`}
                                    onClick={() => toggleEventTab('my')}
                                >
                                    Event Saya
                                </button>
                            </div>
                            
                            {/* All Events Tab */}
                            {activeEventTab === 'all' && (
                                allEvents.length === 0 ? (
                                    <div className="no-events-message">
                                        <h3>Tidak ada event tersedia</h3>
                                        <p>Event akan ditampilkan di sini.</p>
                                    </div>
                                ) : (
                                    <div className="all-events">
                                        {allEvents.map(event => (
                                            <div className="event-card" key={event.id}>
                                                <div className="event-image-container">
                                                    <img 
                                                        src={event.flyer || "/img/placeholder.jpg"} 
                                                        alt={`${event.title} flyer`} 
                                                        className="event-flyer"
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = "/img/placeholder.jpg";
                                                        }}
                                                    />
                                                </div>
                                                
                                                <div className="event-content">
                                                    <h3 className="event-title">{event.title}</h3>
                                                    
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
                                                        <button 
                                                            className="register-button"
                                                            onClick={() => handleRegisterEvent(event)}
                                                        >
                                                            Register Now 
                                                            <FontAwesomeIcon icon={faArrowRight} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )
                            )}
                            
                            {/* My Events Tab */}
                            {activeEventTab === 'my' && (
                                myEvents.length === 0 ? (
                                    <div className="no-events-message">
                                        <h3>Belum ada event terdaftar</h3>
                                        <p>Daftar untuk event yang tersedia di tab Semua Event.</p>
                                    </div>
                                ) : (
                                    <div className="registered-events">
                                        {myEvents.map(registration => (
                                            <div className="registered-event-card" key={registration.id}>
                                                <div className="event-status-badge" data-status={registration.status}>
                                                    {registration.status === 'approved' ? 'Disetujui' : 
                                                    registration.status === 'rejected' ? 'Ditolak' : 'Menunggu Persetujuan'}
                                                </div>
                                                
                                                <h3>{registration.eventTitle}</h3>
                                                
                                                <div className="event-meta">
                                                    {registration.eventDetails && registration.eventDetails.date && (
                                                        <div className="event-meta-item">
                                                            <FontAwesomeIcon icon={faCalendar} />
                                                            <span>{new Date(registration.eventDetails.date).toLocaleDateString('id-ID', {
                                                                weekday: 'long', 
                                                                day: 'numeric', 
                                                                month: 'long', 
                                                                year: 'numeric'
                                                            })}</span>
                                                        </div>
                                                    )}
                                                    
                                                    {registration.eventDetails && registration.eventDetails.location && (
                                                        <div className="event-meta-item">
                                                            <FontAwesomeIcon icon={faMapMarkerAlt} />
                                                            <span>{registration.eventDetails.location}</span>
                                                        </div>
                                                    )}
                                                    
                                                    {registration.eventDetails && registration.eventDetails.time && (
                                                        <div className="event-meta-item">
                                                            <FontAwesomeIcon icon={faClock} />
                                                            <span>{registration.eventDetails.time}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                <div className="registration-details-mini">
                                                    <p><strong>Terdaftar sebagai:</strong> {registration.tipePeserta}</p>
                                                    <p><strong>Status Kehadiran:</strong> {registration.attended ? 'Hadir' : 'Belum Hadir'}</p>
                                                    {registration.buktiPembayaran && registration.buktiPembayaran !== 'Tidak ada' && (
                                                        <p><strong>Pembayaran:</strong> {registration.buktiPembayaran}</p>
                                                    )}
                                                </div>
                                                
                                                <div className="event-qr-mini">
                                                    <QRCodeSVG value={registration.qrData} size={80} />
                                                    <p className="qr-note-mini">Tunjukkan QR Code ini saat hadir di event</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )
                            )}
                        </div>
                        
                        {/* Registration Modal */}
                        {showRegistrationModal && selectedEvent && (
                            <div className="modal-overlay">
                                <div className="modal-content">
                                    <button className="close-button" onClick={handleCloseModal}>
                                        <FontAwesomeIcon icon={faTimes} />
                                    </button>
                                    
                                    <h2>Pendaftaran Event</h2>
                                    
                                    <div className="event-info">
                                        <h3>{selectedEvent.title}</h3>
                                        <div className="event-info-details">
                                            <div className="info-item">
                                                <FontAwesomeIcon icon={faCalendar} />
                                                <span>{formatDate(selectedEvent.date)}</span>
                                            </div>
                                            <div className="info-item">
                                                <FontAwesomeIcon icon={faMapMarkerAlt} />
                                                <span>{selectedEvent.location}</span>
                                            </div>
                                            <div className="info-item">
                                                <FontAwesomeIcon icon={faClock} />
                                                <span>{selectedEvent.time}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <form onSubmit={handleSubmitRegistration}>
                                        <div className="form-group">
                                            <label htmlFor="peserta">Nama Lengkap</label>
                                            <input 
                                                type="text" 
                                                id="peserta" 
                                                name="peserta" 
                                                value={registrationForm.peserta}
                                                onChange={handleFormChange}
                                                required
                                            />
                                        </div>
                                        
                                        <div className="form-group">
                                            <label htmlFor="email">Email</label>
                                            <input 
                                                type="email" 
                                                id="email" 
                                                name="email" 
                                                value={registrationForm.email}
                                                onChange={handleFormChange}
                                                required
                                            />
                                        </div>
                                        
                                        <div className="form-group">
                                            <label htmlFor="university">Universitas / Institusi</label>
                                            <input 
                                                type="text" 
                                                id="university" 
                                                name="university" 
                                                value={registrationForm.university}
                                                onChange={handleFormChange}
                                                required
                                            />
                                        </div>
                                        
                                        <div className="form-group">
                                            <label htmlFor="programStudi">Program Studi</label>
                                            <input 
                                                type="text" 
                                                id="programStudi" 
                                                name="programStudi" 
                                                value={registrationForm.programStudi}
                                                onChange={handleFormChange}
                                            />
                                        </div>
                                        
                                        <div className="form-group">
                                            <label htmlFor="tipePeserta">Tipe Peserta</label>
                                            <select 
                                                id="tipePeserta" 
                                                name="tipePeserta" 
                                                value={registrationForm.tipePeserta}
                                                onChange={handleFormChange}
                                                required
                                            >
                                                <option value="Umum">Umum</option>
                                                <option value="Mahasiswa">Mahasiswa</option>
                                                <option value="Dosen">Dosen</option>
                                                <option value="Profesional">Profesional</option>
                                            </select>
                                        </div>
                                        
                                        <div className="form-group">
                                            <label htmlFor="buktiPembayaran">Bukti Pembayaran</label>
                                            <select 
                                                id="buktiPembayaran" 
                                                name="buktiPembayaran" 
                                                value={registrationForm.buktiPembayaran}
                                                onChange={handleFormChange}
                                            >
                                                <option value="Tidak ada">Tidak Ada (Gratis)</option>
                                                <option value="Sudah Dibayar">Sudah Dibayar</option>
                                                <option value="Menunggu Konfirmasi">Menunggu Konfirmasi</option>
                                            </select>
                                            <span className="form-helper-text">Pilih "Tidak Ada" jika event gratis</span>
                                        </div>
                                        
                                        <div className="form-actions">
                                            <button type="button" className="cancel-button" onClick={handleCloseModal}>
                                                Batal
                                            </button>
                                            <button type="submit" className="submit-button">
                                                Daftar Sekarang
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                );
            case 'courses':
                return (
                    <div className="content-section">
                        <h2>Kursus Saya</h2>
                        <div className="courses-container">
                            {myCourses.length === 0 ? (
                                <div className="no-courses-message">
                                    <h3>Belum ada kursus yang diambil</h3>
                                    <p>Silakan cek kembali nanti untuk informasi kursus yang tersedia.</p>
                                </div>
                            ) : (
                                myCourses.map(course => (
                                    <div className="course-item" key={course.id}>
                                        <div className="course-header">
                                            {course.image && (
                                                <div className="course-image">
                                                    <img src={course.image} alt={course.title} />
                                                </div>
                                            )}
                                            <h3>{course.title}</h3>
                                        </div>
                                        <p className="course-description">{course.description}</p>
                                        {course.duration && (
                                            <div className="course-duration">
                                                <span><FontAwesomeIcon icon={faClock} /> {course.duration}</span>
                                            </div>
                                        )}
                                        <div className="course-progress">
                                            <div className="progress-bar" style={{width: `${course.progress}%`}}></div>
                                            <span>{course.progress}% selesai</span>
                                        </div>
                                        <div className="course-footer">
                                            <button className="course-button">Lanjutkan Belajar</button>
                                        </div>
                                    </div>
                                ))
                            )}
                            
                            {allCourses.length > myCourses.length && (
                                <div className="available-courses">
                                    <h3>Kursus Tersedia Lainnya</h3>
                                    <div className="available-courses-list">
                                        {allCourses
                                            .filter(course => !myCourses.some(myCourse => myCourse.id === course.id))
                                            .map(course => (
                                                <div className="available-course-item" key={course.id}>
                                                    <h4>{course.title}</h4>
                                                    <p>{course.description.substring(0, 100)}{course.description.length > 100 ? '...' : ''}</p>
                                                    <button className="enroll-button">Daftar Kursus</button>
                                                </div>
                                            ))
                                        }
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                );
            case 'certificates':
                return (
                    <div className="content-section">
                        <h2>Sertifikat Saya</h2>
                        <div className="certificates-container">
                            {myCertificates.length === 0 ? (
                                <div className="no-certificates-message">
                                    <h3>Belum ada sertifikat</h3>
                                    <p>Selesaikan kursus untuk mendapatkan sertifikat.</p>
                                </div>
                            ) : (
                                myCertificates.map(certificate => (
                                    <div className="certificate-item" key={certificate.id}>
                                        <div className="certificate-header">
                                            <FontAwesomeIcon icon={faCertificate} className="certificate-icon" />
                                            <h3>{certificate.title}</h3>
                                        </div>
                                        <p>{certificate.description}</p>
                                        <p className="certificate-date">
                                            Diterbitkan: {new Date(certificate.issueDate).toLocaleDateString('id-ID', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric'
                                            })}
                                        </p>
                                        <button className="certificate-download">
                                            <i className="fas fa-download"></i> Unduh Sertifikat
                                        </button>
                                    </div>
                                ))
                            )}
                            
                            {myCourses.some(course => course.progress >= 90) && myCertificates.length === 0 && (
                                <div className="pending-certificates">
                                    <h3>Sertifikat dalam Proses</h3>
                                    <p>Sertifikat untuk kursus yang telah selesai sedang dalam proses.</p>
                                </div>
                            )}
                        </div>
                    </div>
                );
            case 'saham':
                return (
                    <div className="content-section">
                        <h2>Saham</h2>
                        <div className="saham-container">
                            <div className="no-saham-message" style={{ textAlign: 'center', padding: '30px' }}>
                                <h3 style={{ color: 'var(--text-color)', marginBottom: '10px' }}>Belum ada data saham</h3>
                                <p style={{ color: 'var(--text-light)' }}>Data saham akan ditampilkan di sini.</p>
                            </div>
                        </div>
                    </div>
                );
            case 'settings':
                return (
                    <div className="content-section">
                        <h2>Pengaturan Akun</h2>
                        <div className="settings-form">
                            <div className="form-group">
                                <label>Nama Lengkap</label>
                                <input type="text" defaultValue={userData.name || ''} className="form-control" />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input type="email" defaultValue={userData.email || ''} className="form-control" />
                            </div>
                            <div className="form-group">
                                <label>Universitas</label>
                                <input type="text" defaultValue={userData.university || ''} className="form-control" />
                            </div>
                            <div className="form-group">
                                <label>Password Baru</label>
                                <input type="password" className="form-control" />
                            </div>
                            <div className="form-group">
                                <label>Konfirmasi Password</label>
                                <input type="password" className="form-control" />
                            </div>
                            <button className="save-settings">Simpan Perubahan</button>
                        </div>
                    </div>
                );
            default:
                return <div>Pilih menu di sidebar</div>;
        }
    };

    return (
        <div className={`dashboard-container ${sidebarOpen ? 'sidebar-open' : ''} ${isLightMode ? 'light-theme' : ''}`}>
            {/* Mobile overlay */}
            {sidebarOpen && <div className="mobile-overlay" onClick={handleOverlayClick}></div>}
            
            {/* Sidebar toggle button for mobile */}
            <button className="sidebar-toggle" onClick={toggleSidebar}>
                <FontAwesomeIcon icon={isSidebarMinimized ? faChevronRight : faChevronLeft} />
            </button>
            
            <div className={`sidebar ${isSidebarMinimized ? 'minimized' : ''}`}>
                <div className="sidebar-header">
                    <h2>Eduvation Talent</h2>
                    {/* Close button visible only on mobile */}
                    <button className="sidebar-close" onClick={() => setSidebarOpen(false)}>
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>
                
                <div className="user-info">
                    <div className="user-avatar">
                        {userData?.name?.charAt(0) || 'U'}
                    </div>
                    <span className="user-name">{userData?.name}</span>
                    
                    {/* Add theme toggle button */}
                    <div className="mode-switch-container">
                        <label className="mode-switch">
                            <input 
                                type="checkbox" 
                                checked={isLightMode} 
                                onChange={toggleTheme}
                            />
                            <span className="mode-slider">
                                <div className="mode-icons">
                                    <FontAwesomeIcon icon={faSun} />
                                    <FontAwesomeIcon icon={faMoon} />
                                </div>
                            </span>
                        </label>
                    </div>
                </div>
                
                <div className="sidebar-menu">
                    <div 
                        className={`menu-item ${activeSection === 'account' ? 'active' : ''}`}
                        onClick={() => handleMenuClick('account')}
                    >
                        <span className="menu-icon">
                            <FontAwesomeIcon icon={faUser} />
                        </span>
                        <span>Account</span>
                    </div>
                    
                    <div 
                        className={`menu-item ${activeSection === 'news' ? 'active' : ''}`}
                        onClick={() => handleMenuClick('news')}
                    >
                        <span className="menu-icon">
                            <FontAwesomeIcon icon={faNewspaper} />
                        </span>
                        <span>News</span>
                    </div>
                    
                    <div 
                        className={`menu-item ${activeSection === 'chat' ? 'active' : ''}`}
                        onClick={() => handleMenuClick('chat')}
                    >
                        <span className="menu-icon">
                            <FontAwesomeIcon icon={faComments} />
                        </span>
                        <span>Chat</span>
                    </div>
                    
                    <div 
                        className={`menu-item ${activeSection === 'events' ? 'active' : ''}`}
                        onClick={() => handleMenuClick('events')}
                    >
                        <span className="menu-icon">
                            <FontAwesomeIcon icon={faCalendarAlt} />
                        </span>
                        <span>Events</span>
                    </div>
                    
                    <div 
                        className={`menu-item ${activeSection === 'courses' ? 'active' : ''}`}
                        onClick={() => handleMenuClick('courses')}
                    >
                        <span className="menu-icon">
                            <FontAwesomeIcon icon={faBook} />
                        </span>
                        <span>Courses</span>
                    </div>
                    
                    <div 
                        className={`menu-item ${activeSection === 'certificates' ? 'active' : ''}`}
                        onClick={() => handleMenuClick('certificates')}
                    >
                        <span className="menu-icon">
                            <FontAwesomeIcon icon={faCertificate} />
                        </span>
                        <span>Certificates</span>
                    </div>
                    
                    <div 
                        className={`menu-item ${activeSection === 'saham' ? 'active' : ''}`}
                        onClick={() => handleMenuClick('saham')}
                    >
                        <span className="menu-icon">
                            <FontAwesomeIcon icon={faChartLine} />
                        </span>
                        <span>Saham</span>
                    </div>
                    
                    <div 
                        className={`menu-item ${activeSection === 'settings' ? 'active' : ''}`}
                        onClick={() => handleMenuClick('settings')}
                    >
                        <span className="menu-icon">
                            <FontAwesomeIcon icon={faCog} />
                        </span>
                        <span>Settings</span>
                    </div>
                </div>
                
                <div className="logout-container">
                    <button className="logout-button" onClick={handleLogout}>
                        <span className="menu-icon">
                            <FontAwesomeIcon icon={faSignOutAlt} />
                        </span>
                        <span>Logout</span>
                    </button>
                </div>
            </div>
            
            {renderContent()}
        </div>
    );
};

export default TalentAccount;