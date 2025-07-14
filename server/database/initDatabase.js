// Database initialization script for auto-setup
export const initializeDatabase = async (pool) => {
  const queries = [
    // Users table
    `CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      full_name VARCHAR(100),
      phone VARCHAR(20),
      role VARCHAR(20) DEFAULT 'customer' CHECK (role IN ('customer', 'manager', 'marketer', 'admin')),
      status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // User sessions table
    `CREATE TABLE IF NOT EXISTS user_sessions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      session_token VARCHAR(255) UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      expires_at TIMESTAMP NOT NULL
    )`,

    // Products table
    `CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      category VARCHAR(100),
      in_stock BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // Product images table
    `CREATE TABLE IF NOT EXISTS product_images (
      id SERIAL PRIMARY KEY,
      product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
      image_url VARCHAR(500) NOT NULL,
      is_primary BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // Orders table
    `CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      customer_name VARCHAR(255) NOT NULL,
      customer_email VARCHAR(255),
      customer_phone VARCHAR(50),
      customer_address TEXT,
      product_id INTEGER REFERENCES products(id),
      product_name VARCHAR(255),
      quantity INTEGER DEFAULT 1,
      status VARCHAR(50) DEFAULT 'pending',
      special_instructions TEXT,
      order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // Events table
    `CREATE TABLE IF NOT EXISTS events (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      event_type VARCHAR(50) DEFAULT 'event' CHECK (event_type IN ('event', 'promotion')),
      start_date DATE,
      end_date DATE,
      is_active BOOLEAN DEFAULT true,
      position VARCHAR(10) DEFAULT 'left' CHECK (position IN ('left', 'right')),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // Slideshow images table
    `CREATE TABLE IF NOT EXISTS slideshow_images (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255),
      description TEXT,
      image_url VARCHAR(500) NOT NULL,
      is_active BOOLEAN DEFAULT true,
      sort_order INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // Testimonials table
    `CREATE TABLE IF NOT EXISTS testimonials (
      id SERIAL PRIMARY KEY,
      patient_name VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
      image_url VARCHAR(500),
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // FAQs table
    `CREATE TABLE IF NOT EXISTS faqs (
      id SERIAL PRIMARY KEY,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      category VARCHAR(100) DEFAULT 'general',
      is_active BOOLEAN DEFAULT true,
      sort_order INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`
  ];

  const indexes = [
    `CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`,
    `CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)`,
    `CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token)`,
    `CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at)`,
    `CREATE INDEX IF NOT EXISTS idx_products_category ON products(category)`,
    `CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id)`,
    `CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)`,
    `CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email)`,
    `CREATE INDEX IF NOT EXISTS idx_events_active ON events(is_active)`,
    `CREATE INDEX IF NOT EXISTS idx_slideshow_active ON slideshow_images(is_active)`,
    `CREATE INDEX IF NOT EXISTS idx_testimonials_active ON testimonials(is_active)`,
    `CREATE INDEX IF NOT EXISTS idx_faqs_active ON faqs(is_active)`
  ];

  const sampleData = [
    // Sample products - Check if products exist first
    `INSERT INTO products (name, description, category, in_stock) 
     SELECT 'Antiseptic Solution', 'Professional antiseptic solution for wound preparation', 'Solutions', true
     WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Antiseptic Solution')`,
     
    `INSERT INTO products (name, description, category, in_stock) 
     SELECT 'Sterile Gauze Pads', 'High-quality sterile gauze pads for wound dressing', 'Dressings', true
     WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Sterile Gauze Pads')`,
     
    `INSERT INTO products (name, description, category, in_stock) 
     SELECT 'Medical Tape', 'Hypoallergenic medical tape for secure dressing', 'Supplies', true
     WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Medical Tape')`,
     
    `INSERT INTO products (name, description, category, in_stock) 
     SELECT 'Wound Cleanser', 'Gentle wound cleanser for daily care', 'Solutions', true
     WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Wound Cleanser')`,
     
    `INSERT INTO products (name, description, category, in_stock) 
     SELECT 'Compression Bandages', 'Elastic compression bandages for support', 'Bandages', true
     WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Compression Bandages')`,

    // Sample FAQs - Check if FAQs exist first
    `INSERT INTO faqs (question, answer, category, sort_order) 
     SELECT 'What services do you provide?', 'We provide comprehensive wound care services including assessment, treatment, and ongoing management of various types of wounds.', 'services', 1
     WHERE NOT EXISTS (SELECT 1 FROM faqs WHERE question = 'What services do you provide?')`,
     
    `INSERT INTO faqs (question, answer, category, sort_order) 
     SELECT 'How often should dressings be changed?', 'Dressing change frequency depends on the type of wound and dressing used. Generally, every 1-3 days or as recommended by your healthcare provider.', 'care', 2
     WHERE NOT EXISTS (SELECT 1 FROM faqs WHERE question = 'How often should dressings be changed?')`,
     
    `INSERT INTO faqs (question, answer, category, sort_order) 
     SELECT 'Do you accept insurance?', 'Yes, we accept most major insurance plans. Please contact us to verify your specific coverage.', 'billing', 3
     WHERE NOT EXISTS (SELECT 1 FROM faqs WHERE question = 'Do you accept insurance?')`,
     
    `INSERT INTO faqs (question, answer, category, sort_order) 
     SELECT 'What should I bring to my appointment?', 'Please bring your insurance card, a list of current medications, and any relevant medical records.', 'appointments', 4
     WHERE NOT EXISTS (SELECT 1 FROM faqs WHERE question = 'What should I bring to my appointment?')`
  ];

  try {
    console.log('🔄 Starting database initialization...');
    
    // Create tables
    for (const query of queries) {
      await pool.query(query);
    }
    console.log('✅ Database tables created successfully');

    // Create indexes
    for (const index of indexes) {
      await pool.query(index);
    }
    console.log('✅ Database indexes created successfully');

    // Insert sample data
    for (const data of sampleData) {
      await pool.query(data);
    }
    console.log('✅ Sample data inserted successfully');
    
    console.log('🎉 Database initialization completed!');
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    return false;
  }
};
