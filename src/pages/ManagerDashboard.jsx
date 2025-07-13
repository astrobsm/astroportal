import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Truck, 
  Users, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  LogOut,
  Plus,
  Edit,
  Calendar,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import { toast } from 'react-toastify';
import Logo from '../components/Logo';

const ManagerDashboard = () => {
  const [user, setUser] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('assignments');
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);

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

      const [assignmentsRes, activitiesRes] = await Promise.all([
        fetch('/api/assignments', { headers }),
        fetch('/api/activities', { headers })
      ]);

      if (assignmentsRes.ok) {
        const assignmentsData = await assignmentsRes.json();
        setAssignments(assignmentsData);
      }

      if (activitiesRes.ok) {
        const activitiesData = await activitiesRes.json();
        setActivities(activitiesData);
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

  const handleAssignmentUpdate = async (assignmentId, status, notes) => {
    try {
      const token = localStorage.getItem('userToken');
      const response = await fetch(`/api/assignments/${assignmentId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status, notes })
      });

      if (response.ok) {
        toast.success(`Assignment ${status} successfully`);
        loadData();
      } else {
        throw new Error('Failed to update assignment');
      }
    } catch (error) {
      console.error('Error updating assignment:', error);
      toast.error('Failed to update assignment');
    }
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

  const getStatusBadge = (status) => {
    const badges = {
      'assigned': 'bg-blue-100 text-blue-800',
      'accepted': 'bg-green-100 text-green-800',
      'in_progress': 'bg-yellow-100 text-yellow-800',
      'completed': 'bg-green-100 text-green-800',
      'declined': 'bg-red-100 text-red-800'
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

  if (isLoading) {
    return (
      <div className="flex flex-center" style={{ minHeight: '80vh' }}>
        <div className="text-center">
          <div className="spinner" style={{ width: '40px', height: '40px', marginBottom: '1rem' }}></div>
          <h2>Loading Manager Dashboard...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="manager-dashboard" style={{ minHeight: '80vh', padding: '2rem 0' }}>
      <div className="container">
        {/* Header */}
        <div className="flex flex-between mb-xl">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Logo logoOnly={true} size={60} />
            <div>
              <h1 style={{ fontSize: '2.5rem', color: 'var(--primary-navy)', marginBottom: '0.5rem' }}>
                Manager Dashboard
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
            <Package size={32} style={{ color: 'var(--primary-green)', margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
              {assignments.filter(a => a.status === 'assigned').length}
            </h3>
            <p>New Assignments</p>
          </div>
          <div className="card text-center">
            <Truck size={32} style={{ color: 'var(--accent-green)', margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
              {assignments.filter(a => a.status === 'in_progress').length}
            </h3>
            <p>In Progress</p>
          </div>
          <div className="card text-center">
            <CheckCircle size={32} style={{ color: 'var(--primary-green)', margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
              {assignments.filter(a => a.status === 'completed').length}
            </h3>
            <p>Completed</p>
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
              { id: 'assignments', label: 'Order Assignments', icon: Package },
              { id: 'activities', label: 'My Activities', icon: Calendar }
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
        {activeTab === 'assignments' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Order Assignments</h2>
            {assignments.length === 0 ? (
              <div className="card text-center py-8">
                <Package size={48} style={{ color: 'var(--light-navy)', margin: '0 auto 1rem' }} />
                <p style={{ color: 'var(--light-navy)' }}>No assignments yet</p>
              </div>
            ) : (
              assignments.map(assignment => (
                <div key={assignment.id} className="card">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">
                        Order #{assignment.order_id}
                      </h3>
                      <p className="text-gray-600">
                        Customer: {assignment.customer_name || 'N/A'}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(assignment.status)}`}>
                      {assignment.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Customer Contact:</p>
                      <div className="space-y-1">
                        {assignment.customer_email && (
                          <div className="flex items-center gap-2 text-sm">
                            <Mail size={14} />
                            {assignment.customer_email}
                          </div>
                        )}
                        {assignment.customer_phone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone size={14} />
                            {assignment.customer_phone}
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Delivery Address:</p>
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin size={14} className="mt-1" />
                        <span>{assignment.customer_address || 'No address provided'}</span>
                      </div>
                    </div>
                  </div>

                  {assignment.notes && (
                    <div className="mb-4 p-3 bg-gray-50 rounded">
                      <p className="text-sm font-medium text-gray-700 mb-1">Notes:</p>
                      <p className="text-sm text-gray-600">{assignment.notes}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {assignment.status === 'assigned' && (
                      <>
                        <button
                          onClick={() => handleAssignmentUpdate(assignment.id, 'accepted', '')}
                          className="btn btn-primary"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => {
                            const notes = prompt('Reason for declining:');
                            if (notes) handleAssignmentUpdate(assignment.id, 'declined', notes);
                          }}
                          className="btn btn-outline"
                        >
                          Decline
                        </button>
                      </>
                    )}
                    {assignment.status === 'accepted' && (
                      <button
                        onClick={() => handleAssignmentUpdate(assignment.id, 'in_progress', '')}
                        className="btn btn-primary"
                      >
                        Start Delivery
                      </button>
                    )}
                    {assignment.status === 'in_progress' && (
                      <button
                        onClick={() => {
                          const notes = prompt('Delivery completion notes:');
                          handleAssignmentUpdate(assignment.id, 'completed', notes || 'Delivered successfully');
                        }}
                        className="btn btn-success"
                      >
                        Mark Complete
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'activities' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">My Activities</h2>
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
      </div>
    </div>
  );
};

// Activity Modal Component
const ActivityModal = ({ activity, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    activityType: activity?.activity_type || 'delivery',
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
              <option value="delivery">Delivery</option>
              <option value="customer_visit">Customer Visit</option>
              <option value="inventory_check">Inventory Check</option>
              <option value="training">Training</option>
              <option value="meeting">Meeting</option>
              <option value="other">Other</option>
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

export default ManagerDashboard;
