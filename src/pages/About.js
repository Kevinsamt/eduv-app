import React, { useState, useEffect } from 'react';
import './About.css';

const About = () => {
    const [selectedRole, setSelectedRole] = useState('rektor'); // Default selection
    const [isVisible, setIsVisible] = useState({
        intro: false,
        image: false,
        mission: false,
        structure: false,
        services: false
    });

    // Team members data with more detailed info
    const teamMembers = {
        "rektor": {
            name: "Dr. Tracey Yani Harjatanaya",
            title: "Rektor Universitas Satya Terra Bhinneka",
            bio: "Dr. Tracey Yani Harjatanaya, B.A., M.A., M.Sc, DPhil, adalah Rektor Universitas Satya Terra Bhinneka yang memiliki latar belakang akademik dan profesional yang luas. Dengan keahlian di bidang penelitian, pendidikan, dan manajemen akademik, beliau berkomitmen untuk membawa universitas menuju keunggulan dalam inovasi, riset, dan pengembangan sumber daya manusia. Kepemimpinannya berfokus pada kolaborasi global, peningkatan kualitas pendidikan, serta penerapan teknologi dalam pembelajaran guna mencetak lulusan yang siap bersaing di era digital.",
            image: "/img/team/rektor.png"
        },
        "Ketua": {
            name: "Sengli Egani Sitepu, M.Kom",
            title: "Ketua",
            bio: "Sengli Egani Sitepu memiliki keahlian dalam manajemen strategis dan pengembangan organisasi. Ia bertanggung jawab atas operasional harian dan pengembangan program.",
            image: "/img/team/Ketua.png"
        },
        "Manager": {
            name: "Siti Hawarina Simbolon",
            title: "Manager Inkubator Bisnis",
            bio: "Siti Hawarina Simbolon memiliki keahlian dalam manajemen strategis dan pengembangan organisasi. Ia bertanggung jawab atas operasional harian dan pengembangan program.",
            image: "/img/team/manager.png"
        },
        "Dekan FEB": {
            name: "Hidayatna Putri, S.E., M.Si",
            title: "Dekan Fakultas Ekonomi & Bisnis",
            bio: "Hidayatna Putri S.E, M.Si adalah pakar ekonomi dengan fokus pada ekonomi digital dan kewirausahaan. Ia aktif dalam penelitian dan pengembangan kurikulum inovatif.",
            image: "/img/team/dean.jpg"
        },
        "Tim IT": {
            name: "Tim Teknologi Informasi",
            title: "Divisi Digital & Teknologi",
            bio: "Tim IT kami terdiri dari profesional berpengalaman yang mengembangkan infrastruktur digital dan solusi teknologi untuk mendukung pembelajaran modern.",
            image: "/img/team/it-team.jpg",
            members: [
                {
                    name: "Pak Dafa",
                    title: "App Developer",
                    bio: "Pak Dafa adalah pengembang aplikasi yang berpengalaman dalam menciptakan solusi perangkat lunak yang inovatif.",
                    image: "/img/team/pak-dafa.jpg"
                },
                {
                    name: "Kevin Samuel",
                    title: "IT Support dan Front End Developer",
                    bio: "Kevin Samuel bertanggung jawab untuk dukungan IT dan pengembangan antarmuka pengguna yang menarik.",
                    image: "/img/team/kevin-samuel.jpg"
                },
                {
                    name: "Pak Jihad",
                    title: "App Developer",
                    bio: "Deskripsi singkat tentang anggota baru.",
                    image: "/img/team/anggota-baru.jpg"
                }
            ]
        },
        "Tim Desain": {
            name: "Tim Konten",
            title: "Divisi Desain & Kreativitas",
            bio: "Tim Desain kami terdiri dari profesional yang merancang pengalaman pengguna yang menarik dan fungsional.",
            image: "/img/team/design-team.jpg",
            members: [
                {
                    name: "Kevin Samuel",
                    title: "IT Support, Front End Developer, Desainer UI/UX & Grafik Desainer",
                },
                {
                    name: "Rey Permana",
                    title: "videografer",
                },

                {
                    name: "Dina Melisa",
                    title: "Script Maker",
                },

                {
                    name: "Nabila Meidana",
                    title: "fotografer",
                }
                ,

                {
                    name: "Jimy & Habil",
                    title: "Oprator",
                }
            ]
        }
    };

    // Fixed icons for each role to match the teamMembers keys
    const roleIcons = {
        "rektor": "fa-university",
        "Ketua": "fa-user-tie",
        "Manager": "fa-briefcase",
        "Dekan FEB": "fa-graduation-cap",
        "Tim IT": "fa-laptop-code",
        "Tim Konten": "fa-pencil-alt",
        "Tim Desain": "fa-paint-brush"
    };

    // Services data with more details
    const services = [
        {
            title: "Pelatihan",
            icon: "fa-graduation-cap",
            description: "Program pelatihan intensif untuk pengembangan keterampilan profesional dan akademik. Dirancang oleh para ahli industri dan pendidik berpengalaman.",
            features: ["Kurikulum up-to-date", "Instruktur berpengalaman", "Sertifikasi resmi"]
        },
        {
            title: "Mentoring",
            icon: "fa-user-friends",
            description: "Bimbingan personal dari para ahli di bidangnya. Kami memfasilitasi pertumbuhan profesional dan personal melalui pendekatan one-on-one.",
            features: ["Mentor berpengalaman", "Program terstruktur", "Evaluasi berkala"]
        },
        {
            title: "Konsultasi",
            icon: "fa-comments",
            description: "Layanan konsultasi profesional untuk solusi terbaik bagi individu maupun organisasi yang ingin mengembangkan strategi pendidikan dan pelatihan.",
            features: ["Analisis kebutuhan", "Rekomendasi terukur", "Implementasi efektif"]
        }
    ];

    useEffect(() => {
        // Trigger animations with staggered timing
        const timeouts = {
            intro: setTimeout(() => setIsVisible(prev => ({ ...prev, intro: true })), 300),
            image: setTimeout(() => setIsVisible(prev => ({ ...prev, image: true })), 600),
            mission: setTimeout(() => setIsVisible(prev => ({ ...prev, mission: true })), 900),
            structure: setTimeout(() => setIsVisible(prev => ({ ...prev, structure: true })), 1200),
            services: setTimeout(() => setIsVisible(prev => ({ ...prev, services: true })), 1500)
        };

        // Show default bio section
        handleRoleClick('rektor');

        // Cleanup timeouts on unmount
        return () => {
            Object.values(timeouts).forEach(timeout => clearTimeout(timeout));
        };
    }, []);

    const handleRoleClick = (role) => {
        setSelectedRole(role);
        
        // Add smooth scroll to bio section when a role is clicked
        const bioSection = document.querySelector('.bio-section');
        if (bioSection) {
            setTimeout(() => {
                bioSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 100);
        }
    };

    // Animation class helper
    const animationClass = (section) => isVisible[section] ? 'fade-in-up visible' : 'fade-in-up';

    // Render team member details (including support for sub-members if they exist)
    const renderTeamMemberDetails = () => {
        const member = teamMembers[selectedRole];
        if (!member) return null;

        return (
            <div className="bio-section">
                <div className="bio-card">
                    <div className="bio-image-container">
                        <img src={member.image} alt={member.name} className="bio-image" />
                    </div>
                    <div className="bio-content">
                        <h3 className="bio-name">{member.name}</h3>
                        <h4 className="bio-title">{member.title}</h4>
                        <p className="bio-text">{member.bio}</p>
                        
                        {member.members && member.members.length > 0 && (
                            <div className="sub-members">
                                <h5 className="sub-members-title">Anggota Tim:</h5>
                                <ul className="sub-members-list">
                                    {member.members.map((subMember, idx) => (
                                        <li key={idx} className="sub-member-item">
                                            <strong>{subMember.name}</strong> - {subMember.title}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <section className="about-section">
            <div className="about-container">
                <div className="about-header">
                    <h1 className="about-title">Tim & Visi Kami</h1>
                </div>
                
                <div className="about-content">
                    <p className={`about-intro ${animationClass('intro')}`}>
                        Kami adalah tim profesional yang berdedikasi untuk menciptakan perubahan positif 
                        melalui pendidikan dan pengembangan yang inovatif.
                    </p>
                    
                    <div className={`about-image-container ${animationClass('image')}`}>
                        <img src="/img/eduvtim.jpg" alt="Tim Kami" className="about-image" />
                        <div className="image-overlay">
                            <span>Membangun Masa Depan Bersama</span>
                        </div>
                    </div>
                    
                    <div className={`mission-section ${animationClass('mission')}`}>
                        <h2 className="section-title">Misi Kami</h2>
                        <div className="mission-content">
                            <div className="mission-cards">
                                <div className="mission-card">
                                    <i className="fas fa-lightbulb"></i>
                                    <h3>Inovasi</h3>
                                    <p>Mengembangkan pendekatan pembelajaran inovatif yang selaras dengan perkembangan global</p>
                                </div>
                                <div className="mission-card">
                                    <i className="fas fa-hands-helping"></i>
                                    <h3>Kolaborasi</h3>
                                    <p>Membangun kemitraan strategis dengan institusi dan industri terkemuka</p>
                                </div>
                                <div className="mission-card">
                                    <i className="fas fa-chart-line"></i>
                                    <h3>Pengembangan</h3>
                                    <p>Mendorong pertumbuhan profesional berkelanjutan dan pengembangan potensi</p>
                                </div>
                            </div>
                            <p className="mission-description">Misi kami adalah menyediakan layanan pendidikan dan pengembangan berkualitas tinggi yang memberdayakan individu dan organisasi untuk mencapai potensi maksimal mereka.</p>
                            <div className="cta-container">
                                <a href="#contact" className="cta-button">Pelajari Lebih Lanjut <i className="fas fa-arrow-right"></i></a>
                            </div>
                        </div>
                    </div>
                    
                    <div className={`structure-section ${animationClass('structure')}`}>
                        <h2 className="section-title">Struktur Tim</h2>
                        <ul className="structure-list">
                            {Object.keys(teamMembers).map((role) => (
                                <li 
                                    className={`structure-item ${selectedRole === role ? 'active' : ''}`} 
                                    key={role} 
                                    data-role={role} 
                                    onClick={() => handleRoleClick(role)}
                                >
                                    <div className="icon-container">
                                        <i className={`fas ${roleIcons[role] || 'fa-user'}`}></i>
                                    </div>
                                    <span className="structure-text">{role}</span>
                                </li>
                            ))}
                        </ul>
                        
                        {renderTeamMemberDetails()}
                    </div>
                    
                    <div className={`services-section ${animationClass('services')}`}>
                        <h2 className="section-title">Layanan Kami</h2>
                        <div className="services-grid">
                            {services.map((service, index) => (
                                <div className="service-card" key={index}>
                                    <div className="service-icon">
                                        <i className={`fas ${service.icon}`}></i>
                                    </div>
                                    <h3 className="service-title">{service.title}</h3>
                                    <p className="service-description">{service.description}</p>
                                    <ul className="service-features">
                                        {service.features.map((feature, i) => (
                                            <li key={i}><i className="fas fa-check"></i> {feature}</li>
                                        ))}
                                    </ul>
                                    <div className="service-cta">
                                        <a href={`#${service.title.toLowerCase()}`} className="cta-button small">Detail <i className="fas fa-arrow-right"></i></a>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="cta-container">
                            <a href="#contact" className="cta-button large">Hubungi Kami <i className="fas fa-envelope"></i></a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default About;