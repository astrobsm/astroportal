import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import pkg from 'pg';
import { initializeDatabase } from './database/initDatabase.js';
const { Pool } = pkg;

// ES modules dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// For ES modules, we'll use environment variables directly or set them in the system

const app = express();
const PORT = process.env.PORT || 3001;

// Database connection with optimized pool settings
const pool = new Pool({
  user: process.env.POSTGRES_USER || process.env.DB_USER || 'postgres',
  host: process.env.POSTGRES_HOST || process.env.DB_HOST || 'localhost',
  database: process.env.POSTGRES_DB || process.env.DB_NAME || 'astro_bsm_portal',
  password: process.env.POSTGRES_PASSWORD || process.env.DB_PASSWORD || 'natiss_natiss',
  port: process.env.POSTGRES_PORT || process.env.DB_PORT || 5432,
  // Connection pool optimization
  max: 20, // Maximum number of clients in the pool
  min: 2,  // Minimum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 10000, // Increased timeout for remote DB
  maxUses: 7500, // Close (and replace) a connection after it has been used 7500 times
  // SSL configuration for Digital Ocean managed database
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  // Enable keep-alive for better performance
  keepAlive: true,
  keepAliveInitialDelayMs: 10000
});

// Middleware
app.use(cors());
app.use(express.json());

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, '../dist')));

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.originalname);
    cb(null, 'product-' + uniqueSuffix + fileExtension);
  }
});

// File filter for images only
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Simple session storage (in production, use Redis or database)
const adminSessions = new Set();

// Admin authentication middleware
const requireAdminAuth = (req, res, next) => {
  console.log('🔐 Auth check for:', req.method, req.path);
  
  const authHeader = req.headers.authorization;
  console.log('📋 Auth header:', authHeader ? 'Present' : 'Missing');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('❌ No valid auth header');
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  const token = authHeader.substring(7);
  console.log('🎫 Token:', token.substring(0, 10) + '...');
  
  if (!adminSessions.has(token)) {
    console.log('❌ Invalid token - not in sessions');
    console.log('📝 Active sessions:', Array.from(adminSessions).map(t => t.substring(0, 10) + '...'));
    return res.status(401).json({ error: 'Invalid or expired session' });
  }
  
  console.log('✅ Auth passed');
  next();
};

// Generate simple session token
const generateSessionToken = () => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

// Enhanced database connection testing and monitoring
const testDatabaseConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('🔗 Database connected successfully');
    
    // Test query to verify connection
    const result = await client.query('SELECT NOW() as current_time, version() as postgres_version');
    console.log('📊 Database Info:', {
      time: result.rows[0].current_time,
      version: result.rows[0].postgres_version.split(' ')[0] + ' ' + result.rows[0].postgres_version.split(' ')[1]
    });
    
    // Check connection pool status
    console.log('🏊 Connection Pool Status:', {
      total: pool.totalCount,
      idle: pool.idleCount,
      waiting: pool.waitingCount
    });
    
    // Check if all required tables exist
    const tableCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    const existingTables = tableCheck.rows.map(row => row.table_name);
    const requiredTables = ['users', 'products', 'orders', 'events', 'slideshow_images', 'testimonials', 'faqs'];
    const missingTables = requiredTables.filter(table => !existingTables.includes(table));
    
    if (missingTables.length > 0) {
      console.log('📋 Missing tables detected:', missingTables);
      console.log('� Initializing database schema...');
      
      // Run database initialization
      const initSuccess = await initializeDatabase(pool);
      if (initSuccess) {
        console.log('✅ Database schema initialized successfully');
      } else {
        console.error('❌ Database schema initialization failed');
      }
    } else {
      console.log('✅ All required tables exist');
    }
    
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    return false;
  }
};

// Enhanced pool event handlers
pool.on('connect', (client) => {
  console.log('🔌 New client connected to database');
});

pool.on('error', (err, client) => {
  console.error('💥 Unexpected error on idle client', err);
  process.exit(-1);
});

pool.on('acquire', (client) => {
  console.log('📥 Client acquired from pool');
});

pool.on('release', (client) => {
  console.log('📤 Client released back to pool');
});

// Test database connection on startup
testDatabaseConnection();

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Admin authentication routes
app.post('/api/admin/login', (req, res) => {
  try {
    const { password } = req.body;
    
    if (password !== 'natiss_natiss') {
      return res.status(401).json({ error: 'Invalid password' });
    }
    
    const token = generateSessionToken();
    adminSessions.add(token);
    
    // Auto-expire session after 24 hours
    setTimeout(() => {
      adminSessions.delete(token);
    }, 24 * 60 * 60 * 1000);
    
    res.json({ 
      success: true, 
      token,
      message: 'Admin login successful',
      expiresIn: '24h'
    });
  } catch (error) {
    console.error('Error during admin login:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/admin/logout', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      adminSessions.delete(token);
    }
    
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Error during admin logout:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

app.get('/api/admin/verify', requireAdminAuth, (req, res) => {
  res.json({ valid: true, message: 'Admin session is valid' });
});

// ============ USER MANAGEMENT APIS ============

// User authentication middleware
const requireUserAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No valid authorization token provided' });
    }

    const token = authHeader.substring(7);
    
    // Check if token exists in user_sessions
    const sessionResult = await pool.query(
      'SELECT us.*, u.id as user_id, u.role, u.status FROM user_sessions us JOIN users u ON us.user_id = u.id WHERE us.session_token = $1 AND us.expires_at > NOW()',
      [token]
    );

    if (sessionResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    const session = sessionResult.rows[0];
    
    // Check if user is approved
    if (session.status !== 'approved') {
      return res.status(403).json({ error: 'Account not approved' });
    }

    // Update last accessed time
    await pool.query(
      'UPDATE user_sessions SET last_accessed = NOW() WHERE session_token = $1',
      [token]
    );

    req.user = {
      id: session.user_id,
      role: session.role,
      status: session.status
    };
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

// User registration
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone, role, profileData } = req.body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate role
    if (!['manager', 'marketer'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be manager or marketer' });
    }

    // Check if user already exists
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    // Hash password (in production, use bcrypt)
    const passwordHash = `$2b$10$hash_${password}_placeholder`; // Replace with proper bcrypt

    // Create username from email
    const username = email.split('@')[0];

    // Insert user
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, username, phone, role, status, profile_data)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', $8)
       RETURNING id, email, first_name, last_name, role, status, created_at`,
      [email, passwordHash, firstName, lastName, username, phone, role, JSON.stringify(profileData || {})]
    );

    res.status(201).json({
      message: 'Registration successful. Please wait for admin approval.',
      user: result.rows[0]
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// User login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const userResult = await pool.query(
      'SELECT id, email, password_hash, first_name, last_name, role, status FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = userResult.rows[0];

    // Check password (in production, use bcrypt.compare)
    const isValidPassword = user.password_hash.includes(password); // Replace with proper bcrypt check

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if user is approved
    if (user.status !== 'approved') {
      return res.status(403).json({ 
        error: 'Account not approved', 
        status: user.status,
        message: user.status === 'pending' ? 'Your account is pending approval' : 
                 user.status === 'rejected' ? 'Your account has been rejected' :
                 'Your account has been suspended'
      });
    }

    // Generate session token
    const sessionToken = generateSessionToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Save session
    await pool.query(
      'INSERT INTO user_sessions (user_id, session_token, expires_at) VALUES ($1, $2, $3)',
      [user.id, sessionToken, expiresAt]
    );

    // Update last login
    await pool.query(
      'UPDATE users SET last_login = NOW() WHERE id = $1',
      [user.id]
    );

    res.json({
      token: sessionToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        status: user.status
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// User logout
app.post('/api/auth/logout', requireUserAuth, async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader.substring(7);

    await pool.query('DELETE FROM user_sessions WHERE session_token = $1', [token]);
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

// Get current user profile
app.get('/api/auth/profile', requireUserAuth, async (req, res) => {
  try {
    const userResult = await pool.query(
      'SELECT id, email, first_name, last_name, username, phone, role, status, profile_data, created_at, last_login FROM users WHERE id = $1',
      [req.user.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(userResult.rows[0]);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Admin: Get all users for approval
app.get('/api/admin/users', requireAdminAuth, async (req, res) => {
  try {
    const { status, role } = req.query;
    let query = 'SELECT id, email, first_name, last_name, username, phone, role, status, profile_data, created_at, approved_at FROM users WHERE role != $1';
    const params = ['admin'];

    if (status) {
      query += ' AND status = $2';
      params.push(status);
    }

    if (role) {
      const roleIndex = params.length + 1;
      query += ` AND role = $${roleIndex}`;
      params.push(role);
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Admin: Approve/reject user
app.put('/api/admin/users/:id/status', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['approved', 'rejected', 'suspended'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const updateFields = ['status = $1'];
    const params = [status, id];

    if (status === 'approved') {
      updateFields.push('approved_at = NOW()');
      updateFields.push('approved_by = $3');
      params.splice(2, 0, req.admin.id || 1); // Use admin ID from session
    }

    const query = `UPDATE users SET ${updateFields.join(', ')} WHERE id = $${params.length} AND role != 'admin' RETURNING *`;

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: `User ${status} successfully`,
      user: result.rows[0]
    });

  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ error: 'Failed to update user status' });
  }
});

// Activity routes
app.get('/api/activities', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM activities ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

app.post('/api/activities', requireAdminAuth, async (req, res) => {
  try {
    const { type, description, user_id, order_id } = req.body;
    
    const result = await pool.query(
      'INSERT INTO activities (type, description, user_id, order_id, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING *',
      [type, description, user_id, order_id]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating activity:', error);
    res.status(500).json({ error: 'Failed to create activity' });
  }
});

// Orders routes
app.get('/api/orders', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT o.*, c.name as customer_name, c.email as customer_email 
      FROM orders o 
      JOIN customers c ON o.customer_id = c.id 
      ORDER BY o.created_at DESC
    `);
    
    // Parse products JSON
    const orders = result.rows.map(order => ({
      ...order,
      products: JSON.parse(order.products)
    }));
    
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

app.get('/api/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT o.*, c.name as customer_name, c.email as customer_email 
      FROM orders o 
      JOIN customers c ON o.customer_id = c.id 
      WHERE o.id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    const order = {
      ...result.rows[0],
      products: JSON.parse(result.rows[0].products)
    };
    
    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

app.get('/api/orders/customer/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;
    const result = await pool.query(`
      SELECT o.*, c.name as customer_name, c.email as customer_email 
      FROM orders o 
      JOIN customers c ON o.customer_id = c.id 
      WHERE o.customer_id = $1 
      ORDER BY o.created_at DESC
    `, [customerId]);
    
    const orders = result.rows.map(order => ({
      ...order,
      products: JSON.parse(order.products)
    }));
    
    res.json(orders);
  } catch (error) {
    console.error('Error fetching customer orders:', error);
    res.status(500).json({ error: 'Failed to fetch customer orders' });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const { customer_id, products, delivery_method, customer_address } = req.body;
    
    const result = await pool.query(`
      INSERT INTO orders (customer_id, products, delivery_method, customer_address, status, created_at, updated_at) 
      VALUES ($1, $2, $3, $4, 'pending', NOW(), NOW()) 
      RETURNING *
    `, [customer_id, JSON.stringify(products), delivery_method, customer_address]);
    
    // Create notification for new order
    await pool.query(`
      INSERT INTO notifications (type, title, message, is_read, created_at) 
      VALUES ('new_order', 'New Order Received', $1, false, NOW())
    `, [`New order #${result.rows[0].id} received`]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

app.put('/api/orders/:id', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, delivery_method, customer_address } = req.body;
    
    const result = await pool.query(`
      UPDATE orders 
      SET status = COALESCE($1, status), 
          delivery_method = COALESCE($2, delivery_method), 
          customer_address = COALESCE($3, customer_address),
          updated_at = NOW() 
      WHERE id = $4 
      RETURNING *
    `, [status, delivery_method, customer_address, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

// ============ USER ACTIVITIES & ORDER ASSIGNMENTS ============

// Get user activities
app.get('/api/activities', requireUserAuth, async (req, res) => {
  try {
    const { status, type } = req.query;
    let query = 'SELECT * FROM user_activities WHERE user_id = $1';
    const params = [req.user.id];

    if (status) {
      query += ' AND status = $2';
      params.push(status);
    }

    if (type) {
      const typeIndex = params.length + 1;
      query += ` AND activity_type = $${typeIndex}`;
      params.push(type);
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

// Create user activity
app.post('/api/activities', requireUserAuth, async (req, res) => {
  try {
    const { activityType, title, description, priority, dueDate, activityData } = req.body;

    if (!activityType || !title) {
      return res.status(400).json({ error: 'Activity type and title are required' });
    }

    const result = await pool.query(
      `INSERT INTO user_activities (user_id, activity_type, title, description, priority, due_date, activity_data)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [req.user.id, activityType, title, description, priority || 'medium', dueDate, JSON.stringify(activityData || {})]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating activity:', error);
    res.status(500).json({ error: 'Failed to create activity' });
  }
});

// Update user activity
app.put('/api/activities/:id', requireUserAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, title, description, priority, dueDate, completedDate, notes, activityData } = req.body;

    // Build dynamic update query
    const updates = [];
    const params = [];
    let paramIndex = 1;

    if (status !== undefined) {
      updates.push(`status = $${paramIndex++}`);
      params.push(status);
    }
    if (title !== undefined) {
      updates.push(`title = $${paramIndex++}`);
      params.push(title);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      params.push(description);
    }
    if (priority !== undefined) {
      updates.push(`priority = $${paramIndex++}`);
      params.push(priority);
    }
    if (dueDate !== undefined) {
      updates.push(`due_date = $${paramIndex++}`);
      params.push(dueDate);
    }
    if (completedDate !== undefined) {
      updates.push(`completed_date = $${paramIndex++}`);
      params.push(completedDate);
    }
    if (notes !== undefined) {
      updates.push(`notes = $${paramIndex++}`);
      params.push(notes);
    }
    if (activityData !== undefined) {
      updates.push(`activity_data = $${paramIndex++}`);
      params.push(JSON.stringify(activityData));
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push(`updated_at = NOW()`);
    params.push(req.user.id);
    params.push(id);

    const query = `UPDATE user_activities SET ${updates.join(', ')} WHERE user_id = $${paramIndex++} AND id = $${paramIndex} RETURNING *`;

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating activity:', error);
    res.status(500).json({ error: 'Failed to update activity' });
  }
});

// Get order assignments for current user
app.get('/api/assignments', requireUserAuth, async (req, res) => {
  try {
    const { status } = req.query;
    let query = `
      SELECT oa.*, o.customer_address, o.status as order_status, o.products,
             c.name as customer_name, c.email as customer_email, c.phone as customer_phone
      FROM order_assignments oa
      JOIN orders o ON oa.order_id = o.id
      LEFT JOIN customers c ON o.customer_id = c.id
      WHERE oa.assigned_to = $1
    `;
    const params = [req.user.id];

    if (status) {
      query += ' AND oa.status = $2';
      params.push(status);
    }

    query += ' ORDER BY oa.assigned_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
});

// Update assignment status
app.put('/api/assignments/:id', requireUserAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const updates = ['status = $1', 'updated_at = NOW()'];
    const params = [status];
    let paramIndex = 2;

    if (notes !== undefined) {
      updates.push(`notes = $${paramIndex++}`);
      params.push(notes);
    }

    if (status === 'accepted') {
      updates.push(`accepted_at = NOW()`);
    } else if (status === 'completed') {
      updates.push(`completed_at = NOW()`);
    }

    params.push(req.user.id);
    params.push(id);

    const query = `UPDATE order_assignments SET ${updates.join(', ')} WHERE assigned_to = $${paramIndex++} AND id = $${paramIndex} RETURNING *`;

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating assignment:', error);
    res.status(500).json({ error: 'Failed to update assignment' });
  }
});

// Admin: Create order assignment
app.post('/api/admin/assignments', requireAdminAuth, async (req, res) => {
  try {
    const { orderId, assignedTo, assignmentType, notes } = req.body;

    if (!orderId || !assignedTo) {
      return res.status(400).json({ error: 'Order ID and assigned user are required' });
    }

    // Verify order exists
    const orderCheck = await pool.query('SELECT id FROM orders WHERE id = $1', [orderId]);
    if (orderCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Verify user exists and is approved
    const userCheck = await pool.query('SELECT id, role FROM users WHERE id = $1 AND status = $2', [assignedTo, 'approved']);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: 'User not found or not approved' });
    }

    const result = await pool.query(
      `INSERT INTO order_assignments (order_id, assigned_to, assigned_by, assignment_type, notes)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [orderId, assignedTo, req.admin?.id || 1, assignmentType || 'delivery', notes]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating assignment:', error);
    res.status(500).json({ error: 'Failed to create assignment' });
  }
});

// Get all approved users (for assignment dropdown)
app.get('/api/users/approved', requireAdminAuth, async (req, res) => {
  try {
    const { role } = req.query;
    let query = 'SELECT id, first_name, last_name, email, role FROM users WHERE status = $1 AND role != $2';
    const params = ['approved', 'admin'];

    if (role) {
      query += ' AND role = $3';
      params.push(role);
    }

    query += ' ORDER BY first_name, last_name';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching approved users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// ============ CUSTOMER INTERACTIONS ============

// Get customer interactions for current user
app.get('/api/interactions', requireUserAuth, async (req, res) => {
  try {
    const { customerId } = req.query;
    let query = `
      SELECT ci.*, c.name as customer_name, c.email as customer_email 
      FROM customer_interactions ci
      JOIN customers c ON ci.customer_id = c.id
      WHERE ci.user_id = $1
    `;
    const params = [req.user.id];

    if (customerId) {
      query += ' AND ci.customer_id = $2';
      params.push(customerId);
    }

    query += ' ORDER BY ci.created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching interactions:', error);
    res.status(500).json({ error: 'Failed to fetch interactions' });
  }
});

// Create customer interaction
app.post('/api/interactions', requireUserAuth, async (req, res) => {
  try {
    const { customerId, interactionType, subject, description, outcome, followUpRequired, followUpDate } = req.body;

    if (!customerId || !interactionType) {
      return res.status(400).json({ error: 'Customer ID and interaction type are required' });
    }

    const result = await pool.query(
      `INSERT INTO customer_interactions (customer_id, user_id, interaction_type, subject, description, outcome, follow_up_required, follow_up_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [customerId, req.user.id, interactionType, subject, description, outcome, followUpRequired, followUpDate]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating interaction:', error);
    res.status(500).json({ error: 'Failed to create interaction' });
  }
});

// Products routes
app.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

app.post('/api/products', requireAdminAuth, async (req, res) => {
  try {
    const { name, description, category, inStock } = req.body;
    
    const result = await pool.query(
      'INSERT INTO products (name, description, category, in_stock, created_at, updated_at) VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING *',
      [name, description, category, inStock]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Product Images routes
app.get('/api/products/:productId/images', async (req, res) => {
  try {
    const { productId } = req.params;
    const result = await pool.query(
      'SELECT * FROM product_images WHERE product_id = $1 ORDER BY is_primary DESC, display_order ASC',
      [productId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching product images:', error);
    res.status(500).json({ error: 'Failed to fetch product images' });
  }
});

app.post('/api/products/:productId/images', requireAdminAuth, async (req, res) => {
  try {
    const { productId } = req.params;
    const { image_url, alt_text, is_primary, display_order } = req.body;
    
    // If this is primary, unset other primary images
    if (is_primary) {
      await pool.query('UPDATE product_images SET is_primary = false WHERE product_id = $1', [productId]);
    }
    
    const result = await pool.query(
      'INSERT INTO product_images (product_id, image_url, alt_text, is_primary, display_order) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [productId, image_url, alt_text, is_primary, display_order]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding product image:', error);
    res.status(500).json({ error: 'Failed to add product image' });
  }
});

app.delete('/api/products/images/:imageId', requireAdminAuth, async (req, res) => {
  try {
    const { imageId } = req.params;
    const result = await pool.query('DELETE FROM product_images WHERE id = $1 RETURNING *', [imageId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Image not found' });
    }
    
    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Error deleting product image:', error);
    res.status(500).json({ error: 'Failed to delete product image' });
  }
});

// File upload endpoint for product images
app.post('/api/products/:productId/upload-image', requireAdminAuth, upload.single('image'), async (req, res) => {
  console.log('📸 Upload request received for product:', req.params.productId);
  console.log('📁 File info:', req.file ? req.file.filename : 'No file');
  console.log('🔐 Auth header:', req.headers.authorization ? 'Present' : 'Missing');
  
  try {
    const { productId } = req.params;
    
    if (!req.file) {
      console.log('❌ No file provided in request');
      return res.status(400).json({ error: 'No image file provided' });
    }
    
    console.log('✅ File received:', req.file.filename, req.file.size, 'bytes');
    
    const imageUrl = `/uploads/${req.file.filename}`;
    const altText = req.body.alt_text || `${req.body.product_name || 'Product'} image`;
    const isPrimary = req.body.is_primary === 'true' || false;
    const displayOrder = parseInt(req.body.display_order) || 0;
    
    // If this is primary, unset other primary images
    if (isPrimary) {
      await pool.query('UPDATE product_images SET is_primary = false WHERE product_id = $1', [productId]);
    }
    
    const result = await pool.query(
      'INSERT INTO product_images (product_id, image_url, alt_text, is_primary, display_order) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [productId, imageUrl, altText, isPrimary, displayOrder]
    );
    
    console.log('💾 Image saved to database with ID:', result.rows[0].id);
    
    res.status(201).json({
      ...result.rows[0],
      file_info: {
        originalName: req.file.originalname,
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    });
  } catch (error) {
    console.error('❌ Error uploading product image:', error);
    
    // Clean up uploaded file if database insertion failed
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error cleaning up uploaded file:', unlinkError);
      }
    }
    
    res.status(500).json({ error: 'Failed to upload product image' });
  }
});

// Product Videos routes
app.get('/api/products/:productId/videos', async (req, res) => {
  try {
    const { productId } = req.params;
    const result = await pool.query(
      'SELECT * FROM product_videos WHERE product_id = $1 ORDER BY is_featured DESC, created_at DESC',
      [productId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching product videos:', error);
    res.status(500).json({ error: 'Failed to fetch product videos' });
  }
});

app.post('/api/products/:productId/videos', requireAdminAuth, async (req, res) => {
  try {
    const { productId } = req.params;
    const { video_url, video_type, title, description, thumbnail_url, duration, is_featured } = req.body;
    
    const result = await pool.query(
      'INSERT INTO product_videos (product_id, video_url, video_type, title, description, thumbnail_url, duration, is_featured) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [productId, video_url, video_type, title, description, thumbnail_url, duration, is_featured]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding product video:', error);
    res.status(500).json({ error: 'Failed to add product video' });
  }
});

// Customers routes
app.get('/api/customers', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM customers ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

app.get('/api/customers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM customers WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
});

app.get('/api/customers/email/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const result = await pool.query('SELECT * FROM customers WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching customer by email:', error);
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
});

app.post('/api/customers', async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;
    
    // Check if customer already exists
    const existingCustomer = await pool.query('SELECT * FROM customers WHERE email = $1', [email]);
    
    if (existingCustomer.rows.length > 0) {
      // Update existing customer
      const result = await pool.query(
        'UPDATE customers SET name = $1, phone = $2, address = $3, updated_at = NOW() WHERE email = $4 RETURNING *',
        [name, phone, address, email]
      );
      return res.json(result.rows[0]);
    }
    
    // Create new customer
    const result = await pool.query(
      'INSERT INTO customers (name, email, phone, address, created_at, updated_at) VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING *',
      [name, email, phone, address]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ error: 'Failed to create customer' });
  }
});

// Notifications routes
app.get('/api/notifications', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM notifications ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

app.put('/api/notifications/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'UPDATE notifications SET is_read = true WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating notification:', error);
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

app.get('/api/notifications/unread-count', async (req, res) => {
  try {
    const result = await pool.query('SELECT COUNT(*) FROM notifications WHERE is_read = false');
    res.json({ count: parseInt(result.rows[0].count) });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
});

// Sync routes
app.post('/api/sync/upload', async (req, res) => {
  try {
    const { syncData } = req.body;
    // Process sync data upload
    // This would typically handle offline data synchronization
    res.json({ success: true, message: 'Data synced successfully' });
  } catch (error) {
    console.error('Error uploading sync data:', error);
    res.status(500).json({ error: 'Failed to upload sync data' });
  }
});

app.get('/api/sync/download', async (req, res) => {
  try {
    const { lastSync } = req.query;
    
    // Fetch updates since lastSync
    const updates = {
      orders: [],
      customers: [],
      products: [],
      notifications: []
    };
    
    if (lastSync && lastSync !== 'null' && !isNaN(new Date(lastSync).getTime())) {
      const syncDate = new Date(lastSync);
      
      // Fetch updated orders
      const ordersResult = await pool.query(
        'SELECT * FROM orders WHERE updated_at > $1',
        [syncDate]
      );
      updates.orders = ordersResult.rows.map(order => ({
        ...order,
        products: typeof order.products === 'string' ? JSON.parse(order.products) : order.products
      }));
      
      // Fetch updated customers
      const customersResult = await pool.query(
        'SELECT * FROM customers WHERE updated_at > $1',
        [syncDate]
      );
      updates.customers = customersResult.rows;
      
      // Fetch updated products
      const productsResult = await pool.query(
        'SELECT * FROM products WHERE updated_at > $1',
        [syncDate]
      );
      updates.products = productsResult.rows;
      
      // Fetch new notifications
      const notificationsResult = await pool.query(
        'SELECT * FROM notifications WHERE created_at > $1',
        [syncDate]
      );
      updates.notifications = notificationsResult.rows;
    } else {
      // If no lastSync or invalid date, return all data
      const [ordersResult, customersResult, productsResult, notificationsResult] = await Promise.all([
        pool.query('SELECT * FROM orders ORDER BY created_at DESC'),
        pool.query('SELECT * FROM customers ORDER BY created_at DESC'),
        pool.query('SELECT * FROM products ORDER BY created_at DESC'),
        pool.query('SELECT * FROM notifications ORDER BY created_at DESC')
      ]);
      
      updates.orders = ordersResult.rows.map(order => ({
        ...order,
        products: typeof order.products === 'string' ? JSON.parse(order.products) : order.products
      }));
      updates.customers = customersResult.rows;
      updates.products = productsResult.rows;
      updates.notifications = notificationsResult.rows;
    }
    
    res.json(updates);
  } catch (error) {
    console.error('Error downloading updates:', error);
    res.status(500).json({ error: 'Failed to download updates' });
  }
});

// Distributors routes
app.get('/api/distributors', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM distributors WHERE is_active = true ORDER BY region');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching distributors:', error);
    res.status(500).json({ error: 'Failed to fetch distributors' });
  }
});

app.get('/api/distributors/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM distributors WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Distributor not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching distributor:', error);
    res.status(500).json({ error: 'Failed to fetch distributor' });
  }
});

app.post('/api/distributors', requireAdminAuth, async (req, res) => {
  try {
    const { name, region, contact_person, phone, email, address, coverage_areas, specialties } = req.body;
    
    const result = await pool.query(
      'INSERT INTO distributors (name, region, contact_person, phone, email, address, coverage_areas, specialties, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()) RETURNING *',
      [name, region, contact_person, phone, email, address, coverage_areas, specialties]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating distributor:', error);
    res.status(500).json({ error: 'Failed to create distributor' });
  }
});

app.put('/api/distributors/:id', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, region, contact_person, phone, email, address, coverage_areas, specialties, is_active } = req.body;
    
    const result = await pool.query(`
      UPDATE distributors 
      SET name = COALESCE($1, name), 
          region = COALESCE($2, region), 
          contact_person = COALESCE($3, contact_person),
          phone = COALESCE($4, phone),
          email = COALESCE($5, email),
          address = COALESCE($6, address),
          coverage_areas = COALESCE($7, coverage_areas),
          specialties = COALESCE($8, specialties),
          is_active = COALESCE($9, is_active),
          updated_at = NOW() 
      WHERE id = $10 
      RETURNING *
    `, [name, region, contact_person, phone, email, address, coverage_areas, specialties, is_active, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Distributor not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating distributor:', error);
    res.status(500).json({ error: 'Failed to update distributor' });
  }
});

// Events routes
app.get('/api/events', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM events WHERE is_active = true ORDER BY start_date ASC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

app.post('/api/events', requireAdminAuth, async (req, res) => {
  try {
    const { title, description, event_type, start_date, end_date, banner_image_url, banner_text, action_url, action_text, display_order } = req.body;
    
    const result = await pool.query(
      'INSERT INTO events (title, description, event_type, start_date, end_date, banner_image_url, banner_text, action_url, action_text, display_order) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
      [title, description, event_type, start_date, end_date, banner_image_url, banner_text, action_url, action_text, display_order]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

app.put('/api/events/:id', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, event_type, start_date, end_date, banner_image_url, banner_text, action_url, action_text, is_active, display_order } = req.body;
    
    const result = await pool.query(`
      UPDATE events 
      SET title = COALESCE($1, title),
          description = COALESCE($2, description),
          event_type = COALESCE($3, event_type),
          start_date = COALESCE($4, start_date),
          end_date = COALESCE($5, end_date),
          banner_image_url = COALESCE($6, banner_image_url),
          banner_text = COALESCE($7, banner_text),
          action_url = COALESCE($8, action_url),
          action_text = COALESCE($9, action_text),
          is_active = COALESCE($10, is_active),
          display_order = COALESCE($11, display_order),
          updated_at = NOW()
      WHERE id = $12 
      RETURNING *
    `, [title, description, event_type, start_date, end_date, banner_image_url, banner_text, action_url, action_text, is_active, display_order, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

// Content Blocks routes
app.get('/api/content-blocks', async (req, res) => {
  try {
    const { page_section } = req.query;
    let query = 'SELECT * FROM content_blocks WHERE is_active = true';
    let params = [];
    
    if (page_section) {
      query += ' AND page_section = $1';
      params.push(page_section);
    }
    
    query += ' ORDER BY display_order ASC';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching content blocks:', error);
    res.status(500).json({ error: 'Failed to fetch content blocks' });
  }
});

app.post('/api/content-blocks', requireAdminAuth, async (req, res) => {
  try {
    const { block_type, title, content, page_section, display_order } = req.body;
    
    const result = await pool.query(
      'INSERT INTO content_blocks (block_type, title, content, page_section, display_order) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [block_type, title, JSON.stringify(content), page_section, display_order]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating content block:', error);
    res.status(500).json({ error: 'Failed to create content block' });
  }
});

app.put('/api/content-blocks/:id', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { block_type, title, content, is_active, display_order, page_section } = req.body;
    
    const result = await pool.query(`
      UPDATE content_blocks 
      SET block_type = COALESCE($1, block_type),
          title = COALESCE($2, title),
          content = COALESCE($3, content),
          is_active = COALESCE($4, is_active),
          display_order = COALESCE($5, display_order),
          page_section = COALESCE($6, page_section),
          updated_at = NOW()
      WHERE id = $7 
      RETURNING *
    `, [block_type, title, content ? JSON.stringify(content) : null, is_active, display_order, page_section, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Content block not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating content block:', error);
    res.status(500).json({ error: 'Failed to update content block' });
  }
});

// Slideshow Images routes
app.get('/api/slideshow-images', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM slideshow_images WHERE is_active = true ORDER BY display_order ASC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching slideshow images:', error);
    res.status(500).json({ error: 'Failed to fetch slideshow images' });
  }
});

app.post('/api/slideshow-images', requireAdminAuth, upload.single('image'), async (req, res) => {
  try {
    const { title, description, alt_text, display_order } = req.body;
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;
    
    if (!image_url) {
      return res.status(400).json({ error: 'Image file is required' });
    }
    
    const result = await pool.query(
      'INSERT INTO slideshow_images (title, description, image_url, alt_text, display_order) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [title, description, image_url, alt_text, display_order || 0]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating slideshow image:', error);
    res.status(500).json({ error: 'Failed to create slideshow image' });
  }
});

app.put('/api/slideshow-images/:id', requireAdminAuth, upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, alt_text, is_active, display_order } = req.body;
    const image_url = req.file ? `/uploads/${req.file.filename}` : undefined;
    
    let query = 'UPDATE slideshow_images SET title = $1, description = $2, alt_text = $3, is_active = $4, display_order = $5, updated_at = CURRENT_TIMESTAMP';
    let params = [title, description, alt_text, is_active !== undefined ? is_active : true, display_order || 0];
    
    if (image_url) {
      query += ', image_url = $6 WHERE id = $7 RETURNING *';
      params.push(image_url, id);
    } else {
      query += ' WHERE id = $6 RETURNING *';
      params.push(id);
    }
    
    const result = await pool.query(query, params);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Slideshow image not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating slideshow image:', error);
    res.status(500).json({ error: 'Failed to update slideshow image' });
  }
});

app.delete('/api/slideshow-images/:id', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('UPDATE slideshow_images SET is_active = false WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Slideshow image not found' });
    }
    
    res.json({ message: 'Slideshow image deactivated successfully' });
  } catch (error) {
    console.error('Error deactivating slideshow image:', error);
    res.status(500).json({ error: 'Failed to deactivate slideshow image' });
  }
});

// Testimonials routes
app.get('/api/testimonials', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM testimonials WHERE is_active = true ORDER BY display_order ASC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    res.status(500).json({ error: 'Failed to fetch testimonials' });
  }
});

app.post('/api/testimonials', requireAdminAuth, upload.single('patient_image'), async (req, res) => {
  try {
    const { patient_name, patient_title, testimonial_text, product_used, rating, is_featured, display_order } = req.body;
    const patient_image_url = req.file ? `/uploads/${req.file.filename}` : null;
    
    const result = await pool.query(
      'INSERT INTO testimonials (patient_name, patient_title, testimonial_text, patient_image_url, product_used, rating, is_featured, display_order) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [patient_name, patient_title, testimonial_text, patient_image_url, product_used, rating || 5, is_featured || false, display_order || 0]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating testimonial:', error);
    res.status(500).json({ error: 'Failed to create testimonial' });
  }
});

app.put('/api/testimonials/:id', requireAdminAuth, upload.single('patient_image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { patient_name, patient_title, testimonial_text, product_used, rating, is_active, is_featured, display_order } = req.body;
    const patient_image_url = req.file ? `/uploads/${req.file.filename}` : undefined;
    
    let query = 'UPDATE testimonials SET patient_name = $1, patient_title = $2, testimonial_text = $3, product_used = $4, rating = $5, is_active = $6, is_featured = $7, display_order = $8, updated_at = CURRENT_TIMESTAMP';
    let params = [patient_name, patient_title, testimonial_text, product_used, rating, is_active !== undefined ? is_active : true, is_featured || false, display_order || 0];
    
    if (patient_image_url) {
      query += ', patient_image_url = $9 WHERE id = $10 RETURNING *';
      params.push(patient_image_url, id);
    } else {
      query += ' WHERE id = $9 RETURNING *';
      params.push(id);
    }
    
    const result = await pool.query(query, params);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Testimonial not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating testimonial:', error);
    res.status(500).json({ error: 'Failed to update testimonial' });
  }
});

app.delete('/api/testimonials/:id', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('UPDATE testimonials SET is_active = false WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Testimonial not found' });
    }
    
    res.json({ message: 'Testimonial deactivated successfully' });
  } catch (error) {
    console.error('Error deactivating testimonial:', error);
    res.status(500).json({ error: 'Failed to deactivate testimonial' });
  }
});

// FAQs routes
app.get('/api/faqs', async (req, res) => {
  try {
    const { category } = req.query;
    let query = 'SELECT * FROM faqs WHERE is_active = true';
    let params = [];
    
    if (category) {
      query += ' AND category = $1';
      params.push(category);
    }
    
    query += ' ORDER BY display_order ASC';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    res.status(500).json({ error: 'Failed to fetch FAQs' });
  }
});

app.post('/api/faqs', requireAdminAuth, async (req, res) => {
  try {
    const { question, answer, category, display_order } = req.body;
    
    const result = await pool.query(
      'INSERT INTO faqs (question, answer, category, display_order) VALUES ($1, $2, $3, $4) RETURNING *',
      [question, answer, category, display_order || 0]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating FAQ:', error);
    res.status(500).json({ error: 'Failed to create FAQ' });
  }
});

app.put('/api/faqs/:id', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { question, answer, category, is_active, display_order } = req.body;
    
    const result = await pool.query(
      'UPDATE faqs SET question = $1, answer = $2, category = $3, is_active = $4, display_order = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING *',
      [question, answer, category, is_active !== undefined ? is_active : true, display_order || 0, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'FAQ not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating FAQ:', error);
    res.status(500).json({ error: 'Failed to update FAQ' });
  }
});

app.delete('/api/faqs/:id', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('UPDATE faqs SET is_active = false WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'FAQ not found' });
    }
    
    res.json({ message: 'FAQ deactivated successfully' });
  } catch (error) {
    console.error('Error deactivating FAQ:', error);
    res.status(500).json({ error: 'Failed to deactivate FAQ' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Catch-all handler: send back React's index.html file for any non-API routes
app.get('*', (req, res) => {
  // Skip API routes
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  const indexPath = path.join(__dirname, '../dist/index.html');
  const distDir = path.join(__dirname, '../dist');
  
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    console.log('⚠️  Frontend build files not found');
    console.log('📁 Checking dist directory:', distDir);
    console.log('📄 Looking for index.html at:', indexPath);
    
    // Check if dist directory exists
    if (!fs.existsSync(distDir)) {
      console.log('❌ Dist directory does not exist');
    } else {
      console.log('📋 Files in dist directory:', fs.readdirSync(distDir));
    }
    
    // Return a helpful error with instructions
    res.status(503).json({ 
      error: 'Frontend build not found. Please run "npm run build" first.',
      details: {
        distPath: distDir,
        indexPath: indexPath,
        distExists: fs.existsSync(distDir),
        indexExists: fs.existsSync(indexPath)
      },
      instructions: [
        'Build Command should be: npm ci && npm run build',
        'Run Command should be: npm run server',
        'Make sure Vite is in dependencies, not devDependencies'
      ]
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Frontend served from: http://localhost:${PORT}`);
  console.log(`🔧 API Health check: http://localhost:${PORT}/api/health`);
  console.log(`📁 Static uploads: http://localhost:${PORT}/uploads`);
});
