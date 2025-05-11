import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/Login.css';
import '../styles/AdminDashboard.css';
import jsQR from 'jsqr';

// Add font awesome stylesheet
const fontAwesomeLink = document.createElement('link');
fontAwesomeLink.rel = 'stylesheet';
fontAwesomeLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
document.head.appendChild(fontAwesomeLink);

// Add Google Font
const fontLink = document.createElement('link');
fontLink.rel = 'stylesheet';
fontLink.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap';
document.head.appendChild(fontLink);

const AdminDashboard = ({ initialSection = 'profile' }) => {
    const [adminData, setAdminData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeSection, setActiveSection] = useState(initialSection);
    const navigate = useNavigate();
    const location = useLocation();
    
    // Sidebar state for mobile view
    const [sidebarOpen, setSidebarOpen] = useState(false);
    
    // Theme state for light/dark mode
    const [isLightMode, setIsLightMode] = useState(() => {
        const savedMode = localStorage.getItem('adminThemeMode');
        return savedMode ? savedMode === 'light' : true;
    });
    
    // Toggle sidebar function
    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };
    
    // Toggle theme function
    const toggleTheme = () => {
        const newMode = !isLightMode;
        setIsLightMode(newMode);
        document.body.className = newMode ? 'light-theme' : 'dark-theme';
        localStorage.setItem('adminThemeMode', newMode ? 'light' : 'dark');
    };
    
    // Close sidebar when clicking outside
    const handleOverlayClick = () => {
        setSidebarOpen(false);
    };
    
    // Success action animation state
    const [successAction, setSuccessAction] = useState(null);
    
    // Highlight state for registrants found from QR scan
    const [highlightedRegistrantId, setHighlightedRegistrantId] = useState(null);
    const [scannedNewRegistrant, setScannedNewRegistrant] = useState(null);
    const [showAddRegistrantModal, setShowAddRegistrantModal] = useState(false);
    
    // Payment proof modal state
    const [showPaymentProofModal, setShowPaymentProofModal] = useState(false);
    const [selectedPaymentProof, setSelectedPaymentProof] = useState(null);
    
    // System Settings state
    const [websiteSettings, setWebsiteSettings] = useState({
        siteTitle: 'EDUV',
        siteDescription: '',
        contactEmail: '',
        socialMedia: {
            facebook: '',
            twitter: '',
            instagram: ''
        },
        maintenanceMode: false
    });

    // Event management state
    const [events, setEvents] = useState([]);
    const [newEvent, setNewEvent] = useState({
        title: '',
        date: '',
        time: '',
        location: '',
        description: '',
        flyer: null,
        requiresPayment: false
    });
    const [eventMessage, setEventMessage] = useState('');
    const [viewingEvent, setViewingEvent] = useState(null);
    const [editingEvent, setEditingEvent] = useState(null);
    const [eventFormData, setEventFormData] = useState({
        title: '',
        date: '',
        time: '',
        location: '',
        description: '',
        flyer: null,
        requiresPayment: false
    });

    // News management state
    const [news, setNews] = useState([]);
    const [newNewsItem, setNewNewsItem] = useState({
        title: '',
        content: '',
        type: 'announcement'
    });
    const [viewingNews, setViewingNews] = useState(null);
    const [editingNews, setEditingNews] = useState(null);
    const [newsFormData, setNewsFormData] = useState({
        title: '',
        content: '',
        type: 'announcement'
    });

    // Course management state
    const [courses, setCourses] = useState([]);
    const [newCourse, setNewCourse] = useState({
        title: '',
        description: '',
        duration: '',
        modules: [],
        image: null
    });
    const [courseMessage, setCourseMessage] = useState('');
    const [viewingCourse, setViewingCourse] = useState(null);
    const [editingCourse, setEditingCourse] = useState(null);
    const [courseFormData, setCourseFormData] = useState({
        title: '',
        description: '',
        duration: '',
        modules: [],
        image: null
    });

    // Certificate management state
    const [certificates, setCertificates] = useState([]);
    const [newCertificate, setNewCertificate] = useState({
        title: '',
        description: '',
        forCourse: '',
        image: null
    });
    const [certificateMessage, setCertificateMessage] = useState('');
    const [viewingCertificate, setViewingCertificate] = useState(null);
    const [editingCertificate, setEditingCertificate] = useState(null);
    const [certificateFormData, setCertificateFormData] = useState({
        title: '',
        description: '',
        forCourse: '',
        image: null
    });

    // Talent and Registrant management state
    const [talents, setTalents] = useState([]);
    const [registrants, setRegistrants] = useState([]);
    const [activeTab, setActiveTab] = useState('talents'); // 'talents' or 'registrants' or 'attendance' or 'accounts'
    const [editingRegistrant, setEditingRegistrant] = useState(null);
    const [registrantFormData, setRegistrantFormData] = useState({
        name: '',
        email: '',
        event: '',
        status: '',
        university: '',
        program: '',
        paymentProof: null
    });
    const [editingTalent, setEditingTalent] = useState(null);
    const [talentFormData, setTalentFormData] = useState({
        name: '',
        email: '',
        specialization: '',
        status: ''
    });
    
    // QR scanner and attendance state
    const [scanning, setScanning] = useState(false);
    const [qrResult, setQrResult] = useState('');
    const [scannedAttendee, setScannedAttendee] = useState(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [attendanceFilter, setAttendanceFilter] = useState('all'); // 'all', 'attended', 'notAttended'

    // Add new state for viewing talent details
    const [viewingTalent, setViewingTalent] = useState(null);

    // Add new state for viewing registrant details
    const [viewingRegistrant, setViewingRegistrant] = useState(null);

    // Add new state variable for the accounts tab
    const [accounts, setAccounts] = useState([]);
    const [editingAccount, setEditingAccount] = useState(null);
    const [accountFormData, setAccountFormData] = useState({
        name: '',
        email: '',
        university: '',
        status: 'active',
        password: '',
        showPassword: false
    });

    // Close talent view
    const closeTalentView = () => {
        setViewingTalent(null);
    };

    // Close registrant view
    const closeRegistrantView = () => {
        setViewingRegistrant(null);
    };

    useEffect(() => {
        // Check if admin is logged in
        const admin = localStorage.getItem('admin');
        const adminToken = localStorage.getItem('adminToken');
        
        if (!admin || !adminToken) {
            navigate('/admin/login');
            return;
        }
        
        try {
            const parsedAdminData = JSON.parse(admin);
            setAdminData(parsedAdminData);
            
            // Load events from localStorage if available
            const savedEvents = localStorage.getItem('events');
            if (savedEvents) {
                setEvents(JSON.parse(savedEvents));
            }
            
            // Load talents and their registrations
            fetchTalentsAndRegistrations();
        } catch (err) {
            console.error('Error parsing admin data:', err.message);
            setError('An error occurred while loading your profile');
            localStorage.removeItem('admin');
            localStorage.removeItem('adminToken');
            navigate('/admin/login');
        } finally {
            setLoading(false);
        }
    }, [navigate, location]);

    // Effect for applying theme
    useEffect(() => {
        // Apply theme when component mounts
        document.body.className = isLightMode ? 'light-theme' : 'dark-theme';
    }, [isLightMode]);

    const handleLogout = () => {
        localStorage.removeItem('admin');
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
    };

    const handleEventInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setNewEvent({
            ...newEvent,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleFlyerUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Convert image to base64 string for demo purposes
            // In a real app, you'd use a proper file upload system
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewEvent({
                    ...newEvent,
                    flyer: reader.result
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAddEvent = (e) => {
        e.preventDefault();
        
        // Validate form
        if (!newEvent.title || !newEvent.date || !newEvent.location || !newEvent.description) {
            setEventMessage('Please fill in all required fields');
            return;
        }
        
        // Create new event object with unique ID
        const eventToAdd = {
            ...newEvent,
            id: Date.now(), // Simple unique ID
            date: new Date(newEvent.date).toISOString() // Store as ISO string for consistency
        };
        
        // Add to events array
        const updatedEvents = [...events, eventToAdd];
        setEvents(updatedEvents);
        
        // Save to localStorage
        localStorage.setItem('events', JSON.stringify(updatedEvents));
        
        // Create a news item about this new event
        const eventNewsItem = {
            id: Date.now() + 1, // Ensure unique ID
            title: `New Event: ${newEvent.title}`,
            content: `A new event has been scheduled: ${newEvent.title} on ${new Date(newEvent.date).toLocaleDateString()} at ${newEvent.location}. ${newEvent.description}`,
            type: 'news',
            date: new Date().toISOString()
        };
        
        // Add to news
        const savedNews = JSON.parse(localStorage.getItem('news') || '[]');
        localStorage.setItem('news', JSON.stringify([eventNewsItem, ...savedNews]));
        
        // Reset form
        setNewEvent({
            title: '',
            date: '',
            time: '',
            location: '',
            description: '',
            flyer: null,
            requiresPayment: false
        });
        
        setEventMessage('Event added successfully');
        
        // Clear success message after 3 seconds
        setTimeout(() => {
            setEventMessage('');
        }, 3000);
    };

    const deleteEvent = (id) => {
        const updatedEvents = events.filter(event => event.id !== id);
        setEvents(updatedEvents);
        localStorage.setItem('events', JSON.stringify(updatedEvents));
        setEventMessage('Event deleted successfully');
        
        // Clear success message after 3 seconds
        setTimeout(() => {
            setEventMessage('');
        }, 3000);
    };

    const handleWebsiteSettingsChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name.startsWith('social.')) {
            const platform = name.split('.')[1];
            setWebsiteSettings(prev => ({
                ...prev,
                socialMedia: {
                    ...prev.socialMedia,
                    [platform]: value
                }
            }));
        } else {
            setWebsiteSettings(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

    const saveWebsiteSettings = () => {
        localStorage.setItem('websiteSettings', JSON.stringify(websiteSettings));
        setEventMessage('Website settings saved successfully');
        setTimeout(() => {
            setEventMessage('');
        }, 3000);
    };

    useEffect(() => {
        // Load website settings from localStorage
        const savedSettings = localStorage.getItem('websiteSettings');
        if (savedSettings) {
            setWebsiteSettings(JSON.parse(savedSettings));
        }
    }, []);

    const handleNewsInputChange = (e) => {
        const { name, value } = e.target;
        setNewNewsItem({
            ...newNewsItem,
            [name]: value
        });
    };

    const handleAddNews = (e) => {
        e.preventDefault();
        
        // Validate form
        if (!newNewsItem.title || !newNewsItem.content) {
            setEventMessage('Please fill in all required fields for news');
            return;
        }
        
        // Create new news object with unique ID
        const newsItemToAdd = {
            ...newNewsItem,
            id: Date.now(),
            date: new Date().toISOString()
        };
        
        // Add to news array
        const updatedNews = [newsItemToAdd, ...news];
        setNews(updatedNews);
        
        // Save to localStorage 
        localStorage.setItem('news', JSON.stringify(updatedNews));
        
        // Reset form
        setNewNewsItem({
            title: '',
            content: '',
            type: 'announcement'
        });
        
        setEventMessage('News item added successfully');
        
        // Clear success message after 3 seconds
        setTimeout(() => {
            setEventMessage('');
        }, 3000);
    };

    const deleteNewsItem = (id) => {
        const updatedNews = news.filter(item => item.id !== id);
        setNews(updatedNews);
        localStorage.setItem('news', JSON.stringify(updatedNews));
        setEventMessage('News item deleted successfully');
        
        // Clear success message after 3 seconds
        setTimeout(() => {
            setEventMessage('');
        }, 3000);
    };

    useEffect(() => {
        // Load news from localStorage
        const savedNews = localStorage.getItem('news');
        if (savedNews) {
            setNews(JSON.parse(savedNews));
        }
    }, []);

    const fetchTalentsAndRegistrations = async () => {
        try {
            // Load talents from localStorage
            let talentData = [];
            const savedTalents = localStorage.getItem('talents');
            
            if (savedTalents) {
                talentData = JSON.parse(savedTalents);
            } else {
                // If no talents in localStorage, check for individual user accounts
                // and create a talents array
                const userAccounts = [];
                // Try to find all user accounts in localStorage
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key === 'user' || key.startsWith('user_')) {
                        try {
                            const userData = JSON.parse(localStorage.getItem(key));
                            if (userData && userData.email) {
                                userAccounts.push(userData);
                            }
                        } catch (e) {
                            console.error('Error parsing user data:', e);
                        }
                    }
                }
                
                // Convert user accounts to talent format
                if (userAccounts.length > 0) {
                    talentData = userAccounts.map((user, index) => ({
                        id: index + 1,
                        name: user.name || 'Unknown',
                        email: user.email,
                        specialization: user.university || 'Not specified',
                        status: user.isLoggedIn ? 'active' : 'inactive'
                    }));
                    
                    // Save to talents in localStorage for future use
                    localStorage.setItem('talents', JSON.stringify(talentData));
                } else {
                    // If no users found, use sample data
                    talentData = [
                      // Sample data here
                    ];
                    // Save sample data
                    localStorage.setItem('talents', JSON.stringify(talentData));
                }
            }
            
            // Load event registrations from localStorage
            let registrantData = [];
            
            // Load from new registrations format
            const newRegistrations = localStorage.getItem('registrations');
            if (newRegistrations) {
                try {
                    const parsedNewRegistrations = JSON.parse(newRegistrations);
                    
                    // Map the new registrations to the expected format
                    const formattedRegistrations = parsedNewRegistrations.map(reg => {
                        // Try to find matching talent
                        const matchingTalent = talentData.find(t => t.email === reg.email);
                        const talentId = matchingTalent ? matchingTalent.id : null;
                        
                        return {
                            id: reg.id,
                            name: reg.peserta,
                            email: reg.email,
                            event: reg.eventTitle,
                            registrationDate: new Date(reg.registered),
                            status: reg.status || 'pending',
                            university: reg.universitas,
                            program: reg.programStudi,
                            type: reg.tipePeserta,
                            talentId: talentId,
                            attended: reg.attended || false,
                            attendanceTime: reg.attendanceTime || null,
                            paymentProof: reg.buktiPembayaran || null,
                            qrData: reg.qrData,
                            nim: reg.nim
                        };
                    });
                    
                    registrantData = [...registrantData, ...formattedRegistrations];
                } catch (error) {
                    console.error('Error parsing new registrations:', error);
                }
            }
            
            // Also load from old format for backward compatibility
            const savedRegistrations = localStorage.getItem('eventRegistrations');
            if (savedRegistrations) {
                try {
                    const parsedRegistrations = JSON.parse(savedRegistrations);
                    const eventsData = JSON.parse(localStorage.getItem('events') || '[]');
                    
                    // Convert to expected format
                    const formattedOldRegistrations = parsedRegistrations.map(reg => {
                        const matchingTalent = talentData.find(t => t.email === reg.email);
                        const talentId = matchingTalent ? matchingTalent.id : Math.floor(Math.random() * talentData.length) + 1;
                        
                        // Find if this event requires payment
                        const eventData = eventsData.find(e => e.title === reg.eventTitle);
                        const requiresPayment = eventData ? eventData.requiresPayment : false;
                        
                        return {
                            id: reg.id,
                            name: reg.name,
                            email: reg.email || `${reg.name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
                            event: reg.eventTitle,
                            registrationDate: new Date(reg.date),
                            status: reg.status || 'pending',
                            university: reg.university,
                            program: reg.program,
                            type: reg.type,
                            talentId: reg.talentId || talentId,
                            attended: reg.attended || false,
                            attendanceTime: reg.attendanceTime || null,
                            paymentProof: reg.paymentProof || null,
                            requiresPayment: requiresPayment
                        };
                    });
                    
                    // Merge with new registrations
                    registrantData = [...registrantData, ...formattedOldRegistrations];
                } catch (error) {
                    console.error('Error parsing old registrations:', error);
                }
            }
            
            setTalents(talentData);
            setRegistrants(registrantData);
        } catch (error) {
            console.error('Error fetching talents and registrations:', error);
            setError('Failed to load talents and registrations data');
        }
    };

    const handleRegistrantStatusChange = (registrantId, newStatus) => {
        const updatedRegistrants = registrants.map(reg => 
            reg.id === registrantId ? {...reg, status: newStatus} : reg
        );
        setRegistrants(updatedRegistrants);
        
        // Update in localStorage
        const savedRegistrations = JSON.parse(localStorage.getItem('eventRegistrations') || '[]');
        const updatedSavedRegistrations = savedRegistrations.map(reg => 
            reg.id === registrantId ? {...reg, status: newStatus} : reg
        );
        localStorage.setItem('eventRegistrations', JSON.stringify(updatedSavedRegistrations));
        
        setEventMessage(`Registrant status updated to ${newStatus}`);
        setTimeout(() => {
            setEventMessage('');
        }, 3000);
    };

    const deleteRegistrant = (id) => {
        try {
            const updatedRegistrants = registrants.filter(reg => reg.id !== id);
            setRegistrants(updatedRegistrants);
            
            // Update in new format
            try {
                const newRegistrations = JSON.parse(localStorage.getItem('registrations') || '[]');
                const updatedNewRegistrations = newRegistrations.filter(reg => reg.id !== id);
                localStorage.setItem('registrations', JSON.stringify(updatedNewRegistrations));
            } catch (err) {
                console.error('Error updating registrations on delete:', err);
            }
            
            // Update in old format for backward compatibility
            try {
                const savedRegistrations = JSON.parse(localStorage.getItem('eventRegistrations') || '[]');
                const updatedSavedRegistrations = savedRegistrations.filter(reg => reg.id !== id);
                localStorage.setItem('eventRegistrations', JSON.stringify(updatedSavedRegistrations));
            } catch (err) {
                console.error('Error updating eventRegistrations on delete:', err);
            }
            
            setEventMessage('Registrant removed successfully');
            setTimeout(() => {
                setEventMessage('');
            }, 3000);
        } catch (error) {
            console.error('Error deleting registrant:', error);
            setEventMessage('Error removing registrant. Please try again.');
            setTimeout(() => {
                setEventMessage('');
            }, 3000);
        }
    };
    
    const startEditingRegistrant = (registrant) => {
        try {
            setEditingRegistrant(registrant);
            setRegistrantFormData({
                name: registrant.name || '',
                email: registrant.email || '',
                event: registrant.event || '',
                status: registrant.status || 'pending',
                university: registrant.university || '',
                program: registrant.program || '',
                paymentProof: registrant.paymentProof || null
            });
        } catch (error) {
            console.error('Error starting edit:', error);
            setEventMessage('Error preparing form. Please try again.');
            setTimeout(() => {
                setEventMessage('');
            }, 3000);
        }
    };
    
    const cancelEditingRegistrant = () => {
        setEditingRegistrant(null);
    };
    
    const handleRegistrantFormChange = (e) => {
        const { name, value } = e.target;
        setRegistrantFormData({
            ...registrantFormData,
            [name]: value
        });
    };
    
    const saveRegistrantEdit = () => {
        try {
            // Update in state
            const updatedRegistrants = registrants.map(reg => 
                reg.id === editingRegistrant.id ? {...reg, ...registrantFormData} : reg
            );
            setRegistrants(updatedRegistrants);
            
            // Update in new registrations format
            try {
                const newRegistrations = JSON.parse(localStorage.getItem('registrations') || '[]');
                const updatedNewRegistrations = newRegistrations.map(reg => 
                    reg.id === editingRegistrant.id ? 
                    {...reg, 
                        peserta: registrantFormData.name,
                        email: registrantFormData.email,
                        eventTitle: registrantFormData.event,
                        status: registrantFormData.status,
                        universitas: registrantFormData.university,
                        programStudi: registrantFormData.program
                    } : reg
                );
                localStorage.setItem('registrations', JSON.stringify(updatedNewRegistrations));
            } catch (err) {
                console.error('Error updating new registrations format:', err);
            }
            
            // Update in old registrations format for backward compatibility
            try {
                const savedRegistrations = JSON.parse(localStorage.getItem('eventRegistrations') || '[]');
                const updatedSavedRegistrations = savedRegistrations.map(reg => 
                    reg.id === editingRegistrant.id ? 
                    {...reg, 
                        name: registrantFormData.name,
                        email: registrantFormData.email,
                        eventTitle: registrantFormData.event,
                        status: registrantFormData.status,
                        university: registrantFormData.university,
                        program: registrantFormData.program
                    } : reg
                );
                localStorage.setItem('eventRegistrations', JSON.stringify(updatedSavedRegistrations));
            } catch (err) {
                console.error('Error updating old registrations format:', err);
            }
            
            setEventMessage('Registrant updated successfully');
            setTimeout(() => {
                setEventMessage('');
            }, 3000);
            
            setEditingRegistrant(null);
        } catch (error) {
            console.error('Error saving registrant edit:', error);
            setEventMessage('Error saving changes. Please try again.');
            setTimeout(() => {
                setEventMessage('');
            }, 3000);
        }
    };
    
    const viewTalentDetails = (talentId) => {
        const talent = talents.find(t => t.id === talentId);
        if (talent) {
            // Replace alert with a more reliable way to show talent details
            setViewingTalent(talent);
        } else {
            setEventMessage('Talent information not found');
            setTimeout(() => {
                setEventMessage('');
            }, 3000);
        }
    };
    
    const startEditingTalent = (talent) => {
        setEditingTalent(talent);
        setTalentFormData({
            name: talent.name,
            email: talent.email,
            specialization: talent.specialization,
            status: talent.status
        });
    };
    
    const cancelEditingTalent = () => {
        setEditingTalent(null);
    };
    
    const handleTalentFormChange = (e) => {
        const { name, value } = e.target;
        setTalentFormData({
            ...talentFormData,
            [name]: value
        });
    };
    
    const saveTalentEdit = () => {
        // Update in state
        const updatedTalents = talents.map(talent => 
            talent.id === editingTalent.id ? {...talent, ...talentFormData} : talent
        );
        setTalents(updatedTalents);
        
        // Update in localStorage
        localStorage.setItem('talents', JSON.stringify(updatedTalents));
        
        setEventMessage('Talent updated successfully');
        setTimeout(() => {
            setEventMessage('');
        }, 3000);
        
        setEditingTalent(null);
    };
    
    const deleteTalent = (id) => {
        const updatedTalents = talents.filter(talent => talent.id !== id);
        setTalents(updatedTalents);
        
        // Update in localStorage
        localStorage.setItem('talents', JSON.stringify(updatedTalents));
        
        setEventMessage('Talent removed successfully');
        setTimeout(() => {
            setEventMessage('');
        }, 3000);
    };

    // QR Scanner functions
    const startScanner = () => {
        setScanning(true);
        setQrResult('');
        setScannedAttendee(null);
        
        // Set a timeout to initialize the scanner after the component has rendered
        setTimeout(() => {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            
            if (!video || !canvas) return;
            
            const constraints = { video: { facingMode: 'environment' } };
            
            navigator.mediaDevices.getUserMedia(constraints)
                .then(stream => {
                    video.srcObject = stream;
                    video.setAttribute('playsinline', true); // required for iOS
                    video.play();
                    
                    // Start scanning for QR codes
                    requestAnimationFrame(scanQRCode);
                })
                .catch(err => {
                    console.error('Error accessing camera:', err);
                    setEventMessage('Error accessing camera. Please check permissions.');
                    setScanning(false);
                });
        }, 100);
    };
    
    const stopScanner = () => {
        const video = videoRef.current;
        if (video && video.srcObject) {
            const tracks = video.srcObject.getTracks();
            tracks.forEach(track => track.stop());
            video.srcObject = null;
        }
        setScanning(false);
    };
    
    const scanQRCode = () => {
        if (!scanning) return;
        
        const video = videoRef.current;
        const canvas = canvasRef.current;
        
        if (!video || !canvas || video.paused || video.ended) return;
        
        const ctx = canvas.getContext('2d');
        
        // Match canvas size to video
        if (video.videoWidth > 0 && video.videoHeight > 0) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            
            // Draw current video frame to canvas
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            try {
                // Get image data from canvas for QR code detection
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                
                // Detect QR code using jsQR library
                const code = jsQR(imageData.data, imageData.width, imageData.height, {
                    inversionAttempts: "dontInvert",
                });
                
                // If QR code is detected
                if (code) {
                    console.log("QR Code detected", code.data);
                    
                    // Draw a border around the detected QR code
                    ctx.beginPath();
                    ctx.lineWidth = 4;
                    ctx.strokeStyle = "#FF3B58";
                    ctx.moveTo(code.location.topLeftCorner.x, code.location.topLeftCorner.y);
                    ctx.lineTo(code.location.topRightCorner.x, code.location.topRightCorner.y);
                    ctx.lineTo(code.location.bottomRightCorner.x, code.location.bottomRightCorner.y);
                    ctx.lineTo(code.location.bottomLeftCorner.x, code.location.bottomLeftCorner.y);
                    ctx.lineTo(code.location.topLeftCorner.x, code.location.topLeftCorner.y);
                    ctx.stroke();
                    
                    // Add success animation
                    drawScanSuccess(ctx, canvas.width, canvas.height);
                    
                    // Process the QR code data
                    setQrResult(code.data);
                    processQRData(code.data);
                    
                    // Play success sound
                    playSuccessSound();
                    
                    // Stop scanning after successful detection
                    setTimeout(() => {
                        stopScanner();
                    }, 1000); // Give time for the success animation to play
                    return;
                }
                
                // If no code detected, draw scanning animation
                drawScanningAnimation(ctx, canvas.width, canvas.height);
                
                // Continue scanning if no QR code detected
                requestAnimationFrame(scanQRCode);
            } catch (error) {
                console.error('QR scanning error:', error);
                requestAnimationFrame(scanQRCode);
            }
        } else {
            requestAnimationFrame(scanQRCode);
        }
    };
    
    // Function to draw scanning animation
    const drawScanningAnimation = (ctx, width, height) => {
        const time = Date.now() * 0.001; // Convert to seconds
        const scanLineY = Math.sin(time * 2) * height * 0.25 + height * 0.5;
        
        // Draw scan line
        ctx.fillStyle = "rgba(0, 123, 255, 0.5)";
        ctx.fillRect(0, scanLineY - 2, width, 4);
        
        // Add glow effect
        ctx.shadowColor = "#007bff";
        ctx.shadowBlur = 10;
        ctx.strokeStyle = "#007bff";
        ctx.beginPath();
        ctx.moveTo(0, scanLineY);
        ctx.lineTo(width, scanLineY);
        ctx.stroke();
        ctx.shadowBlur = 0;
    };
    
    // Function to draw success animation
    const drawScanSuccess = (ctx, width, height) => {
        // Draw green overlay
        ctx.fillStyle = "rgba(76, 175, 80, 0.3)";
        ctx.fillRect(0, 0, width, height);
        
        // Draw checkmark
        const centerX = width / 2;
        const centerY = height / 2;
        const size = Math.min(width, height) * 0.2;
        
        ctx.strokeStyle = "#4CAF50";
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.moveTo(centerX - size / 2, centerY);
        ctx.lineTo(centerX - size / 6, centerY + size / 2);
        ctx.lineTo(centerX + size / 2, centerY - size / 3);
        ctx.stroke();
    };
    
    // Function to play success sound
    const playSuccessSound = () => {
        try {
            const audio = new Audio();
            audio.src = "data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA/+M4wAAAAAAAAAAAAEluZm8AAAAPAAAAAwAAAbAAWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYf39/f39/f39/f39/f39/f39/f39/f39/f6ysrKysrKysrKysrKysrKysrKysrKysrKz///////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAYKAAAAAAAAAbDWHP+BAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/+MYxAAR0dbSYgxAAKHxDAZlfzcxiLABkARAMDZ3BBGiAGj/gAcGh48PDnb/g4H9D5//////f/ggOP//b/gcQOAYA/5cSTkQA/JztSSXgw/JztSS8GH6OdyRQ8GH5OdqSXgw/JztWS+DD8nO5IoeDD8nO1JL6MOgqKioS5P/////dqKioqLdW70KBY7YxbFwLB9E7vQSSbxOB4OaTkJ3Tufg//8nJPDBLQwUCj0enEEZIm1JJyRlHp9JJJJJJOIJyiSTcQRkibUkn/+MYxBsTMRbqWghHIJJJJJOIJyiSTcQRkiYk4gS/8QTlEknEEZImJOIEv/EE4gS/8QCSSSSSLx+CSLE3Gx+CSLE3Gx+CSLE3Gx+CSLE3Gx+CSLE3Gx+CSLE3Gx+CSLE3Gx+CSLE3Gx+CSLE3GwnoBGBfzzQf4VJCRzc4iQa/vwSIAKL//o3Nzc3Bv89GSTn///KRoVJGklS/5yOTk5Of///+SSSGpIyif//+5OTk5JFSRpGkS6SRNSSKkiRJJkURpJJeS//iJJJJIkSIkSJJJEiSRJJJIkSSSSJJ//6fwSSSSJJJIiSRJJJIkSSSSJJ//6fwSSSSJJJI";
            audio.play().catch(error => console.error("Error playing success sound:", error));
        } catch (error) {
            console.error("Error with audio:", error);
        }
    };
    
    // Process QR code data
    const processQRData = (qrData) => {
        try {
            const parsedData = JSON.parse(qrData);
            console.log('Parsed QR Data:', parsedData);
            
            // If it's our specific QR code format for registrations
            if (parsedData.eventId && parsedData.attendee) {
                // Find the registration in our data
                const registration = registrants.find(r => 
                    (r.qrData && r.qrData === qrData) || // Match by exact QR data
                    (r.event === parsedData.eventTitle && r.name === parsedData.attendee) // Or match by event and name
                );
                
                if (registration) {
                    playSuccessSound();
                    setScannedAttendee(registration);
                    setQrResult('Success');
                    
                    // Mark as attended
                    markAttendance(registration.id, true);
                    
                    // Show success animation
                    const canvas = canvasRef.current;
                    if (canvas) {
                        const ctx = canvas.getContext('2d');
                        drawScanSuccess(ctx, canvas.width, canvas.height);
                    }
                } else {
                    // Registration not found - might be not in our system
                    setQrResult('Error: Registration not found');
                }
                return true;
            }
            
            // Process other QR code formats as before
            // ... existing QR processing code ...
            
            return false;
        } catch (error) {
            console.error('Error processing QR data:', error);
            setQrResult(`Error: ${error.message}`);
            return false;
        }
    };
    
    // Simulate QR code detection (for testing without a camera)
    const simulateQRScan = (qrData) => {
        if (!scanning) return;
        
        setQrResult(qrData);
        processQRData(qrData);
    };
    
    const markAttendance = (registrantId, attended = true) => {
        try {
            // Update the registrant's attendance status
            const updatedRegistrants = registrants.map(reg => {
                if (reg.id === registrantId) {
                    return {
                        ...reg,
                        attended: attended,
                        attendanceTime: attended ? new Date().toISOString() : null
                    };
                }
                return reg;
            });
            
            setRegistrants(updatedRegistrants);
            
            // Get the registrant name for the message
            const registrant = registrants.find(r => r.id === registrantId);
            const registrantName = registrant ? registrant.name : 'Attendee';
            
            // Update in new format (registrations)
            try {
                const newRegistrations = JSON.parse(localStorage.getItem('registrations') || '[]');
                const updatedNewRegistrations = newRegistrations.map(reg => {
                    if (reg.id === registrantId) {
                        return {
                            ...reg,
                            attended: attended,
                            attendanceTime: attended ? new Date().toISOString() : null
                        };
                    }
                    return reg;
                });
                localStorage.setItem('registrations', JSON.stringify(updatedNewRegistrations));
            } catch (err) {
                console.error('Error updating registrations:', err);
            }
            
            // Also update in old format (eventRegistrations) for backward compatibility
            try {
                const oldRegistrations = JSON.parse(localStorage.getItem('eventRegistrations') || '[]');
                const updatedOldRegistrations = oldRegistrations.map(reg => {
                    if (reg.id === registrantId) {
                        return {
                            ...reg,
                            attended: attended,
                            attendanceTime: attended ? new Date().toISOString() : null
                        };
                    }
                    return reg;
                });
                localStorage.setItem('eventRegistrations', JSON.stringify(updatedOldRegistrations));
            } catch (err) {
                console.error('Error updating eventRegistrations:', err);
            }
            
            if (scannedAttendee && scannedAttendee.id === registrantId) {
                setScannedAttendee({
                    ...scannedAttendee,
                    attended: attended,
                    attendanceTime: attended ? new Date().toISOString() : null
                });
            }
            
            setEventMessage(attended ? 
                `Attendance successfully marked for ${registrantName}!` : 
                `Attendance removed for ${registrantName}`
            );
            
            // Show success animation
            setSuccessAction({
                type: attended ? 'mark' : 'unmark',
                registrantId: registrantId,
                timestamp: new Date().getTime()
            });
            
            setTimeout(() => {
                setSuccessAction(null);
                setEventMessage('');
            }, 3000);
        } catch (error) {
            console.error('Error marking attendance:', error);
            setEventMessage('Error updating attendance. Please try again.');
            setTimeout(() => {
                setEventMessage('');
            }, 3000);
        }
    };
    
    const getFilteredRegistrants = () => {
        if (attendanceFilter === 'all') {
            return registrants;
        } else if (attendanceFilter === 'attended') {
            return registrants.filter(reg => reg.attended);
        } else {
            return registrants.filter(reg => !reg.attended);
        }
    };

    const viewPaymentProof = (registrant) => {
        // Find original registration data to get the image data if available
        const savedRegistrations = JSON.parse(localStorage.getItem('eventRegistrations') || '[]');
        const originalRegistration = savedRegistrations.find(reg => reg.id === registrant.id);
        
        setSelectedPaymentProof({
            registrantName: registrant.name,
            eventName: registrant.event,
            proofFilename: registrant.paymentProof,
            proofImage: originalRegistration?.paymentProofImage || null, // Add image data if available
            uploadDate: registrant.registrationDate,
            registrationStatus: registrant.status
        });
        setShowPaymentProofModal(true);
    };
    
    const closePaymentProofModal = () => {
        setShowPaymentProofModal(false);
        setSelectedPaymentProof(null);
    };

    // Add a new registrant from QR scan
    const addRegistrantFromQR = () => {
        if (!scannedNewRegistrant) return;
        
        // Create a new registrant with a unique ID
        const newRegistrant = {
            ...scannedNewRegistrant,
            id: Date.now(),
            email: scannedNewRegistrant.email || `${scannedNewRegistrant.name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
            talentId: talents.length > 0 ? Math.floor(Math.random() * talents.length) + 1 : 1
        };
        
        // Add to registrants state
        const updatedRegistrants = [...registrants, newRegistrant];
        setRegistrants(updatedRegistrants);
        
        // Add to localStorage
        const savedRegistrations = JSON.parse(localStorage.getItem('eventRegistrations') || '[]');
        savedRegistrations.push({
            id: newRegistrant.id,
            eventId: 0, // Placeholder for event ID
            eventTitle: newRegistrant.event,
            name: newRegistrant.name,
            email: newRegistrant.email,
            university: newRegistrant.university,
            program: newRegistrant.program,
            type: newRegistrant.type,
            status: 'pending',
            date: new Date().toISOString()
        });
        localStorage.setItem('eventRegistrations', JSON.stringify(savedRegistrations));
        
        // Close modal and show success message
        setShowAddRegistrantModal(false);
        setScannedNewRegistrant(null);
        setEventMessage(`Registrant ${newRegistrant.name} has been added successfully!`);
        
        // Switch to content management to see the new registrant
        setActiveSection('content');
        setActiveTab('registrants');
        setHighlightedRegistrantId(newRegistrant.id);
        setTimeout(() => setHighlightedRegistrantId(null), 3000);
    };

    useEffect(() => {
        // If new registrant is available, show the modal
        if (scannedNewRegistrant) {
            setShowAddRegistrantModal(true);
        }
    }, [scannedNewRegistrant]);

    // Course handling functions
    const handleCourseInputChange = (e) => {
        const { name, value } = e.target;
        setNewCourse({
            ...newCourse,
            [name]: value
        });
    };

    const handleCourseImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Convert image to base64 string
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewCourse({
                    ...newCourse,
                    image: reader.result
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAddCourse = (e) => {
        e.preventDefault();
        
        // Validate form
        if (!newCourse.title || !newCourse.description) {
            setEventMessage('Please fill in all required fields for course');
            return;
        }
        
        // Create new course object with unique ID
        const courseToAdd = {
            ...newCourse,
            id: Date.now(),
            createdAt: new Date().toISOString()
        };
        
        // Add to courses array
        const updatedCourses = [...courses, courseToAdd];
        setCourses(updatedCourses);
        
        // Save to localStorage
        localStorage.setItem('courses', JSON.stringify(updatedCourses));
        
        // Create a news item about this new course
        const courseNewsItem = {
            id: Date.now() + 1, // Ensure unique ID
            title: `New Course: ${newCourse.title}`,
            content: `A new course has been added: ${newCourse.title}. ${newCourse.description}`,
            type: 'course',
            date: new Date().toISOString()
        };
        
        // Add to news
        const savedNews = JSON.parse(localStorage.getItem('news') || '[]');
        localStorage.setItem('news', JSON.stringify([courseNewsItem, ...savedNews]));
        setNews([courseNewsItem, ...news]);
        
        // Reset form
        setNewCourse({
            title: '',
            description: '',
            duration: '',
            modules: [],
            image: null
        });
        
        setEventMessage('Course added successfully');
        
        // Clear success message after 3 seconds
        setTimeout(() => {
            setEventMessage('');
        }, 3000);
    };

    const deleteCourse = (id) => {
        const updatedCourses = courses.filter(course => course.id !== id);
        setCourses(updatedCourses);
        localStorage.setItem('courses', JSON.stringify(updatedCourses));
        setEventMessage('Course deleted successfully');
        
        // Clear success message after 3 seconds
        setTimeout(() => {
            setEventMessage('');
        }, 3000);
    };

    // Certificate handling functions
    const handleCertificateInputChange = (e) => {
        const { name, value } = e.target;
        setNewCertificate({
            ...newCertificate,
            [name]: value
        });
    };

    const handleCertificateImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Convert image to base64 string
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewCertificate({
                    ...newCertificate,
                    image: reader.result
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAddCertificate = (e) => {
        e.preventDefault();
        
        // Validate form
        if (!newCertificate.title || !newCertificate.description) {
            setEventMessage('Please fill in all required fields for certificate');
            return;
        }
        
        // Create new certificate object with unique ID
        const certificateToAdd = {
            ...newCertificate,
            id: Date.now(),
            createdAt: new Date().toISOString(),
            issueDate: new Date().toISOString()
        };
        
        // Add to certificates array
        const updatedCertificates = [...certificates, certificateToAdd];
        setCertificates(updatedCertificates);
        
        // Save to localStorage
        localStorage.setItem('certificates', JSON.stringify(updatedCertificates));
        
        // Create a news item about this new certificate
        const certificateNewsItem = {
            id: Date.now() + 1, // Ensure unique ID
            title: `New Certificate: ${newCertificate.title}`,
            content: `A new certificate has been added: ${newCertificate.title}. ${newCertificate.description}`,
            type: 'certificate',
            date: new Date().toISOString()
        };
        
        // Add to news
        const savedNews = JSON.parse(localStorage.getItem('news') || '[]');
        localStorage.setItem('news', JSON.stringify([certificateNewsItem, ...savedNews]));
        setNews([certificateNewsItem, ...news]);
        
        // Reset form
        setNewCertificate({
            title: '',
            description: '',
            forCourse: '',
            image: null
        });
        
        setEventMessage('Certificate added successfully');
        
        // Clear success message after 3 seconds
        setTimeout(() => {
            setEventMessage('');
        }, 3000);
    };

    const deleteCertificate = (id) => {
        const updatedCertificates = certificates.filter(certificate => certificate.id !== id);
        setCertificates(updatedCertificates);
        localStorage.setItem('certificates', JSON.stringify(updatedCertificates));
        setEventMessage('Certificate deleted successfully');
        
        // Clear success message after 3 seconds
        setTimeout(() => {
            setEventMessage('');
        }, 3000);
    };

    useEffect(() => {
        // Load news from localStorage
        const savedNews = localStorage.getItem('news');
        if (savedNews) {
            setNews(JSON.parse(savedNews));
        }
    }, []);

    // Event handling functions for Events section
    const viewEvent = (event) => {
        setViewingEvent(event);
    };
    
    const startEditingEvent = (event) => {
        setEditingEvent(event);
        setEventFormData({
            title: event.title,
            date: new Date(event.date).toISOString().split('T')[0], // Format as YYYY-MM-DD
            time: event.time,
            location: event.location,
            description: event.description,
            flyer: event.flyer,
            requiresPayment: event.requiresPayment
        });
    };
    
    const cancelEditingEvent = () => {
        setEditingEvent(null);
    };
    
    const closeEventView = () => {
        setViewingEvent(null);
    };
    
    const handleEventFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEventFormData({
            ...eventFormData,
            [name]: type === 'checkbox' ? checked : value
        });
    };
    
    const handleEditEventFlyerUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setEventFormData({
                    ...eventFormData,
                    flyer: reader.result
                });
            };
            reader.readAsDataURL(file);
        }
    };
    
    const saveEventEdit = () => {
        // Update in state
        const updatedEvents = events.map(event => 
            event.id === editingEvent.id ? 
            {
                ...event,
                ...eventFormData,
                date: new Date(eventFormData.date).toISOString() // Store as ISO string
            } : event
        );
        
        setEvents(updatedEvents);
        
        // Save to localStorage
        localStorage.setItem('events', JSON.stringify(updatedEvents));
        
        setEventMessage('Event updated successfully');
        setTimeout(() => {
            setEventMessage('');
        }, 3000);
        
        setEditingEvent(null);
    };

    // News handling functions
    const viewNews = (newsItem) => {
        setViewingNews(newsItem);
    };
    
    const startEditingNews = (newsItem) => {
        setEditingNews(newsItem);
        setNewsFormData({
            title: newsItem.title,
            content: newsItem.content,
            type: newsItem.type
        });
    };
    
    const cancelEditingNews = () => {
        setEditingNews(null);
    };
    
    const closeNewsView = () => {
        setViewingNews(null);
    };
    
    const handleNewsFormChange = (e) => {
        const { name, value } = e.target;
        setNewsFormData({
            ...newsFormData,
            [name]: value
        });
    };
    
    const saveNewsEdit = () => {
        // Update in state
        const updatedNews = news.map(item => 
            item.id === editingNews.id ? 
            {
                ...item,
                ...newsFormData
            } : item
        );
        
        setNews(updatedNews);
        
        // Save to localStorage
        localStorage.setItem('news', JSON.stringify(updatedNews));
        
        setEventMessage('News item updated successfully');
        setTimeout(() => {
            setEventMessage('');
        }, 3000);
        
        setEditingNews(null);
    };

    // Course handling functions
    const viewCourse = (course) => {
        setViewingCourse(course);
    };
    
    const startEditingCourse = (course) => {
        setEditingCourse(course);
        setCourseFormData({
            title: course.title,
            description: course.description,
            duration: course.duration,
            modules: course.modules || [],
            image: course.image
        });
    };
    
    const cancelEditingCourse = () => {
        setEditingCourse(null);
    };
    
    const closeCourseView = () => {
        setViewingCourse(null);
    };
    
    const handleCourseFormChange = (e) => {
        const { name, value } = e.target;
        setCourseFormData({
            ...courseFormData,
            [name]: value
        });
    };
    
    const handleEditCourseImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setCourseFormData({
                    ...courseFormData,
                    image: reader.result
                });
            };
            reader.readAsDataURL(file);
        }
    };
    
    const saveCourseEdit = () => {
        // Update in state
        const updatedCourses = courses.map(course => 
            course.id === editingCourse.id ? 
            {
                ...course,
                ...courseFormData
            } : course
        );
        
        setCourses(updatedCourses);
        
        // Save to localStorage
        localStorage.setItem('courses', JSON.stringify(updatedCourses));
        
        setCourseMessage('Course updated successfully');
        setTimeout(() => {
            setCourseMessage('');
        }, 3000);
        
        setEditingCourse(null);
    };

    // Certificate handling functions
    const viewCertificate = (certificate) => {
        setViewingCertificate(certificate);
    };
    
    const startEditingCertificate = (certificate) => {
        setEditingCertificate(certificate);
        setCertificateFormData({
            title: certificate.title,
            description: certificate.description,
            forCourse: certificate.forCourse,
            image: certificate.image
        });
    };
    
    const cancelEditingCertificate = () => {
        setEditingCertificate(null);
    };
    
    const closeCertificateView = () => {
        setViewingCertificate(null);
    };
    
    const handleCertificateFormChange = (e) => {
        const { name, value } = e.target;
        setCertificateFormData({
            ...certificateFormData,
            [name]: value
        });
    };
    
    const handleEditCertificateImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setCertificateFormData({
                    ...certificateFormData,
                    image: reader.result
                });
            };
            reader.readAsDataURL(file);
        }
    };
    
    const saveCertificateEdit = () => {
        // Update in state
        const updatedCertificates = certificates.map(certificate => 
            certificate.id === editingCertificate.id ? 
            {
                ...certificate,
                ...certificateFormData
            } : certificate
        );
        
        setCertificates(updatedCertificates);
        
        // Save to localStorage
        localStorage.setItem('certificates', JSON.stringify(updatedCertificates));
        
        setCertificateMessage('Certificate updated successfully');
        setTimeout(() => {
            setCertificateMessage('');
        }, 3000);
        
        setEditingCertificate(null);
    };

    // View registrant details
    const viewRegistrantDetails = (registrantId) => {
        const registrant = registrants.find(r => r.id === registrantId);
        if (registrant) {
            setViewingRegistrant(registrant);
        } else {
            setEventMessage('Registrant information not found');
            setTimeout(() => {
                setEventMessage('');
            }, 3000);
        }
    };

    // Function to load all accounts
    const loadAccounts = () => {
        try {
            // First try to get complete accounts data from localStorage
            let accountsData = [];
            const savedAccounts = localStorage.getItem('accounts');
            
            if (savedAccounts) {
                accountsData = JSON.parse(savedAccounts);
            } else {
                // If no accounts in localStorage, check for individual user accounts
                // and create an accounts array
                const userAccounts = [];
                
                // Try to find all user accounts in localStorage
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key === 'user' || key.startsWith('user_') || key.startsWith('talent_')) {
                        try {
                            const userData = JSON.parse(localStorage.getItem(key));
                            if (userData && userData.email) {
                                userAccounts.push({
                                    ...userData,
                                    id: userData.id || Date.now() + i,
                                    accountType: key.startsWith('talent_') ? 'talent' : 'user'
                                });
                            }
                        } catch (e) {
                            console.error('Error parsing user data:', e);
                        }
                    }
                }
                
                // Use the user accounts as our data
                if (userAccounts.length > 0) {
                    accountsData = userAccounts;
                    // Save to accounts in localStorage for future use
                    localStorage.setItem('accounts', JSON.stringify(accountsData));
                }
            }
            
            setAccounts(accountsData);
        } catch (error) {
            console.error('Error loading accounts:', error);
            setEventMessage('Error loading accounts data');
            setTimeout(() => {
                setEventMessage('');
            }, 3000);
        }
    };

    // Use effect to load accounts when the tab is activated
    useEffect(() => {
        if (activeTab === 'accounts') {
            loadAccounts();
        }
    }, [activeTab]);

    // Function to start editing an account
    const startEditingAccount = (account) => {
        try {
            setEditingAccount(account);
            setAccountFormData({
                name: account.name || '',
                email: account.email || '',
                university: account.university || account.universitas || '',
                status: account.status || 'active',
                password: account.password || '',
                showPassword: false
            });
        } catch (error) {
            console.error('Error starting account edit:', error);
            setEventMessage('Error preparing form. Please try again.');
            setTimeout(() => {
                setEventMessage('');
            }, 3000);
        }
    };

    // Function to handle account form changes
    const handleAccountFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setAccountFormData({
            ...accountFormData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    // Function to toggle password visibility
    const togglePasswordVisibility = () => {
        setAccountFormData({
            ...accountFormData,
            showPassword: !accountFormData.showPassword
        });
    };

    // Function to cancel editing an account
    const cancelEditingAccount = () => {
        setEditingAccount(null);
    };

    // Function to save account edits
    const saveAccountEdit = () => {
        try {
            // Update in state
            const updatedAccounts = accounts.map(acc => 
                acc.id === editingAccount.id ? 
                {
                    ...acc,
                    name: accountFormData.name,
                    email: accountFormData.email,
                    university: accountFormData.university,
                    universitas: accountFormData.university, // For compatibility
                    status: accountFormData.status,
                    password: accountFormData.password
                } : acc
            );
            
            setAccounts(updatedAccounts);
            
            // Update in localStorage
            localStorage.setItem('accounts', JSON.stringify(updatedAccounts));
            
            // If this is a user or talent account, also update individual record
            try {
                const accountKey = `${editingAccount.accountType || 'user'}_${editingAccount.email}`;
                const userData = JSON.parse(localStorage.getItem(accountKey));
                if (userData) {
                    userData.name = accountFormData.name;
                    userData.email = accountFormData.email;
                    userData.university = accountFormData.university;
                    userData.universitas = accountFormData.university; // For compatibility
                    userData.status = accountFormData.status;
                    userData.password = accountFormData.password;
                    
                    localStorage.setItem(accountKey, JSON.stringify(userData));
                }
            } catch (err) {
                console.error('Error updating individual account record:', err);
            }
            
            // Also update talents data
            try {
                const talents = JSON.parse(localStorage.getItem('talents') || '[]');
                const updatedTalents = talents.map(talent => 
                    talent.email === editingAccount.email ? 
                    {
                        ...talent,
                        name: accountFormData.name,
                        email: accountFormData.email,
                        specialization: accountFormData.university,
                        status: accountFormData.status
                    } : talent
                );
                localStorage.setItem('talents', JSON.stringify(updatedTalents));
            } catch (err) {
                console.error('Error updating talents data:', err);
            }
            
            setEventMessage('Account updated successfully');
            setTimeout(() => {
                setEventMessage('');
            }, 3000);
            
            setEditingAccount(null);
        } catch (error) {
            console.error('Error saving account edit:', error);
            setEventMessage('Error saving changes. Please try again.');
            setTimeout(() => {
                setEventMessage('');
            }, 3000);
        }
    };

    // Function to delete an account
    const deleteAccount = (id, email) => {
        try {
            if (window.confirm(`Are you sure you want to permanently delete this account? This action cannot be undone.`)) {
                // Remove from state
                const updatedAccounts = accounts.filter(acc => acc.id !== id);
                setAccounts(updatedAccounts);
                
                // Update in localStorage
                localStorage.setItem('accounts', JSON.stringify(updatedAccounts));
                
                // Also remove individual account entry
                try {
                    localStorage.removeItem(`user_${email}`);
                    localStorage.removeItem(`talent_${email}`);
                } catch (err) {
                    console.error('Error removing individual account:', err);
                }
                
                // Update talents data
                try {
                    const talents = JSON.parse(localStorage.getItem('talents') || '[]');
                    const updatedTalents = talents.filter(talent => talent.email !== email);
                    localStorage.setItem('talents', JSON.stringify(updatedTalents));
                } catch (err) {
                    console.error('Error updating talents data:', err);
                }
                
                setEventMessage('Account permanently deleted');
                setTimeout(() => {
                    setEventMessage('');
                }, 3000);
            }
        } catch (error) {
            console.error('Error deleting account:', error);
            setEventMessage('Error deleting account. Please try again.');
            setTimeout(() => {
                setEventMessage('');
            }, 3000);
        }
    };

    if (loading) {
        return (
            <div className="admin-dashboard">
                <div className="loading">Loading...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-dashboard">
                <div className="error-message">{error}</div>
                <button onClick={() => navigate('/admin/login')}>Return to Login</button>
            </div>
        );
    }

    return (
        <div className={`admin-dashboard-container ${sidebarOpen ? 'sidebar-open' : ''} ${isLightMode ? 'light-theme' : 'dark-theme'}`}>
            {/* Mobile overlay */}
            {sidebarOpen && <div className="mobile-overlay" onClick={handleOverlayClick}></div>}
            
            {/* Sidebar toggle button for mobile */}
            <button className="sidebar-toggle" onClick={toggleSidebar}>
                <div className="menu-icon">
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </button>
            
            {/* Theme toggle button next to hamburger menu */}
            <div className="theme-toggle-container">
                <button className="theme-toggle-btn" onClick={toggleTheme}>
                    {isLightMode ? <i className="fas fa-moon"></i> : <i className="fas fa-sun"></i>}
                </button>
            </div>
            
            {/* Sidebar */}
            <div className="admin-sidebar">
                <div className="sidebar-header">
                    <h1><i className="fas fa-solar-panel"></i> Admin</h1>
                    {/* Close button visible only on mobile */}
                    <button className="sidebar-close" onClick={() => setSidebarOpen(false)}>×</button>
                </div>

                
                <nav className="sidebar-nav">
                    <button 
                        className={`nav-item ${activeSection === 'profile' ? 'active' : ''}`}
                        onClick={() => {
                            setActiveSection('profile');
                            navigate('/admin/dashboard');
                            setSidebarOpen(false); // Close sidebar on mobile after selection
                        }}
                    >
                        <i className="fas fa-id-card"></i> <span className="nav-text">Profile</span>
                    </button>
                    <button 
                        className={`nav-item ${activeSection === 'content' ? 'active' : ''}`}
                        onClick={() => {
                            setActiveSection('content');
                            setSidebarOpen(false); // Close sidebar on mobile after selection
                        }}
                    >
                        <i className="fas fa-database"></i> <span className="nav-text"> Management</span>
                    </button>
                    <button 
                        className={`nav-item ${activeSection === 'events' ? 'active' : ''}`}
                        onClick={() => {
                            setActiveSection('events');
                            setSidebarOpen(false); // Close sidebar on mobile after selection
                        }}
                    >
                        <i className="fas fa-calendar-alt"></i> <span className="nav-text">Event Management</span>
                    </button>
                    <button 
                        className={`nav-item ${activeSection === 'news' ? 'active' : ''}`}
                        onClick={() => {
                            setActiveSection('news');
                            setSidebarOpen(false); // Close sidebar on mobile after selection
                        }}
                    >
                        <i className="fas fa-newspaper"></i> <span className="nav-text">News Management</span>
                    </button>
                    <button 
                        className={`nav-item ${activeSection === 'courses' ? 'active' : ''}`}
                        onClick={() => {
                            setActiveSection('courses');
                            setSidebarOpen(false); // Close sidebar on mobile after selection
                        }}
                    >
                        <i className="fas fa-book"></i> <span className="nav-text">Course Management</span>
                    </button>
                    <button 
                        className={`nav-item ${activeSection === 'certificates' ? 'active' : ''}`}
                        onClick={() => {
                            setActiveSection('certificates');
                            setSidebarOpen(false); // Close sidebar on mobile after selection
                        }}
                    >
                        <i className="fas fa-certificate"></i> <span className="nav-text">Certificate Management</span>
                    </button>
                    <button 
                        className={`nav-item ${activeSection === 'settings' ? 'active' : ''}`}
                        onClick={() => {
                            setActiveSection('settings');
                            setSidebarOpen(false); // Close sidebar on mobile after selection
                        }}
                    >
                        <i className="fas fa-cog"></i> <span className="nav-text">System Settings</span>
                    </button>
                    <button 
                        className="nav-item logout"
                        onClick={handleLogout}
                    >
                        <i className="fas fa-sign-out-alt"></i> <span className="nav-text">Logout</span>
                    </button>
                </nav>
            </div>
            
            <div className="admin-content">
                {/* Remove the header component */}
                
                {eventMessage && (
                    <div className="message-banner">
                        <i className="fas fa-info-circle"></i> {eventMessage}
                    </div>
                )}

                {activeSection === 'profile' && (
                    <div className="content-section">
                        <h2><i className="fas fa-id-card"></i> Admin Profile</h2>
                        <div className="profile-details">
                            <div className="info-item">
                                <span className="label">Email:</span>
                                <span className="value">{adminData.email}</span>
                            </div>
                            <div className="info-item">
                                <span className="label">Role:</span>
                                <span className="value">{adminData.role}</span>
                            </div>
                            <div className="info-item">
                                <span className="label">Last Login:</span>
                                <span className="value">{new Date(adminData.lastLogin).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                )}

                {activeSection === 'content' && (
                    <div className="content-section">
                        <h2><i className="fas fa-database"></i> Content Management</h2>
                        <div className="content-tabs">
                            <button 
                                className={`tab-button ${activeTab === 'talents' ? 'active' : ''}`}
                                onClick={() => setActiveTab('talents')}
                            >
                                <i className="fas fa-user-graduate"></i> Talent Accounts
                            </button>
                            <button 
                                className={`tab-button ${activeTab === 'registrants' ? 'active' : ''}`}
                                onClick={() => setActiveTab('registrants')}
                            >
                                <i className="fas fa-clipboard-list"></i> Event Registrants
                            </button>
                            <button 
                                className={`tab-button ${activeTab === 'attendance' ? 'active' : ''}`}
                                onClick={() => setActiveTab('attendance')}
                            >
                                <i className="fas fa-check-circle"></i> Attendance Tracking
                            </button>
                            <button 
                                className={`tab-button ${activeTab === 'accounts' ? 'active' : ''}`}
                                onClick={() => setActiveTab('accounts')}
                            >
                                <i className="fas fa-users-cog"></i> All Accounts
                            </button>
                        </div>

                        {activeTab === 'talents' && (
                            <div className="talents-section">
                                <h3>Talent Accounts</h3>
                                
                                {editingTalent ? (
                                    <div className="edit-talent-form">
                                        <h4>Edit Talent</h4>
                                        <div className="form-group">
                                            <label>Name</label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={talentFormData.name}
                                                onChange={handleTalentFormChange}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Email</label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={talentFormData.email}
                                                onChange={handleTalentFormChange}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Specialization</label>
                                            <input
                                                type="text"
                                                name="specialization"
                                                value={talentFormData.specialization}
                                                onChange={handleTalentFormChange}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Status</label>
                                            <select
                                                name="status"
                                                value={talentFormData.status}
                                                onChange={handleTalentFormChange}
                                            >
                                                <option value="active">Active</option>
                                                <option value="inactive">Inactive</option>
                                            </select>
                                        </div>
                                        <div className="form-actions">
                                            <button 
                                                className="save-button" 
                                                onClick={saveTalentEdit}
                                            >
                                                Save Changes
                                            </button>
                                            <button 
                                                className="cancel-button" 
                                                onClick={cancelEditingTalent}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="table-container">
                                        <table className="data-table">
                                            <thead>
                                                <tr>
                                                    <th>Name</th>
                                                    <th>Email</th>
                                                    <th>Specialization</th>
                                                    <th>Status</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {talents.map(talent => (
                                                    <tr key={talent.id}>
                                                        <td>{talent.name}</td>
                                                        <td>{talent.email}</td>
                                                        <td>{talent.specialization}</td>
                                                        <td>
                                                            <span className={`status-badge ${talent.status}`}>
                                                                {talent.status}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <button 
                                                                className="action-button view"
                                                                onClick={() => viewTalentDetails(talent.id)}
                                                            >
                                                                View
                                                            </button>
                                                            <button 
                                                                className="action-button edit"
                                                                onClick={() => startEditingTalent(talent)}
                                                            >
                                                                Edit
                                                            </button>
                                                            <button 
                                                                className="action-button delete"
                                                                onClick={() => deleteTalent(talent.id)}
                                                            >
                                                                Delete
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'registrants' && (
                            <div className="registrants-section">
                                <h3>Event Registrants</h3>
                                <div className="registrants-actions">
                                    <button 
                                        className="scan-qr-button"
                                        onClick={() => {
                                            setActiveSection('attendance');
                                            setActiveTab('attendance');
                                            // Start scanner automatically
                                            setTimeout(() => startScanner(), 300);
                                        }}
                                    >
                                        <i className="fas fa-qrcode"></i>
                                        Scan QR to Find/Add Registrant
                                    </button>
                                </div>
                                
                                {editingRegistrant ? (
                                    <div className="edit-registrant-form">
                                        <h4>Edit Registrant</h4>
                                        <div className="form-group">
                                            <label>Name</label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={registrantFormData.name}
                                                onChange={handleRegistrantFormChange}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Email</label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={registrantFormData.email}
                                                onChange={handleRegistrantFormChange}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>University</label>
                                            <input
                                                type="text"
                                                name="university"
                                                value={registrantFormData.university}
                                                onChange={handleRegistrantFormChange}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Program</label>
                                            <input
                                                type="text"
                                                name="program"
                                                value={registrantFormData.program}
                                                onChange={handleRegistrantFormChange}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Event</label>
                                            <input
                                                type="text"
                                                name="event"
                                                value={registrantFormData.event}
                                                onChange={handleRegistrantFormChange}
                                            />
                                        </div>
                                        {editingRegistrant.requiresPayment && (
                                            <div className="form-group">
                                                <label>Bukti Transfer</label>
                                                <div className="payment-proof-display">
                                                    {registrantFormData.paymentProof ? (
                                                        <div className="payment-proof-info">
                                                            <span>{registrantFormData.paymentProof}</span>
                                                            <button 
                                                                className="view-proof-button"
                                                                onClick={() => viewPaymentProof(editingRegistrant)}
                                                            >
                                                                Lihat
                                                            </button>
                                                            <button 
                                                                className="remove-proof-button"
                                                                onClick={() => setRegistrantFormData({
                                                                    ...registrantFormData,
                                                                    paymentProof: null
                                                                })}
                                                            >
                                                                Hapus
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span className="no-proof">Bukti transfer belum diupload</span>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                        <div className="form-group">
                                            <label>Status</label>
                                            <select
                                                name="status"
                                                value={registrantFormData.status}
                                                onChange={handleRegistrantFormChange}
                                                className={`status-select ${registrantFormData.status}`}
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="confirmed">Confirmed</option>
                                                <option value="cancelled">Cancelled</option>
                                            </select>
                                        </div>
                                        <div className="form-actions">
                                            <button 
                                                className="save-button" 
                                                onClick={saveRegistrantEdit}
                                            >
                                                Save Changes
                                            </button>
                                            <button 
                                                className="cancel-button" 
                                                onClick={cancelEditingRegistrant}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="table-container">
                                        <table className="data-table">
                                            <thead>
                                                <tr>
                                                    <th className="col-id">ID</th>
                                                    <th>Name</th>
                                                    <th>Email</th>
                                                    <th className="col-date">Event</th>
                                                    <th className="col-date">Registration Date</th>
                                                    <th className="col-status">Status</th>
                                                    <th>Payment Proof</th>
                                                    <th className="col-actions">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {registrants.length > 0 ? (
                                                    registrants.map(registrant => (
                                                        <tr 
                                                            key={registrant.id} 
                                                            className={highlightedRegistrantId === registrant.id ? 'highlighted-row' : ''}
                                                        >
                                                            <td className="col-id">{registrant.id}</td>
                                                            <td>{registrant.name}</td>
                                                            <td>{registrant.email}</td>
                                                            <td className="col-date">{registrant.event}</td>
                                                            <td className="col-date">{new Date(registrant.registrationDate).toLocaleDateString()}</td>
                                                            <td className="col-status">
                                                                <select 
                                                                    className={`status-select ${registrant.status}`}
                                                                    value={registrant.status}
                                                                    onChange={(e) => handleRegistrantStatusChange(registrant.id, e.target.value)}
                                                                >
                                                                    <option value="pending">Pending</option>
                                                                    <option value="confirmed">Confirmed</option>
                                                                    <option value="cancelled">Cancelled</option>
                                                                </select>
                                                            </td>
                                                            <td>
                                                                {registrant.requiresPayment ? (
                                                                    registrant.paymentProof ? (
                                                                        <div className="payment-proof-container">
                                                                            <span className="payment-badge payment-received">
                                                                                {registrant.paymentProof}
                                                                            </span>
                                                                            <button 
                                                                                className="view-proof-button"
                                                                                onClick={() => viewPaymentProof(registrant)}
                                                                            >
                                                                                Lihat
                                                                            </button>
                                                                        </div>
                                                                    ) : (
                                                                        <span className="payment-badge payment-pending">
                                                                            Belum Upload
                                                                        </span>
                                                                    )
                                                                ) : (
                                                                    <span className="payment-badge payment-not-required">
                                                                        Tidak Diperlukan
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="actions-cell">
                                                                <button 
                                                                    className="action-button view"
                                                                    onClick={() => viewRegistrantDetails(registrant.id)}
                                                                >
                                                                    View Details
                                                                </button>
                                                                <button 
                                                                    className="action-button view" 
                                                                    onClick={() => viewTalentDetails(registrant.talentId)}
                                                                >
                                                                    View Talent
                                                                </button>
                                                                <button 
                                                                    className="action-button edit"
                                                                    onClick={() => startEditingRegistrant(registrant)}
                                                                >
                                                                    Edit
                                                                </button>
                                                                <button 
                                                                    className="action-button delete"
                                                                    onClick={() => deleteRegistrant(registrant.id)}
                                                                >
                                                                    Delete
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan="8" className="no-data">No registrants found</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'attendance' && (
                            <div className="attendance-section">
                                <h3>Attendance Tracking</h3>
                                
                                <div className="attendance-scanner-container">
                                    <div className="scanner-controls">
                                        {scanning && (
                                            <button 
                                                className="scanner-button stop" 
                                                onClick={stopScanner}
                                            >
                                                Stop Scanner
                                            </button>
                                        )}
                                    </div>
                                    
                                    {scanning && (
                                        <div className="scanner-view">
                                            <div className="video-container">
                                                <video ref={videoRef} className="qr-video"></video>
                                                <canvas ref={canvasRef} className="qr-canvas"></canvas>
                                                <div className="scanner-overlay">
                                                    <div className="scanner-marker"></div>
                                                </div>
                                            </div>
                                            
                                            <div className="scanner-status">
                                                {qrResult ? (
                                                    <div className="qr-result">
                                                        <p>QR Code detected!</p>
                                                        <div className="qr-data">{qrResult}</div>
                                                    </div>
                                                ) : (
                                                    <div className="scanning-indicator">
                                                        <div className="scanning-animation"></div>
                                                        <p>Scanning QR code... Please hold the QR code steady in the frame</p>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="manual-scan-info">
                                                <h4>Manual QR Scanning</h4>
                                                <p>Point the camera at a QR code and it will be processed when detected.</p>
                                                <button 
                                                    className="manual-scan-button"
                                                    onClick={() => {
                                                        if (videoRef.current && canvasRef.current) {
                                                            scanQRCode();
                                                        }
                                                    }}
                                                >
                                                    Capture QR Code
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {scannedAttendee && (
                                        <div className="scanned-result">
                                            <h4>Attendee Found:</h4>
                                            <div className="attendee-card">
                                                <div className="attendee-details">
                                                    <p><strong>Name:</strong> {scannedAttendee.name}</p>
                                                    <p><strong>Email:</strong> {scannedAttendee.email}</p>
                                                    <p><strong>Event:</strong> {scannedAttendee.event}</p>
                                                    <p><strong>University:</strong> {scannedAttendee.university}</p>
                                                    <p><strong>Program:</strong> {scannedAttendee.program}</p>
                                                    <p><strong>Status:</strong> {scannedAttendee.status}</p>
                                                    <p><strong>Attendance:</strong> 
                                                        <span className={`attendance-status ${scannedAttendee.attended ? 'present' : 'absent'}`}>
                                                            {scannedAttendee.attended ? 'Present' : 'Not Marked'}
                                                        </span>
                                                    </p>
                                                    {scannedAttendee.attendanceTime && (
                                                        <p><strong>Attendance Time:</strong> {new Date(scannedAttendee.attendanceTime).toLocaleString()}</p>
                                                    )}
                                                </div>
                                                <div className="attendance-actions">
                                                    {!scannedAttendee.attended ? (
                                                        <button 
                                                            className="mark-attendance-button present"
                                                            onClick={() => markAttendance(scannedAttendee.id, true)}
                                                        >
                                                            Mark as Present
                                                        </button>
                                                    ) : (
                                                        <button 
                                                            className="mark-attendance-button absent"
                                                            onClick={() => markAttendance(scannedAttendee.id, false)}
                                                        >
                                                            Remove Attendance
                                                        </button>
                                                    )}
                                                    <button 
                                                        className="view-details-button"
                                                        onClick={() => {
                                                            setActiveSection('content');
                                                            setActiveTab('registrants');
                                                            setHighlightedRegistrantId(scannedAttendee.id);
                                                            setTimeout(() => setHighlightedRegistrantId(null), 3000);
                                                        }}
                                                    >
                                                        View Full Details
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="attendance-list-container">
                                    <h4>Attendance List</h4>
                                    
                                    <div className="attendance-search">
                                        <button 
                                            className="scan-qr-button"
                                            onClick={() => {
                                                if (!scanning) {
                                                    startScanner();
                                                }
                                            }}
                                        >
                                            <i className="fas fa-qrcode"></i>
                                            Scan QR Code for Attendance
                                        </button>
                                    </div>
                                    
                                    <div className="attendance-filters">
                                        <button 
                                            className={`filter-button ${attendanceFilter === 'all' ? 'active' : ''}`}
                                            onClick={() => setAttendanceFilter('all')}
                                        >
                                            All
                                        </button>
                                        <button 
                                            className={`filter-button ${attendanceFilter === 'attended' ? 'active' : ''}`}
                                            onClick={() => setAttendanceFilter('attended')}
                                        >
                                            Present
                                        </button>
                                        <button 
                                            className={`filter-button ${attendanceFilter === 'notAttended' ? 'active' : ''}`}
                                            onClick={() => setAttendanceFilter('notAttended')}
                                        >
                                            Absent
                                        </button>
                                    </div>
                                    
                                    <div className="table-container">
                                        <table className="data-table">
                                            <thead>
                                                <tr>
                                                    <th>Name</th>
                                                    <th>Email</th>
                                                    <th>Event</th>
                                                    <th>Status</th>
                                                    <th>Attendance</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {getFilteredRegistrants().length > 0 ? (
                                                    getFilteredRegistrants().map(registrant => (
                                                        <tr 
                                                            key={registrant.id} 
                                                            id={`attendee-${registrant.id}`}
                                                            className={`
                                                                ${scannedAttendee && scannedAttendee.id === registrant.id ? 'highlighted-row' : ''}
                                                                ${successAction && successAction.registrantId === registrant.id ? 
                                                                    (successAction.type === 'mark' ? 'attendance-success' : 'attendance-removed') : ''}
                                                            `}
                                                        >
                                                            <td>{registrant.name}</td>
                                                            <td>{registrant.email}</td>
                                                            <td>{registrant.event}</td>
                                                            <td>
                                                                <span className={`status-badge ${registrant.status}`}>
                                                                    {registrant.status}
                                                                </span>
                                                            </td>
                                                            <td>
                                                                <span className={`attendance-status ${registrant.attended ? 'present' : 'absent'}`}>
                                                                    {registrant.attended ? 'Present' : 'Absent'}
                                                                </span>
                                                                {registrant.attendanceTime && (
                                                                    <span className="attendance-time">
                                                                        {new Date(registrant.attendanceTime).toLocaleTimeString()}
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td>
                                                                {!registrant.attended ? (
                                                                    <button 
                                                                        className="action-button view"
                                                                        onClick={() => markAttendance(registrant.id, true)}
                                                                    >
                                                                        Mark Present
                                                                    </button>
                                                                ) : (
                                                                    <button 
                                                                        className="action-button delete"
                                                                        onClick={() => markAttendance(registrant.id, false)}
                                                                    >
                                                                        Clear
                                                                    </button>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan="6" className="no-data">No registrants found</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'accounts' && (
                            <div className="accounts-section">
                                <h3>All User Accounts</h3>
                                
                                {editingAccount ? (
                                    <div className="edit-account-form">
                                        <h4>Edit Account</h4>
                                        <div className="form-group">
                                            <label>Name</label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={accountFormData.name}
                                                onChange={handleAccountFormChange}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Email</label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={accountFormData.email}
                                                onChange={handleAccountFormChange}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>University/Specialization</label>
                                            <input
                                                type="text"
                                                name="university"
                                                value={accountFormData.university}
                                                onChange={handleAccountFormChange}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Status</label>
                                            <select
                                                name="status"
                                                value={accountFormData.status}
                                                onChange={handleAccountFormChange}
                                            >
                                                <option value="active">Active</option>
                                                <option value="inactive">Inactive</option>
                                                <option value="suspended">Suspended</option>
                                            </select>
                                        </div>
                                        <div className="form-group password-field">
                                            <label>Password</label>
                                            <div className="password-input-container">
                                                <input
                                                    type={accountFormData.showPassword ? "text" : "password"}
                                                    name="password"
                                                    value={accountFormData.password}
                                                    onChange={handleAccountFormChange}
                                                />
                                                <button 
                                                    type="button"
                                                    className="password-toggle-button"
                                                    onClick={togglePasswordVisibility}
                                                >
                                                    {accountFormData.showPassword ? 
                                                        <i className="fas fa-eye-slash"></i> : 
                                                        <i className="fas fa-eye"></i>
                                                    }
                                                </button>
                                            </div>
                                        </div>
                                        <div className="form-actions">
                                            <button 
                                                className="save-button" 
                                                onClick={saveAccountEdit}
                                            >
                                                Save Changes
                                            </button>
                                            <button 
                                                className="cancel-button" 
                                                onClick={cancelEditingAccount}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="table-container">
                                        <table className="data-table">
                                            <thead>
                                                <tr>
                                                    <th>Name</th>
                                                    <th>Email</th>
                                                    <th>University/Specialization</th>
                                                    <th>Type</th>
                                                    <th>Status</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {accounts.length > 0 ? (
                                                    accounts.map(account => (
                                                        <tr key={account.id}>
                                                            <td>{account.name || 'N/A'}</td>
                                                            <td>{account.email}</td>
                                                            <td>{account.university || account.universitas || 'N/A'}</td>
                                                            <td>{account.accountType || 'user'}</td>
                                                            <td>
                                                                <span className={`status-badge ${account.status || 'active'}`}>
                                                                    {account.status || 'active'}
                                                                </span>
                                                            </td>
                                                            <td>
                                                                <button 
                                                                    className="action-button edit"
                                                                    onClick={() => startEditingAccount(account)}
                                                                >
                                                                    Edit
                                                                </button>
                                                                <button 
                                                                    className="action-button delete"
                                                                    onClick={() => deleteAccount(account.id, account.email)}
                                                                >
                                                                    Delete Permanently
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan="6" className="no-data">No accounts found</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {activeSection === 'events' && (
                    <div className="content-section">
                        <h2><i className="fas fa-calendar-alt"></i> Events</h2>
                        
                        {editingEvent ? (
                            <div className="edit-event-form">
                                <h4>Edit Event</h4>
                                <div className="form-group">
                                    <label>Title</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={eventFormData.title}
                                        onChange={handleEventFormChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Date</label>
                                    <input
                                        type="date"
                                        name="date"
                                        value={eventFormData.date}
                                        onChange={handleEventFormChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Time</label>
                                    <input
                                        type="time"
                                        name="time"
                                        value={eventFormData.time}
                                        onChange={handleEventFormChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Location</label>
                                    <input
                                        type="text"
                                        name="location"
                                        value={eventFormData.location}
                                        onChange={handleEventFormChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea
                                        name="description"
                                        value={eventFormData.description}
                                        onChange={handleEventFormChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Flyer</label>
                                    {eventFormData.flyer && (
                                        <div className="image-preview">
                                            <img 
                                                src={eventFormData.flyer} 
                                                alt="Event Flyer" 
                                                style={{ maxWidth: '200px' }} 
                                            />
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        name="flyer"
                                        onChange={handleEditEventFlyerUpload}
                                    />
                                </div>
                                <div className="form-group checkbox-group">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            name="requiresPayment"
                                            checked={eventFormData.requiresPayment}
                                            onChange={handleEventFormChange}
                                        />
                                        Memerlukan Bukti Transfer
                                    </label>
                                </div>
                                <div className="form-actions">
                                    <button 
                                        className="save-button" 
                                        onClick={saveEventEdit}
                                    >
                                        Save Changes
                                    </button>
                                    <button 
                                        className="cancel-button" 
                                        onClick={cancelEditingEvent}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : viewingEvent ? (
                            <div className="view-event-container">
                                <h4>{viewingEvent.title}</h4>
                                <div className="event-details">
                                    <p><strong>Date:</strong> {new Date(viewingEvent.date).toLocaleDateString()}</p>
                                    <p><strong>Time:</strong> {viewingEvent.time}</p>
                                    <p><strong>Location:</strong> {viewingEvent.location}</p>
                                    <p><strong>Description:</strong> {viewingEvent.description}</p>
                                    <p><strong>Requires Payment:</strong> {viewingEvent.requiresPayment ? 'Yes' : 'No'}</p>
                                    {viewingEvent.flyer && (
                                        <div className="event-flyer">
                                            <h5>Event Flyer</h5>
                                            <img 
                                                src={viewingEvent.flyer} 
                                                alt="Event Flyer" 
                                                style={{ maxWidth: '100%' }} 
                                            />
                                        </div>
                                    )}
                                </div>
                                <button 
                                    className="back-button" 
                                    onClick={closeEventView}
                                >
                                    Back to Events
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="event-form">
                                    <input
                                        type="text"
                                        name="title"
                                        placeholder="Title"
                                        value={newEvent.title}
                                        onChange={handleEventInputChange}
                                    />
                                    <input
                                        type="date"
                                        name="date"
                                        placeholder="Date"
                                        value={newEvent.date}
                                        onChange={handleEventInputChange}
                                    />
                                    <input
                                        type="time"
                                        name="time"
                                        placeholder="Time"
                                        value={newEvent.time}
                                        onChange={handleEventInputChange}
                                    />
                                    <input
                                        type="text"
                                        name="location"
                                        placeholder="Location"
                                        value={newEvent.location}
                                        onChange={handleEventInputChange}
                                    />
                                    <textarea
                                        name="description"
                                        placeholder="Description"
                                        value={newEvent.description}
                                        onChange={handleEventInputChange}
                                    />
                                    <input
                                        type="file"
                                        name="flyer"
                                        onChange={handleFlyerUpload}
                                    />
                                    <div className="form-group checkbox-group">
                                        <label className="checkbox-label">
                                            <input
                                                type="checkbox"
                                                name="requiresPayment"
                                                checked={newEvent.requiresPayment}
                                                onChange={handleEventInputChange}
                                            />
                                            Memerlukan Bukti Transfer
                                        </label>
                                    </div>
                                    <button onClick={handleAddEvent} className="add-event-button">
                                        <i className="fas fa-plus-circle"></i> Add Event
                                    </button>
                                </div>
                                <div className="table-container">
                                    <table className="data-table">
                                        <thead>
                                            <tr>
                                                <th>Title</th>
                                                <th>Date</th>
                                                <th>Time</th>
                                                <th>Location</th>
                                                <th>Description</th>
                                                <th>Flyer</th>
                                                <th>Bukti Transfer</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {events.map(event => (
                                                <tr key={event.id}>
                                                    <td>{event.title}</td>
                                                    <td>{new Date(event.date).toLocaleDateString()}</td>
                                                    <td>{event.time}</td>
                                                    <td>{event.location}</td>
                                                    <td>{event.description.length > 30 ? `${event.description.substring(0, 30)}...` : event.description}</td>
                                                    <td>{event.flyer ? 'Yes' : 'No'}</td>
                                                    <td>{event.requiresPayment ? 'Dibutuhkan' : 'Tidak'}</td>
                                                    <td>
                                                        <button 
                                                            className="action-button view"
                                                            onClick={() => viewEvent(event)}
                                                        >View</button>
                                                        <button 
                                                            className="action-button edit"
                                                            onClick={() => startEditingEvent(event)}
                                                        >Edit</button>
                                                        <button 
                                                            className="action-button delete" 
                                                            onClick={() => deleteEvent(event.id)}
                                                        >Delete</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {activeSection === 'news' && (
                    <div className="content-section">
                        <h2><i className="fas fa-newspaper"></i> News Management</h2>
                        
                        {editingNews ? (
                            <div className="edit-news-form">
                                <h4>Edit News Item</h4>
                                <div className="form-group">
                                    <label>Title</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={newsFormData.title}
                                        onChange={handleNewsFormChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Content</label>
                                    <textarea
                                        name="content"
                                        value={newsFormData.content}
                                        onChange={handleNewsFormChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Type</label>
                                    <select
                                        name="type"
                                        value={newsFormData.type}
                                        onChange={handleNewsFormChange}
                                    >
                                        <option value="announcement">Announcement</option>
                                        <option value="news">News</option>
                                        <option value="update">Update</option>
                                    </select>
                                </div>
                                <div className="form-actions">
                                    <button 
                                        className="save-button" 
                                        onClick={saveNewsEdit}
                                    >
                                        Save Changes
                                    </button>
                                    <button 
                                        className="cancel-button" 
                                        onClick={cancelEditingNews}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : viewingNews ? (
                            <div className="view-news-container">
                                <h4>{viewingNews.title}</h4>
                                <div className="news-details">
                                    <p><strong>Type:</strong> {viewingNews.type}</p>
                                    <p><strong>Date:</strong> {new Date(viewingNews.date).toLocaleDateString()}</p>
                                    <div className="news-content">
                                        <p>{viewingNews.content}</p>
                                    </div>
                                </div>
                                <button 
                                    className="back-button" 
                                    onClick={closeNewsView}
                                >
                                    Back to News
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="news-form">
                                    <input
                                        type="text"
                                        name="title"
                                        placeholder="News Title"
                                        value={newNewsItem.title}
                                        onChange={handleNewsInputChange}
                                    />
                                    <textarea
                                        name="content"
                                        placeholder="News Content"
                                        value={newNewsItem.content}
                                        onChange={handleNewsInputChange}
                                    />
                                    <select
                                        name="type"
                                        value={newNewsItem.type}
                                        onChange={handleNewsInputChange}
                                    >
                                        <option value="announcement">Announcement</option>
                                        <option value="news">News</option>
                                        <option value="update">Update</option>
                                    </select>
                                    <button onClick={handleAddNews}>Add News Item</button>
                                </div>
                                <div className="table-container">
                                    <table className="data-table">
                                        <thead>
                                            <tr>
                                                <th>Title</th>
                                                <th>Type</th>
                                                <th>Date</th>
                                                <th>Content</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {news.map(item => (
                                                <tr key={item.id}>
                                                    <td>{item.title}</td>
                                                    <td>{item.type}</td>
                                                    <td>{new Date(item.date).toLocaleDateString()}</td>
                                                    <td className="content-cell">{item.content.length > 50 ? `${item.content.substring(0, 50)}...` : item.content}</td>
                                                    <td>
                                                        <button 
                                                            className="action-button view"
                                                            onClick={() => viewNews(item)}
                                                        >View</button>
                                                        <button 
                                                            className="action-button edit"
                                                            onClick={() => startEditingNews(item)}
                                                        >Edit</button>
                                                        <button 
                                                            className="action-button delete" 
                                                            onClick={() => deleteNewsItem(item.id)}
                                                        >Delete</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {activeSection === 'courses' && (
                    <div className="content-section">
                        <h2><i className="fas fa-book"></i> Course Management</h2>
                        
                        {editingCourse ? (
                            <div className="edit-course-form">
                                <h4>Edit Course</h4>
                                <div className="form-group">
                                    <label>Title</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={courseFormData.title}
                                        onChange={handleCourseFormChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea
                                        name="description"
                                        value={courseFormData.description}
                                        onChange={handleCourseFormChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Duration</label>
                                    <input
                                        type="text"
                                        name="duration"
                                        value={courseFormData.duration}
                                        onChange={handleCourseFormChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Image</label>
                                    {courseFormData.image && (
                                        <div className="image-preview">
                                            <img 
                                                src={courseFormData.image} 
                                                alt="Course" 
                                                style={{ maxWidth: '200px' }} 
                                            />
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        name="image"
                                        onChange={handleEditCourseImageUpload}
                                    />
                                </div>
                                <div className="form-actions">
                                    <button 
                                        className="save-button" 
                                        onClick={saveCourseEdit}
                                    >
                                        Save Changes
                                    </button>
                                    <button 
                                        className="cancel-button" 
                                        onClick={cancelEditingCourse}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : viewingCourse ? (
                            <div className="view-course-container">
                                <h4>{viewingCourse.title}</h4>
                                <div className="course-details">
                                    <p><strong>Duration:</strong> {viewingCourse.duration}</p>
                                    <p><strong>Description:</strong> {viewingCourse.description}</p>
                                    {viewingCourse.image && (
                                        <div className="course-image">
                                            <h5>Course Image</h5>
                                            <img 
                                                src={viewingCourse.image} 
                                                alt="Course" 
                                                style={{ maxWidth: '100%' }} 
                                            />
                                        </div>
                                    )}
                                </div>
                                <button 
                                    className="back-button" 
                                    onClick={closeCourseView}
                                >
                                    Back to Courses
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="course-form">
                                    <input
                                        type="text"
                                        name="title"
                                        placeholder="Course Title"
                                        value={newCourse.title}
                                        onChange={handleCourseInputChange}
                                    />
                                    <textarea
                                        name="description"
                                        placeholder="Course Description"
                                        value={newCourse.description}
                                        onChange={handleCourseInputChange}
                                    />
                                    <input
                                        type="text"
                                        name="duration"
                                        placeholder="Duration (e.g., 8 weeks)"
                                        value={newCourse.duration}
                                        onChange={handleCourseInputChange}
                                    />
                                    <input
                                        type="file"
                                        name="courseImage"
                                        onChange={handleCourseImageUpload}
                                    />
                                    <button onClick={handleAddCourse}>Add Course</button>
                                </div>
                                <div className="table-container">
                                    <table className="data-table">
                                        <thead>
                                            <tr>
                                                <th>Title</th>
                                                <th>Description</th>
                                                <th>Duration</th>
                                                <th>Image</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {courses.map(course => (
                                                <tr key={course.id}>
                                                    <td>{course.title}</td>
                                                    <td className="content-cell">{course.description.length > 50 ? `${course.description.substring(0, 50)}...` : course.description}</td>
                                                    <td>{course.duration}</td>
                                                    <td>{course.image ? 'Yes' : 'No'}</td>
                                                    <td>
                                                        <button 
                                                            className="action-button view"
                                                            onClick={() => viewCourse(course)}
                                                        >View</button>
                                                        <button 
                                                            className="action-button edit"
                                                            onClick={() => startEditingCourse(course)}
                                                        >Edit</button>
                                                        <button 
                                                            className="action-button delete" 
                                                            onClick={() => deleteCourse(course.id)}
                                                        >Delete</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {activeSection === 'certificates' && (
                    <div className="content-section">
                        <h2><i className="fas fa-certificate"></i> Certificate Management</h2>
                        
                        {editingCertificate ? (
                            <div className="edit-certificate-form">
                                <h4>Edit Certificate</h4>
                                <div className="form-group">
                                    <label>Title</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={certificateFormData.title}
                                        onChange={handleCertificateFormChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea
                                        name="description"
                                        value={certificateFormData.description}
                                        onChange={handleCertificateFormChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Related Course</label>
                                    <select
                                        name="forCourse"
                                        value={certificateFormData.forCourse}
                                        onChange={handleCertificateFormChange}
                                    >
                                        <option value="">Select a Course</option>
                                        {courses.map(course => (
                                            <option key={course.id} value={course.id}>{course.title}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Image</label>
                                    {certificateFormData.image && (
                                        <div className="image-preview">
                                            <img 
                                                src={certificateFormData.image} 
                                                alt="Certificate" 
                                                style={{ maxWidth: '200px' }} 
                                            />
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        name="image"
                                        onChange={handleEditCertificateImageUpload}
                                    />
                                </div>
                                <div className="form-actions">
                                    <button 
                                        className="save-button" 
                                        onClick={saveCertificateEdit}
                                    >
                                        Save Changes
                                    </button>
                                    <button 
                                        className="cancel-button" 
                                        onClick={cancelEditingCertificate}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : viewingCertificate ? (
                            <div className="view-certificate-container">
                                <h4>{viewingCertificate.title}</h4>
                                <div className="certificate-details">
                                    <p><strong>Description:</strong> {viewingCertificate.description}</p>
                                    <p><strong>Related Course:</strong> {
                                        viewingCertificate.forCourse ? 
                                        courses.find(c => c.id.toString() === viewingCertificate.forCourse.toString())?.title || 'N/A' : 
                                        'N/A'
                                    }</p>
                                    <p><strong>Issue Date:</strong> {new Date(viewingCertificate.issueDate).toLocaleDateString()}</p>
                                    {viewingCertificate.image && (
                                        <div className="certificate-image">
                                            <h5>Certificate Image</h5>
                                            <img 
                                                src={viewingCertificate.image} 
                                                alt="Certificate" 
                                                style={{ maxWidth: '100%' }} 
                                            />
                                        </div>
                                    )}
                                </div>
                                <button 
                                    className="back-button" 
                                    onClick={closeCertificateView}
                                >
                                    Back to Certificates
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="certificate-form">
                                    <input
                                        type="text"
                                        name="title"
                                        placeholder="Certificate Title"
                                        value={newCertificate.title}
                                        onChange={handleCertificateInputChange}
                                    />
                                    <textarea
                                        name="description"
                                        placeholder="Certificate Description"
                                        value={newCertificate.description}
                                        onChange={handleCertificateInputChange}
                                    />
                                    <select
                                        name="forCourse"
                                        value={newCertificate.forCourse}
                                        onChange={handleCertificateInputChange}
                                    >
                                        <option value="">Select a Course</option>
                                        {courses.map(course => (
                                            <option key={course.id} value={course.id}>{course.title}</option>
                                        ))}
                                    </select>
                                    <input
                                        type="file"
                                        name="certificateImage"
                                        onChange={handleCertificateImageUpload}
                                    />
                                    <button onClick={handleAddCertificate}>Add Certificate</button>
                                </div>
                                <div className="table-container">
                                    <table className="data-table">
                                        <thead>
                                            <tr>
                                                <th>Title</th>
                                                <th>Description</th>
                                                <th>Related Course</th>
                                                <th>Issue Date</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {certificates.map(certificate => (
                                                <tr key={certificate.id}>
                                                    <td>{certificate.title}</td>
                                                    <td className="content-cell">{certificate.description.length > 50 ? `${certificate.description.substring(0, 50)}...` : certificate.description}</td>
                                                    <td>{certificate.forCourse ? courses.find(c => c.id.toString() === certificate.forCourse.toString())?.title || 'N/A' : 'N/A'}</td>
                                                    <td>{new Date(certificate.issueDate).toLocaleDateString()}</td>
                                                    <td>
                                                        <button 
                                                            className="action-button view"
                                                            onClick={() => viewCertificate(certificate)}
                                                        >View</button>
                                                        <button 
                                                            className="action-button edit"
                                                            onClick={() => startEditingCertificate(certificate)}
                                                        >Edit</button>
                                                        <button 
                                                            className="action-button delete" 
                                                            onClick={() => deleteCertificate(certificate.id)}
                                                        >Delete</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {activeSection === 'settings' && (
                    <div className="settings-section">
                        <h2><i className="fas fa-cog"></i> System Settings</h2>
                        <div className="settings-form">
                            <div className="form-group">
                                <label>Site Title</label>
                                <input
                                    type="text"
                                    name="siteTitle"
                                    value={websiteSettings.siteTitle}
                                    onChange={handleWebsiteSettingsChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>Site Description</label>
                                <textarea
                                    name="siteDescription"
                                    value={websiteSettings.siteDescription}
                                    onChange={handleWebsiteSettingsChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>Contact Email</label>
                                <input
                                    type="email"
                                    name="contactEmail"
                                    value={websiteSettings.contactEmail}
                                    onChange={handleWebsiteSettingsChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>Social Media Links</label>
                                <input
                                    type="url"
                                    name="social.facebook"
                                    placeholder="Facebook URL"
                                    value={websiteSettings.socialMedia.facebook}
                                    onChange={handleWebsiteSettingsChange}
                                />
                                <input
                                    type="url"
                                    name="social.twitter"
                                    placeholder="Twitter URL"
                                    value={websiteSettings.socialMedia.twitter}
                                    onChange={handleWebsiteSettingsChange}
                                />
                                <input
                                    type="url"
                                    name="social.instagram"
                                    placeholder="Instagram URL"
                                    value={websiteSettings.socialMedia.instagram}
                                    onChange={handleWebsiteSettingsChange}
                                />
                            </div>
                            <div className="form-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        name="maintenanceMode"
                                        checked={websiteSettings.maintenanceMode}
                                        onChange={handleWebsiteSettingsChange}
                                    />
                                    Maintenance Mode
                                </label>
                            </div>
                            <button 
                                className="save-settings-btn"
                                onClick={saveWebsiteSettings}
                            >
                                Save Settings
                            </button>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Add Registrant Modal */}
            {showAddRegistrantModal && scannedNewRegistrant && (
                <div className="modal-overlay">
                    <div className="modal-content add-registrant-modal">
                        <div className="modal-header">
                            <h3>Add New Registrant from QR Code</h3>
                            <button 
                                className="close-modal-btn"
                                onClick={() => {
                                    setShowAddRegistrantModal(false);
                                    setScannedNewRegistrant(null);
                                }}
                            >
                                ×
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Name</label>
                                <input
                                    type="text"
                                    value={scannedNewRegistrant.name}
                                    onChange={(e) => setScannedNewRegistrant({
                                        ...scannedNewRegistrant,
                                        name: e.target.value
                                    })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    value={scannedNewRegistrant.email}
                                    placeholder="Enter email address"
                                    onChange={(e) => setScannedNewRegistrant({
                                        ...scannedNewRegistrant,
                                        email: e.target.value
                                    })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Event</label>
                                <input
                                    type="text"
                                    value={scannedNewRegistrant.event}
                                    readOnly
                                />
                            </div>
                            <div className="form-group">
                                <label>University</label>
                                <input
                                    type="text"
                                    value={scannedNewRegistrant.university}
                                    onChange={(e) => setScannedNewRegistrant({
                                        ...scannedNewRegistrant,
                                        university: e.target.value
                                    })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Program</label>
                                <input
                                    type="text"
                                    value={scannedNewRegistrant.program}
                                    onChange={(e) => setScannedNewRegistrant({
                                        ...scannedNewRegistrant,
                                        program: e.target.value
                                    })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Type</label>
                                <select
                                    value={scannedNewRegistrant.type}
                                    onChange={(e) => setScannedNewRegistrant({
                                        ...scannedNewRegistrant,
                                        type: e.target.value
                                    })}
                                >
                                    <option value="satya">Satya Terra Bhinneka</option>
                                    <option value="umum">Umum</option>
                                </select>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button
                                className="save-button"
                                onClick={addRegistrantFromQR}
                            >
                                Add Registrant
                            </button>
                            <button
                                className="cancel-button"
                                onClick={() => {
                                    setShowAddRegistrantModal(false);
                                    setScannedNewRegistrant(null);
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Payment Proof Modal */}
            {showPaymentProofModal && selectedPaymentProof && (
                <div className="modal-overlay">
                    <div className="modal-content payment-proof-modal">
                        <div className="modal-header">
                            <h3>Detail Bukti Pembayaran</h3>
                            <button 
                                className="close-modal-btn"
                                onClick={closePaymentProofModal}
                            >
                                ×
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="payment-proof-details">
                                <div className="detail-row">
                                    <span className="detail-label">Nama Peserta:</span>
                                    <span className="detail-value">{selectedPaymentProof.registrantName}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Event:</span>
                                    <span className="detail-value">{selectedPaymentProof.eventName}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">File Bukti:</span>
                                    <span className="detail-value">{selectedPaymentProof.proofFilename}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Tanggal Upload:</span>
                                    <span className="detail-value">
                                        {new Date(selectedPaymentProof.uploadDate).toLocaleDateString('id-ID', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Status Pendaftaran:</span>
                                    <span className={`detail-value status-${selectedPaymentProof.registrationStatus}`}>
                                        {selectedPaymentProof.registrationStatus}
                                    </span>
                                </div>
                            </div>
                            <div className="payment-proof-image">
                                {selectedPaymentProof.proofImage ? (
                                    <div className="proof-image-container">
                                        <img 
                                            src={selectedPaymentProof.proofImage} 
                                            alt="Bukti Pembayaran" 
                                            className="proof-image" 
                                        />
                                    </div>
                                ) : (
                                    <div className="no-image-container">
                                        <div className="image-icon">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="64" height="64">
                                                <path fill="none" d="M0 0h24v24H0z"/>
                                                <path d="M4.828 21l-.02.02-.021-.02H2.992A.993.993 0 0 1 2 20.007V3.993A1 1 0 0 1 2.992 3h18.016c.548 0 .992.445.992.993v16.014a1 1 0 0 1-.992.993H4.828zM20 15V5H4v14L14 9l6 6zm0 2.828l-6-6L6.828 19H20v-1.172zM8 11a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" fill="rgba(82,130,255,1)"/>
                                            </svg>
                                        </div>
                                        <p className="image-caption">File bukti transfer: {selectedPaymentProof.proofFilename}</p>
                                        <p className="image-note">Gambar tidak tersedia untuk ditampilkan</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button 
                                className={`status-action-btn ${selectedPaymentProof.registrationStatus === 'confirmed' ? 'confirmed' : ''}`}
                                onClick={() => {
                                    // Find the registrant and update status
                                    const registrantId = registrants.find(r => 
                                        r.name === selectedPaymentProof.registrantName && 
                                        r.event === selectedPaymentProof.eventName
                                    )?.id;
                                    
                                    if (registrantId) {
                                        if (selectedPaymentProof.registrationStatus !== 'confirmed') {
                                            handleRegistrantStatusChange(registrantId, 'confirmed');
                                            setSelectedPaymentProof({
                                                ...selectedPaymentProof,
                                                registrationStatus: 'confirmed'
                                            });
                                        } else {
                                            handleRegistrantStatusChange(registrantId, 'pending');
                                            setSelectedPaymentProof({
                                                ...selectedPaymentProof,
                                                registrationStatus: 'pending'
                                            });
                                        }
                                    }
                                }}
                            >
                                {selectedPaymentProof.registrationStatus === 'confirmed' ? 'Batalkan Konfirmasi' : 'Konfirmasi Pembayaran'}
                            </button>
                            <button 
                                className="close-btn"
                                onClick={closePaymentProofModal}
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Talent View Modal */}
            {viewingTalent && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Talent Details</h3>
                            <button 
                                className="close-modal-btn"
                                onClick={closeTalentView}
                            >
                                ×
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="talent-details">
                                <div className="detail-row">
                                    <span className="detail-label">Name:</span>
                                    <span className="detail-value">{viewingTalent.name || 'N/A'}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Email:</span>
                                    <span className="detail-value">{viewingTalent.email || 'N/A'}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Specialization:</span>
                                    <span className="detail-value">{viewingTalent.specialization || 'N/A'}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Status:</span>
                                    <span className="detail-value">{viewingTalent.status || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button
                                className="close-btn"
                                onClick={closeTalentView}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Registrant View Modal */}
            {viewingRegistrant && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Registrant Details</h3>
                            <button 
                                className="close-modal-btn"
                                onClick={closeRegistrantView}
                            >
                                ×
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="registrant-details">
                                <div className="detail-row">
                                    <span className="detail-label">Name:</span>
                                    <span className="detail-value">{viewingRegistrant.name || 'N/A'}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Email:</span>
                                    <span className="detail-value">{viewingRegistrant.email || 'N/A'}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Event:</span>
                                    <span className="detail-value">{viewingRegistrant.event || 'N/A'}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Registration Date:</span>
                                    <span className="detail-value">
                                        {viewingRegistrant.registrationDate ? new Date(viewingRegistrant.registrationDate).toLocaleString() : 'N/A'}
                                    </span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Status:</span>
                                    <span className={`detail-value status-${viewingRegistrant.status}`}>
                                        {viewingRegistrant.status || 'N/A'}
                                    </span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">University:</span>
                                    <span className="detail-value">{viewingRegistrant.university || 'N/A'}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Program:</span>
                                    <span className="detail-value">{viewingRegistrant.program || 'N/A'}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Attendance:</span>
                                    <span className={`detail-value ${viewingRegistrant.attended ? 'present' : 'absent'}`}>
                                        {viewingRegistrant.attended ? 'Present' : 'Not marked'}
                                    </span>
                                </div>
                                {viewingRegistrant.attendanceTime && (
                                    <div className="detail-row">
                                        <span className="detail-label">Attendance Time:</span>
                                        <span className="detail-value">
                                            {new Date(viewingRegistrant.attendanceTime).toLocaleString()}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button
                                className="edit-btn"
                                onClick={() => {
                                    closeRegistrantView();
                                    startEditingRegistrant(viewingRegistrant);
                                }}
                            >
                                Edit
                            </button>
                            <button
                                className="close-btn"
                                onClick={closeRegistrantView}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard; 