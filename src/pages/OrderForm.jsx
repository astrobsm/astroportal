import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  MapPin, 
  Truck,
  Check,
  Package,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { toast } from 'react-toastify';
import { productService, orderService, customerService } from '../services/indexedDB';
import Logo from '../components/Logo';

// Custom Product Dropdown Component
const ProductDropdown = ({ products, selectedProduct, onProductSelect, placeholder = "Select a product...", isLoading = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = React.useRef(null);
  const searchInputRef = React.useRef(null);
  
  const selectedProductData = products.find(p => p.id.toString() === selectedProduct);
  
  // Filter products based on search term
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.category && product.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm(''); // Clear search when closing
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Focus search input when dropdown opens
  React.useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current.focus();
      }, 100);
    }
  }, [isOpen]);
  
  if (isLoading) {
    return (
      <div className="form-input" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0.75rem',
        color: '#6c757d'
      }}>
        <Package size={16} style={{ marginRight: '0.5rem' }} />
        Loading products...
      </div>
    );
  }
  
  return (
    <div ref={dropdownRef} className="product-dropdown" style={{ position: 'relative', width: '100%' }}>
      {/* Dropdown Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="form-input"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.75rem',
          background: 'white',
          border: '2px solid #e9ecef',
          borderRadius: '8px',
          cursor: 'pointer',
          textAlign: 'left',
          width: '100%'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
          {selectedProductData ? (
            <>
              {/* Product Image */}
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '6px',
                overflow: 'hidden',
                backgroundColor: '#f8f9fa',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {selectedProductData.primaryImage ? (
                  <img
                    src={selectedProductData.primaryImage.image_url}
                    alt={selectedProductData.primaryImage.alt_text || selectedProductData.name}
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
                  display: selectedProductData.primaryImage ? 'none' : 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#6c757d'
                }}>
                  <Package size={20} />
                </div>
              </div>
              
              {/* Product Name */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ 
                  fontWeight: '500', 
                  color: 'var(--primary-navy)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {selectedProductData.name}
                </div>
                {selectedProductData.category && (
                  <div style={{ 
                    fontSize: '0.75rem', 
                    color: 'var(--light-navy)',
                    opacity: 0.8
                  }}>
                    {selectedProductData.category}
                  </div>
                )}
              </div>
            </>
          ) : (
            <span style={{ color: '#6c757d' }}>{placeholder}</span>
          )}
        </div>
        
        {/* Dropdown Icon */}
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
      
      {/* Dropdown Options */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          zIndex: 1000,
          backgroundColor: 'white',
          border: '2px solid #e9ecef',
          borderTop: 'none',
          borderRadius: '0 0 8px 8px',
          maxHeight: '350px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          {/* Search Input */}
          <div style={{ 
            padding: '0.75rem',
            borderBottom: '1px solid #e9ecef',
            backgroundColor: '#f8f9fa'
          }}>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '0.9rem',
                outline: 'none'
              }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          
          {/* Products List */}
          <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
            {filteredProducts.length === 0 ? (
              <div style={{
                padding: '2rem',
                textAlign: 'center',
                color: '#6c757d'
              }}>
                <Package size={32} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                <div>No products found</div>
                {searchTerm && (
                  <div style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                    Try adjusting your search terms
                  </div>
                )}
              </div>
            ) : (
              filteredProducts.map(product => (
            <button
              key={product.id}
              type="button"
              onClick={() => {
                onProductSelect(product.id.toString());
                setIsOpen(false);
                setSearchTerm(''); // Clear search when selecting
              }}
              style={{
                width: '100%',
                padding: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                border: 'none',
                background: selectedProduct === product.id.toString() ? '#f8f9fa' : 'white',
                cursor: 'pointer',
                textAlign: 'left',
                borderBottom: '1px solid #f1f3f4'
              }}
              onMouseEnter={(e) => {
                if (selectedProduct !== product.id.toString()) {
                  e.target.style.backgroundColor = '#f8f9fa';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedProduct !== product.id.toString()) {
                  e.target.style.backgroundColor = 'white';
                }
              }}
            >
              {/* Product Image */}
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '6px',
                overflow: 'hidden',
                backgroundColor: '#f8f9fa',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                border: '1px solid #e9ecef'
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
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#6c757d'
                }}>
                  <Package size={24} />
                </div>
              </div>
              
              {/* Product Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ 
                  fontWeight: '500', 
                  color: 'var(--primary-navy)',
                  marginBottom: '0.25rem'
                }}>
                  {product.name}
                </div>
                {product.category && (
                  <div style={{ 
                    fontSize: '0.75rem', 
                    backgroundColor: 'var(--accent-green)',
                    color: 'white',
                    padding: '0.125rem 0.5rem',
                    borderRadius: '12px',
                    display: 'inline-block',
                    marginBottom: '0.25rem'
                  }}>
                    {product.category}
                  </div>
                )}
                {product.description && (
                  <div style={{ 
                    fontSize: '0.8rem', 
                    color: '#6c757d',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {product.description}
                  </div>
                )}
              </div>
            </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const OrderForm = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [deliveryMethod, setDeliveryMethod] = useState('standard');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  // New product selection state
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('');
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  // Units of measure options
  const unitOptions = [
    { value: 'tubes', label: 'Tubes' },
    { value: 'pcs', label: 'Pieces' },
    { value: 'carton', label: 'Carton' },
    { value: 'packets', label: 'Packets' },
    { value: 'bottles', label: 'Bottles' }
  ];

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setProductsLoading(true);
    try {
      // Fetch products from API to get images
      const response = await fetch('/api/products');
      if (response.ok) {
        const productsData = await response.json();
        
        // Fetch images for each product
        const productsWithImages = await Promise.all(
          productsData.map(async (product) => {
            try {
              const imageResponse = await fetch(`/api/products/${product.id}/images`);
              if (imageResponse.ok) {
                const images = await imageResponse.json();
                const primaryImage = images.find(img => img.is_primary) || images[0];
                return {
                  ...product,
                  images,
                  primaryImage
                };
              }
            } catch (error) {
              console.error(`Error fetching images for product ${product.id}:`, error);
            }
            return {
              ...product,
              images: [],
              primaryImage: null
            };
          })
        );
        
        setProducts(productsWithImages);
      } else {
        // Fallback to IndexedDB if API fails
        const productsData = await productService.getAllProducts();
        setProducts(productsData.map(product => ({ ...product, images: [], primaryImage: null })));
      }
    } catch (error) {
      console.error('Error loading products:', error);
      // Fallback to IndexedDB
      try {
        const productsData = await productService.getAllProducts();
        setProducts(productsData.map(product => ({ ...product, images: [], primaryImage: null })));
      } catch (fallbackError) {
        console.error('Fallback error:', fallbackError);
        toast.error('Failed to load products');
      }
    } finally {
      setProductsLoading(false);
    }
  };

  const addToCart = () => {
    if (!selectedProduct) {
      toast.error('Please select a product');
      return;
    }
    if (!selectedUnit) {
      toast.error('Please select a unit of measure');
      return;
    }
    if (selectedQuantity < 1) {
      toast.error('Please enter a valid quantity');
      return;
    }

    const product = products.find(p => p.id === parseInt(selectedProduct));
    if (!product) {
      toast.error('Selected product not found');
      return;
    }

    const cartItem = {
      id: product.id,
      name: product.name,
      description: product.description,
      category: product.category,
      unit: selectedUnit,
      quantity: selectedQuantity
    };

    const existingItemIndex = cart.findIndex(item => 
      item.id === product.id && item.unit === selectedUnit
    );

    if (existingItemIndex >= 0) {
      const updatedCart = [...cart];
      updatedCart[existingItemIndex].quantity += selectedQuantity;
      setCart(updatedCart);
      toast.success(`Updated ${product.name} quantity in cart`);
    } else {
      setCart([...cart, cartItem]);
      toast.success(`${product.name} added to cart`);
    }

    // Reset form
    setSelectedProduct('');
    setSelectedUnit('');
    setSelectedQuantity(1);
  };

  const updateCartItemQuantity = (cartIndex, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(cartIndex);
      return;
    }
    
    const updatedCart = [...cart];
    updatedCart[cartIndex].quantity = newQuantity;
    setCart(updatedCart);
  };

  const removeFromCart = (cartIndex) => {
    const updatedCart = cart.filter((_, index) => index !== cartIndex);
    setCart(updatedCart);
    toast.info('Item removed from cart');
  };

  const validateForm = () => {
    if (cart.length === 0) {
      toast.error('Please add items to your cart');
      return false;
    }

    if (!customerInfo.name.trim()) {
      toast.error('Please enter your name');
      return false;
    }

    if (!customerInfo.email.trim() || !customerInfo.email.includes('@')) {
      toast.error('Please enter a valid email address');
      return false;
    }

    if (!customerInfo.phone.trim()) {
      toast.error('Please enter your phone number');
      return false;
    }

    if (!customerInfo.address.trim()) {
      toast.error('Please enter your address');
      return false;
    }

    return true;
  };

  const handleSubmitOrder = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Create or update customer
      const customerId = await customerService.createOrUpdateCustomer(customerInfo);

      // Create order
      const orderData = {
        customerId,
        customerName: customerInfo.name,
        customerEmail: customerInfo.email,
        customerPhone: customerInfo.phone,
        customerAddress: customerInfo.address,
        products: cart,
        deliveryMethod
      };

      await orderService.createOrder(orderData);

      toast.success('Order placed successfully!');
      
      // Clear cart and form
      setCart([]);
      setCustomerInfo({
        name: '',
        email: '',
        phone: '',
        address: ''
      });
      setCurrentStep(1);

      // Navigate to customer dashboard
      setTimeout(() => {
        navigate('/customer-dashboard');
      }, 2000);

    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep === 1 && cart.length === 0) {
      toast.error('Please add items to your cart');
      return;
    }
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  return (
    <div className="order-form-page" style={{ minHeight: '80vh', padding: '2rem 0' }}>
      <div className="container">
        {/* Logo and Title */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
          <Logo logoOnly={true} size={70} style={{ marginBottom: '1rem' }} />
          <h1 style={{ fontSize: '2rem', color: 'var(--primary-navy)', textAlign: 'center', margin: 0 }}>
            Place Your Order
          </h1>
        </div>

        {/* Progress Steps */}
        <div className="mb-xl">
          <div className="flex" style={{ justifyContent: 'center', gap: '2rem', marginBottom: '2rem' }}>
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex" style={{ alignItems: 'center', gap: '0.5rem' }}>
                <div 
                  className={`flex flex-center ${currentStep >= step ? 'bg-primary' : 'bg-gray'}`}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: currentStep >= step ? 'var(--primary-green)' : '#e5e7eb',
                    color: currentStep >= step ? 'var(--pure-white)' : 'var(--light-green)',
                    fontWeight: 'bold'
                  }}
                >
                  {currentStep > step ? <Check size={20} /> : step}
                </div>
                <span style={{ 
                  fontWeight: currentStep === step ? 'bold' : 'normal',
                  color: currentStep >= step ? 'var(--primary-green)' : 'var(--light-green)'
                }}>
                  {step === 1 ? 'Select Products' : step === 2 ? 'Customer Info' : 'Review & Submit'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Product Selection */}
        {currentStep === 1 && (
          <div className="fade-in">
            <h2 className="text-center mb-lg" style={{ fontSize: '2rem', color: 'var(--primary-green)' }}>
              <Package className="icon" style={{ marginRight: '0.5rem' }} />
              Select Products
            </h2>

            {/* Product Selection Form */}
            <div className="card" style={{ marginBottom: '2rem', padding: '2rem' }}>
              <h3 style={{ 
                color: 'var(--primary-green)', 
                marginBottom: '1.5rem',
                fontSize: '1.25rem'
              }}>
                Add Product to Cart
              </h3>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '2fr 1fr 1fr auto',
                gap: '1rem',
                alignItems: 'end'
              }}>
                {/* Product Dropdown */}
                <div className="form-group">
                  <label className="form-label">
                    Product *
                  </label>
                  <ProductDropdown
                    products={products}
                    selectedProduct={selectedProduct}
                    onProductSelect={setSelectedProduct}
                    placeholder="Select a product..."
                    isLoading={productsLoading}
                  />
                </div>

                {/* Unit Dropdown */}
                <div className="form-group">
                  <label className="form-label">
                    Unit *
                  </label>
                  <select
                    value={selectedUnit}
                    onChange={(e) => setSelectedUnit(e.target.value)}
                    className="form-input"
                  >
                    <option value="">Select unit...</option>
                    {unitOptions.map(unit => (
                      <option key={unit.value} value={unit.value}>
                        {unit.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quantity Input */}
                <div className="form-group">
                  <label className="form-label">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={selectedQuantity}
                    onChange={(e) => setSelectedQuantity(parseInt(e.target.value) || 1)}
                    className="form-input"
                  />
                </div>

                {/* Add Button */}
                <button
                  onClick={addToCart}
                  className="btn btn-primary"
                  style={{ height: 'fit-content' }}
                >
                  <Plus size={18} />
                  Add to Cart
                </button>
              </div>
            </div>

            {/* Cart Display */}
            {cart.length > 0 && (
              <div className="cart-section">
                <h3 style={{ 
                  color: 'var(--primary-green)', 
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <ShoppingCart size={20} />
                  Your Cart ({cart.length} item{cart.length !== 1 ? 's' : ''})
                </h3>

                <div className="cart-items">
                  {cart.map((item, index) => (
                    <div key={`${item.id}-${item.unit}-${index}`} className="card" style={{ marginBottom: '1rem' }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center' 
                      }}>
                        <div style={{ flex: '1' }}>
                          <h4 style={{ 
                            color: 'var(--primary-green)', 
                            marginBottom: '0.5rem',
                            fontSize: '1.1rem'
                          }}>
                            {item.name}
                          </h4>
                          <p style={{ 
                            color: 'var(--light-green)', 
                            fontSize: '0.9rem',
                            marginBottom: '0.5rem'
                          }}>
                            {item.description}
                          </p>
                          <div style={{ 
                            color: 'var(--accent-green)', 
                            fontWeight: '500' 
                          }}>
                            Unit: {unitOptions.find(u => u.value === item.unit)?.label || item.unit}
                          </div>
                        </div>

                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '1rem' 
                        }}>
                          {/* Quantity Controls */}
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.5rem' 
                          }}>
                            <button
                              onClick={() => updateCartItemQuantity(index, item.quantity - 1)}
                              className="btn btn-outline"
                              style={{
                                width: '32px',
                                height: '32px',
                                padding: '0.25rem',
                                minWidth: 'auto'
                              }}
                            >
                              <Minus size={14} />
                            </button>
                            
                            <span style={{ 
                              minWidth: '40px', 
                              textAlign: 'center',
                              fontWeight: '500',
                              color: 'var(--primary-green)'
                            }}>
                              {item.quantity}
                            </span>
                            
                            <button
                              onClick={() => updateCartItemQuantity(index, item.quantity + 1)}
                              className="btn btn-outline"
                              style={{
                                width: '32px',
                                height: '32px',
                                padding: '0.25rem',
                                minWidth: 'auto'
                              }}
                            >
                              <Plus size={14} />
                            </button>
                          </div>

                          {/* Remove Button */}
                          <button
                            onClick={() => removeFromCart(index)}
                            className="btn btn-danger"
                            style={{
                              width: '32px',
                              height: '32px',
                              padding: '0.25rem',
                              minWidth: 'auto'
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Navigation */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'flex-end', 
                  marginTop: '2rem' 
                }}>
                  <button
                    onClick={nextStep}
                    className="btn btn-primary"
                  >
                    Continue to Customer Info
                  </button>
                </div>
              </div>
            )}

            {cart.length === 0 && (
              <div className="card text-center" style={{ padding: '2rem' }}>
                <ShoppingCart size={48} style={{ color: 'var(--light-green)', margin: '0 auto 1rem' }} />
                <p style={{ color: 'var(--light-green)' }}>Your cart is empty. Add products to continue.</p>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Customer Information */}
        {currentStep === 2 && (
          <div className="fade-in">
            <h2 className="text-center mb-lg" style={{ fontSize: '2rem', color: 'var(--primary-green)' }}>
              Customer Information
            </h2>

            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
              <div className="card" style={{ padding: '2rem' }}>
                <div className="form-group">
                  <label className="form-label">
                    <MapPin size={16} style={{ marginRight: '0.5rem' }} />
                    Full Name *
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    className="form-input"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                    placeholder="Enter your email address"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number *</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                    placeholder="Enter your phone number"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Delivery Address *</label>
                  <textarea
                    className="form-input"
                    value={customerInfo.address}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                    placeholder="Enter your complete delivery address"
                    rows="3"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <Truck size={16} style={{ marginRight: '0.5rem' }} />
                    Delivery Method
                  </label>
                  <select
                    className="form-select"
                    value={deliveryMethod}
                    onChange={(e) => setDeliveryMethod(e.target.value)}
                  >
                    <option value="standard">Standard Delivery (3-5 days)</option>
                    <option value="express">Express Delivery (1-2 days)</option>
                    <option value="overnight">Same Day Delivery</option>
                  </select>
                  
                  {/* Regional Distributors Info */}
                  <div style={{ 
                    marginTop: '1rem', 
                    padding: '0.75rem', 
                    backgroundColor: 'var(--light-yellow)', 
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--golden-yellow)'
                  }}>
                    <h5 style={{ 
                      fontSize: '0.9rem', 
                      fontWeight: 'bold', 
                      marginBottom: '0.5rem',
                      color: 'var(--primary-green)'
                    }}>
                      📞 Need Faster Delivery? Contact Your Regional Distributor:
                    </h5>
                    <div style={{ fontSize: '0.8rem', color: 'var(--light-green)', lineHeight: 1.4 }}>
                      <p style={{ margin: '0.2rem 0' }}><strong>ANAMBRA/SOUTH-EAST:</strong> FABIAN - +234 803 609 4136</p>
                      <p style={{ margin: '0.2rem 0' }}><strong>LAGOS/SOUTH-WEST:</strong> IKECHUKWU - +234 803 732 5194</p>
                      <p style={{ margin: '0.2rem 0' }}><strong>ABUJA/NORTH:</strong> ANIAGBOSO DAVIDSON - +234 805 850 1919</p>
                      <p style={{ margin: '0.2rem 0' }}><strong>WARRI/SOUTH-SOUTH:</strong> DOUGLAS ONYEMA - +234 802 135 2164</p>
                      <p style={{ margin: '0.2rem 0' }}><strong>NSUKKA/ENUGU:</strong> CHIKWENDU CHINONSO - +234 806 710 4155</p>
                    </div>
                  </div>
                </div>

                <div className="flex" style={{ gap: '1rem', marginTop: '2rem' }}>
                  <button
                    onClick={prevStep}
                    className="btn btn-outline"
                    style={{ flex: 1 }}
                  >
                    Back to Products
                  </button>
                  <button
                    onClick={nextStep}
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                  >
                    Review Order
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Review and Submit */}
        {currentStep === 3 && (
          <div className="fade-in">
            <h2 className="text-center mb-lg" style={{ fontSize: '2rem', color: 'var(--primary-green)' }}>
              Review Your Order
            </h2>

            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
              <div className="grid grid-2" style={{ gap: '2rem' }}>
                {/* Order Summary */}
                <div>
                  <h3 className="mb-lg" style={{ color: 'var(--primary-green)' }}>Order Summary</h3>
                  <div className="card">
                    {cart.map((item) => (
                      <div key={`${item.id}-${item.unit}`} style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #e5e7eb' }}>
                        <div>
                          <h5 style={{ marginBottom: '0.25rem', color: 'var(--primary-green)' }}>{item.name}</h5>
                          <p style={{ fontSize: '0.875rem', color: 'var(--light-green)', marginBottom: '0.25rem' }}>
                            {item.description}
                          </p>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.875rem', color: 'var(--accent-green)' }}>
                              Unit: {unitOptions.find(u => u.value === item.unit)?.label || item.unit}
                            </span>
                            <strong style={{ color: 'var(--primary-green)' }}>
                              Quantity: {item.quantity}
                            </strong>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: 'rgba(109, 180, 116, 0.1)', borderRadius: '8px' }}>
                      <strong style={{ fontSize: '1.1rem', color: 'var(--primary-green)' }}>
                        Total Items: {cart.reduce((total, item) => total + item.quantity, 0)}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Customer & Delivery Info */}
                <div>
                  <h3 className="mb-lg" style={{ color: 'var(--primary-green)' }}>Delivery Information</h3>
                  <div className="card">
                    <div style={{ marginBottom: '1rem' }}>
                      <h5 style={{ marginBottom: '0.5rem' }}>Customer Details</h5>
                      <p style={{ margin: '0.25rem 0' }}><strong>Name:</strong> {customerInfo.name}</p>
                      <p style={{ margin: '0.25rem 0' }}><strong>Email:</strong> {customerInfo.email}</p>
                      <p style={{ margin: '0.25rem 0' }}><strong>Phone:</strong> {customerInfo.phone}</p>
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                      <h5 style={{ marginBottom: '0.5rem' }}>Delivery Address</h5>
                      <p style={{ margin: 0 }}>{customerInfo.address}</p>
                    </div>
                    <div>
                      <h5 style={{ marginBottom: '0.5rem' }}>Delivery Method</h5>
                      <p style={{ margin: 0, textTransform: 'capitalize' }}>
                        {deliveryMethod === 'standard' ? 'Standard Delivery (3-5 days)' :
                         deliveryMethod === 'express' ? 'Express Delivery (1-2 days)' :
                         'Same Day Delivery'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex" style={{ gap: '1rem', marginTop: '2rem' }}>
                <button
                  onClick={prevStep}
                  className="btn btn-outline"
                  style={{ flex: 1 }}
                >
                  Back to Customer Info
                </button>
                <button
                  onClick={handleSubmitOrder}
                  disabled={isSubmitting}
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                >
                  {isSubmitting ? (
                    <span>Placing Order...</span>
                  ) : (
                    <span>
                      <Check size={16} style={{ marginRight: '0.5rem' }} />
                      Place Order
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderForm;
