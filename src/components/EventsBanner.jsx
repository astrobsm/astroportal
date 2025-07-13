import React, { useState, useEffect } from 'react';
import { Clock, ArrowRight, X } from 'lucide-react';
import { apiService } from '../services/apiService';

const EventsBanner = () => {
  const [events, setEvents] = useState([]);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState('');
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    loadActiveEvents();
  }, []);

  useEffect(() => {
    if (events.length > 0 && !dismissed) {
      const timer = setInterval(() => {
        calculateTimeLeft();
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [events, currentEventIndex, dismissed]);

  useEffect(() => {
    if (events.length > 1) {
      const rotationTimer = setInterval(() => {
        setCurrentEventIndex((prev) => (prev + 1) % events.length);
      }, 10000); // Rotate every 10 seconds

      return () => clearInterval(rotationTimer);
    }
  }, [events.length]);

  const loadActiveEvents = async () => {
    try {
      const data = await apiService.events.getAll();
      
      // Filter active events that haven't ended
      const activeEvents = data.filter(event => 
        event.is_active && 
        (!event.end_date || new Date(event.end_date) > new Date())
      );
      
      setEvents(activeEvents);
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const calculateTimeLeft = () => {
    if (events.length === 0 || !events[currentEventIndex]?.end_date) return;

    const now = new Date().getTime();
    const eventDate = new Date(events[currentEventIndex].end_date).getTime();
    const distance = eventDate - now;

    if (distance > 0) {
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h ${minutes}m`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      } else {
        setTimeLeft(`${minutes}m ${seconds}s`);
      }
    } else {
      setTimeLeft('Event ended');
      // Move to next event or remove this one
      if (events.length > 1) {
        setCurrentEventIndex((prev) => (prev + 1) % events.length);
      } else {
        setEvents([]);
      }
    }
  };

  const getEventTypeColor = (type) => {
    switch (type) {
      case 'promotion':
        return 'var(--golden-yellow)';
      case 'announcement':
        return 'var(--accent-green)';
      case 'webinar':
        return 'var(--primary-navy)';
      case 'training':
        return 'var(--light-navy)';
      default:
        return 'var(--primary-green)';
    }
  };

  const handleAction = (event) => {
    if (event.action_url) {
      if (event.action_url.startsWith('http')) {
        window.open(event.action_url, '_blank');
      } else {
        window.location.href = event.action_url;
      }
    }
  };

  if (events.length === 0 || dismissed) {
    return null;
  }

  const currentEvent = events[currentEventIndex];

  return (
    <div style={{
      backgroundColor: getEventTypeColor(currentEvent.event_type),
      color: currentEvent.event_type === 'promotion' ? 'var(--primary-green)' : 'var(--pure-white)',
      padding: '1rem 0',
      position: 'relative',
      borderBottom: '2px solid rgba(0,0,0,0.1)',
      animation: 'slideInFromTop 0.5s ease-out'
    }}>
      <div className="container">
        <div className="flex flex-between" style={{ alignItems: 'center', gap: '1rem' }}>
          <div style={{ flex: 1 }}>
            <div className="flex" style={{ alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              {/* Event Type Badge */}
              <span style={{
                backgroundColor: currentEvent.event_type === 'promotion' ? 'var(--primary-green)' : 'rgba(255,255,255,0.2)',
                color: currentEvent.event_type === 'promotion' ? 'var(--pure-white)' : 'inherit',
                padding: '0.25rem 0.75rem',
                borderRadius: '1rem',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                textTransform: 'uppercase'
              }}>
                {currentEvent.event_type}
              </span>

              {/* Event Banner Text */}
              <div style={{ flex: 1 }}>
                <h4 style={{ 
                  fontSize: '1.1rem', 
                  fontWeight: 'bold', 
                  margin: 0,
                  lineHeight: 1.2
                }}>
                  {currentEvent.banner_text || currentEvent.title}
                </h4>
                {currentEvent.description && (
                  <p style={{ 
                    fontSize: '0.875rem', 
                    margin: '0.25rem 0 0', 
                    opacity: 0.9,
                    lineHeight: 1.3
                  }}>
                    {currentEvent.description}
                  </p>
                )}
              </div>

              {/* Countdown Timer */}
              {currentEvent.end_date && timeLeft && timeLeft !== 'Event ended' && (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  backgroundColor: 'rgba(0,0,0,0.1)',
                  padding: '0.5rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.875rem',
                  fontWeight: 'bold'
                }}>
                  <Clock size={16} />
                  <span>Ends in: {timeLeft}</span>
                </div>
              )}

              {/* Action Button */}
              {currentEvent.action_text && currentEvent.action_url && (
                <button
                  onClick={() => handleAction(currentEvent)}
                  style={{
                    backgroundColor: currentEvent.event_type === 'promotion' ? 'var(--primary-green)' : 'var(--pure-white)',
                    color: currentEvent.event_type === 'promotion' ? 'var(--pure-white)' : 'var(--primary-green)',
                    border: 'none',
                    padding: '0.75rem 1.5rem',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.875rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  {currentEvent.action_text}
                  <ArrowRight size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Event Navigation Dots */}
          {events.length > 1 && (
            <div className="flex" style={{ gap: '0.5rem', alignItems: 'center' }}>
              {events.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentEventIndex(index)}
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    border: 'none',
                    backgroundColor: index === currentEventIndex 
                      ? (currentEvent.event_type === 'promotion' ? 'var(--primary-green)' : 'var(--pure-white)')
                      : 'rgba(255,255,255,0.4)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                />
              ))}
            </div>
          )}

          {/* Dismiss Button */}
          <button
            onClick={() => setDismissed(true)}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: 'inherit',
              cursor: 'pointer',
              padding: '0.5rem',
              borderRadius: 'var(--radius-sm)',
              opacity: 0.7,
              transition: 'opacity 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.opacity = '1'}
            onMouseLeave={(e) => e.target.style.opacity = '0.7'}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideInFromTop {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default EventsBanner;
