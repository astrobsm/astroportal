import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Package, 
  DollarSign, 
  TrendingUp,
  Bell,
  CheckCircle,
  Clock,
  Truck,
  X,
  Search,
  Filter,
  Edit,
  Eye,
  Calendar,
  Plus,
  Trash2,
  Save,
  Phone,
  MapPin,
  Building,
  LogOut
} from 'lucide-react';
import { toast } from 'react-toastify';
import Logo from '../components/Logo';
import AdminLogin from '../components/AdminLogin';
import ContentManager from '../components/ContentManager';
import { 
  orderService, 
  customerService, 
  productService, 
  notificationService 
} from '../services/indexedDB';
import { format } from 'date-fns';

const AdminDashboard = () => {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authToken, setAuthToken] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Product management state
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    category: '',
    inStock: true
  });

  // Contact Information state
  const [contactInfo, setContactInfo] = useState({
    phone: '+234 803 609 4136',
    email: 'info@bonnesantemedicals.com',
    address: 'Medical Plaza, Healthcare District',
    hours: 'Mon-Fri: 8:00 AM - 6:00 PM\nSat: 9:00 AM - 4:00 PM\nSun: Closed'
  });

  // Location state
  const [locationInfo, setLocationInfo] = useState({
    address: 'Medical Plaza, Healthcare District, Nigeria',
    coordinates: '6.5244, 3.3792',
    directions: 'Located in the heart of the medical district, easily accessible by public transport.',
    landmarks: 'Near Central Hospital and Medical College'
  });

  // Distributors state
  const [distributors, setDistributors] = useState([]);
  const [showDistributorModal, setShowDistributorModal] = useState(false);
  const [editingDistributor, setEditingDistributor] = useState(null);
  const [distributorForm, setDistributorForm] = useState({
    name: '',
    region: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    coverageAreas: '',
    specialties: ''
  });

  useEffect(() => {
    // Check authentication on component mount
    const checkAuth = async () => {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setAuthLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/admin/verify', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          setAuthToken(token);
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('adminToken');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('adminToken');
      } finally {
        setAuthLoading(false);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData();
      loadDistributors();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, statusFilter, dateFilter]);

  // Helper function for authenticated API calls
  const fetchWithAuth = async (url, options = {}) => {
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${authToken}`
    };
    
    return fetch(url, {
      ...options,
      headers
    });
  };

  // Authentication handlers
  const handleLogin = (token) => {
    setAuthToken(token);
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('adminToken');
      setAuthToken(null);
      setIsAuthenticated(false);
      setActiveTab('overview');
    }
  };

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [ordersData, customersData, productsData, notificationsData] = await Promise.all([
        orderService.getAllOrders(),
        customerService.getAllCustomers(),
        productService.getAllProducts(),
        notificationService.getAllNotifications()
      ]);

      setOrders(ordersData);
      setCustomers(customersData);
      setProducts(productsData);
      setNotifications(notificationsData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadDistributors = async () => {
    try {
      const response = await fetch('/api/distributors');
      if (response.ok) {
        const distributorsData = await response.json();
        setDistributors(distributorsData);
      }
    } catch (error) {
      console.error('Error loading distributors:', error);
    }
  };

  const filterOrders = () => {
    let filtered = orders;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.id.toString().includes(searchTerm) ||
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Filter by date
    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          filtered = filtered.filter(order => new Date(order.orderDate) >= filterDate);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          filtered = filtered.filter(order => new Date(order.orderDate) >= filterDate);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          filtered = filtered.filter(order => new Date(order.orderDate) >= filterDate);
          break;
      }
    }

    setFilteredOrders(filtered);
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      await loadDashboardData();
      toast.success(`Order status updated to ${newStatus}`);
      
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(notifications.map(notif => 
        notif.id === notificationId ? { ...notif, isRead: true } : notif
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock size={16} style={{ color: 'var(--golden-yellow)' }} />;
      case 'confirmed':
        return <CheckCircle size={16} style={{ color: 'var(--accent-green)' }} />;
      case 'delivered':
        return <Truck size={16} style={{ color: 'var(--primary-green)' }} />;
      case 'cancelled':
        return <X size={16} style={{ color: 'var(--error-red)' }} />;
      default:
        return <Package size={16} />;
    }
  };

  const getOrderStats = () => {
    const totalItems = orders.reduce((total, order) => 
      total + (order.products || []).reduce((sum, product) => sum + product.quantity, 0), 0);
    const pendingOrders = orders.filter(order => order.status === 'pending').length;
    const deliveredOrders = orders.filter(order => order.status === 'delivered').length;
    const todayOrders = orders.filter(order => {
      const today = new Date();
      const orderDate = new Date(order.orderDate);
      return orderDate.toDateString() === today.toDateString();
    }).length;

    return {
      totalItems,
      pendingOrders,
      deliveredOrders,
      todayOrders
    };
  };

  const stats = getOrderStats();

  // Product Management Functions
  const handleCreateProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      description: '',
      category: '',
      inStock: true
    });
    setShowProductModal(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      category: product.category,
      inStock: product.inStock
    });
    setShowProductModal(true);
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productService.deleteProduct(productId);
        setProducts(products.filter(p => p.id !== productId));
        toast.success('Product deleted successfully');
      } catch (error) {
        console.error('Error deleting product:', error);
        toast.error('Failed to delete product');
      }
    }
  };

  const handleSaveProduct = async () => {
    try {
      if (!productForm.name.trim() || !productForm.description.trim() || !productForm.category.trim()) {
        toast.error('Please fill in all required fields');
        return;
      }

      let savedProduct;
      if (editingProduct) {
        // Update existing product
        savedProduct = await productService.updateProduct(editingProduct.id, productForm);
        setProducts(products.map(p => p.id === editingProduct.id ? savedProduct : p));
        toast.success('Product updated successfully');
      } else {
        // Create new product
        savedProduct = await productService.createProduct(productForm);
        setProducts([...products, savedProduct]);
        toast.success('Product created successfully');
      }

      setShowProductModal(false);
      setEditingProduct(null);
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Failed to save product');
    }
  };

  const handleProductFormChange = (field, value) => {
    setProductForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Contact Information handlers
  const handleSaveContactInfo = async () => {
    try {
      // Save to localStorage for now (can be upgraded to API later)
      localStorage.setItem('astro_contact_info', JSON.stringify(contactInfo));
      toast.success('Contact information updated successfully!');
    } catch (error) {
      console.error('Error saving contact info:', error);
      toast.error('Failed to save contact information');
    }
  };

  // Location handlers
  const handleSaveLocationInfo = async () => {
    try {
      // Save to localStorage for now (can be upgraded to API later)
      localStorage.setItem('astro_location_info', JSON.stringify(locationInfo));
      toast.success('Location information updated successfully!');
    } catch (error) {
      console.error('Error saving location info:', error);
      toast.error('Failed to save location information');
    }
  };

  // Distributor handlers
  const handleAddDistributor = () => {
    setEditingDistributor(null);
    setDistributorForm({
      name: '',
      region: '',
      contactPerson: '',
      phone: '',
      email: '',
      address: '',
      coverageAreas: '',
      specialties: ''
    });
    setShowDistributorModal(true);
  };

  const handleEditDistributor = (distributor) => {
    setEditingDistributor(distributor);
    setDistributorForm({
      name: distributor.name || '',
      region: distributor.region || '',
      contactPerson: distributor.contact_person || '',
      phone: distributor.phone || '',
      email: distributor.email || '',
      address: distributor.address || '',
      coverageAreas: distributor.coverage_areas?.join(', ') || '',
      specialties: distributor.specialties?.join(', ') || ''
    });
    setShowDistributorModal(true);
  };

  const handleSaveDistributor = async () => {
    try {
      const distributorData = {
        name: distributorForm.name,
        region: distributorForm.region,
        contact_person: distributorForm.contactPerson,
        phone: distributorForm.phone,
        email: distributorForm.email,
        address: distributorForm.address,
        coverage_areas: distributorForm.coverageAreas.split(',').map(area => area.trim()),
        specialties: distributorForm.specialties.split(',').map(spec => spec.trim())
      };

      let response;
      if (editingDistributor) {
        response = await fetchWithAuth(`/api/distributors/${editingDistributor.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(distributorData)
        });
      } else {
        response = await fetchWithAuth('/api/distributors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(distributorData)
        });
      }

      if (response.ok) {
        toast.success(`Distributor ${editingDistributor ? 'updated' : 'added'} successfully!`);
        setShowDistributorModal(false);
        loadDistributors();
      } else {
        throw new Error('Failed to save distributor');
      }
    } catch (error) {
      console.error('Error saving distributor:', error);
      toast.error('Failed to save distributor');
    }
  };

  const handleDeleteDistributor = async (distributorId) => {
    if (window.confirm('Are you sure you want to delete this distributor?')) {
      try {
        const response = await fetch(`/api/distributors/${distributorId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ is_active: false })
        });

        if (response.ok) {
          toast.success('Distributor deleted successfully!');
          loadDistributors();
        } else {
          throw new Error('Failed to delete distributor');
        }
      } catch (error) {
        console.error('Error deleting distributor:', error);
        toast.error('Failed to delete distributor');
      }
    }
  };

  // Load saved data on component mount
  useEffect(() => {
    const savedContactInfo = localStorage.getItem('astro_contact_info');
    const savedLocationInfo = localStorage.getItem('astro_location_info');
    
    if (savedContactInfo) {
      setContactInfo(JSON.parse(savedContactInfo));
    }
    
    if (savedLocationInfo) {
      setLocationInfo(JSON.parse(savedLocationInfo));
    }
  }, []);

  if (authLoading) {
    return (
      <div className="flex flex-center" style={{ minHeight: '80vh' }}>
        <div className="text-center">
          <div className="spinner" style={{ width: '40px', height: '40px', marginBottom: '1rem' }}></div>
          <h2>Checking authentication...</h2>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  if (isLoading) {
    return (
      <div className="flex flex-center" style={{ minHeight: '80vh' }}>
        <div className="text-center">
          <div className="spinner" style={{ width: '40px', height: '40px', marginBottom: '1rem' }}></div>
          <h2>Loading Admin Dashboard...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard" style={{ minHeight: '80vh', padding: '2rem 0' }}>
      <div className="container">
        <div className="flex flex-between mb-xl">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Logo logoOnly={true} size={60} />
            <div>
              <h1 style={{ fontSize: '2.5rem', color: 'var(--primary-navy)', marginBottom: '0.5rem' }}>
                Admin Dashboard
              </h1>
              <p style={{ color: 'var(--light-navy)', fontSize: '1.1rem' }}>
                Manage orders, customers, and monitor business performance
              </p>
            </div>
          </div>
          <div className="flex" style={{ alignItems: 'center', gap: '1rem' }}>
            <div style={{ position: 'relative' }}>
              <Bell size={24} style={{ color: 'var(--primary-green)' }} />
              {notifications.filter(n => !n.isRead).length > 0 && (
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
                  {notifications.filter(n => !n.isRead).length}
                </span>
              )}
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
        </div>

        {/* Tab Navigation */}
        <div className="mb-lg">
          <div className="flex" style={{ gap: '1rem', borderBottom: '2px solid #e5e7eb' }}>
            {            [
              { id: 'overview', label: 'Overview', icon: <TrendingUp size={16} /> },
              { id: 'orders', label: 'Orders', icon: <Package size={16} /> },
              { id: 'customers', label: 'Customers', icon: <Users size={16} /> },
              { id: 'products', label: 'Products', icon: <Package size={16} /> },
              { id: 'content', label: 'Content Manager', icon: <Edit size={16} /> },
              { id: 'contact', label: 'Contact Info', icon: <Phone size={16} /> },
              { id: 'location', label: 'Our Location', icon: <MapPin size={16} /> },
              { id: 'distributors', label: 'Distributors', icon: <Building size={16} /> },
              { id: 'notifications', label: 'Notifications', icon: <Bell size={16} /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`btn ${activeTab === tab.id ? 'btn-primary' : 'btn-outline'}`}
                style={{
                  borderRadius: '0',
                  borderTop: 'none',
                  borderLeft: 'none', 
                  borderRight: 'none',
                  borderBottom: activeTab === tab.id ? '3px solid var(--golden-yellow)' : 'none',
                  backgroundColor: activeTab === tab.id ? 'transparent' : 'transparent',
                  color: activeTab === tab.id ? 'var(--primary-green)' : 'var(--light-green)'
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="fade-in">
            {/* Stats Cards */}
            <div className="grid grid-2 mb-xl">
              <div className="card text-center" style={{ padding: '2rem' }}>
                <Package size={40} style={{ color: 'var(--accent-green)', margin: '0 auto 1rem' }} />
                <h3 style={{ fontSize: '2.5rem', color: 'var(--accent-green)', marginBottom: '0.5rem' }}>
                  {stats.totalItems}
                </h3>
                <p style={{ color: 'var(--light-green)', margin: 0 }}>Total Items Sold</p>
              </div>
              <div className="card text-center" style={{ padding: '2rem' }}>
                <Package size={40} style={{ color: 'var(--primary-green)', margin: '0 auto 1rem' }} />
                <h3 style={{ fontSize: '2.5rem', color: 'var(--primary-green)', marginBottom: '0.5rem' }}>
                  {orders.length}
                </h3>
                <p style={{ color: 'var(--light-green)', margin: 0 }}>Total Orders</p>
              </div>
              <div className="card text-center" style={{ padding: '2rem' }}>
                <Clock size={40} style={{ color: 'var(--golden-yellow)', margin: '0 auto 1rem' }} />
                <h3 style={{ fontSize: '2.5rem', color: 'var(--golden-yellow)', marginBottom: '0.5rem' }}>
                  {stats.pendingOrders}
                </h3>
                <p style={{ color: 'var(--light-green)', margin: 0 }}>Pending Orders</p>
              </div>
              <div className="card text-center" style={{ padding: '2rem' }}>
                <Users size={40} style={{ color: 'var(--light-green)', margin: '0 auto 1rem' }} />
                <h3 style={{ fontSize: '2.5rem', color: 'var(--light-green)', marginBottom: '0.5rem' }}>
                  {customers.length}
                </h3>
                <p style={{ color: 'var(--light-green)', margin: 0 }}>Total Customers</p>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="card" style={{ padding: '2rem' }}>
              <h3 style={{ color: 'var(--primary-green)', marginBottom: '1rem' }}>
                Recent Orders
              </h3>
              {orders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex flex-between" style={{ 
                  padding: '1rem', 
                  borderBottom: '1px solid #e5e7eb',
                  alignItems: 'center'
                }}>
                  <div>
                    <h5 style={{ marginBottom: '0.25rem' }}>Order #{order.id}</h5>
                    <p style={{ fontSize: '0.875rem', color: 'var(--light-green)', margin: 0 }}>
                      {order.customerName} - {format(new Date(order.orderDate), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <div className="flex" style={{ alignItems: 'center', gap: '1rem' }}>
                    <span className={`status-badge status-${order.status}`}>
                      {getStatusIcon(order.status)}
                      {order.status}
                    </span>
                    <span style={{ fontWeight: 'bold', color: 'var(--primary-green)' }}>
                      {(order.products || []).reduce((total, product) => total + product.quantity, 0)} items
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="fade-in">
            {/* Filters */}
            <div className="card mb-lg" style={{ padding: '1.5rem' }}>
              <div className="grid grid-3" style={{ gap: '1rem', alignItems: 'end' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Search Orders</label>
                  <div style={{ position: 'relative' }}>
                    <Search 
                      size={16} 
                      style={{ 
                        position: 'absolute', 
                        left: '0.75rem', 
                        top: '50%', 
                        transform: 'translateY(-50%)',
                        color: 'var(--light-green)'
                      }} 
                    />
                    <input
                      type="text"
                      className="form-input"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Order ID, customer name or email"
                      style={{ paddingLeft: '2.5rem' }}
                    />
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Date Range</label>
                  <select
                    className="form-select"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">Last 7 Days</option>
                    <option value="month">Last 30 Days</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Orders List */}
            <div>
              <h3 className="mb-lg" style={{ color: 'var(--primary-green)' }}>
                Orders ({filteredOrders.length})
              </h3>
              
              {filteredOrders.length === 0 ? (
                <div className="card text-center" style={{ padding: '3rem' }}>
                  <Package size={64} style={{ color: 'var(--light-green)', margin: '0 auto 1rem' }} />
                  <h4 style={{ color: 'var(--light-green)' }}>No orders found</h4>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {filteredOrders.map((order) => (
                    <div key={order.id} className="card">
                      <div className="flex flex-between" style={{ marginBottom: '1rem' }}>
                        <div>
                          <h4 style={{ color: 'var(--primary-green)', marginBottom: '0.25rem' }}>
                            Order #{order.id}
                          </h4>
                          <p style={{ fontSize: '0.875rem', color: 'var(--light-green)', margin: 0 }}>
                            {order.customerName} ({order.customerEmail})
                          </p>
                          <p style={{ fontSize: '0.875rem', color: 'var(--light-green)', margin: 0 }}>
                            {format(new Date(order.orderDate), 'PPp')}
                          </p>
                        </div>
                        <div className="flex" style={{ alignItems: 'center', gap: '1rem' }}>
                          <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--primary-green)' }}>
                            {(order.products || []).reduce((total, product) => total + product.quantity, 0)} items
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-between" style={{ alignItems: 'center' }}>
                        <div className="flex" style={{ gap: '0.5rem' }}>
                          <span className={`status-badge status-${order.status}`}>
                            {getStatusIcon(order.status)}
                            {order.status}
                          </span>
                          <span className="status-badge status-pending">
                            {order.products.length} items
                          </span>
                        </div>
                        <div className="flex" style={{ gap: '0.5rem' }}>
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                            className="form-select"
                            style={{ fontSize: '0.875rem', padding: '0.25rem 0.5rem' }}
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="btn btn-outline"
                            style={{ fontSize: '0.875rem' }}
                          >
                            <Eye size={14} />
                            View
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Customers Tab */}
        {activeTab === 'customers' && (
          <div className="fade-in">
            <h3 className="mb-lg" style={{ color: 'var(--primary-green)' }}>
              Customers ({customers.length})
            </h3>
            
            <div className="grid grid-2" style={{ gap: '1rem' }}>
              {customers.map((customer) => (
                <div key={customer.id} className="card">
                  <h4 style={{ color: 'var(--primary-green)', marginBottom: '0.5rem' }}>
                    {customer.name}
                  </h4>
                  <p style={{ fontSize: '0.875rem', color: 'var(--light-green)', margin: '0.25rem 0' }}>
                    📧 {customer.email}
                  </p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--light-green)', margin: '0.25rem 0' }}>
                    📞 {customer.phone}
                  </p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--light-green)', margin: '0.25rem 0' }}>
                    📅 Registered: {format(new Date(customer.registrationDate), 'MMM dd, yyyy')}
                  </p>
                  <div style={{ marginTop: '1rem' }}>
                    <span className="status-badge status-confirmed">
                      {orders.filter(order => order.customerId === customer.id).length} orders
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="fade-in">
            <div className="flex flex-between mb-lg">
              <h3 style={{ color: 'var(--primary-green)' }}>
                Product Management ({products.length} products)
              </h3>
              <button
                onClick={handleCreateProduct}
                className="btn btn-primary"
              >
                <Plus size={16} />
                Add New Product
              </button>
            </div>

            {/* Products Grid */}
            <div className="grid grid-2" style={{ gap: '1.5rem' }}>
              {products.map(product => (
                <div key={product.id} className="card">
                  <div className="flex flex-between" style={{ marginBottom: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ 
                        color: 'var(--primary-green)', 
                        marginBottom: '0.5rem',
                        fontSize: '1.25rem'
                      }}>
                        {product.name}
                      </h4>
                      <p style={{ 
                        color: 'var(--light-green)', 
                        marginBottom: '0.75rem',
                        fontSize: '0.9rem',
                        lineHeight: '1.4'
                      }}>
                        {product.description}
                      </p>
                      <div className="flex" style={{ gap: '0.75rem', alignItems: 'center' }}>
                        <span className="status-badge status-confirmed" style={{ fontSize: '0.75rem' }}>
                          {product.category}
                        </span>
                        <span className={`status-badge ${product.inStock ? 'status-confirmed' : 'status-pending'}`} 
                              style={{ fontSize: '0.75rem' }}>
                          {product.inStock ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </div>
                    </div>
                    <div className="flex" style={{ gap: '0.5rem', alignItems: 'flex-start' }}>
                      <button
                        onClick={() => handleEditProduct(product)}
                        className="btn btn-outline"
                        style={{ 
                          padding: '0.5rem',
                          width: '40px',
                          height: '40px',
                          minWidth: 'auto'
                        }}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="btn btn-danger"
                        style={{ 
                          padding: '0.5rem',
                          width: '40px',
                          height: '40px',
                          minWidth: 'auto'
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {products.length === 0 && (
              <div className="card text-center" style={{ padding: '3rem' }}>
                <Package size={64} style={{ color: 'var(--light-green)', margin: '0 auto 1rem' }} />
                <h4 style={{ color: 'var(--light-green)', marginBottom: '0.5rem' }}>
                  No products found
                </h4>
                <p style={{ color: 'var(--light-green)', marginBottom: '1.5rem' }}>
                  Start by adding your first product to the catalog.
                </p>
                <button
                  onClick={handleCreateProduct}
                  className="btn btn-primary"
                >
                  <Plus size={16} />
                  Add Your First Product
                </button>
              </div>
            )}
          </div>
        )}

        {/* Content Manager Tab */}
        {activeTab === 'content' && (
          <div className="fade-in">
            <ContentManager />
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="fade-in">
            <h3 className="mb-lg" style={{ color: 'var(--primary-green)' }}>
              Notifications ({notifications.length})
            </h3>
            
            {notifications.length === 0 ? (
              <div className="card text-center" style={{ padding: '3rem' }}>
                <Bell size={64} style={{ color: 'var(--light-green)', margin: '0 auto 1rem' }} />
                <h4 style={{ color: 'var(--light-green)' }}>No notifications</h4>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {notifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className="card"
                    style={{
                      backgroundColor: notification.isRead ? 'var(--pure-white)' : 'var(--light-yellow)',
                      cursor: 'pointer'
                    }}
                    onClick={() => markNotificationAsRead(notification.id)}
                  >
                    <div className="flex flex-between">
                      <div>
                        <h4 style={{ color: 'var(--primary-green)', marginBottom: '0.5rem' }}>
                          {notification.title}
                        </h4>
                        <p style={{ fontSize: '0.875rem', color: 'var(--light-green)', margin: 0 }}>
                          {notification.message}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right', fontSize: '0.75rem', color: 'var(--light-green)' }}>
                        {format(new Date(notification.createdAt), 'MMM dd, HH:mm')}
                        {!notification.isRead && (
                          <div 
                            style={{
                              width: '8px',
                              height: '8px',
                              backgroundColor: 'var(--error-red)',
                              borderRadius: '50%',
                              marginLeft: 'auto',
                              marginTop: '0.25rem'
                            }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Contact Information Tab */}
        {activeTab === 'contact' && (
          <div className="fade-in">
            <div className="flex flex-between mb-lg">
              <h3 style={{ color: 'var(--primary-green)' }}>Contact Information</h3>
              <button
                onClick={handleSaveContactInfo}
                className="btn btn-primary"
                style={{ marginLeft: 'auto' }}
              >
                <Save size={16} style={{ marginRight: '0.5rem' }} />
                Save Changes
              </button>
            </div>

            <div className="card" style={{ padding: '2rem' }}>
              <div className="grid grid-2 gap-lg">
                <div className="form-group">
                  <label className="form-label">
                    <Phone size={16} style={{ marginRight: '0.5rem' }} />
                    Phone Number
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={contactInfo.phone}
                    onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                    placeholder="Enter phone number"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">
                    <Edit size={16} style={{ marginRight: '0.5rem' }} />
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="form-input"
                    value={contactInfo.email}
                    onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                    placeholder="Enter email address"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <MapPin size={16} style={{ marginRight: '0.5rem' }} />
                  Address
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={contactInfo.address}
                  onChange={(e) => setContactInfo({ ...contactInfo, address: e.target.value })}
                  placeholder="Enter address"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Clock size={16} style={{ marginRight: '0.5rem' }} />
                  Business Hours
                </label>
                <textarea
                  className="form-textarea"
                  value={contactInfo.hours}
                  onChange={(e) => setContactInfo({ ...contactInfo, hours: e.target.value })}
                  placeholder="Enter business hours"
                  rows="4"
                />
              </div>
            </div>
          </div>
        )}

        {/* Location Information Tab */}
        {activeTab === 'location' && (
          <div className="fade-in">
            <div className="flex flex-between mb-lg">
              <h3 style={{ color: 'var(--primary-green)' }}>Our Location</h3>
              <button
                onClick={handleSaveLocationInfo}
                className="btn btn-primary"
                style={{ marginLeft: 'auto' }}
              >
                <Save size={16} style={{ marginRight: '0.5rem' }} />
                Save Changes
              </button>
            </div>

            <div className="card" style={{ padding: '2rem' }}>
              <div className="form-group">
                <label className="form-label">
                  <MapPin size={16} style={{ marginRight: '0.5rem' }} />
                  Full Address
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={locationInfo.address}
                  onChange={(e) => setLocationInfo({ ...locationInfo, address: e.target.value })}
                  placeholder="Enter full address"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Edit size={16} style={{ marginRight: '0.5rem' }} />
                  GPS Coordinates (lat, lng)
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={locationInfo.coordinates}
                  onChange={(e) => setLocationInfo({ ...locationInfo, coordinates: e.target.value })}
                  placeholder="Enter coordinates (e.g., 6.5244, 3.3792)"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Truck size={16} style={{ marginRight: '0.5rem' }} />
                  Directions
                </label>
                <textarea
                  className="form-textarea"
                  value={locationInfo.directions}
                  onChange={(e) => setLocationInfo({ ...locationInfo, directions: e.target.value })}
                  placeholder="Enter directions to your location"
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Eye size={16} style={{ marginRight: '0.5rem' }} />
                  Nearby Landmarks
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={locationInfo.landmarks}
                  onChange={(e) => setLocationInfo({ ...locationInfo, landmarks: e.target.value })}
                  placeholder="Enter nearby landmarks"
                />
              </div>
            </div>
          </div>
        )}

        {/* Regional Distributors Tab */}
        {activeTab === 'distributors' && (
          <div className="fade-in">
            <div className="flex flex-between mb-lg">
              <h3 style={{ color: 'var(--primary-green)' }}>Regional Distributors</h3>
              <button
                onClick={handleAddDistributor}
                className="btn btn-primary"
              >
                <Plus size={16} style={{ marginRight: '0.5rem' }} />
                Add Distributor
              </button>
            </div>

            {distributors.length === 0 ? (
              <div className="card text-center" style={{ padding: '3rem' }}>
                <Building size={64} style={{ color: 'var(--light-green)', margin: '0 auto 1rem' }} />
                <h4 style={{ color: 'var(--light-green)' }}>No distributors found</h4>
                <p style={{ color: 'var(--light-green)', marginBottom: '2rem' }}>
                  Add your first regional distributor to get started.
                </p>
                <button
                  onClick={handleAddDistributor}
                  className="btn btn-primary"
                >
                  <Plus size={16} style={{ marginRight: '0.5rem' }} />
                  Add Your First Distributor
                </button>
              </div>
            ) : (
              <div className="grid gap-lg">
                {distributors.map((distributor) => (
                  <div key={distributor.id} className="card" style={{ padding: '1.5rem' }}>
                    <div className="flex flex-between mb-md">
                      <div>
                        <h4 style={{ color: 'var(--primary-green)', marginBottom: '0.5rem' }}>
                          {distributor.name}
                        </h4>
                        <p style={{ color: 'var(--light-green)', margin: 0, fontSize: '0.875rem' }}>
                          {distributor.region}
                        </p>
                      </div>
                      <div className="flex" style={{ gap: '0.5rem' }}>
                        <button
                          onClick={() => handleEditDistributor(distributor)}
                          className="btn btn-sm btn-outline"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteDistributor(distributor.id)}
                          className="btn btn-sm btn-outline"
                          style={{ color: 'var(--error-red)', borderColor: 'var(--error-red)' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-2 gap-md">
                      <div>
                        <p style={{ fontSize: '0.875rem', margin: '0.25rem 0' }}>
                          <strong>Contact:</strong> {distributor.contact_person || 'N/A'}
                        </p>
                        <p style={{ fontSize: '0.875rem', margin: '0.25rem 0' }}>
                          <strong>Phone:</strong> {distributor.phone || 'N/A'}
                        </p>
                        <p style={{ fontSize: '0.875rem', margin: '0.25rem 0' }}>
                          <strong>Email:</strong> {distributor.email || 'N/A'}
                        </p>
                      </div>
                      <div>
                        {distributor.coverage_areas && distributor.coverage_areas.length > 0 && (
                          <p style={{ fontSize: '0.875rem', margin: '0.25rem 0' }}>
                            <strong>Coverage:</strong> {distributor.coverage_areas.join(', ')}
                          </p>
                        )}
                        {distributor.specialties && distributor.specialties.length > 0 && (
                          <p style={{ fontSize: '0.875rem', margin: '0.25rem 0' }}>
                            <strong>Specialties:</strong> {distributor.specialties.join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Order Details Modal */}
        {selectedOrder && (
          <div 
            style={{
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
            }}
            onClick={() => setSelectedOrder(null)}
          >
            <div 
              className="card"
              style={{
                maxWidth: '700px',
                width: '100%',
                maxHeight: '80vh',
                overflow: 'auto',
                padding: '2rem'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-between" style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ color: 'var(--primary-green)' }}>
                  Order #{selectedOrder.id} Details
                </h3>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="btn btn-outline"
                  style={{ padding: '0.5rem', width: '40px', height: '40px' }}
                >
                  <X size={16} />
                </button>
              </div>

              <div className="grid grid-2" style={{ gap: '2rem' }}>
                <div>
                  <h4 style={{ marginBottom: '1rem', color: 'var(--primary-green)' }}>Customer Information</h4>
                  <p><strong>Name:</strong> {selectedOrder.customerName}</p>
                  <p><strong>Email:</strong> {selectedOrder.customerEmail}</p>
                  <p><strong>Phone:</strong> {selectedOrder.customerPhone}</p>
                  <p><strong>Address:</strong> {selectedOrder.customerAddress}</p>
                </div>
                <div>
                  <h4 style={{ marginBottom: '1rem', color: 'var(--primary-green)' }}>Order Information</h4>
                  <p><strong>Date:</strong> {format(new Date(selectedOrder.orderDate), 'PPp')}</p>
                  <p><strong>Status:</strong> 
                    <span className={`status-badge status-${selectedOrder.status}`} style={{ marginLeft: '0.5rem' }}>
                      {getStatusIcon(selectedOrder.status)}
                      {selectedOrder.status}
                    </span>
                  </p>
                  <p><strong>Delivery:</strong> {selectedOrder.deliveryMethod}</p>
                  <p><strong>Total Items:</strong> {(selectedOrder.products || []).reduce((total, product) => total + product.quantity, 0)}</p>
                </div>
              </div>

              <div style={{ marginTop: '2rem' }}>
                <h4 style={{ marginBottom: '1rem', color: 'var(--primary-green)' }}>Products</h4>
                {selectedOrder.products.map((product, index) => (
                  <div key={index} className="flex flex-between" style={{ 
                    padding: '1rem', 
                    backgroundColor: 'var(--off-white)', 
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '0.5rem'
                  }}>
                    <div>
                      <h5 style={{ marginBottom: '0.25rem' }}>{product.name}</h5>
                      <p style={{ fontSize: '0.875rem', color: 'var(--light-green)', margin: 0 }}>
                        Unit: {product.unit} × {product.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <strong>Qty: {product.quantity}</strong>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                <select
                  value={selectedOrder.status}
                  onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value)}
                  className="form-select"
                  style={{ flex: 1 }}
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <button className="btn btn-primary">
                  <Edit size={16} />
                  Update Status
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Product Management Modal */}
        {showProductModal && (
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '1rem'
            }}
            onClick={() => setShowProductModal(false)}
          >
            <div 
              className="card"
              style={{
                maxWidth: '600px',
                width: '100%',
                padding: '2rem',
                borderRadius: 'var(--radius-lg)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-between" style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ color: 'var(--primary-green)' }}>
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h3>
                <button
                  onClick={() => setShowProductModal(false)}
                  className="btn btn-outline"
                  style={{ padding: '0.5rem', width: '40px', height: '40px' }}
                >
                  <X size={16} />
                </button>
              </div>

              <div>
                <div className="form-group mb-md">
                  <label className="form-label">Product Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    placeholder="Enter product name"
                  />
                </div>
                <div className="form-group mb-md">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-textarea"
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    placeholder="Enter product description"
                    rows="3"
                  />
                </div>
                <div className="grid grid-2 gap-md">
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <input
                      type="text"
                      className="form-input"
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                      placeholder="Enter product category"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">In Stock</label>
                    <select
                      className="form-select"
                      value={productForm.inStock ? 'yes' : 'no'}
                      onChange={(e) => setProductForm({ ...productForm, inStock: e.target.value === 'yes' })}
                    >
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex" style={{ marginTop: '2rem', gap: '1rem' }}>
                <button
                  onClick={() => setShowProductModal(false)}
                  className="btn btn-outline flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProduct}
                  className="btn btn-primary flex-1"
                >
                  <Save size={16} style={{ marginRight: '0.5rem' }} />
                  {editingProduct ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Distributor Modal */}
        {showDistributorModal && (
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowDistributorModal(false);
              }
            }}
          >
            <div 
              className="card"
              style={{ 
                width: '90%', 
                maxWidth: '600px', 
                maxHeight: '90vh', 
                overflow: 'auto',
                margin: '2rem'
              }}
            >
              <div className="flex flex-between mb-lg">
                <h3 style={{ color: 'var(--primary-green)' }}>
                  {editingDistributor ? 'Edit Distributor' : 'Add New Distributor'}
                </h3>
                <button
                  onClick={() => setShowDistributorModal(false)}
                  className="btn btn-sm btn-outline"
                >
                  <X size={16} />
                </button>
              </div>

              <div>
                <div className="grid grid-2 gap-md mb-md">
                  <div className="form-group">
                    <label className="form-label">Distributor Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={distributorForm.name}
                      onChange={(e) => setDistributorForm({ ...distributorForm, name: e.target.value })}
                      placeholder="Enter distributor name"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Region</label>
                    <input
                      type="text"
                      className="form-input"
                      value={distributorForm.region}
                      onChange={(e) => setDistributorForm({ ...distributorForm, region: e.target.value })}
                      placeholder="Enter region (e.g., LAGOS/SOUTH-WEST)"
                    />
                  </div>
                </div>

                <div className="grid grid-2 gap-md mb-md">
                  <div className="form-group">
                    <label className="form-label">Contact Person</label>
                    <input
                      type="text"
                      className="form-input"
                      value={distributorForm.contactPerson}
                      onChange={(e) => setDistributorForm({ ...distributorForm, contactPerson: e.target.value })}
                      placeholder="Enter contact person name"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input
                      type="text"
                      className="form-input"
                      value={distributorForm.phone}
                      onChange={(e) => setDistributorForm({ ...distributorForm, phone: e.target.value })}
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>

                <div className="form-group mb-md">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-input"
                    value={distributorForm.email}
                    onChange={(e) => setDistributorForm({ ...distributorForm, email: e.target.value })}
                    placeholder="Enter email address"
                  />
                </div>

                <div className="form-group mb-md">
                  <label className="form-label">Address</label>
                  <textarea
                    className="form-textarea"
                    value={distributorForm.address}
                    onChange={(e) => setDistributorForm({ ...distributorForm, address: e.target.value })}
                    placeholder="Enter full address"
                    rows="2"
                  />
                </div>

                <div className="form-group mb-md">
                  <label className="form-label">Coverage Areas (comma-separated)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={distributorForm.coverageAreas}
                    onChange={(e) => setDistributorForm({ ...distributorForm, coverageAreas: e.target.value })}
                    placeholder="e.g., Lagos, Ogun, Oyo, Osun"
                  />
                </div>

                <div className="form-group mb-md">
                  <label className="form-label">Specialties (comma-separated)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={distributorForm.specialties}
                    onChange={(e) => setDistributorForm({ ...distributorForm, specialties: e.target.value })}
                    placeholder="e.g., Wound Care, Advanced Dressings, Surgical Supplies"
                  />
                </div>
              </div>

              <div className="flex" style={{ marginTop: '2rem', gap: '1rem' }}>
                <button
                  onClick={() => setShowDistributorModal(false)}
                  className="btn btn-outline flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveDistributor}
                  className="btn btn-primary flex-1"
                >
                  <Save size={16} style={{ marginRight: '0.5rem' }} />
                  {editingDistributor ? 'Update Distributor' : 'Add Distributor'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Admin Login */}
        {!isAuthenticated && (
          <div className="admin-login" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            minHeight: '100vh',
            padding: '2rem',
            backgroundColor: 'var(--light-navy)'
          }}>
            <AdminLogin 
              onLoginSuccess={(token) => {
                setAuthToken(token);
                setIsAuthenticated(true);
                toast.success('Login successful');
              }}
              onLoginFail={() => {
                toast.error('Invalid credentials, please try again');
              }}
            />
          </div>
        )}

        {/* Logout Button */}
        {isAuthenticated && (
          <div className="flex" style={{ justifyContent: 'flex-end', marginBottom: '2rem' }}>
            <button
              onClick={() => {
                setIsAuthenticated(false);
                setAuthToken(null);
                toast.success('Logged out successfully');
              }}
              className="btn btn-danger"
            >
              <LogOut size={16} style={{ marginRight: '0.5rem' }} />
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
