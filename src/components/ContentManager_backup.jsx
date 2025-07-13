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
      const response = await fetch(`/api/events/${eventId}`, { method: 'DELETE' });
      if (response.ok) {
        toast.success('Event deleted!');
        loadEvents();
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    }
  };

  const CountdownTimer = ({ endDate }) => {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
      const timer = setInterval(() => {
        const now = new Date().getTime();
        const eventDate = new Date(endDate).getTime();
        const distance = eventDate - now;

        if (distance > 0) {
          const days = Math.floor(distance / (1000 * 60 * 60 * 24));
          const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((distance % (1000 * 60)) / 1000);

          setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
        } else {
          setTimeLeft('Event ended');
        }
      }, 1000);

      return () => clearInterval(timer);
    }, [endDate]);

    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.5rem',
        fontSize: '0.875rem',
        color: 'var(--golden-yellow)',
        fontWeight: 'bold'
      }}>
        <Clock size={16} />
        {timeLeft}
      </div>
    );
  };

  const EventForm = ({ event, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
      title: event?.title || '',
      description: event?.description || '',
      event_type: event?.event_type || 'promotion',
      start_date: event?.start_date ? new Date(event.start_date).toISOString().slice(0, 16) : '',
      end_date: event?.end_date ? new Date(event.end_date).toISOString().slice(0, 16) : '',
      banner_text: event?.banner_text || '',
      action_text: event?.action_text || '',
      action_url: event?.action_url || '',
      banner_image_url: event?.banner_image_url || '',
      is_active: event?.is_active ?? true,
      display_order: event?.display_order || 0
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      onSave(formData);
    };

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem'
      }}>
        <div 
          className="card"
          style={{
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            padding: '2rem'
          }}
        >
          <div className="flex flex-between" style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: 'var(--primary-green)', margin: 0 }}>
              {event ? 'Edit Event' : 'Create New Event'}
            </h3>
            <button onClick={onCancel} className="btn btn-outline" style={{ padding: '0.5rem' }}>
              <X size={16} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Event Title *</label>
              <input
                type="text"
                className="form-input"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-input"
                rows="3"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid grid-2" style={{ gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Event Type</label>
                <select
                  className="form-select"
                  value={formData.event_type}
                  onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
                >
                  <option value="promotion">Promotion</option>
                  <option value="announcement">Announcement</option>
                  <option value="training">Training</option>
                  <option value="webinar">Webinar</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Display Order</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid grid-2" style={{ gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Start Date *</label>
                <input
                  type="datetime-local"
                  className="form-input"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">End Date</label>
                <input
                  type="datetime-local"
                  className="form-input"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Banner Text</label>
              <input
                type="text"
                className="form-input"
                value={formData.banner_text}
                onChange={(e) => setFormData({ ...formData, banner_text: e.target.value })}
                placeholder="e.g., 🎉 SPECIAL OFFER - 30% OFF! 🎉"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Banner Image URL</label>
              <input
                type="url"
                className="form-input"
                value={formData.banner_image_url}
                onChange={(e) => setFormData({ ...formData, banner_image_url: e.target.value })}
                placeholder="https://example.com/banner-image.jpg"
              />
            </div>

            <div className="grid grid-2" style={{ gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Action Text</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.action_text}
                  onChange={(e) => setFormData({ ...formData, action_text: e.target.value })}
                  placeholder="e.g., Shop Now"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Action URL</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.action_url}
                  onChange={(e) => setFormData({ ...formData, action_url: e.target.value })}
                  placeholder="e.g., /order"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
                Active Event
              </label>
            </div>

            <div className="flex" style={{ gap: '1rem', marginTop: '2rem' }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                <Save size={16} />
                {event ? 'Update Event' : 'Create Event'}
              </button>
              <button type="button" onClick={onCancel} className="btn btn-outline" style={{ flex: 1 }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const ProductImageManager = ({ product }) => {
    const [images, setImages] = useState([]);
    const [newImageUrl, setNewImageUrl] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadMethod, setUploadMethod] = useState('url'); // 'url' or 'file'

    useEffect(() => {
      loadProductImages();
    }, [product.id]);

    const loadProductImages = async () => {
      try {
        const response = await fetch(`/api/products/${product.id}/images`);
        const data = await response.json();
        setImages(data);
      } catch (error) {
        console.error('Error loading product images:', error);
      }
    };

    const handleFileSelect = (e) => {
      const file = e.target.files[0];
      if (file) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast.error('Please select an image file');
          return;
        }
        
        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
          toast.error('Image file size must be less than 5MB');
          return;
        }
        
        setSelectedFile(file);
      }
    };

    const handleFileUpload = async () => {
      if (!selectedFile) return;

      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append('image', selectedFile);
        formData.append('alt_text', `${product.name} image`);
        formData.append('is_primary', images.length === 0);
        formData.append('display_order', images.length);
        formData.append('product_name', product.name);

        // Get admin token (you might need to adjust this based on your auth implementation)
        const adminToken = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
        
        const response = await fetch(`/api/products/${product.id}/upload-image`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${adminToken}`
          },
          body: formData
        });

        if (response.ok) {
          const result = await response.json();
          toast.success('Image uploaded successfully!');
          setSelectedFile(null);
          // Reset file input
          const fileInput = document.querySelector(`#file-input-${product.id}`);
          if (fileInput) fileInput.value = '';
          loadProductImages();
        } else {
          const error = await response.json();
          toast.error(error.error || 'Failed to upload image');
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        toast.error('Failed to upload image');
      } finally {
        setIsUploading(false);
      }
    };

    const handleAddImageUrl = async () => {
      if (!newImageUrl.trim()) return;

      setIsUploading(true);
      try {
        const adminToken = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
        
        const response = await fetch(`/api/products/${product.id}/images`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`
          },
          body: JSON.stringify({
            image_url: newImageUrl,
            alt_text: `${product.name} image`,
            is_primary: images.length === 0,
            display_order: images.length
          })
        });

        if (response.ok) {
          toast.success('Image added successfully!');
          setNewImageUrl('');
          loadProductImages();
        } else {
          const error = await response.json();
          toast.error(error.error || 'Failed to add image');
        }
      } catch (error) {
        console.error('Error adding image:', error);
        toast.error('Failed to add image');
      } finally {
        setIsUploading(false);
      }
    };

    const handleDeleteImage = async (imageId) => {
      if (!window.confirm('Are you sure you want to delete this image?')) return;

      try {
        const adminToken = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
        
        const response = await fetch(`/api/products/images/${imageId}`, { 
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${adminToken}`
          }
        });
        
        if (response.ok) {
          toast.success('Image deleted!');
          loadProductImages();
        } else {
          const error = await response.json();
          toast.error(error.error || 'Failed to delete image');
        }
      } catch (error) {
        console.error('Error deleting image:', error);
        toast.error('Failed to delete image');
      }
    };

    return (
      <div style={{ marginTop: '1rem' }}>
        <h5 style={{ color: 'var(--primary-green)', marginBottom: '1rem' }}>Product Images</h5>
        
        {/* Upload Method Selector */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="radio"
                name={`upload-method-${product.id}`}
                value="file"
                checked={uploadMethod === 'file'}
                onChange={(e) => setUploadMethod(e.target.value)}
              />
              <Upload size={16} />
              Upload from Device
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="radio"
                name={`upload-method-${product.id}`}
                value="url"
                checked={uploadMethod === 'url'}
                onChange={(e) => setUploadMethod(e.target.value)}
              />
              <Image size={16} />
              Add by URL
            </label>
          </div>
        </div>

        {/* File Upload Section */}
        {uploadMethod === 'file' && (
          <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '2px dashed #dee2e6' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor={`file-input-${product.id}`} style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--primary-green)' }}>
                Select Image File (Max 5MB)
              </label>
              <input
                id={`file-input-${product.id}`}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                style={{ 
                  padding: '0.5rem',
                  border: '1px solid #ced4da',
                  borderRadius: '4px',
                  backgroundColor: 'white'
                }}
              />
              {selectedFile && (
                <div style={{ fontSize: '0.875rem', color: 'var(--light-green)' }}>
                  Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </div>
              )}
              <button
                onClick={handleFileUpload}
                className="btn btn-primary"
                disabled={!selectedFile || isUploading}
                style={{ alignSelf: 'flex-start' }}
              >
                {isUploading ? (
                  <>
                    <div className="spinner" style={{ width: '16px', height: '16px' }}></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={16} />
                    Upload Image
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* URL Input Section */}
        {uploadMethod === 'url' && (
          <div className="flex" style={{ gap: '0.5rem', marginBottom: '1rem' }}>
            <input
              type="url"
              className="form-input"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              placeholder="Enter image URL"
              style={{ flex: 1 }}
            />
            <button
              onClick={handleAddImageUrl}
              className="btn btn-primary"
              disabled={isUploading || !newImageUrl.trim()}
            >
              {isUploading ? <div className="spinner" style={{ width: '16px', height: '16px' }}></div> : <Plus size={16} />}
              Add
            </button>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '1rem' }}>
          {images.map((image) => (
            <div key={image.id} className="card" style={{ padding: '0.5rem', position: 'relative' }}>
              <img
                src={image.image_url}
                alt={image.alt_text}
                style={{
                  width: '100%',
                  height: '80px',
                  objectFit: 'cover',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: '0.5rem'
                }}
                onError={(e) => {
                  e.target.src = '/images/placeholder-product.jpg';
                }}
              />
              {image.is_primary && (
                <div style={{
                  position: 'absolute',
                  top: '0.25rem',
                  left: '0.25rem',
                  backgroundColor: 'var(--golden-yellow)',
                  color: 'var(--primary-green)',
                  fontSize: '0.6rem',
                  padding: '0.1rem 0.3rem',
                  borderRadius: '0.2rem',
                  fontWeight: 'bold'
                }}>
                  PRIMARY
                </div>
              )}
              <button
                onClick={() => handleDeleteImage(image.id)}
                style={{
                  position: 'absolute',
                  top: '0.25rem',
                  right: '0.25rem',
                  backgroundColor: 'var(--error-red)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
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
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                      {event.end_date && new Date(event.end_date) > new Date() && (
                        <CountdownTimer endDate={event.end_date} />
                      )}
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

                  {event.banner_text && (
                    <div style={{
                      backgroundColor: 'var(--golden-yellow)',
                      color: 'var(--primary-green)',
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-md)',
                      fontWeight: 'bold',
                      textAlign: 'center',
                      marginTop: '1rem'
                    }}>
                      {event.banner_text}
                    </div>
                  )}
                </div>
              ))}

              {events.length === 0 && (
                <div className="card text-center" style={{ padding: '3rem' }}>
                  <Calendar size={64} style={{ color: 'var(--light-green)', margin: '0 auto 1rem' }} />
                  <h4 style={{ color: 'var(--light-green)', marginBottom: '0.5rem' }}>
                    No events created yet
                  </h4>
                  <p style={{ color: 'var(--light-green)', marginBottom: '1rem' }}>
                    Create your first event or promotion to get started
                  </p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="btn btn-primary"
                  >
                    <Plus size={16} />
                    Create First Event
                  </button>
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

                  <ProductImageManager product={product} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Homepage Slideshow Tab */}
        {activeTab === 'slideshow' && !isLoading && (
          <div>
            <div className="flex flex-between" style={{ marginBottom: '2rem' }}>
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
            <div className="flex flex-between" style={{ marginBottom: '2rem' }}>
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
            <div className="flex flex-between" style={{ marginBottom: '2rem' }}>
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

        {/* Content Blocks Tab */}
        {activeTab === 'content' && !isLoading && (
          <div>
            <div className="flex flex-between" style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: 'var(--primary-green)' }}>Content Blocks</h3>
              <button className="btn btn-primary">
                <Plus size={16} />
                Add Content Block
              </button>
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
                    <div className="flex" style={{ gap: '0.5rem' }}>
                      <button className="btn btn-outline" style={{ padding: '0.5rem' }}>
                        <Edit size={14} />
                      </button>
                      <button
                        className="btn btn-outline"
                        style={{ padding: '0.5rem', color: 'var(--error-red)', borderColor: 'var(--error-red)' }}
                      >
                        <Trash2 size={14} />
                      </button>
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

        {/* Homepage Slideshow Tab */}
        {activeTab === 'slideshow' && !isLoading && (
          <div>
            <div className="flex flex-between" style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: 'var(--primary-green)' }}>Homepage Slideshow</h3>
              <button
                onClick={() => setShowForm(true)}
                className="btn btn-primary"
              >
                <Plus size={16} />
                Add Slideshow Image
              </button>
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
                      onError={(e) => {
                        e.target.src = '/images/placeholder-product.jpg';
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div className="flex flex-between" style={{ marginBottom: '0.5rem' }}>
                        <h4 style={{ color: 'var(--primary-green)', margin: 0 }}>
                          {slide.title}
                        </h4>
                        <div className="flex" style={{ gap: '0.5rem' }}>
                          <button
                            onClick={() => {
                              setEditingItem(slide);
                              setShowForm(true);
                            }}
                            className="btn btn-outline"
                            style={{ padding: '0.5rem' }}
                          ></button>
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteSlideshow(slide.id)}
                            className="btn btn-outline"
                            style={{ padding: '0.5rem', color: 'var(--error-red)', borderColor: 'var(--error-red)' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <p style={{ color: 'var(--light-green)', margin: '0.5rem 0', fontSize: '0.875rem' }}>
                        {slide.description}
                      </p>
                      <div style={{ fontSize: '0.8rem', color: 'var(--light-green)' }}>
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
                <div className="card text-center" style={{ padding: '3rem' }}></div>
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
            <div className="flex flex-between" style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: 'var(--primary-green)' }}>Patient Testimonials</h3>
              <button
                onClick={() => setShowForm(true)}
                className="btn btn-primary"
              >
                <Plus size={16} />
                Add Testimonial
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="card" style={{ padding: '1.5rem' }}></div>
                  <div className="flex flex-between" style={{ marginBottom: '1rem' }}>
                    <div>
                      <h4 style={{ color: 'var(--primary-green)', margin: 0 }}>
                        {testimonial.patient_name}
                      </h4>
                      <p style={{ color: 'var(--light-green)', margin: '0.25rem 0', fontSize: '0.9rem', fontStyle: 'italic' }}>
                        {testimonial.patient_title}
                      </p>
                    </div>
                    <div className="flex" style={{ gap: '0.5rem' }}>
                      <span style={{ color: 'var(--golden-yellow)', fontSize: '1.2rem' }}>
                        {'★'.repeat(testimonial.rating)}{'☆'.repeat(5 - testimonial.rating)}
                      </span>
                      <button
                        onClick={() => {
                          setEditingItem(testimonial);
                          setShowForm(true);
                        }}
                        className="btn btn-outline"
                        style={{ padding: '0.5rem' }}
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteTestimonial(testimonial.id)}
                        className="btn btn-outline"
                        style={{ padding: '0.5rem', color: 'var(--error-red)', borderColor: 'var(--error-red)' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
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
            <div className="flex flex-between" style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: 'var(--primary-green)' }}>Frequently Asked Questions</h3>
              <button
                onClick={() => setShowForm(true)}
                className="btn btn-primary"
              >
                <Plus size={16} />
                Add FAQ
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {faqs.map((faq) => (
                <div key={faq.id} className="card" style={{ padding: '1.5rem' }}>
                  <div className="flex flex-between" style={{ marginBottom: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ color: 'var(--primary-green)', margin: 0, marginBottom: '0.5rem' }}>
                        {faq.question}
                      </h4>
                      <p style={{ color: 'var(--light-green)', margin: 0, fontSize: '0.9rem' }}>
                        {faq.answer}
                      </p>
                    </div>
                    <div className="flex" style={{ gap: '0.5rem' }}>
                      <button
                        onClick={() => {
                          setEditingItem(faq);
                          setShowForm(true);
                        }}
                        className="btn btn-outline"
                        style={{ padding: '0.5rem' }}
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteFAQ(faq.id)}
                        className="btn btn-outline"
                        style={{ padding: '0.5rem', color: 'var(--error-red)', borderColor: 'var(--error-red)' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
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

        {/* Event Form Modal */}
        {showForm && (
          <EventForm
            event={editingItem}
            onSave={handleSaveEvent}
            onCancel={() => {
              setShowForm(false);
              setEditingItem(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ContentManager;
