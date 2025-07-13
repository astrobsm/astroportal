import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import EventsBanner from '../components/EventsBanner';
import { 
  ShoppingCart, 
  Clock, 
  Shield, 
  Truck, 
  Users, 
  Award,
  CheckCircle,
  ArrowRight,
  Package,
  ChevronLeft,
  ChevronRight,
  Star,
  Quote,
  Plus,
  Minus
} from 'lucide-react';

// Events Sidebar Component
const EventsSidebar = ({ events, loading, title }) => {
  if (loading) {
    return (
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '1.5rem',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        marginBottom: '1rem'
      }}>
        <h3 style={{ 
          color: 'var(--primary-navy)', 
          marginBottom: '1rem', 
          fontSize: '1.1rem',
          fontWeight: 'bold'
        }}>
          {title}
        </h3>
        <div style={{ textAlign: 'center', color: '#6c757d', padding: '2rem 0' }}>
          <Package size={32} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '1.5rem',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        marginBottom: '1rem'
      }}>
        <h3 style={{ 
          color: 'var(--primary-navy)', 
          marginBottom: '1rem', 
          fontSize: '1.1rem',
          fontWeight: 'bold'
        }}>
          {title}
        </h3>
        <div style={{ textAlign: 'center', color: '#6c757d', padding: '1rem 0' }}>
          <Package size={24} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
          <div style={{ fontSize: '0.9rem' }}>No events available</div>
        </div>
      </div>
    );
  }    return (
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '1.5rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        marginBottom: '1rem',
        border: '1px solid #e9ecef'
      }}>
        <h3 style={{ 
          color: 'var(--primary-navy)', 
          marginBottom: '1rem', 
          fontSize: '1.1rem',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          borderBottom: '2px solid var(--accent-green)',
          paddingBottom: '0.5rem'
        }}>
          <Package size={18} style={{ color: 'var(--accent-green)' }} />
          {title}
        </h3>
        
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {events.slice(0, 5).map((event, index) => (
            <div
              key={event.id}
              style={{
                padding: '1rem',
                marginBottom: '0.75rem',
                border: '1px solid #e9ecef',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #e3f2fd 0%, #f8f9fa 100%)';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Event Type Badge */}
              <div style={{
                position: 'absolute',
                top: '0.5rem',
                right: '0.5rem',
                backgroundColor: event.event_type === 'promotion' ? 'var(--accent-green)' : 'var(--primary-navy)',
                color: 'white',
                fontSize: '0.7rem',
                padding: '0.25rem 0.5rem',
                borderRadius: '12px',
                fontWeight: 'bold',
                textTransform: 'uppercase'
              }}>
                {event.event_type}
              </div>
              
              <div style={{
                fontSize: '0.9rem',
                fontWeight: 'bold',
                color: 'var(--primary-navy)',
                marginBottom: '0.5rem',
                lineHeight: 1.3,
                paddingRight: '4rem' // Make room for badge
              }}>
                {event.title}
              </div>
            
            {event.description && (
              <div style={{
                fontSize: '0.8rem',
                color: '#6c757d',
                marginBottom: '0.5rem',
                lineHeight: 1.4,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {event.description}
              </div>
            )}
            
            {event.start_date && (
              <div style={{
                fontSize: '0.75rem',
                color: 'var(--accent-green)',
                fontWeight: '500'
              }}>
                {new Date(event.start_date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </div>
            )}
            
            {event.action_url && event.action_text && (
              <div style={{ marginTop: '0.5rem' }}>
                <a
                  href={event.action_url}
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--primary-navy)',
                    textDecoration: 'none',
                    fontWeight: 'bold',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.textDecoration = 'underline';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.textDecoration = 'none';
                  }}
                >
                  {event.action_text}
                  <ArrowRight size={12} />
                </a>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Product Slideshow Component
const ProductSlideshow = ({ images, loading }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + images.length) % images.length);
  };

  useEffect(() => {
    if (images.length > 0) {
      const interval = setInterval(nextSlide, 5000); // Auto-advance every 5 seconds
      return () => clearInterval(interval);
    }
  }, [images.length]);

  if (loading) {
    return (
      <div style={{
        height: '400px',
        backgroundColor: '#f8f9fa',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '12px'
      }}>
        <Package size={48} style={{ color: '#6c757d', marginRight: '1rem' }} />
        <span style={{ color: '#6c757d', fontSize: '1.1rem' }}>Loading slideshow...</span>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div style={{
        height: '400px',
        backgroundColor: '#f8f9fa',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '12px',
        border: '2px dashed #dee2e6'
      }}>
        <div style={{ textAlign: 'center', color: '#6c757d' }}>
          <Package size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
          <div>No slideshow images available</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
      {/* Slideshow Container */}
      <div style={{
        height: '400px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {images.map((image, index) => (
          <div
            key={image.id}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              opacity: index === currentSlide ? 1 : 0,
              transition: 'opacity 0.5s ease-in-out',
              backgroundImage: `url(${image.image_url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: 'flex',
              alignItems: 'flex-end'
            }}
          >
            {/* Overlay */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)'
            }} />
            
            {/* Content */}
            {(image.title || image.description) && (
              <div style={{
                position: 'relative',
                padding: '2rem',
                color: 'white',
                zIndex: 1
              }}>
                {image.title && (
                  <h3 style={{
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    marginBottom: '0.5rem',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
                  }}>
                    {image.title}
                  </h3>
                )}
                {image.description && (
                  <p style={{
                    fontSize: '1rem',
                    lineHeight: 1.4,
                    textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
                  }}>
                    {image.description}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            style={{
              position: 'absolute',
              left: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              backgroundColor: 'rgba(255,255,255,0.9)',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'white';
              e.target.style.transform = 'translateY(-50%) scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'rgba(255,255,255,0.9)';
              e.target.style.transform = 'translateY(-50%) scale(1)';
            }}
          >
            <ChevronLeft size={20} style={{ color: 'var(--primary-navy)' }} />
          </button>
          
          <button
            onClick={nextSlide}
            style={{
              position: 'absolute',
              right: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              backgroundColor: 'rgba(255,255,255,0.9)',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'white';
              e.target.style.transform = 'translateY(-50%) scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'rgba(255,255,255,0.9)';
              e.target.style.transform = 'translateY(-50%) scale(1)';
            }}
          >
            <ChevronRight size={20} style={{ color: 'var(--primary-navy)' }} />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {images.length > 1 && (
        <div style={{
          position: 'absolute',
          bottom: '1rem',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '0.5rem'
        }}>
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                border: 'none',
                backgroundColor: index === currentSlide ? 'white' : 'rgba(255,255,255,0.5)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Testimonials Slideshow Component
const TestimonialsSlideshow = ({ testimonials, loading }) => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  useEffect(() => {
    if (testimonials.length > 0) {
      const interval = setInterval(nextTestimonial, 7000); // Auto-advance every 7 seconds
      return () => clearInterval(interval);
    }
  }, [testimonials.length]);

  if (loading) {
    return (
      <div style={{
        height: '300px',
        backgroundColor: '#f8f9fa',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '12px'
      }}>
        <Quote size={48} style={{ color: '#6c757d', marginRight: '1rem' }} />
        <span style={{ color: '#6c757d', fontSize: '1.1rem' }}>Loading testimonials...</span>
      </div>
    );
  }

  if (testimonials.length === 0) {
    return (
      <div style={{
        height: '300px',
        backgroundColor: '#f8f9fa',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '12px',
        border: '2px dashed #dee2e6'
      }}>
        <div style={{ textAlign: 'center', color: '#6c757d' }}>
          <Quote size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
          <div>No testimonials available</div>
        </div>
      </div>
    );
  }

  const currentTest = testimonials[currentTestimonial];

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '2rem',
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      position: 'relative',
      minHeight: '300px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center'
    }}>
      {/* Quote Icon */}
      <Quote size={40} style={{ 
        color: 'var(--accent-green)', 
        marginBottom: '1rem',
        opacity: 0.3
      }} />

      {/* Testimonial Content */}
      <div style={{
        fontSize: '1.1rem',
        lineHeight: 1.6,
        color: 'var(--primary-navy)',
        marginBottom: '1.5rem',
        fontStyle: 'italic',
        flex: 1,
        display: 'flex',
        alignItems: 'center'
      }}>
        "{currentTest.testimonial_text}"
      </div>

      {/* Patient Info */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '1rem'
      }}>
        {currentTest.patient_image_url ? (
          <img
            src={currentTest.patient_image_url}
            alt={currentTest.patient_name}
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '3px solid var(--accent-green)'
            }}
          />
        ) : (
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: 'var(--accent-green)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '1.5rem',
            fontWeight: 'bold'
          }}>
            {currentTest.patient_name.charAt(0)}
          </div>
        )}
        
        <div>
          <div style={{
            fontWeight: 'bold',
            color: 'var(--primary-navy)',
            fontSize: '1rem'
          }}>
            {currentTest.patient_name}
          </div>
          {currentTest.patient_title && (
            <div style={{
              color: 'var(--light-navy)',
              fontSize: '0.9rem'
            }}>
              {currentTest.patient_title}
            </div>
          )}
          {currentTest.product_used && (
            <div style={{
              color: 'var(--accent-green)',
              fontSize: '0.8rem',
              fontWeight: '500'
            }}>
              Used: {currentTest.product_used}
            </div>
          )}
        </div>
      </div>

      {/* Rating */}
      {currentTest.rating && (
        <div style={{
          display: 'flex',
          gap: '0.25rem',
          marginBottom: '1rem'
        }}>
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={16}
              style={{
                color: i < currentTest.rating ? 'var(--golden-yellow)' : '#ddd',
                fill: i < currentTest.rating ? 'var(--golden-yellow)' : 'none'
              }}
            />
          ))}
        </div>
      )}

      {/* Navigation */}
      {testimonials.length > 1 && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <button
            onClick={prevTestimonial}
            style={{
              backgroundColor: 'var(--accent-green)',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'var(--primary-navy)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'var(--accent-green)';
            }}
          >
            <ChevronLeft size={20} />
          </button>

          <div style={{
            display: 'flex',
            gap: '0.5rem'
          }}>
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTestimonial(index)}
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  border: 'none',
                  backgroundColor: index === currentTestimonial ? 'var(--accent-green)' : '#ddd',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              />
            ))}
          </div>

          <button
            onClick={nextTestimonial}
            style={{
              backgroundColor: 'var(--accent-green)',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'var(--primary-navy)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'var(--accent-green)';
            }}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

// FAQ Component
const FAQSection = ({ faqs, loading }) => {
  const [expandedFAQ, setExpandedFAQ] = useState(null);

  const toggleFAQ = (index) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  if (loading) {
    return (
      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '2rem',
        borderRadius: '12px',
        textAlign: 'center'
      }}>
        <Package size={48} style={{ color: '#6c757d', marginBottom: '1rem' }} />
        <div style={{ color: '#6c757d', fontSize: '1.1rem' }}>Loading FAQs...</div>
      </div>
    );
  }

  if (faqs.length === 0) {
    return (
      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '2rem',
        borderRadius: '12px',
        textAlign: 'center',
        border: '2px dashed #dee2e6'
      }}>
        <Package size={48} style={{ color: '#6c757d', marginBottom: '1rem', opacity: 0.5 }} />
        <div style={{ color: '#6c757d' }}>No FAQs available</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {faqs.map((faq, index) => (
        <div
          key={faq.id}
          style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            marginBottom: '1rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            overflow: 'hidden',
            transition: 'all 0.2s ease'
          }}
        >
          <button
            onClick={() => toggleFAQ(index)}
            style={{
              width: '100%',
              padding: '1.5rem',
              border: 'none',
              backgroundColor: 'transparent',
              textAlign: 'left',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              color: 'var(--primary-navy)',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (expandedFAQ !== index) {
                e.target.style.backgroundColor = '#f8f9fa';
              }
            }}
            onMouseLeave={(e) => {
              if (expandedFAQ !== index) {
                e.target.style.backgroundColor = 'transparent';
              }
            }}
          >
            <span style={{ flex: 1, paddingRight: '1rem' }}>{faq.question}</span>
            <div style={{
              backgroundColor: expandedFAQ === index ? 'var(--accent-green)' : 'var(--primary-navy)',
              color: 'white',
              borderRadius: '50%',
              width: '30px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}>
              {expandedFAQ === index ? <Minus size={16} /> : <Plus size={16} />}
            </div>
          </button>
          
          {expandedFAQ === index && (
            <div style={{
              padding: '0 1.5rem 1.5rem 1.5rem',
              backgroundColor: '#f8f9fa',
              borderTop: '1px solid #e9ecef'
            }}>
              <p style={{
                margin: 0,
                lineHeight: 1.6,
                color: 'var(--light-navy)',
                fontSize: '1rem'
              }}>
                {faq.answer}
              </p>
              {faq.category && (
                <div style={{
                  marginTop: '1rem',
                  display: 'inline-block',
                  backgroundColor: 'var(--accent-green)',
                  color: 'white',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '12px',
                  fontSize: '0.8rem',
                  fontWeight: '500'
                }}>
                  {faq.category}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const Home = () => {
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [slideshow, setSlideshow] = useState([]);
  const [slideshowLoading, setSlideshowLoading] = useState(true);
  const [testimonials, setTestimonials] = useState([]);
  const [testimonialsLoading, setTestimonialsLoading] = useState(true);
  const [faqs, setFaqs] = useState([]);
  const [faqsLoading, setFaqsLoading] = useState(true);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load products from database
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setProductsLoading(true);
        
        // Fetch products
        const productsResponse = await fetch('/api/products');
        const productsData = await productsResponse.json();
        
        // Fetch images for each product
        const productsWithImages = await Promise.all(
          productsData.map(async (product) => {
            try {
              const imagesResponse = await fetch(`/api/products/${product.id}/images`);
              const images = await imagesResponse.json();
              return {
                ...product,
                images: images || [],
                primaryImage: images.find(img => img.is_primary) || images[0] || null
              };
            } catch (error) {
              console.error(`Error fetching images for product ${product.id}:`, error);
              return {
                ...product,
                images: [],
                primaryImage: null
              };
            }
          })
        );
        
        setProducts(productsWithImages);
      } catch (error) {
        console.error('Error fetching products:', error);
        // Fallback to static data if API fails
        setProducts(staticProducts);
      } finally {
        setProductsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Load events and promotions from database
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setEventsLoading(true);
        const response = await fetch('/api/events');
        if (response.ok) {
          const eventsData = await response.json();
          setEvents(eventsData);
        } else {
          console.error('Failed to fetch events');
          setEvents([]);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
        setEvents([]);
      } finally {
        setEventsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Load slideshow images from database
  useEffect(() => {
    const fetchSlideshow = async () => {
      try {
        setSlideshowLoading(true);
        const response = await fetch('/api/slideshow-images');
        if (response.ok) {
          const slideshowData = await response.json();
          setSlideshow(slideshowData);
        } else {
          console.error('Failed to fetch slideshow images');
          setSlideshow([]);
        }
      } catch (error) {
        console.error('Error fetching slideshow images:', error);
        setSlideshow([]);
      } finally {
        setSlideshowLoading(false);
      }
    };

    fetchSlideshow();
  }, []);

  // Load testimonials from database
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        setTestimonialsLoading(true);
        const response = await fetch('/api/testimonials');
        if (response.ok) {
          const testimonialsData = await response.json();
          setTestimonials(testimonialsData);
        } else {
          console.error('Failed to fetch testimonials');
          setTestimonials([]);
        }
      } catch (error) {
        console.error('Error fetching testimonials:', error);
        setTestimonials([]);
      } finally {
        setTestimonialsLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  // Load FAQs from database
  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        setFaqsLoading(true);
        const response = await fetch('/api/faqs');
        if (response.ok) {
          const faqsData = await response.json();
          setFaqs(faqsData);
        } else {
          console.error('Failed to fetch FAQs');
          setFaqs([]);
        }
      } catch (error) {
        console.error('Error fetching FAQs:', error);
        setFaqs([]);
      } finally {
        setFaqsLoading(false);
      }
    };

    fetchFAQs();
  }, []);

  // Fallback static products data (for when API is not available)
  const staticProducts = [
    {
      id: 'static-1',
      name: 'WOUND-CARE GAUZE BIG',
      description: 'Large honey-based povidone iodine dressing for advanced wound healing',
      category: 'Gauze & Dressings',
      images: [],
      primaryImage: null
    },
    {
      id: 'static-2',
      name: 'WOUND-CARE GAUZE SMALL',
      description: 'Small honey-based povidone iodine dressing for precise wound care',
      category: 'Gauze & Dressings',
      images: [],
      primaryImage: null
    },
    {
      id: 'static-3',
      name: 'HERA WOUND GEL BIG LARGE',
      description: 'Large advanced wound healing gel for extensive tissue regeneration',
      category: 'Wound Gels',
      images: [],
      primaryImage: null
    },
    {
      id: 'static-4',
      name: 'HERA WOUND GEL SMALL',
      description: 'Small wound healing gel for targeted wound care',
      category: 'Wound Gels',
      images: [],
      primaryImage: null
    },
    {
      id: 'static-5',
      name: 'WOUNDCLEX 500MLS',
      description: 'Professional wound cleaning solution in 500ml volume',
      category: 'Cleaning Solutions',
      images: [],
      primaryImage: null
    },
    {
      id: 'static-6',
      name: 'COBAN BANDAGE 6INCH',
      description: '6-inch self-adherent elastic bandages for secure wound wrapping',
      category: 'Bandages',
      images: [],
      primaryImage: null
    },
    {
      id: 'static-7',
      name: 'COBAN BANDAGE 4INCH',
      description: '4-inch self-adherent elastic bandages for precise wound care',
      category: 'Bandages',
      images: [],
      primaryImage: null
    },
    {
      id: 'static-8',
      name: 'SILICONE SHEET',
      description: 'Medical-grade silicone sheets for scar reduction and prevention',
      category: 'Specialty Products',
      images: [],
      primaryImage: null
    },
    {
      id: 'static-9',
      name: 'STERILE DRESSING PACK',
      description: 'Complete sterile dressing packages for professional care',
      category: 'Complete Kits',
      images: [],
      primaryImage: null
    },
    {
      id: 'static-10',
      name: 'COMPLETE DRESSING KIT',
      description: 'Comprehensive kit with dressing bag, woundclex, hera gel, stopain spray, sterile pack, gauze, and plaster',
      category: 'Complete Kits',
      images: [],
      primaryImage: null
    }
  ];

  const features = [
    {
      icon: <ShoppingCart size={40} />,
      title: 'Easy Ordering',
      description: 'Simple and intuitive order placement process with real-time inventory.'
    },
    {
      icon: <Clock size={40} />,
      title: '24/7 Support',
      description: 'Round-the-clock customer support to assist with your wound care needs.'
    },
    {
      icon: <Shield size={40} />,
      title: 'Quality Assured',
      description: 'All products meet highest medical standards and quality certifications.'
    },
    {
      icon: <Truck size={40} />,
      title: 'Fast Delivery',
      description: 'Multiple delivery options including same-day and next-day delivery.'
    }
  ];

  const stats = [
    { number: '10,000+', label: 'Products Delivered' },
    { number: '500+', label: 'Healthcare Partners' },
    { number: '99.9%', label: 'Uptime Reliability' },
    { number: '24/7', label: 'Customer Support' }
  ];

  const services = [
    'WOUND-CARE GAUZE (Big & Small)',
    'HERA WOUND GEL (Large & Small)',
    'WOUNDCLEX 500MLS Cleaning Solution',
    'COBAN BANDAGES (4-inch & 6-inch)',
    'SILICONE SHEETS & FOOT PADS',
    'STERILE DRESSING PACKS',
    'COMPLETE DRESSING KITS',
    'NPWT-VAC PACKS',
    'HERATEX TULLE DRESSING'
  ];

  return (
    <div className="home-page">
      {/* Events Banner */}
      <EventsBanner />
      
      {/* Main Layout with Sidebars */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: windowWidth > 1200 ? '250px 1fr 250px' : '1fr',
        gap: '1rem',
        minHeight: '100vh',
        position: 'relative'
      }}>
        {/* Left Sidebar - Events (Hidden on mobile) */}
        {windowWidth > 1200 && (
          <div style={{
            position: 'sticky',
            top: '0',
            height: 'fit-content',
            padding: '1rem 0'
          }}>
            <EventsSidebar 
              events={events.filter(event => event.event_type === 'event')} 
              loading={eventsLoading}
              title="Upcoming Events"
            />
          </div>
        )}

        {/* Main Content */}
        <div className="main-content">
          {/* Mobile Events & Promotions Section */}
          {windowWidth <= 1200 && (events.length > 0) && (
            <section style={{ 
              padding: '2rem 0', 
              backgroundColor: '#f8f9fa',
              borderBottom: '1px solid #e9ecef'
            }}>
              <div className="container">
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: windowWidth > 768 ? '1fr 1fr' : '1fr',
                  gap: '1.5rem',
                  maxWidth: '1200px',
                  margin: '0 auto'
                }}>
                  {/* Mobile Events */}
                  {events.filter(event => event.event_type === 'event').length > 0 && (
                    <EventsSidebar 
                      events={events.filter(event => event.event_type === 'event')} 
                      loading={eventsLoading}
                      title="Upcoming Events"
                    />
                  )}
                  
                  {/* Mobile Promotions */}
                  {events.filter(event => event.event_type === 'promotion').length > 0 && (
                    <EventsSidebar 
                      events={events.filter(event => event.event_type === 'promotion')} 
                      loading={eventsLoading}
                      title="Current Promotions"
                    />
                  )}
                </div>
              </div>
            </section>
          )}

          {/* Hero Section */}
          <section 
            style={{
              background: 'linear-gradient(135deg, var(--primary-navy) 0%, var(--light-navy) 100%)',
              color: 'var(--pure-white)',
              padding: '4rem 0',
              textAlign: 'center'
            }}
          >
        <div className="container">
          <div className="fade-in">
            {/* Company Brand with Logo */}
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              marginBottom: '2rem' 
            }}>
              <Logo logoOnly={true} size={120} style={{ marginBottom: '1rem' }} />
              <h1 style={{ 
                fontSize: '3.5rem', 
                fontWeight: 'bold', 
                marginBottom: '0.5rem',
                lineHeight: 1.1,
                color: 'var(--pure-white)',
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'center',
                gap: '0.3rem',
                flexWrap: 'wrap'
              }}>
                <span style={{ fontFamily: 'Mistral, cursive' }}>
                  <span style={{ textTransform: 'uppercase' }}>B</span>
                  <span style={{ textTransform: 'lowercase' }}>onne</span>
                </span>
                <span style={{ fontFamily: 'Georgia, serif' }}>SANTE</span>
                <span style={{ fontFamily: 'Georgia, serif' }}>MEDICALS</span>
              </h1>
              <p style={{ 
                fontSize: '1.1rem', 
                fontWeight: '500',
                color: 'rgba(255,255,255,0.9)',
                marginBottom: '0.5rem'
              }}>
                Your Trusted Partner in Professional Wound Care Solutions
              </p>
            </div>
            
            <h2 style={{ 
              fontSize: '2.5rem', 
              fontWeight: 'bold', 
              marginBottom: '1.5rem',
              lineHeight: 1.2,
              color: 'var(--golden-yellow)',
              textShadow: '1px 1px 3px rgba(0,0,0,0.3)',
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'center',
              gap: '0.3rem',
              flexWrap: 'wrap'
            }}>
              <span style={{ fontFamily: 'Georgia, serif' }}>Advanced Medical Supply Solutions</span>
            </h2>
            <p style={{ 
              fontSize: '1.25rem', 
              marginBottom: '2rem',
              maxWidth: '600px',
              margin: '0 auto 2rem'
            }}>
              Access high-quality wound care products with fast delivery, 
              expert support, and seamless online ordering.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/order" className="btn btn-secondary" style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>
                Place Order Now
                <ArrowRight size={20} />
              </Link>
              <Link to="/customer-dashboard" className="btn btn-outline" style={{ 
                fontSize: '1.1rem', 
                padding: '1rem 2rem',
                borderColor: 'var(--pure-white)',
                color: 'var(--pure-white)'
              }}>
                View My Orders
              </Link>
              <Link to="/register" className="btn btn-outline" style={{ 
                fontSize: '1.1rem', 
                padding: '1rem 2rem',
                borderColor: 'var(--golden-yellow)',
                color: 'var(--golden-yellow)',
                backgroundColor: 'rgba(255, 215, 0, 0.1)'
              }}>
                <Users size={20} style={{ marginRight: '0.5rem' }} />
                Join Our Team
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Company Information Section */}
      <section style={{ padding: '3rem 0', backgroundColor: 'var(--pure-white)', borderBottom: '1px solid #e5e7eb' }}>
        <div className="container">
          <div className="text-center">
            <h2 style={{ 
              fontSize: '2rem', 
              fontWeight: 'bold', 
              marginBottom: '2rem',
              color: 'var(--primary-green)'
            }}>
              About Bonnesante Medicals
            </h2>
            <div className="grid grid-3" style={{ gap: '2rem', alignItems: 'flex-start' }}>
              {/* Contact Information */}
              <div className="card" style={{ padding: '1.5rem', textAlign: 'left' }}>
                <h3 style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: 'bold', 
                  marginBottom: '1rem',
                  color: 'var(--primary-green)'
                }}>
                  Contact Information
                </h3>
                <div style={{ fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--light-green)' }}>
                  <p><strong>Email:</strong> astrobsm@gmail.com</p>
                  <p><strong>Phone:</strong></p>
                  <ul style={{ listStyle: 'none', padding: 0, margin: '0.5rem 0' }}>
                    <li>+234 902 872 4839</li>
                    <li>+234 702 575 5406</li>
                    <li>+234 707 679 3866</li>
                    <li>+234 909 253 4292</li>
                  </ul>
                </div>
              </div>

              {/* Address */}
              <div className="card" style={{ padding: '1.5rem', textAlign: 'left' }}>
                <h3 style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: 'bold', 
                  marginBottom: '1rem',
                  color: 'var(--primary-green)'
                }}>
                  Our Location
                </h3>
                <div style={{ fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--light-green)' }}>
                  <p>
                    <strong>Address:</strong><br />
                    No 6B Peace Avenue/17A Isuofia Street<br />
                    Federal Housing Estate<br />
                    Trans Ekulu, Enugu<br />
                    Nigeria
                  </p>
                </div>
              </div>

              {/* Mission */}
              <div className="card" style={{ padding: '1.5rem', textAlign: 'left' }}>
                <h3 style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: 'bold', 
                  marginBottom: '1rem',
                  color: 'var(--primary-green)'
                }}>
                  Our Mission
                </h3>
                <div style={{ fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--light-green)' }}>
                  <p>
                    Providing healthcare professionals and patients with premium wound care solutions, 
                    ensuring optimal healing outcomes through innovative medical products and 
                    exceptional customer service.
                  </p>
                </div>
              </div>
            </div>

            {/* Regional Distributors Section */}
            <div style={{ marginTop: '3rem' }}>
              <h3 style={{ 
                fontSize: '2rem', 
                fontWeight: 'bold', 
                marginBottom: '2rem',
                color: 'var(--primary-green)',
                textAlign: 'center'
              }}>
                Regional Distributors
              </h3>
              <div className="grid grid-2" style={{ gap: '1.5rem', maxWidth: '900px', margin: '0 auto' }}>
                {/* Anambra/South-East */}
                <div className="card" style={{ padding: '1.5rem', textAlign: 'left' }}>
                  <h4 style={{ 
                    fontSize: '1.1rem', 
                    fontWeight: 'bold', 
                    marginBottom: '0.75rem',
                    color: 'var(--primary-green)'
                  }}>
                    ANAMBRA / SOUTH-EAST
                  </h4>
                  <div style={{ fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--light-green)' }}>
                    <p><strong>Distributor:</strong> FABIAN</p>
                    <p><strong>Phone:</strong> +234 803 609 4136</p>
                    <p style={{ fontSize: '0.8rem', fontStyle: 'italic', margin: '0.5rem 0 0' }}>
                      Serving Anambra State and South-Eastern Nigeria
                    </p>
                  </div>
                </div>

                {/* Lagos/South-West */}
                <div className="card" style={{ padding: '1.5rem', textAlign: 'left' }}>
                  <h4 style={{ 
                    fontSize: '1.1rem', 
                    fontWeight: 'bold', 
                    marginBottom: '0.75rem',
                    color: 'var(--primary-green)'
                  }}>
                    LAGOS STATE / SOUTH-WEST
                  </h4>
                  <div style={{ fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--light-green)' }}>
                    <p><strong>Distributor:</strong> IKECHUKWU</p>
                    <p><strong>Phone:</strong> +234 803 732 5194</p>
                    <p style={{ fontSize: '0.8rem', fontStyle: 'italic', margin: '0.5rem 0 0' }}>
                      Serving Lagos State and South-Western Nigeria
                    </p>
                  </div>
                </div>

                {/* Abuja/North */}
                <div className="card" style={{ padding: '1.5rem', textAlign: 'left' }}>
                  <h4 style={{ 
                    fontSize: '1.1rem', 
                    fontWeight: 'bold', 
                    marginBottom: '0.75rem',
                    color: 'var(--primary-green)'
                  }}>
                    ABUJA (N-CENTRAL/N-E/N-W)
                  </h4>
                  <div style={{ fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--light-green)' }}>
                    <p><strong>Distributor:</strong> ANIAGBOSO DAVIDSON</p>
                    <p><strong>Phone:</strong> +234 805 850 1919</p>
                    <p style={{ fontSize: '0.8rem', fontStyle: 'italic', margin: '0.5rem 0 0' }}>
                      Serving FCT Abuja and Northern Nigeria
                    </p>
                  </div>
                </div>

                {/* Warri/South-South */}
                <div className="card" style={{ padding: '1.5rem', textAlign: 'left' }}>
                  <h4 style={{ 
                    fontSize: '1.1rem', 
                    fontWeight: 'bold', 
                    marginBottom: '0.75rem',
                    color: 'var(--primary-green)'
                  }}>
                    WARRI / SOUTH-SOUTH
                  </h4>
                  <div style={{ fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--light-green)' }}>
                    <p><strong>Distributor:</strong> DOUGLAS ONYEMA</p>
                    <p><strong>Phone:</strong> +234 802 135 2164</p>
                    <p style={{ fontSize: '0.8rem', fontStyle: 'italic', margin: '0.5rem 0 0' }}>
                      Serving Delta State and South-Southern Nigeria
                    </p>
                  </div>
                </div>

                {/* Nsukka/Enugu */}
                <div className="card" style={{ padding: '1.5rem', textAlign: 'left', gridColumn: 'span 2' }}>
                  <h4 style={{ 
                    fontSize: '1.1rem', 
                    fontWeight: 'bold', 
                    marginBottom: '0.75rem',
                    color: 'var(--primary-green)'
                  }}>
                    NSUKKA ENUGU STATE
                  </h4>
                  <div style={{ fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--light-green)' }}>
                    <p><strong>Distributor:</strong> CHIKWENDU CHINONSO</p>
                    <p><strong>Phone:</strong> +234 806 710 4155</p>
                    <p style={{ fontSize: '0.8rem', fontStyle: 'italic', margin: '0.5rem 0 0' }}>
                      Serving Nsukka, Enugu State and surrounding areas
                    </p>
                  </div>
                </div>
              </div>

              <div style={{ 
                textAlign: 'center', 
                marginTop: '2rem', 
                padding: '1rem',
                backgroundColor: 'var(--light-yellow)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--golden-yellow)'
              }}>
                <p style={{ 
                  fontSize: '0.9rem', 
                  color: 'var(--primary-green)', 
                  margin: 0,
                  fontWeight: '500'
                }}>
                  <strong>📞 Contact your nearest regional distributor for faster delivery and local support</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '4rem 0', backgroundColor: 'var(--off-white)' }}>
        <div className="container">
          <div className="text-center mb-xl">
            <h2 style={{ 
              fontSize: '2.5rem', 
              fontWeight: 'bold', 
              marginBottom: '1rem',
              color: 'var(--primary-green)'
            }}>
              Why Choose Astro-BSM Portal?
            </h2>
            <p style={{ 
              fontSize: '1.1rem', 
              color: 'var(--light-green)',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              We provide comprehensive wound care solutions with industry-leading 
              technology and customer service.
            </p>
          </div>

          <div className="grid grid-2" style={{ gap: '2rem' }}>
            {features.map((feature, index) => (
              <div key={index} className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                <div style={{ 
                  color: 'var(--primary-green)', 
                  marginBottom: '1rem',
                  display: 'flex',
                  justifyContent: 'center'
                }}>
                  {feature.icon}
                </div>
                <h3 style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: 'bold', 
                  marginBottom: '1rem',
                  color: 'var(--primary-green)'
                }}>
                  {feature.title}
                </h3>
                <p style={{ 
                  fontSize: '1rem', 
                  color: 'var(--light-green)',
                  lineHeight: 1.6
                }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{ 
        padding: '3rem 0',
        backgroundColor: 'var(--primary-green)',
        color: 'var(--pure-white)'
      }}>
        <div className="container">
          <div className="grid grid-2" style={{ textAlign: 'center' }}>
            {stats.map((stat, index) => (
              <div key={index} style={{ padding: '1rem' }}>
                <h3 style={{ 
                  fontSize: '3rem', 
                  fontWeight: 'bold', 
                  marginBottom: '0.5rem',
                  color: 'var(--golden-yellow)'
                }}>
                  {stat.number}
                </h3>
                <p style={{ 
                  fontSize: '1.1rem', 
                  fontWeight: '500'
                }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section style={{ padding: '4rem 0' }}>
        <div className="container">
          <div className="grid grid-2" style={{ alignItems: 'center', gap: '3rem' }}>
            <div>
              <h2 style={{ 
                fontSize: '2.5rem', 
                fontWeight: 'bold', 
                marginBottom: '1.5rem',
                color: 'var(--primary-green)'
              }}>
                Comprehensive Product Range
              </h2>
              <p style={{ 
                fontSize: '1.1rem', 
                color: 'var(--light-green)',
                marginBottom: '2rem',
                lineHeight: 1.6
              }}>
                From basic wound dressings to advanced care systems, we offer everything 
                healthcare professionals need for effective wound management.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {services.map((service, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <CheckCircle size={20} style={{ color: 'var(--accent-navy)' }} />
                    <span style={{ fontSize: '1rem', color: 'var(--primary-green)' }}>
                      {service}
                    </span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '2rem' }}>
                <Link to="/order" className="btn btn-primary" style={{ fontSize: '1.1rem' }}>
                  Browse Products
                  <ArrowRight size={20} />
                </Link>
              </div>
            </div>
            <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
              <div style={{ 
                width: '80px', 
                height: '80px', 
                backgroundColor: 'var(--accent-navy)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
                color: 'var(--pure-white)'
              }}>
                <Award size={40} />
              </div>
              <h3 style={{ 
                fontSize: '1.5rem', 
                fontWeight: 'bold', 
                marginBottom: '1rem',
                color: 'var(--primary-green)'
              }}>
                Certified Quality
              </h3>
              <p style={{ 
                fontSize: '1rem', 
                color: 'var(--light-green)',
                lineHeight: 1.6
              }}>
                All our products are certified by regulatory authorities and meet 
                international quality standards for medical devices.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Products Showcase Section */}
      <section style={{ padding: '4rem 0', backgroundColor: 'var(--off-white)' }}>
        <div className="container">
          <div className="text-center mb-xl">
            <h2 style={{ 
              fontSize: '2.5rem', 
              fontWeight: 'bold', 
              marginBottom: '1rem',
              color: 'var(--primary-green)'
            }}>
              Our Comprehensive Product Range
            </h2>
            <p style={{ 
              fontSize: '1.1rem', 
              color: 'var(--light-green)',
              maxWidth: '800px',
              margin: '0 auto'
            }}>
              Professional-grade wound care products trusted by healthcare providers worldwide
            </p>
          </div>

          <div className="product-grid">
            {productsLoading ? (
              // Loading state
              Array.from({ length: 6 }).map((_, index) => (
                <div key={`loading-${index}`} className="card product-card" style={{ 
                  padding: '2rem',
                  backgroundColor: '#f8f9fa'
                }}>
                  <div style={{
                    width: '100%',
                    height: '180px',
                    backgroundColor: '#e9ecef',
                    borderRadius: '8px',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Package size={40} style={{ color: '#adb5bd' }} />
                  </div>
                  <div style={{
                    height: '20px',
                    backgroundColor: '#e9ecef',
                    borderRadius: '4px',
                    marginBottom: '1rem'
                  }}></div>
                  <div style={{
                    height: '60px',
                    backgroundColor: '#e9ecef',
                    borderRadius: '4px',
                    marginBottom: '1rem'
                  }}></div>
                </div>
              ))
            ) : (
              products.map((product, index) => (
                <div key={product.id || index} className="card product-card" style={{ 
                  padding: '2rem',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  {/* Product Image */}
                  <div style={{
                    width: '100%',
                    height: '200px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    marginBottom: '1.5rem',
                    backgroundColor: '#f8f9fa',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid #e9ecef'
                  }}>
                    {product.primaryImage ? (
                      <img
                        src={product.primaryImage.image_url}
                        alt={product.primaryImage.alt_text || product.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div style={{
                      display: product.primaryImage ? 'none' : 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#6c757d',
                      textAlign: 'center',
                      padding: '1rem'
                    }}>
                      <Package size={48} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                      <span style={{ fontSize: '0.875rem', opacity: 0.7 }}>No Image Available</span>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h3 className="product-name" style={{ 
                      fontSize: '1.25rem', 
                      marginBottom: '1rem',
                      color: 'var(--primary-green)',
                      fontWeight: 'bold'
                    }}>
                      {product.name}
                    </h3>
                    
                    {/* Category Badge */}
                    {product.category && (
                      <div style={{
                        backgroundColor: 'var(--accent-green)',
                        color: 'white',
                        fontSize: '0.75rem',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '12px',
                        alignSelf: 'flex-start',
                        marginBottom: '1rem',
                        fontWeight: '500'
                      }}>
                        {product.category}
                      </div>
                    )}
                    
                    <p style={{ 
                      fontSize: '0.95rem', 
                      color: 'var(--light-green)',
                      marginBottom: '1.5rem',
                      lineHeight: 1.5,
                      flex: 1
                    }}>
                      {product.description}
                    </p>

                    {/* Features or Stock Status */}
                    <div style={{ marginBottom: '1.5rem' }}>
                      {product.features ? (
                        // Display features if available (from static data)
                        product.features.map((feature, featureIndex) => (
                          <div key={featureIndex} className="product-feature" style={{ 
                            marginBottom: '0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}>
                            <CheckCircle size={14} style={{ color: 'var(--accent-green)' }} />
                            <span style={{ 
                              fontSize: '0.9rem', 
                              color: 'var(--primary-green)' 
                            }}>
                              {feature}
                            </span>
                          </div>
                        ))
                      ) : (
                        // Display stock status for database products
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          fontSize: '0.9rem',
                          color: product.in_stock ? 'var(--accent-green)' : 'var(--error-red)',
                          fontWeight: '500'
                        }}>
                          <div style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: product.in_stock ? 'var(--accent-green)' : 'var(--error-red)'
                          }}></div>
                          {product.in_stock ? 'In Stock' : 'Out of Stock'}
                        </div>
                      )}
                    </div>

                    {/* Additional Images Count */}
                    {product.images && product.images.length > 1 && (
                      <div style={{
                        fontSize: '0.8rem',
                        color: 'var(--light-green)',
                        marginBottom: '1rem',
                        fontStyle: 'italic'
                      }}>
                        +{product.images.length - 1} more image{product.images.length > 2 ? 's' : ''}
                      </div>
                    )}
                    
                    <Link to="/order" className="btn btn-outline" style={{ 
                      width: '100%',
                      fontSize: '0.9rem',
                      borderColor: 'var(--primary-green)',
                      color: 'var(--primary-green)',
                      marginTop: 'auto'
                    }}>
                      Order Now
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>

          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <Link to="/order" className="btn btn-primary" style={{ 
              fontSize: '1.1rem',
              padding: '1rem 2rem'
            }}>
              View All Products
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Product Slideshow Section */}
      <section style={{ padding: '4rem 0', backgroundColor: '#f8f9fa' }}>
        <div className="container">
          <div className="text-center mb-xl">
            <h2 style={{ 
              fontSize: '2.5rem', 
              fontWeight: 'bold', 
              marginBottom: '1rem',
              color: 'var(--primary-navy)'
            }}>
              Our Products in Action
            </h2>
            <p style={{ 
              fontSize: '1.1rem', 
              color: 'var(--light-navy)',
              maxWidth: '800px',
              margin: '0 auto'
            }}>
              See our advanced wound care solutions making a difference in real healthcare settings
            </p>
          </div>

          <ProductSlideshow images={slideshow} loading={slideshowLoading} />
        </div>
      </section>

      {/* Testimonials Section */}
      <section style={{ padding: '4rem 0', backgroundColor: 'var(--off-white)' }}>
        <div className="container">
          <div className="text-center mb-xl">
            <h2 style={{ 
              fontSize: '2.5rem', 
              fontWeight: 'bold', 
              marginBottom: '1rem',
              color: 'var(--primary-navy)'
            }}>
              What Our Patients Say
            </h2>
            <p style={{ 
              fontSize: '1.1rem', 
              color: 'var(--light-navy)',
              maxWidth: '800px',
              margin: '0 auto'
            }}>
              Real experiences from healthcare professionals and patients who trust our products
            </p>
          </div>

          <TestimonialsSlideshow testimonials={testimonials} loading={testimonialsLoading} />
        </div>
      </section>

      {/* FAQ Section */}
      <section style={{ padding: '4rem 0', backgroundColor: 'white' }}>
        <div className="container">
          <div className="text-center mb-xl">
            <h2 style={{ 
              fontSize: '2.5rem', 
              fontWeight: 'bold', 
              marginBottom: '1rem',
              color: 'var(--primary-navy)'
            }}>
              Frequently Asked Questions
            </h2>
            <p style={{ 
              fontSize: '1.1rem', 
              color: 'var(--light-navy)',
              maxWidth: '800px',
              margin: '0 auto'
            }}>
              Find answers to common questions about our wound care products and services
            </p>
          </div>

          <FAQSection faqs={faqs} loading={faqsLoading} />
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ 
        padding: '4rem 0',
        backgroundColor: 'var(--golden-yellow)',
        textAlign: 'center'
      }}>
        <div className="container">
          <h2 style={{ 
            fontSize: '2.5rem', 
            fontWeight: 'bold', 
            marginBottom: '1rem',
            color: 'var(--primary-green)'
          }}>
            Ready to Get Started?
          </h2>
          <p style={{ 
            fontSize: '1.1rem', 
            color: 'var(--primary-green)',
            marginBottom: '2rem',
            maxWidth: '500px',
            margin: '0 auto 2rem'
          }}>
            Join thousands of healthcare professionals who trust Astro-BSM Portal 
            for their wound care needs.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/order" className="btn btn-primary" style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>
              Place Your First Order
              <ShoppingCart size={20} />
            </Link>
            <Link to="/admin-dashboard" className="btn btn-outline" style={{ 
              fontSize: '1.1rem', 
              padding: '1rem 2rem',
              borderColor: 'var(--primary-green)',
              color: 'var(--primary-green)'
            }}>
              Admin Access
              <Users size={20} />
            </Link>
          </div>
        </div>
      </section>
        </div>

        {/* Right Sidebar - Promotions (Hidden on mobile) */}
        {windowWidth > 1200 && (
          <div style={{
            position: 'sticky',
            top: '0',
            height: 'fit-content',
            padding: '1rem 0'
          }}>
            <EventsSidebar 
              events={events.filter(event => event.event_type === 'promotion')} 
              loading={eventsLoading}
              title="Current Promotions"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
