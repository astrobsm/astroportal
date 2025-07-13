import { apiService, checkOnlineStatus } from './apiService';
import {
  db,
  orderService,
  customerService,
  productService,
  notificationService,
  getPendingSyncItems,
  removeFromSyncQueue,
  addToSyncQueue
} from './indexedDB';
import { toast } from 'react-toastify';

class SyncService {
  constructor() {
    this.isSyncing = false;
    this.lastSyncTime = localStorage.getItem('lastSyncTime') || null;
    this.syncInterval = null;
    
    // Start periodic sync when online
    this.startPeriodicSync();
    
    // Listen for online events
    window.addEventListener('online', () => {
      this.handleOnlineEvent();
    });
  }
  
  // Start periodic sync every 5 minutes when online
  startPeriodicSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    
    this.syncInterval = setInterval(async () => {
      if (navigator.onLine) {
        await this.syncData();
      }
    }, 5 * 60 * 1000); // 5 minutes
  }
  
  // Handle when device comes online
  async handleOnlineEvent() {
    toast.info('Connection restored. Syncing data...', {
      position: 'top-center',
      autoClose: 3000
    });
    
    // Wait a moment for connection to stabilize
    setTimeout(() => {
      this.syncData();
    }, 2000);
  }
  
  // Main sync function
  async syncData() {
    if (this.isSyncing) {
      console.log('Sync already in progress');
      return;
    }
    
    this.isSyncing = true;
    
    try {
      // Check if we're actually online
      const isOnline = await checkOnlineStatus();
      if (!isOnline) {
        console.log('Not online, skipping sync');
        return;
      }
      
      console.log('Starting data synchronization...');
      
      // Upload pending changes first
      await this.uploadPendingChanges();
      
      // Download updates from server
      await this.downloadUpdates();
      
      // Update last sync time
      this.lastSyncTime = new Date().toISOString();
      localStorage.setItem('lastSyncTime', this.lastSyncTime);
      
      console.log('Data synchronization completed');
      
      // Show success notification
      toast.success('Data synchronized successfully', {
        position: 'bottom-right',
        autoClose: 3000
      });
      
    } catch (error) {
      console.error('Sync failed:', error);
      
      toast.error('Sync failed. Will retry later.', {
        position: 'bottom-right',
        autoClose: 5000
      });
    } finally {
      this.isSyncing = false;
    }
  }
  
  // Upload pending changes to server
  async uploadPendingChanges() {
    try {
      const pendingItems = await getPendingSyncItems();
      
      if (pendingItems.length === 0) {
        console.log('No pending changes to upload');
        return;
      }
      
      console.log(`Uploading ${pendingItems.length} pending changes...`);
      
      for (const item of pendingItems) {
        try {
          await this.uploadSingleItem(item);
          await removeFromSyncQueue(item.id);
        } catch (error) {
          console.error('Failed to upload item:', item, error);
          
          // Increment retry count
          await db.syncQueue.update(item.id, {
            retryCount: (item.retryCount || 0) + 1
          });
          
          // Remove from queue if too many retries
          if ((item.retryCount || 0) >= 3) {
            console.log('Removing item from sync queue after 3 failed attempts:', item);
            await removeFromSyncQueue(item.id);
          }
        }
      }
      
    } catch (error) {
      console.error('Error uploading pending changes:', error);
      throw error;
    }
  }
  
  // Upload a single item to server
  async uploadSingleItem(item) {
    const { tableName, operation, data } = item;
    
    switch (tableName) {
      case 'orders':
        if (operation === 'create') {
          await apiService.orders.create(data);
        } else if (operation === 'update') {
          await apiService.orders.update(data.id, data);
        } else if (operation === 'delete') {
          await apiService.orders.delete(data.id);
        }
        break;
        
      case 'customers':
        if (operation === 'create') {
          await apiService.customers.create(data);
        } else if (operation === 'update') {
          await apiService.customers.update(data.id, data);
        }
        break;
        
      case 'products':
        if (operation === 'create') {
          await apiService.products.create(data);
        } else if (operation === 'update') {
          await apiService.products.update(data.id, data);
        } else if (operation === 'delete') {
          await apiService.products.delete(data.id);
        }
        break;
        
      default:
        console.warn('Unknown table name for sync:', tableName);
    }
  }
  
  // Download updates from server
  async downloadUpdates() {
    try {
      console.log('Downloading updates from server...');
      
      // Download updates since last sync
      const updates = await apiService.sync.downloadUpdates(this.lastSyncTime);
      
      if (!updates || Object.keys(updates).length === 0) {
        console.log('No updates to download');
        return;
      }
      
      // Apply updates to local database
      await this.applyUpdates(updates);
      
    } catch (error) {
      console.error('Error downloading updates:', error);
      throw error;
    }
  }
  
  // Apply downloaded updates to local database
  async applyUpdates(updates) {
    try {
      // Update orders
      if (updates.orders && updates.orders.length > 0) {
        for (const order of updates.orders) {
          await db.orders.put({
            ...order,
            syncStatus: 'synced',
            lastUpdated: new Date(order.lastUpdated)
          });
        }
        console.log(`Updated ${updates.orders.length} orders`);
      }
      
      // Update customers
      if (updates.customers && updates.customers.length > 0) {
        for (const customer of updates.customers) {
          await db.customers.put({
            ...customer,
            lastUpdated: new Date(customer.lastUpdated)
          });
        }
        console.log(`Updated ${updates.customers.length} customers`);
      }
      
      // Update products
      if (updates.products && updates.products.length > 0) {
        for (const product of updates.products) {
          await db.products.put({
            ...product,
            lastUpdated: new Date(product.lastUpdated)
          });
        }
        console.log(`Updated ${updates.products.length} products`);
      }
      
      // Update notifications
      if (updates.notifications && updates.notifications.length > 0) {
        for (const notification of updates.notifications) {
          await db.notifications.put({
            ...notification,
            createdAt: new Date(notification.createdAt)
          });
        }
        console.log(`Updated ${updates.notifications.length} notifications`);
      }
      
    } catch (error) {
      console.error('Error applying updates:', error);
      throw error;
    }
  }
  
  // Force sync (manual trigger)
  async forcSync() {
    if (this.isSyncing) {
      toast.warning('Sync already in progress', {
        position: 'top-center',
        autoClose: 3000
      });
      return;
    }
    
    const isOnline = await checkOnlineStatus();
    if (!isOnline) {
      toast.error('Cannot sync while offline', {
        position: 'top-center',
        autoClose: 3000
      });
      return;
    }
    
    toast.info('Starting manual sync...', {
      position: 'top-center',
      autoClose: 2000
    });
    
    await this.syncData();
  }
  
  // Get sync status
  getSyncStatus() {
    return {
      isSyncing: this.isSyncing,
      lastSyncTime: this.lastSyncTime,
      hasLastSync: !!this.lastSyncTime
    };
  }
  
  // Reset sync data (for testing)
  resetSyncData() {
    localStorage.removeItem('lastSyncTime');
    this.lastSyncTime = null;
    
    toast.info('Sync data reset', {
      position: 'top-center',
      autoClose: 3000
    });
  }
  
  // Stop sync service
  stop() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }
}

// Create and export singleton instance
export const syncService = new SyncService();

// Export class for testing
export { SyncService };
