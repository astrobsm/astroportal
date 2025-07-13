import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Bell, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { notificationService } from '../services/indexedDB';
import { syncService } from '../services/syncService';

const Header = ({ isOnline }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [syncStatus, setSyncStatus] = useState(syncService.getSyncStatus());
  const location = useLocation();

  useEffect(() => {
    // Load notification count
    loadNotificationCount();
    
    // Update sync status periodically
    const interval = setInterval(() => {
      setSyncStatus(syncService.getSyncStatus());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const loadNotificationCount = async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setNotificationCount(count);
    } catch (error) {
      console.error('Error loading notification count:', error);
    }
  };

  const handleSyncClick = async () => {
    await syncService.forcSync();
    setSyncStatus(syncService.getSyncStatus());
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const isActivePage = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="bg-white shadow-md border-b-4 border-primary-navy">
      <div className="container">
        <div className="flex flex-between" style={{ height: '70px' }}>
          {/* Logo and Brand */}
          <div className="flex" style={{ alignItems: 'center', gap: '1rem' }}>
            <Link to="/" className="flex" style={{ alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
              <div 
                className="flex flex-center"
                style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: 'var(--brilliant-navy)',
                  borderRadius: '50%',
                  color: 'var(--pure-white)',
                  fontWeight: 'bold',
                  fontSize: '1.2rem'
                }}
              >
                B
              </div>
              <div>
                <h1 style={{ 
                  fontSize: '1.4rem', 
                  fontWeight: 'bold', 
                  color: 'var(--primary-navy)',
                  margin: 0,
                  lineHeight: 1
                }}>
                  Bonnesante Medicals
                </h1>
                <p style={{ 
                  fontSize: '0.7rem', 
                  color: 'var(--light-navy)',
                  margin: 0,
                  lineHeight: 1
                }}>
                  Professional Wound Care Solutions
                </p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="flex" style={{ alignItems: 'center', gap: '2rem', display: window.innerWidth >= 768 ? 'flex' : 'none' }}>
            <Link 
              to="/" 
              className={`nav-link ${isActivePage('/') ? 'active' : ''}`}
              style={{
                textDecoration: 'none',
                color: isActivePage('/') ? 'var(--primary-green)' : 'var(--light-green)',
                fontWeight: isActivePage('/') ? '600' : '500',
                borderBottom: isActivePage('/') ? '2px solid var(--golden-yellow)' : 'none',
                paddingBottom: '0.25rem'
              }}
            >
              Home
            </Link>
            <Link 
              to="/order" 
              className={`nav-link ${isActivePage('/order') ? 'active' : ''}`}
              style={{
                textDecoration: 'none',
                color: isActivePage('/order') ? 'var(--primary-green)' : 'var(--light-green)',
                fontWeight: isActivePage('/order') ? '600' : '500',
                borderBottom: isActivePage('/order') ? '2px solid var(--golden-yellow)' : 'none',
                paddingBottom: '0.25rem'
              }}
            >
              Place Order
            </Link>
            <Link 
              to="/customer-dashboard" 
              className={`nav-link ${isActivePage('/customer-dashboard') ? 'active' : ''}`}
              style={{
                textDecoration: 'none',
                color: isActivePage('/customer-dashboard') ? 'var(--primary-green)' : 'var(--light-green)',
                fontWeight: isActivePage('/customer-dashboard') ? '600' : '500',
                borderBottom: isActivePage('/customer-dashboard') ? '2px solid var(--golden-yellow)' : 'none',
                paddingBottom: '0.25rem'
              }}
            >
              My Orders
            </Link>
            <Link 
              to="/admin-dashboard" 
              className={`nav-link ${isActivePage('/admin-dashboard') ? 'active' : ''}`}
              style={{
                textDecoration: 'none',
                color: isActivePage('/admin-dashboard') ? 'var(--primary-green)' : 'var(--light-green)',
                fontWeight: isActivePage('/admin-dashboard') ? '600' : '500',
                borderBottom: isActivePage('/admin-dashboard') ? '2px solid var(--golden-yellow)' : 'none',
                paddingBottom: '0.25rem'
              }}
            >
              Admin
            </Link>
          </nav>

          {/* Status and Actions */}
          <div className="flex" style={{ alignItems: 'center', gap: '1rem' }}>
            {/* Connection Status */}
            <div className="flex" style={{ alignItems: 'center', gap: '0.5rem' }}>
              {isOnline ? (
                <Wifi size={20} style={{ color: 'var(--accent-green)' }} />
              ) : (
                <WifiOff size={20} style={{ color: 'var(--error-red)' }} />
              )}
              <span style={{ 
                fontSize: '0.875rem', 
                color: isOnline ? 'var(--accent-green)' : 'var(--error-red)',
                fontWeight: '500'
              }}>
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>

            {/* Sync Button */}
            {isOnline && (
              <button
                onClick={handleSyncClick}
                disabled={syncStatus.isSyncing}
                className="btn btn-outline"
                style={{ 
                  padding: '0.5rem',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px'
                }}
                title="Sync Data"
              >
                <RefreshCw 
                  size={16} 
                  style={{ 
                    animation: syncStatus.isSyncing ? 'spin 1s linear infinite' : 'none'
                  }} 
                />
              </button>
            )}

            {/* Notifications */}
            <div style={{ position: 'relative' }}>
              <Bell size={20} style={{ color: 'var(--primary-green)' }} />
              {notificationCount > 0 && (
                <span 
                  className="flex flex-center"
                  style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '-8px',
                    backgroundColor: 'var(--error-red)',
                    color: 'var(--pure-white)',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    fontSize: '0.75rem',
                    fontWeight: 'bold'
                  }}
                >
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className="btn btn-outline"
              style={{ 
                display: window.innerWidth < 768 ? 'block' : 'none',
                padding: '0.5rem',
                borderRadius: '4px'
              }}
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav 
            className="mobile-nav"
            style={{
              display: 'block',
              backgroundColor: 'var(--pure-white)',
              borderTop: '1px solid #e5e7eb',
              padding: '1rem 0',
              marginTop: '1rem'
            }}
          >
            <Link 
              to="/" 
              onClick={closeMenu}
              className={`mobile-nav-link ${isActivePage('/') ? 'active' : ''}`}
              style={{
                display: 'block',
                padding: '0.75rem 0',
                textDecoration: 'none',
                color: isActivePage('/') ? 'var(--primary-green)' : 'var(--light-green)',
                fontWeight: isActivePage('/') ? '600' : '500',
                borderLeft: isActivePage('/') ? '4px solid var(--golden-yellow)' : 'none',
                paddingLeft: isActivePage('/') ? '1rem' : '0'
              }}
            >
              Home
            </Link>
            <Link 
              to="/order" 
              onClick={closeMenu}
              className={`mobile-nav-link ${isActivePage('/order') ? 'active' : ''}`}
              style={{
                display: 'block',
                padding: '0.75rem 0',
                textDecoration: 'none',
                color: isActivePage('/order') ? 'var(--primary-green)' : 'var(--light-green)',
                fontWeight: isActivePage('/order') ? '600' : '500',
                borderLeft: isActivePage('/order') ? '4px solid var(--golden-yellow)' : 'none',
                paddingLeft: isActivePage('/order') ? '1rem' : '0'
              }}
            >
              Place Order
            </Link>
            <Link 
              to="/customer-dashboard" 
              onClick={closeMenu}
              className={`mobile-nav-link ${isActivePage('/customer-dashboard') ? 'active' : ''}`}
              style={{
                display: 'block',
                padding: '0.75rem 0',
                textDecoration: 'none',
                color: isActivePage('/customer-dashboard') ? 'var(--primary-green)' : 'var(--light-green)',
                fontWeight: isActivePage('/customer-dashboard') ? '600' : '500',
                borderLeft: isActivePage('/customer-dashboard') ? '4px solid var(--golden-yellow)' : 'none',
                paddingLeft: isActivePage('/customer-dashboard') ? '1rem' : '0'
              }}
            >
              My Orders
            </Link>
            <Link 
              to="/admin-dashboard" 
              onClick={closeMenu}
              className={`mobile-nav-link ${isActivePage('/admin-dashboard') ? 'active' : ''}`}
              style={{
                display: 'block',
                padding: '0.75rem 0',
                textDecoration: 'none',
                color: isActivePage('/admin-dashboard') ? 'var(--primary-green)' : 'var(--light-green)',
                fontWeight: isActivePage('/admin-dashboard') ? '600' : '500',
                borderLeft: isActivePage('/admin-dashboard') ? '4px solid var(--golden-yellow)' : 'none',
                paddingLeft: isActivePage('/admin-dashboard') ? '1rem' : '0'
              }}
            >
              Admin
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
