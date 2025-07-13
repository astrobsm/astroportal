import React from 'react';

const Logo = ({ size = 60, className = '', showText = true, variant = 'default', logoOnly = false }) => {
  const logoStyles = {
    default: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      fontSize: size > 40 ? '1.5rem' : '1rem',
      fontWeight: 'bold',
      color: 'var(--primary-navy)',
      textDecoration: 'none'
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontSize: '1.25rem',
      fontWeight: 'bold',
      color: 'var(--primary-navy)',
      textDecoration: 'none'
    },
    footer: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontSize: '1rem',
      fontWeight: 'bold',
      color: 'var(--pure-white)',
      textDecoration: 'none'
    }
  };

  // If logoOnly is true, just return the image
  if (logoOnly) {
    return (
      <img 
        src="/company-logo.png" 
        alt="Bonnesante Medicals Logo"
        className={className}
        style={{
          width: size,
          height: size,
          objectFit: 'contain'
        }}
      />
    );
  }

  const textColors = {
    default: {
      bonne: 'var(--primary-navy)',
      sante: 'var(--primary-navy)',
      medicals: 'var(--golden-yellow)'
    },
    header: {
      bonne: 'var(--primary-navy)',
      sante: 'var(--primary-navy)', 
      medicals: 'var(--golden-yellow)'
    },
    footer: {
      bonne: 'var(--pure-white)',
      sante: 'var(--pure-white)',
      medicals: 'var(--golden-yellow)'
    }
  };

  return (
    <div className={`logo ${className}`} style={logoStyles[variant]}>
      {/* Logo Icon */}
      <img 
        src="/company-logo.png" 
        alt="Bonnesante Medicals Logo"
        style={{
          width: size,
          height: size,
          objectFit: 'contain',
          flexShrink: 0
        }}
      />
      
      {/* Company Text */}
      {showText && (
        <div style={{ lineHeight: 1.2 }}>
          <div style={{ 
            fontSize: variant === 'header' ? '1.25rem' : variant === 'footer' ? '1rem' : '1.5rem',
            fontWeight: 'bold',
            marginBottom: '0.1rem'
          }}>
            <span style={{ 
              fontFamily: 'Mistral, cursive', 
              color: textColors[variant].bonne,
              textTransform: 'capitalize'
            }}>
              Bonne
            </span>
            <span style={{ 
              fontFamily: 'Georgia, serif', 
              color: textColors[variant].sante,
              marginLeft: '0.2rem'
            }}>
              SANTE
            </span>
          </div>
          <div style={{ 
            fontSize: variant === 'header' ? '0.875rem' : variant === 'footer' ? '0.75rem' : '1rem',
            fontFamily: 'Georgia, serif',
            color: textColors[variant].medicals,
            fontWeight: 'normal',
            letterSpacing: '0.5px'
          }}>
            MEDICALS
          </div>
        </div>
      )}
    </div>
  );
};

export default Logo;
