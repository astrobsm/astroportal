import Dexie from 'dexie';

// Define the database schema
export class AstroBSMDatabase extends Dexie {
  constructor() {
    super('AstroBSMPortal');
    
    // Version 1 - Original schema
    this.version(1).stores({
      orders: '++id, customerId, customerName, customerEmail, customerPhone, customerAddress, products, deliveryMethod, orderDate, status, totalAmount, syncStatus, lastUpdated',
      customers: '++id, name, email, phone, address, registrationDate, lastUpdated',
      products: '++id, name, description, price, category, inStock, lastUpdated',
      notifications: '++id, type, title, message, isRead, createdAt, targetUserId',
      syncQueue: '++id, tableName, operation, data, timestamp, retryCount',
      distributors: '++id, name, region, contactPerson, phone, email, createdAt, lastUpdated'
    });
    
    // Version 2 - Extended schema with content management
    this.version(2).stores({
      orders: '++id, customerId, customerName, customerEmail, customerPhone, customerAddress, products, deliveryMethod, orderDate, status, totalAmount, syncStatus, lastUpdated',
      customers: '++id, name, email, phone, address, registrationDate, lastUpdated',
      products: '++id, name, description, price, category, inStock, lastUpdated',
      notifications: '++id, type, title, message, isRead, createdAt, targetUserId',
      syncQueue: '++id, tableName, operation, data, timestamp, retryCount',
      distributors: '++id, name, region, contactPerson, phone, email, createdAt, lastUpdated',
      productImages: '++id, productId, imageUrl, altText, isPrimary, displayOrder, createdAt, lastUpdated',
      productVideos: '++id, productId, videoUrl, videoType, title, description, thumbnailUrl, duration, isFeatured, createdAt, lastUpdated',
      events: '++id, title, description, eventType, startDate, endDate, bannerImageUrl, bannerText, actionUrl, actionText, isActive, displayOrder, createdAt, lastUpdated',
      contentBlocks: '++id, blockType, title, content, isActive, displayOrder, pageSection, createdAt, lastUpdated'
    });
    
    // Define the data structure
    this.orders = this.table('orders');
    this.customers = this.table('customers');
    this.products = this.table('products');
    this.notifications = this.table('notifications');
    this.syncQueue = this.table('syncQueue');
    this.distributors = this.table('distributors');
    this.productImages = this.table('productImages');
    this.productVideos = this.table('productVideos');
    this.events = this.table('events');
    this.contentBlocks = this.table('contentBlocks');
  }
}

// Create database instance
export const db = new AstroBSMDatabase();

// Initialize database with sample data
export const initializeDatabase = async () => {
  try {
    // Check if database is already initialized
    const orderCount = await db.orders.count();
    const productCount = await db.products.count();
    
    if (orderCount === 0 && productCount === 0) {
      // Add sample products
      await db.products.bulkAdd([
        {
          id: 1,
          name: 'Wound Care Dressing - Standard',
          description: 'High-quality wound care dressing for general use',
          price: 15.99,
          category: 'Dressings',
          inStock: true,
          lastUpdated: new Date()
        },
        {
          id: 2,
          name: 'Antiseptic Solution',
          description: 'Professional antiseptic solution for wound cleaning',
          price: 8.50,
          category: 'Solutions',
          inStock: true,
          lastUpdated: new Date()
        },
        {
          id: 3,
          name: 'Bandages - Elastic',
          description: 'Elastic bandages for secure wound wrapping',
          price: 12.75,
          category: 'Bandages',
          inStock: true,
          lastUpdated: new Date()
        },
        {
          id: 4,
          name: 'Wound Care Kit - Advanced',
          description: 'Complete wound care kit with multiple components',
          price: 45.00,
          category: 'Kits',
          inStock: true,
          lastUpdated: new Date()
        },
        {
          id: 5,
          name: 'Gauze Pads - Sterile',
          description: 'Sterile gauze pads for wound protection',
          price: 6.99,
          category: 'Gauze',
          inStock: true,
          lastUpdated: new Date()
        }
      ]);
      
      console.log('Database initialized with sample data');
    }
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

// Order management functions
export const orderService = {
  // Create a new order
  async createOrder(orderData) {
    try {
      const order = {
        ...orderData,
        orderDate: new Date(),
        status: 'pending',
        syncStatus: 'pending',
        lastUpdated: new Date()
      };
      
      const id = await db.orders.add(order);
      
      // Add to sync queue
      await addToSyncQueue('orders', 'create', { ...order, id });
      
      // Create notification for admin
      await notificationService.createNotification({
        type: 'new_order',
        title: 'New Order Received',
        message: `New order from ${order.customerName}`,
        targetUserId: 'admin'
      });
      
      return id;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },
  
  // Get all orders
  async getAllOrders() {
    try {
      return await db.orders.orderBy('orderDate').reverse().toArray();
    } catch (error) {
      console.error('Error getting orders:', error);
      return [];
    }
  },
  
  // Get orders by customer
  async getOrdersByCustomer(customerId) {
    try {
      return await db.orders
        .where('customerId')
        .equals(customerId)
        .orderBy('orderDate')
        .reverse()
        .toArray();
    } catch (error) {
      console.error('Error getting customer orders:', error);
      return [];
    }
  },
  
  // Update order status
  async updateOrderStatus(orderId, status) {
    try {
      await db.orders.update(orderId, { 
        status, 
        lastUpdated: new Date(),
        syncStatus: 'pending'
      });
      
      // Add to sync queue
      const order = await db.orders.get(orderId);
      await addToSyncQueue('orders', 'update', order);
      
      return true;
    } catch (error) {
      console.error('Error updating order status:', error);
      return false;
    }
  },
  
  // Delete order
  async deleteOrder(orderId) {
    try {
      await db.orders.delete(orderId);
      await addToSyncQueue('orders', 'delete', { id: orderId });
      return true;
    } catch (error) {
      console.error('Error deleting order:', error);
      return false;
    }
  }
};

// Customer management functions
export const customerService = {
  // Create or update customer
  async createOrUpdateCustomer(customerData) {
    try {
      const existingCustomer = await db.customers
        .where('email')
        .equals(customerData.email)
        .first();
      
      if (existingCustomer) {
        await db.customers.update(existingCustomer.id, {
          ...customerData,
          lastUpdated: new Date()
        });
        return existingCustomer.id;
      } else {
        const id = await db.customers.add({
          ...customerData,
          registrationDate: new Date(),
          lastUpdated: new Date()
        });
        return id;
      }
    } catch (error) {
      console.error('Error creating/updating customer:', error);
      throw error;
    }
  },
  
  // Get customer by email
  async getCustomerByEmail(email) {
    try {
      return await db.customers.where('email').equals(email).first();
    } catch (error) {
      console.error('Error getting customer:', error);
      return null;
    }
  },
  
  // Get all customers
  async getAllCustomers() {
    try {
      return await db.customers.orderBy('registrationDate').reverse().toArray();
    } catch (error) {
      console.error('Error getting customers:', error);
      return [];
    }
  }
};

// Product management functions
export const productService = {
  // Get all products
  async getAllProducts() {
    try {
      return await db.products.orderBy('name').toArray();
    } catch (error) {
      console.error('Error getting products:', error);
      return [];
    }
  },
  
  // Get products by category
  async getProductsByCategory(category) {
    try {
      return await db.products.where('category').equals(category).toArray();
    } catch (error) {
      console.error('Error getting products by category:', error);
      return [];
    }
  },
  
  // Create new product
  async createProduct(productData) {
    try {
      const product = {
        ...productData,
        lastUpdated: new Date()
      };
      const id = await db.products.add(product);
      return { ...product, id };
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },
  
  // Update product
  async updateProduct(productId, updates) {
    try {
      await db.products.update(productId, {
        ...updates,
        lastUpdated: new Date()
      });
      const updatedProduct = await db.products.get(productId);
      return updatedProduct;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },
  
  // Delete product
  async deleteProduct(productId) {
    try {
      await db.products.delete(productId);
      return true;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }
};

// Notification management functions
export const notificationService = {
  // Create notification
  async createNotification(notificationData) {
    try {
      const notification = {
        ...notificationData,
        isRead: false,
        createdAt: new Date()
      };
      
      return await db.notifications.add(notification);
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  },
  
  // Get all notifications
  async getAllNotifications() {
    try {
      return await db.notifications.orderBy('createdAt').reverse().toArray();
    } catch (error) {
      console.error('Error getting notifications:', error);
      return [];
    }
  },
  
  // Mark notification as read
  async markAsRead(notificationId) {
    try {
      await db.notifications.update(notificationId, { isRead: true });
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  },
  
  // Get unread notifications count
  async getUnreadCount() {
    try {
      return await db.notifications.where('isRead').equals(0).count(); // Changed from false to 0
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }
};

// Sync queue management
export const addToSyncQueue = async (tableName, operation, data) => {
  try {
    await db.syncQueue.add({
      tableName,
      operation,
      data,
      timestamp: new Date(),
      retryCount: 0
    });
  } catch (error) {
    console.error('Error adding to sync queue:', error);
  }
};

// Get pending sync items
export const getPendingSyncItems = async () => {
  try {
    return await db.syncQueue.orderBy('timestamp').toArray();
  } catch (error) {
    console.error('Error getting pending sync items:', error);
    return [];
  }
};

// Remove from sync queue
export const removeFromSyncQueue = async (itemId) => {
  try {
    await db.syncQueue.delete(itemId);
  } catch (error) {
    console.error('Error removing from sync queue:', error);
  }
};

// Clear all data (for testing purposes)
export const clearAllData = async () => {
  try {
    await db.delete();
    await db.open();
    console.log('All data cleared');
  } catch (error) {
    console.error('Error clearing data:', error);
  }
};

// Distributors management functions
export const distributorService = {
  // Get all distributors
  async getAllDistributors() {
    try {
      return await db.distributors.orderBy('region').toArray();
    } catch (error) {
      console.error('Error getting distributors:', error);
      return [];
    }
  },
  
  // Get distributor by region
  async getDistributorsByRegion(region) {
    try {
      return await db.distributors.where('region').equals(region).toArray();
    } catch (error) {
      console.error('Error getting distributors by region:', error);
      return [];
    }
  },
  
  // Create or update distributor
  async createOrUpdateDistributor(distributorData) {
    try {
      const existingDistributor = await db.distributors
        .where(['name', 'region'])
        .equals([distributorData.name, distributorData.region])
        .first();
      
      if (existingDistributor) {
        await db.distributors.update(existingDistributor.id, {
          ...distributorData,
          lastUpdated: new Date()
        });
        return existingDistributor.id;
      } else {
        const id = await db.distributors.add({
          ...distributorData,
          createdAt: new Date(),
          lastUpdated: new Date()
        });
        return id;
      }
    } catch (error) {
      console.error('Error creating/updating distributor:', error);
      throw error;
    }
  }
};

// Events management functions
export const eventsService = {
  // Get all active events
  async getActiveEvents() {
    try {
      return await db.events
        .where('isActive')
        .equals(true)
        .orderBy('startDate')
        .toArray();
    } catch (error) {
      console.error('Error getting active events:', error);
      return [];
    }
  },

  // Get all events
  async getAllEvents() {
    try {
      return await db.events.orderBy('startDate').reverse().toArray();
    } catch (error) {
      console.error('Error getting events:', error);
      return [];
    }
  },

  // Create or update event
  async createOrUpdateEvent(eventData) {
    try {
      if (eventData.id) {
        await db.events.update(eventData.id, {
          ...eventData,
          lastUpdated: new Date()
        });
        return eventData.id;
      } else {
        const id = await db.events.add({
          ...eventData,
          createdAt: new Date(),
          lastUpdated: new Date()
        });
        return id;
      }
    } catch (error) {
      console.error('Error creating/updating event:', error);
      throw error;
    }
  },

  // Delete event
  async deleteEvent(eventId) {
    try {
      await db.events.delete(eventId);
      return true;
    } catch (error) {
      console.error('Error deleting event:', error);
      return false;
    }
  }
};

// Product media management functions
export const productMediaService = {
  // Get product images
  async getProductImages(productId) {
    try {
      return await db.productImages
        .where('productId')
        .equals(productId)
        .orderBy('displayOrder')
        .toArray();
    } catch (error) {
      console.error('Error getting product images:', error);
      return [];
    }
  },

  // Add product image
  async addProductImage(imageData) {
    try {
      const id = await db.productImages.add({
        ...imageData,
        createdAt: new Date(),
        lastUpdated: new Date()
      });
      return id;
    } catch (error) {
      console.error('Error adding product image:', error);
      throw error;
    }
  },

  // Delete product image
  async deleteProductImage(imageId) {
    try {
      await db.productImages.delete(imageId);
      return true;
    } catch (error) {
      console.error('Error deleting product image:', error);
      return false;
    }
  },

  // Get product videos
  async getProductVideos(productId) {
    try {
      return await db.productVideos
        .where('productId')
        .equals(productId)
        .orderBy('createdAt')
        .reverse()
        .toArray();
    } catch (error) {
      console.error('Error getting product videos:', error);
      return [];
    }
  },

  // Add product video
  async addProductVideo(videoData) {
    try {
      const id = await db.productVideos.add({
        ...videoData,
        createdAt: new Date(),
        lastUpdated: new Date()
      });
      return id;
    } catch (error) {
      console.error('Error adding product video:', error);
      throw error;
    }
  }
};

// Content blocks management functions
export const contentBlocksService = {
  // Get content blocks by page section
  async getContentBlocks(pageSection = null) {
    try {
      let query = db.contentBlocks.where('isActive').equals(true);
      
      if (pageSection) {
        query = query.and(block => block.pageSection === pageSection);
      }
      
      return await query.orderBy('displayOrder').toArray();
    } catch (error) {
      console.error('Error getting content blocks:', error);
      return [];
    }
  },

  // Create or update content block
  async createOrUpdateContentBlock(blockData) {
    try {
      if (blockData.id) {
        await db.contentBlocks.update(blockData.id, {
          ...blockData,
          lastUpdated: new Date()
        });
        return blockData.id;
      } else {
        const id = await db.contentBlocks.add({
          ...blockData,
          createdAt: new Date(),
          lastUpdated: new Date()
        });
        return id;
      }
    } catch (error) {
      console.error('Error creating/updating content block:', error);
      throw error;
    }
  },

  // Delete content block
  async deleteContentBlock(blockId) {
    try {
      await db.contentBlocks.delete(blockId);
      return true;
    } catch (error) {
      console.error('Error deleting content block:', error);
      return false;
    }
  }
};
