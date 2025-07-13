import React, { useState, useEffect } from 'react';

const Footer = () => {
  const [contactInfo, setContactInfo] = useState({
    phone: '+234 803 609 4136',
    email: 'astrobsm@gmail.com',
    address: 'No 6B Peace Avenue/17A Isuofia Street\nFederal Housing Estate, Trans Ekulu\nEnugu, Nigeria',
    hours: 'Mon-Fri: 8:00 AM - 6:00 PM\nSat: 9:00 AM - 4:00 PM\nSun: Closed'
  });

  const [locationInfo, setLocationInfo] = useState({
    address: 'No 6B Peace Avenue/17A Isuofia Street, Federal Housing Estate, Trans Ekulu, Enugu, Nigeria',
    coordinates: '6.5244, 3.3792',
    directions: 'Located in Trans Ekulu, easily accessible by public transport.',
    landmarks: 'Near Federal Housing Estate'
  });

  const [distributors, setDistributors] = useState([]);

  useEffect(() => {
    // Load saved contact info
    const savedContactInfo = localStorage.getItem('astro_contact_info');
    const savedLocationInfo = localStorage.getItem('astro_location_info');
    
    if (savedContactInfo) {
      setContactInfo(JSON.parse(savedContactInfo));
    }
    
    if (savedLocationInfo) {
      setLocationInfo(JSON.parse(savedLocationInfo));
    }

    // Load distributors from API
    loadDistributors();
  }, []);

  const loadDistributors = async () => {
    try {
      const response = await fetch('/api/distributors');
      if (response.ok) {
        const distributorsData = await response.json();
        setDistributors(distributorsData.slice(0, 5)); // Show only first 5
      }
    } catch (error) {
      console.error('Error loading distributors:', error);
    }
  };
  return (
    <footer 
      style={{
        backgroundColor: 'var(--primary-green)',
        color: 'var(--pure-white)',
        padding: '2rem 0',
        marginTop: '3rem'
      }}
    >
      <div className="container">
        <div className="grid grid-3 mb-lg">
          {/* Company Info */}
          <div>
            <h3 style={{ 
              fontSize: '1.25rem', 
              fontWeight: 'bold', 
              marginBottom: '1rem',
              color: 'var(--golden-yellow)'
            }}>
              BONNESANTE MEDICALS
            </h3>
            <p style={{ 
              fontSize: '0.875rem', 
              lineHeight: 1.6,
              marginBottom: '1rem'
            }}>
              Your trusted partner in wound care solutions. We provide high-quality 
              products and exceptional service to healthcare professionals and patients.
            </p>
            <div style={{ fontSize: '0.875rem' }}>
              <p style={{ marginBottom: '0.5rem' }}>
                <strong>Email:</strong> {contactInfo.email}
              </p>
              <p style={{ marginBottom: '0.5rem' }}>
                <strong>Phone:</strong> {contactInfo.phone}
              </p>
              <p>
                <strong>Address:</strong><br />
                {contactInfo.address.split('\n').map((line, index) => (
                  <span key={index}>
                    {line}
                    {index < contactInfo.address.split('\n').length - 1 && <br />}
                  </span>
                ))}
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 style={{ 
              fontSize: '1.25rem', 
              fontWeight: 'bold', 
              marginBottom: '1rem',
              color: 'var(--golden-yellow)'
            }}>
              Quick Links
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <a 
                href="/" 
                style={{
                  color: 'var(--pure-white)',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  transition: 'color 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.color = 'var(--golden-yellow)'}
                onMouseLeave={(e) => e.target.style.color = 'var(--pure-white)'}
              >
                Home
              </a>
              <a 
                href="/order" 
                style={{
                  color: 'var(--pure-white)',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  transition: 'color 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.color = 'var(--golden-yellow)'}
                onMouseLeave={(e) => e.target.style.color = 'var(--pure-white)'}
              >
                Place Order
              </a>
              <a 
                href="/customer-dashboard" 
                style={{
                  color: 'var(--pure-white)',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  transition: 'color 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.color = 'var(--golden-yellow)'}
                onMouseLeave={(e) => e.target.style.color = 'var(--pure-white)'}
              >
                My Orders
              </a>
              <a 
                href="/admin-dashboard" 
                style={{
                  color: 'var(--pure-white)',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  transition: 'color 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.color = 'var(--golden-yellow)'}
                onMouseLeave={(e) => e.target.style.color = 'var(--pure-white)'}
              >
                Admin Dashboard
              </a>
            </div>
          </div>

          {/* Regional Distributors */}
          <div>
            <h3 style={{ 
              fontSize: '1.25rem', 
              fontWeight: 'bold', 
              marginBottom: '1rem',
              color: 'var(--golden-yellow)'
            }}>
              Regional Distributors
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {distributors.length > 0 ? (
                distributors.map((distributor) => (
                  <div key={distributor.id} style={{ fontSize: '0.8rem', marginBottom: '0.3rem' }}>
                    <strong>{distributor.region}:</strong><br />
                    {distributor.contact_person} - {distributor.phone}
                  </div>
                ))
              ) : (
                <>
                  <div style={{ fontSize: '0.8rem', marginBottom: '0.3rem' }}>
                    <strong>ANAMBRA/SOUTH-EAST:</strong><br />
                    FABIAN - +234 803 609 4136
                  </div>
                  <div style={{ fontSize: '0.8rem', marginBottom: '0.3rem' }}>
                    <strong>LAGOS/SOUTH-WEST:</strong><br />
                    IKECHUKWU - +234 803 732 5194
                  </div>
                  <div style={{ fontSize: '0.8rem', marginBottom: '0.3rem' }}>
                    <strong>ABUJA/NORTH:</strong><br />
                    ANIAGBOSO DAVIDSON - +234 805 850 1919
                  </div>
                  <div style={{ fontSize: '0.8rem', marginBottom: '0.3rem' }}>
                    <strong>WARRI/SOUTH-SOUTH:</strong><br />
                    DOUGLAS ONYEMA - +234 802 135 2164
                  </div>
                  <div style={{ fontSize: '0.8rem', marginBottom: '0.3rem' }}>
                    <strong>NSUKKA/ENUGU:</strong><br />
                    CHIKWENDU CHINONSO - +234 806 710 4155
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div 
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.2)',
            paddingTop: '1.5rem',
            textAlign: 'center'
          }}
        >
          <div className="flex flex-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ fontSize: '0.875rem' }}>
              <p style={{ margin: 0 }}>
                © 2025 BONNESANTE MEDICALS. All rights reserved.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              <a 
                href="/privacy" 
                style={{
                  color: 'var(--pure-white)',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  transition: 'color 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.color = 'var(--golden-yellow)'}
                onMouseLeave={(e) => e.target.style.color = 'var(--pure-white)'}
              >
                Privacy Policy
              </a>
              <a 
                href="/terms" 
                style={{
                  color: 'var(--pure-white)',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  transition: 'color 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.color = 'var(--golden-yellow)'}
                onMouseLeave={(e) => e.target.style.color = 'var(--pure-white)'}
              >
                Terms of Service
              </a>
              <a 
                href="/contact" 
                style={{
                  color: 'var(--pure-white)',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  transition: 'color 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.color = 'var(--golden-yellow)'}
                onMouseLeave={(e) => e.target.style.color = 'var(--pure-white)'}
              >
                Contact Us
              </a>
            </div>
          </div>
          
          <div style={{ marginTop: '1rem', fontSize: '0.75rem', opacity: 0.8 }}>
            <p style={{ margin: 0 }}>
              Built with React, Node.js, and PostgreSQL | Designed for Healthcare Professionals
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
