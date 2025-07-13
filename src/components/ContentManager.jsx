import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  Image, 
  Video, 
  Calendar, 
  Edit, 
  Trash2, 
  Plus, 
  Save, 
  X, 
  Clock, 
  Eye, 
  EyeOff,
  ChevronDown,
  ChevronUp,
  Copy
} from 'lucide-react';
import { toast } from 'react-toastify';
import { format, formatDistanceToNow } from 'date-fns';
import { apiService } from '../services/apiService';

const ContentManager = () => {
  const [activeTab, setActiveTab] = useState('events');
  const [events, setEvents] = useState([]);
  const [products, setProducts] = useState([]);
  const [contentBlocks, setContentBlocks] = useState([]);
  const [slideshow, setSlideshow] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      switch (activeTab) {
        case 'events':
          await loadEvents();
          break;
        case 'products':
          await loadProducts();
          break;
        case 'content':
          await loadContentBlocks();
          break;
        case 'slideshow':
          await loadSlideshow();
          break;
        case 'testimonials':
          await loadTestimonials();
          break;
        case 'faqs':
          await loadFAQs();
          break;
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadEvents = async () => {
    const data = await apiService.events.getAll();
    setEvents(data);
  };

  const loadProducts = async () => {
    const data = await apiService.products.getAll();
    setProducts(data);
  };

  const loadContentBlocks = async () => {
    const data = await apiService.contentBlocks.getAll();
    setContentBlocks(data);
  };

  const loadSlideshow = async () => {
    try {
      const response = await fetch('/api/slideshow-images');
      if (response.ok) {
        const data = await response.json();
        setSlideshow(data);
      }
    } catch (error) {
      console.error('Error loading slideshow:', error);
      toast.error('Failed to load slideshow images');
    }
  };

  const loadTestimonials = async () => {
    try {
      const response = await fetch('/api/testimonials');
      if (response.ok) {
        const data = await response.json();
        setTestimonials(data);
      }
    } catch (error) {
      console.error('Error loading testimonials:', error);
      toast.error('Failed to load testimonials');
    }
  };

  const loadFAQs = async () => {
    try {
      const response = await fetch('/api/faqs');
      if (response.ok) {
        const data = await response.json();
        setFaqs(data);
      }
    } catch (error) {
      console.error('Error loading FAQs:', error);
      toast.error('Failed to load FAQs');
    }
  };

  const handleSaveEvent = async (eventData) => {
    try {
      const method = editingItem ? 'PUT' : 'POST';
      const url = editingItem ? `/api/events/${editingItem.id}` : '/api/events';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData)
      });

      if (response.ok) {
        toast.success(editingItem ? 'Event updated!' : 'Event created!');
        setEditingItem(null);
        setShowForm(false);
        loadEvents();
      } else {
        throw new Error('Failed to save event');
      }
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error('Failed to save event');
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;

    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Event deleted!');
        loadEvents();
      } else {
        throw new Error('Failed to delete event');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    }
  };

  return (
    <div className="content-manager" style={{ padding: '2rem 0' }}>
      <div className="container">
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ color: 'var(--primary-green)', marginBottom: '0.5rem' }}>
            Content Management
          </h1>
          <p style={{ color: 'var(--light-green)' }}>
            Manage events, product images, videos, and website content
          </p>
        </div>

        {/* Tabs */}
        <div className="flex" style={{ gap: '1rem', marginBottom: '2rem', borderBottom: '2px solid #e5e7eb' }}>
          {[
            { id: 'events', label: 'Events & Promotions', icon: <Calendar size={16} /> },
            { id: 'products', label: 'Product Media', icon: <Image size={16} /> },
            { id: 'slideshow', label: 'Homepage Slideshow', icon: <Upload size={16} /> },
            { id: 'testimonials', label: 'Patient Testimonials', icon: <Edit size={16} /> },
            { id: 'faqs', label: 'FAQs', icon: <Edit size={16} /> },
            { id: 'content', label: 'Content Blocks', icon: <Edit size={16} /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`btn ${activeTab === tab.id ? 'btn-primary' : 'btn-outline'}`}
              style={{ borderRadius: '0', borderBottom: 'none' }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {isLoading && (
          <div className="text-center" style={{ padding: '2rem' }}>
            <div className="spinner"></div>
            <p style={{ marginTop: '1rem', color: 'var(--light-green)' }}>Loading...</p>
          </div>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && !isLoading && (
          <div>
            <div className="flex flex-between" style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: 'var(--primary-green)' }}>Events & Promotions</h3>
              <button
                onClick={() => setShowForm(true)}
                className="btn btn-primary"
              >
                <Plus size={16} />
                Create Event
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {events.map((event) => (
                <div key={event.id} className="card" style={{ padding: '1.5rem' }}>
                  <div className="flex flex-between" style={{ marginBottom: '1rem' }}>
                    <div>
                      <div className="flex" style={{ alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                        <h4 style={{ color: 'var(--primary-green)', margin: 0 }}>
                          {event.title}
                        </h4>
                        <span className={`status-badge status-${event.event_type}`}>
                          {event.event_type}
                        </span>
                        {!event.is_active && (
                          <span className="status-badge status-cancelled">
                            <EyeOff size={12} />
                            Inactive
                          </span>
                        )}
                      </div>
                      <p style={{ color: 'var(--light-green)', margin: '0.5rem 0', fontSize: '0.875rem' }}>
                        {event.description}
                      </p>
                      <div style={{ fontSize: '0.8rem', color: 'var(--light-green)' }}>
                        <p style={{ margin: '0.25rem 0' }}>
                          <strong>Start:</strong> {format(new Date(event.start_date), 'PPp')}
                        </p>
                        {event.end_date && (
                          <p style={{ margin: '0.25rem 0' }}>
                            <strong>End:</strong> {format(new Date(event.end_date), 'PPp')}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex" style={{ gap: '0.5rem' }}>
                      <button
                        onClick={() => {
                          setEditingItem(event);
                          setShowForm(true);
                        }}
                        className="btn btn-outline"
                        style={{ padding: '0.5rem' }}
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        className="btn btn-outline"
                        style={{ padding: '0.5rem', color: 'var(--error-red)', borderColor: 'var(--error-red)' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {events.length === 0 && (
                <div className="card text-center" style={{ padding: '3rem' }}>
                  <Calendar size={64} style={{ color: 'var(--light-green)', margin: '0 auto 1rem' }} />
                  <h4 style={{ color: 'var(--light-green)', marginBottom: '0.5rem' }}>
                    No events found
                  </h4>
                  <p style={{ color: 'var(--light-green)' }}>
                    Create events and promotions to engage your audience
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Homepage Slideshow Tab */}
        {activeTab === 'slideshow' && !isLoading && (
          <div>
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: 'var(--primary-green)' }}>Homepage Slideshow</h3>
              <p style={{ color: 'var(--light-green)' }}>
                Manage images for the product slideshow on your homepage
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {slideshow.map((slide) => (
                <div key={slide.id} className="card" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <img
                      src={slide.image_url}
                      alt={slide.alt_text}
                      style={{
                        width: '120px',
                        height: '80px',
                        objectFit: 'cover',
                        borderRadius: 'var(--radius-sm)'
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <h4 style={{ color: 'var(--primary-green)', margin: 0, marginBottom: '0.5rem' }}>
                        {slide.title}
                      </h4>
                      <p style={{ color: 'var(--light-green)', margin: 0, fontSize: '0.9rem' }}>
                        {slide.description}
                      </p>
                      <div style={{ fontSize: '0.8rem', color: 'var(--light-green)', marginTop: '0.5rem' }}>
                        <span>Order: {slide.display_order} | </span>
                        <span className={slide.is_active ? 'text-success' : 'text-muted'}>
                          {slide.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {slideshow.length === 0 && (
                <div className="card text-center" style={{ padding: '3rem' }}>
                  <Image size={64} style={{ color: 'var(--light-green)', margin: '0 auto 1rem' }} />
                  <h4 style={{ color: 'var(--light-green)', marginBottom: '0.5rem' }}>
                    No slideshow images found
                  </h4>
                  <p style={{ color: 'var(--light-green)' }}>
                    Add images to showcase your products on the homepage
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Patient Testimonials Tab */}
        {activeTab === 'testimonials' && !isLoading && (
          <div>
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: 'var(--primary-green)' }}>Patient Testimonials</h3>
              <p style={{ color: 'var(--light-green)' }}>
                Manage patient testimonials and reviews
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="card" style={{ padding: '1.5rem' }}>
                  <div style={{ marginBottom: '1rem' }}>
                    <h4 style={{ color: 'var(--primary-green)', margin: 0 }}>
                      {testimonial.patient_name}
                    </h4>
                    <p style={{ color: 'var(--light-green)', margin: '0.25rem 0', fontSize: '0.9rem', fontStyle: 'italic' }}>
                      {testimonial.patient_title}
                    </p>
                    <span style={{ color: 'var(--golden-yellow)', fontSize: '1.2rem' }}>
                      {'★'.repeat(testimonial.rating)}{'☆'.repeat(5 - testimonial.rating)}
                    </span>
                  </div>
                  <p style={{ color: 'var(--primary-green)', marginBottom: '1rem', fontStyle: 'italic' }}>
                    "{testimonial.testimonial_text}"
                  </p>
                  <div style={{ fontSize: '0.8rem', color: 'var(--light-green)' }}>
                    <span>Product: {testimonial.product_used} | </span>
                    <span>Order: {testimonial.display_order} | </span>
                    <span className={testimonial.is_active ? 'text-success' : 'text-muted'}>
                      {testimonial.is_active ? 'Active' : 'Inactive'}
                    </span>
                    {testimonial.is_featured && (
                      <span style={{ 
                        marginLeft: '0.5rem',
                        backgroundColor: 'var(--golden-yellow)',
                        color: 'var(--primary-green)',
                        padding: '0.1rem 0.3rem',
                        borderRadius: '0.2rem',
                        fontSize: '0.7rem'
                      }}>
                        FEATURED
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {testimonials.length === 0 && (
                <div className="card text-center" style={{ padding: '3rem' }}>
                  <Edit size={64} style={{ color: 'var(--light-green)', margin: '0 auto 1rem' }} />
                  <h4 style={{ color: 'var(--light-green)', marginBottom: '0.5rem' }}>
                    No testimonials found
                  </h4>
                  <p style={{ color: 'var(--light-green)' }}>
                    Add patient testimonials to build trust and credibility
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* FAQs Tab */}
        {activeTab === 'faqs' && !isLoading && (
          <div>
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: 'var(--primary-green)' }}>Frequently Asked Questions</h3>
              <p style={{ color: 'var(--light-green)' }}>
                Manage FAQ content for your customers
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {faqs.map((faq) => (
                <div key={faq.id} className="card" style={{ padding: '1.5rem' }}>
                  <div style={{ marginBottom: '1rem' }}>
                    <h4 style={{ color: 'var(--primary-green)', margin: 0, marginBottom: '0.5rem' }}>
                      {faq.question}
                    </h4>
                    <p style={{ color: 'var(--light-green)', margin: 0, fontSize: '0.9rem' }}>
                      {faq.answer}
                    </p>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--light-green)' }}>
                    {faq.category && (
                      <span style={{ 
                        backgroundColor: 'var(--accent-green)',
                        color: 'white',
                        padding: '0.1rem 0.3rem',
                        borderRadius: '0.2rem',
                        fontSize: '0.7rem',
                        marginRight: '0.5rem'
                      }}>
                        {faq.category}
                      </span>
                    )}
                    <span>Order: {faq.display_order} | </span>
                    <span className={faq.is_active ? 'text-success' : 'text-muted'}>
                      {faq.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              ))}

              {faqs.length === 0 && (
                <div className="card text-center" style={{ padding: '3rem' }}>
                  <Edit size={64} style={{ color: 'var(--light-green)', margin: '0 auto 1rem' }} />
                  <h4 style={{ color: 'var(--light-green)', marginBottom: '0.5rem' }}>
                    No FAQs found
                  </h4>
                  <p style={{ color: 'var(--light-green)' }}>
                    Add frequently asked questions to help your customers
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && !isLoading && (
          <div>
            <h3 style={{ color: 'var(--primary-green)', marginBottom: '2rem' }}>
              Product Media Management
            </h3>
            <p style={{ color: 'var(--light-green)', marginBottom: '2rem' }}>
              Manage product images and media content
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {products.map((product) => (
                <div key={product.id} className="card" style={{ padding: '1.5rem' }}>
                  <div style={{ marginBottom: '1rem' }}>
                    <h4 style={{ color: 'var(--primary-green)', margin: 0 }}>
                      {product.name}
                    </h4>
                    <p style={{ color: 'var(--light-green)', margin: '0.5rem 0', fontSize: '0.875rem' }}>
                      {product.description}
                    </p>
                  </div>
                  <p style={{ color: 'var(--light-green)', fontSize: '0.9rem' }}>
                    Product media management will be implemented here
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Content Blocks Tab */}
        {activeTab === 'content' && !isLoading && (
          <div>
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: 'var(--primary-green)' }}>Content Blocks</h3>
              <p style={{ color: 'var(--light-green)' }}>
                Manage website content blocks and sections
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {contentBlocks.map((block) => (
                <div key={block.id} className="card" style={{ padding: '1.5rem' }}>
                  <div className="flex flex-between">
                    <div>
                      <h4 style={{ color: 'var(--primary-green)', margin: 0 }}>
                        {block.title || `${block.block_type} Block`}
                      </h4>
                      <p style={{ color: 'var(--light-green)', margin: '0.5rem 0', fontSize: '0.875rem' }}>
                        Type: {block.block_type} • Section: {block.page_section}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {contentBlocks.length === 0 && (
                <div className="card text-center" style={{ padding: '3rem' }}>
                  <Edit size={64} style={{ color: 'var(--light-green)', margin: '0 auto 1rem' }} />
                  <h4 style={{ color: 'var(--light-green)', marginBottom: '0.5rem' }}>
                    No content blocks found
                  </h4>
                  <p style={{ color: 'var(--light-green)' }}>
                    Create content blocks to customize your website
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentManager;
