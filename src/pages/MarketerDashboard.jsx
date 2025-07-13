import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Phone, 
  Mail, 
  Calendar, 
  TrendingUp,
  Target,
  MessageCircle,
  LogOut,
  Plus,
  Edit,
  Eye,
  CheckCircle,
  Clock
} from 'lucide-react';
import { toast } from 'react-toastify';
import Logo from '../components/Logo';

const MarketerDashboard = () => {
  const [user, setUser] = useState(null);
  const [activities, setActivities] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [interactions, setInteractions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('activities');
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showInteractionModal, setShowInteractionModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      setUser(JSON.parse(userData));
      loadData();
    }
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('userToken');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const [activitiesRes, customersRes, interactionsRes] = await Promise.all([
        fetch('/api/activities', { headers }),
        fetch('/api/customers', { headers }),
        fetch('/api/interactions', { headers })
      ]);

      if (activitiesRes.ok) {
        const activitiesData = await activitiesRes.json();
        setActivities(activitiesData);
      }

      if (customersRes.ok) {
        const customersData = await customersRes.json();
        setCustomers(customersData);
      }

      if (interactionsRes.ok) {
        const interactionsData = await interactionsRes.json();
        setInteractions(interactionsData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    window.location.href = '/user-login';
  };

  const handleActivitySave = async (activityData) => {
    try {
      const token = localStorage.getItem('userToken');
      const url = editingActivity ? `/api/activities/${editingActivity.id}` : '/api/activities';
      const method = editingActivity ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(activityData)
      });

      if (response.ok) {
        toast.success(`Activity ${editingActivity ? 'updated' : 'created'} successfully`);
        setShowActivityModal(false);
        setEditingActivity(null);
        loadData();
      } else {
        throw new Error('Failed to save activity');
      }
    } catch (error) {
      console.error('Error saving activity:', error);
      toast.error('Failed to save activity');
    }
  };

  const handleInteractionSave = async (interactionData) => {
    try {
      const token = localStorage.getItem('userToken');
      
      const response = await fetch('/api/interactions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...interactionData,
          customerId: selectedCustomer.id
        })
      });

      if (response.ok) {
        toast.success('Interaction logged successfully');
        setShowInteractionModal(false);
        setSelectedCustomer(null);
        loadData();
      } else {
        throw new Error('Failed to log interaction');
      }
    } catch (error) {
      console.error('Error logging interaction:', error);
      toast.error('Failed to log interaction');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'planned': 'bg-blue-100 text-blue-800',
      'in_progress': 'bg-yellow-100 text-yellow-800',
      'completed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      'low': 'bg-green-100 text-green-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'high': 'bg-orange-100 text-orange-800',
      'urgent': 'bg-red-100 text-red-800'
    };
    
    return badges[priority] || 'bg-gray-100 text-gray-800';
  };

  const getOutcomeBadge = (outcome) => {
    const badges = {
      'successful': 'bg-green-100 text-green-800',
      'interested': 'bg-blue-100 text-blue-800',
      'no_response': 'bg-gray-100 text-gray-800',
      'not_interested': 'bg-red-100 text-red-800',
      'callback_requested': 'bg-yellow-100 text-yellow-800'
    };
    
    return badges[outcome] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="flex flex-center" style={{ minHeight: '80vh' }}>
        <div className="text-center">
          <div className="spinner" style={{ width: '40px', height: '40px', marginBottom: '1rem' }}></div>
          <h2>Loading Marketer Dashboard...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="marketer-dashboard" style={{ minHeight: '80vh', padding: '2rem 0' }}>
      <div className="container">
        {/* Header */}
        <div className="flex flex-between mb-xl">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Logo logoOnly={true} size={60} />
            <div>
              <h1 style={{ fontSize: '2.5rem', color: 'var(--primary-navy)', marginBottom: '0.5rem' }}>
                Marketer Dashboard
              </h1>
              <p style={{ color: 'var(--light-navy)', fontSize: '1.1rem' }}>
                Welcome back, {user?.firstName} {user?.lastName}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="btn btn-outline"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              padding: '0.5rem 1rem'
            }}
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-lg mb-xl">
          <div className="card text-center">
            <Users size={32} style={{ color: 'var(--primary-green)', margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
              {customers.length}
            </h3>
            <p>Total Customers</p>
          </div>
          <div className="card text-center">
            <MessageCircle size={32} style={{ color: 'var(--accent-green)', margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
              {interactions.length}
            </h3>
            <p>Interactions Logged</p>
          </div>
          <div className="card text-center">
            <Target size={32} style={{ color: 'var(--primary-green)', margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
              {activities.filter(a => a.activity_type.includes('marketing')).length}
            </h3>
            <p>Marketing Activities</p>
          </div>
          <div className="card text-center">
            <Clock size={32} style={{ color: 'var(--golden-yellow)', margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
              {activities.filter(a => a.status === 'planned').length}
            </h3>
            <p>Planned Activities</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-lg">
          <div className="flex" style={{ gap: '1rem', borderBottom: '2px solid #e5e7eb' }}>
            {[
              { id: 'activities', label: 'My Activities', icon: Calendar },
              { id: 'customers', label: 'Customer Management', icon: Users },
              { id: 'interactions', label: 'Interaction History', icon: MessageCircle }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium ${
                    activeTab === tab.id
                      ? 'border-primary-green text-primary-green'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        {activeTab === 'activities' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Marketing Activities</h2>
              <button
                onClick={() => setShowActivityModal(true)}
                className="btn btn-primary"
              >
                <Plus size={16} className="mr-2" />
                Add Activity
              </button>
            </div>

            {activities.length === 0 ? (
              <div className="card text-center py-8">
                <Calendar size={48} style={{ color: 'var(--light-navy)', margin: '0 auto 1rem' }} />
                <p style={{ color: 'var(--light-navy)' }}>No activities logged yet</p>
              </div>
            ) : (
              activities.map(activity => (
                <div key={activity.id} className="card">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold">{activity.title}</h3>
                    <div className="flex gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityBadge(activity.priority)}`}>
                        {activity.priority.toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(activity.status)}`}>
                        {activity.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-2">{activity.description}</p>
                  
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      Type: {activity.activity_type.replace('_', ' ')}
                      {activity.due_date && (
                        <span className="ml-4">
                          Due: {new Date(activity.due_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setEditingActivity(activity);
                        setShowActivityModal(true);
                      }}
                      className="btn btn-outline btn-sm"
                    >
                      <Edit size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'customers' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Customer Management</h2>
            {customers.length === 0 ? (
              <div className="card text-center py-8">
                <Users size={48} style={{ color: 'var(--light-navy)', margin: '0 auto 1rem' }} />
                <p style={{ color: 'var(--light-navy)' }}>No customers found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {customers.map(customer => (
                  <div key={customer.id} className="card">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold">{customer.name}</h3>
                      <button
                        onClick={() => {
                          setSelectedCustomer(customer);
                          setShowInteractionModal(true);
                        }}
                        className="btn btn-outline btn-sm"
                      >
                        <Plus size={14} className="mr-1" />
                        Log
                      </button>
                    </div>
                    
                    <div className="space-y-1 text-sm text-gray-600">
                      {customer.email && (
                        <div className="flex items-center gap-2">
                          <Mail size={14} />
                          {customer.email}
                        </div>
                      )}
                      {customer.phone && (
                        <div className="flex items-center gap-2">
                          <Phone size={14} />
                          {customer.phone}
                        </div>
                      )}
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Interactions: {interactions.filter(i => i.customer_id === customer.id).length}</span>
                        <span>Member since: {new Date(customer.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'interactions' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Interaction History</h2>
            {interactions.length === 0 ? (
              <div className="card text-center py-8">
                <MessageCircle size={48} style={{ color: 'var(--light-navy)', margin: '0 auto 1rem' }} />
                <p style={{ color: 'var(--light-navy)' }}>No interactions logged yet</p>
              </div>
            ) : (
              interactions.map(interaction => (
                <div key={interaction.id} className="card">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold">{interaction.subject || interaction.interaction_type}</h3>
                      <p className="text-sm text-gray-600">
                        Customer: {customers.find(c => c.id === interaction.customer_id)?.name || 'Unknown'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {interaction.interaction_type.replace('_', ' ').toUpperCase()}
                      </span>
                      {interaction.outcome && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getOutcomeBadge(interaction.outcome)}`}>
                          {interaction.outcome.replace('_', ' ').toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {interaction.description && (
                    <p className="text-gray-600 mb-2">{interaction.description}</p>
                  )}
                  
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>{new Date(interaction.created_at).toLocaleDateString()}</span>
                    {interaction.follow_up_required && (
                      <span className="text-orange-600 font-medium">
                        Follow-up required
                        {interaction.follow_up_date && ` by ${new Date(interaction.follow_up_date).toLocaleDateString()}`}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Activity Modal */}
        {showActivityModal && (
          <ActivityModal
            activity={editingActivity}
            onSave={handleActivitySave}
            onClose={() => {
              setShowActivityModal(false);
              setEditingActivity(null);
            }}
          />
        )}

        {/* Interaction Modal */}
        {showInteractionModal && (
          <InteractionModal
            customer={selectedCustomer}
            onSave={handleInteractionSave}
            onClose={() => {
              setShowInteractionModal(false);
              setSelectedCustomer(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

// Activity Modal Component
const ActivityModal = ({ activity, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    activityType: activity?.activity_type || 'marketing_campaign',
    title: activity?.title || '',
    description: activity?.description || '',
    priority: activity?.priority || 'medium',
    dueDate: activity?.due_date || '',
    status: activity?.status || 'planned',
    notes: activity?.notes || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">
          {activity ? 'Edit Activity' : 'Add New Activity'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Activity Type
            </label>
            <select
              value={formData.activityType}
              onChange={(e) => setFormData({...formData, activityType: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            >
              <option value="marketing_campaign">Marketing Campaign</option>
              <option value="customer_call">Customer Call</option>
              <option value="email_campaign">Email Campaign</option>
              <option value="social_media">Social Media</option>
              <option value="event_planning">Event Planning</option>
              <option value="lead_generation">Lead Generation</option>
              <option value="content_creation">Content Creation</option>
              <option value="market_research">Market Research</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows="3"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="planned">Planned</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Due Date
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              {activity ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Interaction Modal Component
const InteractionModal = ({ customer, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    interactionType: 'call',
    subject: '',
    description: '',
    outcome: '',
    followUpRequired: false,
    followUpDate: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">
          Log Interaction with {customer?.name}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Interaction Type
            </label>
            <select
              value={formData.interactionType}
              onChange={(e) => setFormData({...formData, interactionType: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            >
              <option value="call">Phone Call</option>
              <option value="email">Email</option>
              <option value="visit">In-Person Visit</option>
              <option value="demo">Product Demo</option>
              <option value="follow_up">Follow-up</option>
              <option value="meeting">Meeting</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({...formData, subject: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Brief subject of interaction"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows="3"
              placeholder="Details of the interaction"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Outcome
            </label>
            <select
              value={formData.outcome}
              onChange={(e) => setFormData({...formData, outcome: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Select outcome</option>
              <option value="successful">Successful</option>
              <option value="interested">Customer Interested</option>
              <option value="no_response">No Response</option>
              <option value="not_interested">Not Interested</option>
              <option value="callback_requested">Callback Requested</option>
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="followUpRequired"
              checked={formData.followUpRequired}
              onChange={(e) => setFormData({...formData, followUpRequired: e.target.checked})}
              className="mr-2"
            />
            <label htmlFor="followUpRequired" className="text-sm font-medium text-gray-700">
              Follow-up required
            </label>
          </div>

          {formData.followUpRequired && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Follow-up Date
              </label>
              <input
                type="date"
                value={formData.followUpDate}
                onChange={(e) => setFormData({...formData, followUpDate: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              Log Interaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MarketerDashboard;
