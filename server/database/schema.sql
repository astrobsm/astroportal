-- Astro-BSM Portal Database Schema
-- PostgreSQL Database Schema for Wound Care Business Management

-- Create database (run this separately as postgres superuser)
-- CREATE DATABASE astro_bsm_portal;

-- Connect to the database
-- \c astro_bsm_portal;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    in_stock BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
    products JSONB NOT NULL, -- Store product details with units and quantities as JSON
    delivery_method VARCHAR(50) DEFAULT 'standard',
    customer_address TEXT,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'delivered', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    is_read BOOLEAN DEFAULT false,
    target_user_id INTEGER, -- NULL for admin notifications
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Distributors table for regional distributors
CREATE TABLE IF NOT EXISTS distributors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    region VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    coverage_area TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Product images table
CREATE TABLE IF NOT EXISTS product_images (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    alt_text VARCHAR(255),
    is_primary BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Product videos table
CREATE TABLE IF NOT EXISTS product_videos (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    video_url VARCHAR(500) NOT NULL,
    video_type VARCHAR(50) DEFAULT 'youtube', -- youtube, vimeo, direct
    title VARCHAR(255),
    description TEXT,
    thumbnail_url VARCHAR(500),
    duration INTEGER, -- in seconds
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Events table for announcements and promotions
CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_type VARCHAR(50) DEFAULT 'promotion', -- promotion, announcement, training, webinar
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    banner_image_url VARCHAR(500),
    banner_text TEXT,
    action_url VARCHAR(500),
    action_text VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Content blocks for flexible content management
CREATE TABLE IF NOT EXISTS content_blocks (
    id SERIAL PRIMARY KEY,
    block_type VARCHAR(50) NOT NULL, -- hero, feature, product_showcase, testimonial, etc.
    title VARCHAR(255),
    content JSONB, -- flexible content structure
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    page_section VARCHAR(100), -- home_hero, home_features, product_page, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_in_stock ON products(in_stock);
CREATE INDEX IF NOT EXISTS idx_distributors_region ON distributors(region);
CREATE INDEX IF NOT EXISTS idx_distributors_is_active ON distributors(is_active);
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_is_primary ON product_images(is_primary);
CREATE INDEX IF NOT EXISTS idx_product_videos_product_id ON product_videos(product_id);
CREATE INDEX IF NOT EXISTS idx_product_videos_is_featured ON product_videos(is_featured);
CREATE INDEX IF NOT EXISTS idx_events_is_active ON events(is_active);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_content_blocks_page_section ON content_blocks(page_section);
CREATE INDEX IF NOT EXISTS idx_content_blocks_is_active ON content_blocks(is_active);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_customers_updated_at 
    BEFORE UPDATE ON customers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at 
    BEFORE UPDATE ON orders 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_distributors_updated_at 
    BEFORE UPDATE ON distributors 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_images_updated_at 
    BEFORE UPDATE ON product_images 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_videos_updated_at 
    BEFORE UPDATE ON product_videos 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at 
    BEFORE UPDATE ON events 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_blocks_updated_at 
    BEFORE UPDATE ON content_blocks 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data with Bonnesante Medicals product range (No pricing - price removed)
INSERT INTO products (name, description, category, in_stock) VALUES
('WOUND-CARE GAUZE BIG', 'Large honey-based povidone iodine dressing for advanced wound healing and infection prevention', 'Advanced Dressings', true),
('WOUND-CARE GAUZE SMALL', 'Small honey-based povidone iodine dressing for precise wound care', 'Advanced Dressings', true),
('HERA WOUND GEL 100g', 'Advanced wound healing gel 100g for extensive tissue regeneration', 'Wound Gels', true),
('HERA WOUND GEL 40g', 'Wound healing gel 40g for targeted wound care', 'Wound Gels', true),
('WOUNDCLEX 500MLS', 'Professional wound cleaning solution in 500ml volume', 'Wound Cleaners', true),
('COBAN BANDAGE 6INCH', '6-inch self-adherent elastic bandages for secure wound wrapping', 'Elastic Bandages', true),
('COBAN BANDAGE 4INCH', '4-inch self-adherent elastic bandages for precise wound care', 'Elastic Bandages', true),
('SILICONE SHEET', 'Medical-grade silicone sheets for scar reduction and prevention', 'Scar Management', true),
('STERILE DRESSING PACK', 'Complete sterile dressing packages for professional care', 'Dressing Kits', true),
('COMPLETE DRESSING KIT', 'Comprehensive kit with dressing bag, woundclex, hera gel, stopain spray, sterile pack, gauze, and plaster', 'Complete Kits', true),
('NPWT-VAC PACK', 'Negative Pressure Wound Therapy vacuum pack for advanced wound care', 'Advanced Therapy', true),
('SILICONE FOOT PAD', 'Foot protection specially designed for diabetic patients', 'Diabetic Care', true),
('HERATEX TULLE DRESSING', 'Specialized tulle dressing for burns and donor sites', 'Specialized Dressings', true)
ON CONFLICT DO NOTHING;

-- Insert sample customers
INSERT INTO customers (name, email, phone, address) VALUES
('Dr. Sarah Johnson', 'sarah.johnson@healthcenter.com', '+1-555-0101', '123 Medical Plaza, Healthcare City, HC 12345'),
('Nurse Maria Garcia', 'maria.garcia@hospital.org', '+1-555-0102', '456 Nursing Ave, Care Town, CT 67890'),
('Dr. Michael Chen', 'michael.chen@clinic.net', '+1-555-0103', '789 Doctor St, Medical District, MD 54321')
ON CONFLICT (email) DO NOTHING;

-- Insert sample orders with Bonnesante Medicals products (No pricing, with units and quantities)
INSERT INTO orders (customer_id, products, delivery_method, customer_address, status) VALUES
(1, '[{"id": 1, "name": "WOUND-CARE GAUZE BIG", "unit": "pcs", "quantity": 2}, {"id": 5, "name": "WOUNDCLEX 500MLS", "unit": "bottles", "quantity": 1}]', 'standard', '123 Medical Plaza, Healthcare City, HC 12345', 'delivered'),
(2, '[{"id": 3, "name": "HERA WOUND GEL 100g", "unit": "tubes", "quantity": 1}, {"id": 7, "name": "COBAN BANDAGE 4INCH", "unit": "pcs", "quantity": 3}]', 'express', '456 Nursing Ave, Care Town, CT 67890', 'confirmed'),
(3, '[{"id": 8, "name": "SILICONE SHEET", "unit": "pcs", "quantity": 2}, {"id": 9, "name": "STERILE DRESSING PACK", "unit": "packets", "quantity": 1}]', 'overnight', '789 Doctor St, Medical District, MD 54321', 'pending'),
(1, '[{"id": 10, "name": "COMPLETE DRESSING KIT", "unit": "carton", "quantity": 1}, {"id": 12, "name": "SILICONE FOOT PAD", "unit": "pcs", "quantity": 2}]', 'express', '123 Medical Plaza, Healthcare City, HC 12345', 'confirmed')
ON CONFLICT DO NOTHING;

-- Insert sample notifications
INSERT INTO notifications (type, title, message, is_read) VALUES
('new_order', 'New Order Received', 'New order #1 received from Dr. Sarah Johnson', true),
('new_order', 'New Order Received', 'New order #2 received from Nurse Maria Garcia', false),
('new_order', 'New Order Received', 'New order #3 received from Dr. Michael Chen', false),
('system', 'System Maintenance', 'Scheduled system maintenance on Sunday 2AM-4AM EST', false)
ON CONFLICT DO NOTHING;

-- Insert regional distributors data
INSERT INTO distributors (name, region, phone, email, coverage_area, is_active) VALUES
('FABIAN', 'ANAMBRA / SOUTH-EAST', '+234 803 609 4136', NULL, 'Anambra State and South-Eastern Nigeria', true),
('IKECHUKWU', 'LAGOS STATE / SOUTH-WEST', '+234 803 732 5194', NULL, 'Lagos State and South-Western Nigeria', true),
('ANIAGBOSO DAVIDSON', 'ABUJA (N-CENTRAL/N-E/N-W)', '+234 805 850 1919', NULL, 'FCT Abuja and Northern Nigeria', true),
('DOUGLAS ONYEMA', 'WARRI / SOUTH-SOUTH', '+234 802 135 2164', NULL, 'Delta State and South-Southern Nigeria', true),
('CHIKWENDU CHINONSO', 'NSUKKA ENUGU STATE', '+234 806 710 4155', NULL, 'Nsukka, Enugu State and surrounding areas', true)
ON CONFLICT DO NOTHING;

-- Insert sample events
INSERT INTO events (title, description, event_type, start_date, end_date, banner_text, action_text, action_url, is_active) VALUES
('New Year Medical Supplies Sale', 'Up to 30% off on all wound care products. Limited time offer!', 'promotion', '2025-01-01 00:00:00+00', '2025-01-31 23:59:59+00', '🎉 NEW YEAR SALE - 30% OFF ALL PRODUCTS! 🎉', 'Shop Now', '/order', true),
('Advanced Wound Care Training Webinar', 'Join our expert-led webinar on latest wound care techniques and product applications.', 'webinar', '2025-02-15 14:00:00+00', '2025-02-15 16:00:00+00', '📚 FREE TRAINING: Advanced Wound Care Techniques', 'Register Now', '/register', true),
('New Product Launch: NPWT Pro Series', 'Introducing our latest Negative Pressure Wound Therapy products with enhanced features.', 'announcement', '2025-03-01 00:00:00+00', '2025-03-31 23:59:59+00', '🚀 NEW PRODUCT LAUNCH: NPWT Pro Series Available Now!', 'Learn More', '/products/npwt-pro', true)
ON CONFLICT DO NOTHING;

-- Insert sample content blocks
INSERT INTO content_blocks (block_type, title, content, is_active, display_order, page_section) VALUES
('hero_banner', 'Main Hero Section', '{
  "heading": "Professional Wound Care Solutions",
  "subheading": "Advanced medical supplies for healthcare professionals",
  "background_image": "/images/hero-medical-bg.jpg",
  "cta_text": "Explore Products",
  "cta_link": "/order"
}', true, 1, 'home_hero'),
('feature_highlight', 'Quality Assurance', '{
  "icon": "shield-check",
  "title": "Medical Grade Quality",
  "description": "All products meet international medical standards and certifications",
  "image": "/images/quality-badge.jpg"
}', true, 1, 'home_features'),
('testimonial', 'Customer Testimonial', '{
  "quote": "Bonnesante Medicals has been our trusted partner for wound care supplies. Their quality and service are exceptional.",
  "author": "Dr. Sarah Johnson",
  "position": "Chief Medical Officer",
  "organization": "Lagos General Hospital",
  "image": "/images/testimonial-1.jpg"
}', true, 1, 'home_testimonials')
ON CONFLICT DO NOTHING;

-- Create views for reporting
CREATE OR REPLACE VIEW order_summary AS
SELECT 
    o.id,
    o.created_at,
    c.name as customer_name,
    c.email as customer_email,
    o.status,
    o.delivery_method,
    o.total_amount,
    jsonb_array_length(o.products) as product_count
FROM orders o
JOIN customers c ON o.customer_id = c.id;

CREATE OR REPLACE VIEW customer_stats AS
SELECT 
    c.id,
    c.name,
    c.email,
    COUNT(o.id) as total_orders,
    COALESCE(SUM(o.total_amount), 0) as total_spent,
    MAX(o.created_at) as last_order_date
FROM customers c
LEFT JOIN orders o ON c.id = o.customer_id
GROUP BY c.id, c.name, c.email;

-- Grant permissions (adjust as needed for your setup)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_app_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_app_user;
