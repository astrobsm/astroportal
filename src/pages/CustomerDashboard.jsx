import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  Truck, 
  X,
  Search,
  Calendar,
  DollarSign,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import { toast } from 'react-toastify';
import { orderService, customerService } from '../services/indexedDB';
import { format } from 'date-fns';
import Logo from '../components/Logo';

const CustomerDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customer, setCustomer] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    // Load customer email from localStorage if available
    const savedEmail = localStorage.getItem('customerEmail');
    if (savedEmail) {
      setCustomerEmail(savedEmail);
      loadCustomerOrders(savedEmail);
    }
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, statusFilter]);

  const loadCustomerOrders = async (email) => {
    if (!email) return;
    
    setIsLoading(true);
    try {
      // Find customer by email
      const customerData = await customerService.getCustomerByEmail(email);
      if (!customerData) {
        toast.error('Customer not found. Please check your email address.');
        return;
      }

      setCustomer(customerData);
      
      // Load customer orders
      const customerOrders = await orderService.getOrdersByCustomer(customerData.id);
      setOrders(customerOrders);
      
      // Save email to localStorage
      localStorage.setItem('customerEmail', email);
      
      if (customerOrders.length === 0) {
        toast.info('No orders found for this customer.');
      }
    } catch (error) {
      console.error('Error loading customer orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = orders;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.id.toString().includes(searchTerm) ||
        order.products.some(product => 
          product.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
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

  const getStatusText = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (customerEmail.trim()) {
      loadCustomerOrders(customerEmail.trim());
    }
  };

  const openOrderDetails = (order) => {
    setSelectedOrder(order);
  };

  const closeOrderDetails = () => {
    setSelectedOrder(null);
  };

  return (
    <div className="customer-dashboard" style={{ minHeight: '80vh', padding: '2rem 0' }}>
      <div className="container">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
          <Logo logoOnly={true} size={80} style={{ marginBottom: '1rem' }} />
          <h1 className="text-center" style={{ fontSize: '2.5rem', color: 'var(--primary-navy)', margin: 0 }}>
            Customer Dashboard
          </h1>
        </div>

        {/* Customer Email Input */}
        {!customer && (
          <div className="card" style={{ maxWidth: '500px', margin: '0 auto 2rem', padding: '2rem' }}>
            <h3 className="text-center mb-lg" style={{ color: 'var(--primary-green)' }}>
              Enter Your Email to View Orders
            </h3>
            <form onSubmit={handleEmailSubmit}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="flex" style={{ gap: '0.5rem' }}>
                  <input
                    type="email"
                    className="form-input"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="Enter your email address"
                    required
                    style={{ flex: 1 }}
                  />
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="spinner"></div>
                    ) : (
                      <>
                        <Search size={16} />
                        Find Orders
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Customer Info */}
        {customer && (
          <div className="card mb-xl" style={{ padding: '1.5rem' }}>
            <div className="flex flex-between" style={{ alignItems: 'flex-start' }}>
              <div>
                <h2 style={{ color: 'var(--primary-green)', marginBottom: '1rem' }}>
                  Welcome back, {customer.name}!
                </h2>
                <div className="grid grid-3" style={{ gap: '1rem' }}>
                  <div className="flex" style={{ alignItems: 'center', gap: '0.5rem' }}>
                    <Mail size={16} style={{ color: 'var(--light-green)' }} />
                    <span style={{ fontSize: '0.875rem' }}>{customer.email}</span>
                  </div>
                  <div className="flex" style={{ alignItems: 'center', gap: '0.5rem' }}>
                    <Phone size={16} style={{ color: 'var(--light-green)' }} />
                    <span style={{ fontSize: '0.875rem' }}>{customer.phone}</span>
                  </div>
                  <div className="flex" style={{ alignItems: 'center', gap: '0.5rem' }}>
                    <Calendar size={16} style={{ color: 'var(--light-green)' }} />
                    <span style={{ fontSize: '0.875rem' }}>
                      Customer since {format(new Date(customer.registrationDate), 'MMM yyyy')}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setCustomer(null);
                  setOrders([]);
                  setCustomerEmail('');
                  localStorage.removeItem('customerEmail');
                }}
                className="btn btn-outline"
              >
                Switch Customer
              </button>
            </div>
          </div>
        )}

        {/* Orders Section */}
        {customer && (
          <>
            {/* Filters and Search */}
            <div className="card mb-lg" style={{ padding: '1.5rem' }}>
              <div className="grid grid-2" style={{ gap: '1rem', alignItems: 'end' }}>
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
                      placeholder="Search by order ID or product name"
                      style={{ paddingLeft: '2.5rem' }}
                    />
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Filter by Status</label>
                  <select
                    className="form-select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All Orders</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Orders Summary */}
            <div className="grid grid-2 mb-lg">
              <div className="card text-center" style={{ padding: '1.5rem' }}>
                <Package size={32} style={{ color: 'var(--primary-green)', margin: '0 auto 0.5rem' }} />
                <h3 style={{ fontSize: '2rem', color: 'var(--primary-green)', marginBottom: '0.25rem' }}>
                  {orders.length}
                </h3>
                <p style={{ color: 'var(--light-green)', margin: 0 }}>Total Orders</p>
              </div>
              <div className="card text-center" style={{ padding: '1.5rem' }}>
                <Package size={32} style={{ color: 'var(--accent-green)', margin: '0 auto 0.5rem' }} />
                <h3 style={{ fontSize: '2rem', color: 'var(--accent-green)', marginBottom: '0.25rem' }}>
                  {orders.reduce((total, order) => total + (order.products || []).reduce((sum, product) => sum + product.quantity, 0), 0)}
                </h3>
                <p style={{ color: 'var(--light-green)', margin: 0 }}>Total Items Ordered</p>
              </div>
            </div>

            {/* Orders List */}
            <div>
              <h3 className="mb-lg" style={{ color: 'var(--primary-green)' }}>
                Your Orders ({filteredOrders.length})
              </h3>
              
              {filteredOrders.length === 0 ? (
                <div className="card text-center" style={{ padding: '3rem' }}>
                  <Package size={64} style={{ color: 'var(--light-green)', margin: '0 auto 1rem' }} />
                  <h4 style={{ color: 'var(--light-green)', marginBottom: '0.5rem' }}>
                    No orders found
                  </h4>
                  <p style={{ color: 'var(--light-green)' }}>
                    {orders.length === 0 
                      ? "You haven't placed any orders yet." 
                      : "No orders match your current filters."}
                  </p>
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
                            Placed on {format(new Date(order.orderDate), 'MMM dd, yyyy')}
                          </p>
                        </div>
                        <div className="flex" style={{ alignItems: 'center', gap: '1rem' }}>
                          <div className={`status-badge status-${order.status}`}>
                            {getStatusIcon(order.status)}
                            {getStatusText(order.status)}
                          </div>
                          <span style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--primary-green)' }}>
                            {(order.products || []).reduce((total, product) => total + product.quantity, 0)} items
                          </span>
                        </div>
                      </div>
                      
                      <div style={{ marginBottom: '1rem' }}>
                        <h5 style={{ marginBottom: '0.5rem', color: 'var(--primary-green)' }}>
                          Products ({order.products.length} items)
                        </h5>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                          {order.products.slice(0, 3).map((product, index) => (
                            <span key={index} className="status-badge status-confirmed" style={{ fontSize: '0.75rem' }}>
                              {product.name} (×{product.quantity})
                            </span>
                          ))}
                          {order.products.length > 3 && (
                            <span className="status-badge status-pending" style={{ fontSize: '0.75rem' }}>
                              +{order.products.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-between">
                        <div className="flex" style={{ alignItems: 'center', gap: '0.5rem' }}>
                          <MapPin size={14} style={{ color: 'var(--light-green)' }} />
                          <span style={{ fontSize: '0.875rem', color: 'var(--light-green)' }}>
                            Delivery: {order.deliveryMethod}
                          </span>
                        </div>
                        <button
                          onClick={() => openOrderDetails(order)}
                          className="btn btn-outline"
                          style={{ fontSize: '0.875rem' }}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
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
            onClick={closeOrderDetails}
          >
            <div 
              className="card"
              style={{
                maxWidth: '600px',
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
                  onClick={closeOrderDetails}
                  className="btn btn-outline"
                  style={{ padding: '0.5rem', width: '40px', height: '40px' }}
                >
                  <X size={16} />
                </button>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ marginBottom: '0.5rem', color: 'var(--primary-green)' }}>Order Information</h4>
                <p><strong>Date:</strong> {format(new Date(selectedOrder.orderDate), 'PPP')}</p>
                <p><strong>Status:</strong> 
                  <span className={`status-badge status-${selectedOrder.status}`} style={{ marginLeft: '0.5rem' }}>
                    {getStatusIcon(selectedOrder.status)}
                    {getStatusText(selectedOrder.status)}
                  </span>
                </p>
                <p><strong>Delivery Method:</strong> {selectedOrder.deliveryMethod}</p>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ marginBottom: '0.5rem', color: 'var(--primary-green)' }}>Products</h4>
                {selectedOrder.products.map((product, index) => (
                  <div key={index} className="flex flex-between" style={{ 
                    padding: '0.75rem', 
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

              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ marginBottom: '0.5rem', color: 'var(--primary-green)' }}>Delivery Address</h4>
                <p style={{ margin: 0, fontSize: '0.875rem' }}>{selectedOrder.customerAddress}</p>
              </div>

              <div 
                style={{
                  borderTop: '1px solid #e5e7eb',
                  paddingTop: '1rem',
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  textAlign: 'right',
                  color: 'var(--primary-green)'
                }}
              >
                Total Items: {selectedOrder.products.reduce((total, product) => total + product.quantity, 0)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;
