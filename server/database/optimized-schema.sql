-- Optimized Database Schema for ASTRO-BSM Portal
-- Designed for sharing, performance, and scalability
-- Version: 2.0 - Optimized for multi-user access

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS product_videos CASCADE;
DROP TABLE IF EXISTS product_images CASCADE;
DROP TABLE IF EXISTS content_blocks CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS distributors CASCADE;
DROP TABLE IF EXISTS customers CASCADE;

-- Enable UUID extension for better distributed systems support
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Optimized Customers table with sharing support
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    address TEXT,
    registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Optimized Products table without pricing
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    in_stock BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Optimized Orders table with unit-based structure
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50),
    customer_address TEXT NOT NULL,
    products JSONB NOT NULL DEFAULT '[]', -- Stores array of {id, name, unit, quantity, description}
    delivery_method VARCHAR(50) DEFAULT 'standard',
    status VARCHAR(50) DEFAULT 'pending',
    notes TEXT,
    estimated_delivery DATE,
    actual_delivery DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced Notifications table
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    target_user_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced Distributors table
CREATE TABLE distributors (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    region VARCHAR(100) NOT NULL,
    contact_person VARCHAR(255),
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    address TEXT,
    is_active BOOLEAN DEFAULT true,
    coverage_areas TEXT[], -- Array of areas they cover
    specialties TEXT[], -- Array of medical specialties
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product Images table for enhanced catalog
CREATE TABLE product_images (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    alt_text VARCHAR(255),
    is_primary BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product Videos table for enhanced catalog
CREATE TABLE product_videos (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    video_url TEXT NOT NULL,
    video_type VARCHAR(50) DEFAULT 'youtube', -- youtube, vimeo, direct
    title VARCHAR(255),
    description TEXT,
    thumbnail_url TEXT,
    duration INTEGER, -- in seconds
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events table for announcements and promotions
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_type VARCHAR(50) DEFAULT 'announcement', -- announcement, promotion, training
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    banner_image_url TEXT,
    banner_text VARCHAR(500),
    action_url TEXT,
    action_text VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content Blocks table for dynamic content management
CREATE TABLE content_blocks (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    block_type VARCHAR(50) NOT NULL, -- hero, feature, testimonial, faq
    title VARCHAR(255),
    content JSONB NOT NULL DEFAULT '{}', -- Flexible content structure
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    page_section VARCHAR(100), -- home, about, products, contact
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance Indexes for optimal sharing and querying
CREATE INDEX CONCURRENTLY idx_customers_email ON customers(email);
CREATE INDEX CONCURRENTLY idx_customers_uuid ON customers(uuid);
CREATE INDEX CONCURRENTLY idx_customers_active ON customers(is_active, last_active);

CREATE INDEX CONCURRENTLY idx_products_category ON products(category);
CREATE INDEX CONCURRENTLY idx_products_active ON products(is_active, in_stock);
CREATE INDEX CONCURRENTLY idx_products_uuid ON products(uuid);
CREATE INDEX CONCURRENTLY idx_products_sort ON products(sort_order, name);

CREATE INDEX CONCURRENTLY idx_orders_customer_id ON orders(customer_id);
CREATE INDEX CONCURRENTLY idx_orders_status ON orders(status);
CREATE INDEX CONCURRENTLY idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX CONCURRENTLY idx_orders_uuid ON orders(uuid);
CREATE INDEX CONCURRENTLY idx_orders_email ON orders(customer_email);

CREATE INDEX CONCURRENTLY idx_notifications_user ON notifications(target_user_id, is_read);
CREATE INDEX CONCURRENTLY idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX CONCURRENTLY idx_notifications_type ON notifications(type);

CREATE INDEX CONCURRENTLY idx_distributors_region ON distributors(region);
CREATE INDEX CONCURRENTLY idx_distributors_active ON distributors(is_active);

CREATE INDEX CONCURRENTLY idx_product_images_product ON product_images(product_id, display_order);
CREATE INDEX CONCURRENTLY idx_product_images_primary ON product_images(product_id, is_primary);

CREATE INDEX CONCURRENTLY idx_product_videos_product ON product_videos(product_id);
CREATE INDEX CONCURRENTLY idx_product_videos_featured ON product_videos(is_featured);

CREATE INDEX CONCURRENTLY idx_events_active ON events(is_active, start_date, end_date);
CREATE INDEX CONCURRENTLY idx_events_dates ON events(start_date, end_date);

CREATE INDEX CONCURRENTLY idx_content_blocks_section ON content_blocks(page_section, display_order);
CREATE INDEX CONCURRENTLY idx_content_blocks_active ON content_blocks(is_active);

-- JSONB indexes for better performance on product queries
CREATE INDEX CONCURRENTLY idx_orders_products_gin ON orders USING GIN (products);

-- Full-text search indexes for better search performance
CREATE INDEX CONCURRENTLY idx_products_search ON products USING GIN (to_tsvector('english', name || ' ' || description));
CREATE INDEX CONCURRENTLY idx_customers_search ON customers USING GIN (to_tsvector('english', name || ' ' || email));

-- Auto-update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_distributors_updated_at BEFORE UPDATE ON distributors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_images_updated_at BEFORE UPDATE ON product_images
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_videos_updated_at BEFORE UPDATE ON product_videos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_blocks_updated_at BEFORE UPDATE ON content_blocks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample optimized data
INSERT INTO products (name, description, category, in_stock, sort_order) VALUES
('HERA WOUND GEL 100g', 'Advanced wound healing gel with honey-based formula. Large size for extended treatment.', 'Wound Gels', true, 1),
('HERA WOUND GEL 40g', 'Advanced wound healing gel with honey-based formula. Compact size for personal use.', 'Wound Gels', true, 2),
('WOUND-CARE GAUZE BIG', 'Large honey-based povidone iodine dressing for advanced wound healing and infection prevention.', 'Advanced Dressings', true, 3),
('ADVANCED FOAM DRESSING', 'Highly absorbent foam dressing designed for chronic and acute wound management.', 'Advanced Dressings', true, 4),
('HYDROCOLLOID PATCHES', 'Self-adhesive hydrocolloid patches for minor wound care and faster healing.', 'Basic Supplies', true, 5);

INSERT INTO distributors (name, region, contact_person, phone, email, coverage_areas, specialties) VALUES
('Southeast Medical Supplies', 'ANAMBRA/SOUTH-EAST', 'FABIAN', '+234 803 609 4136', 'fabian@southeast-med.com', ARRAY['Anambra', 'Imo', 'Abia', 'Ebonyi', 'Enugu'], ARRAY['Wound Care', 'Advanced Dressings']),
('Lagos Healthcare Solutions', 'LAGOS/SOUTH-WEST', 'IKECHUKWU', '+234 803 732 5194', 'ikechukwu@lagos-health.com', ARRAY['Lagos', 'Ogun', 'Oyo', 'Osun', 'Ondo', 'Ekiti'], ARRAY['General Medical', 'Surgical Supplies']),
('Northern Medical Center', 'ABUJA/NORTH', 'ANIAGBOSO DAVIDSON', '+234 805 850 1919', 'davidson@northern-med.com', ARRAY['Abuja', 'Kaduna', 'Kano', 'Plateau', 'Niger'], ARRAY['Hospital Supplies', 'Specialized Care']),
('Delta Medical Distributors', 'WARRI/SOUTH-SOUTH', 'DOUGLAS ONYEMA', '+234 802 135 2164', 'douglas@delta-med.com', ARRAY['Delta', 'Rivers', 'Bayelsa', 'Cross River', 'Akwa Ibom', 'Edo'], ARRAY['Offshore Medical', 'Emergency Care']),
('Enugu Medical Hub', 'NSUKKA/ENUGU', 'CHIKWENDU CHINONSO', '+234 806 710 4155', 'chinonso@enugu-hub.com', ARRAY['Enugu', 'Nsukka', 'Awka'], ARRAY['University Medical', 'Research Supplies']);

-- Sample orders with unit-based structure
INSERT INTO orders (customer_name, customer_email, customer_phone, customer_address, products, delivery_method, status) VALUES
('Dr. Sarah Johnson', 'sarah.johnson@hospital.com', '+234 801 234 5678', '123 Medical Plaza, Healthcare City, HC 12345', 
 '[{"id": 1, "name": "HERA WOUND GEL 100g", "unit": "tubes", "quantity": 5, "description": "Advanced wound healing gel with honey-based formula. Large size for extended treatment."}]', 
 'express', 'confirmed'),
('Nurse Mary Okafor', 'mary.okafor@clinic.ng', '+234 802 345 6789', '456 Health Street, Medical District, MD 67890', 
 '[{"id": 3, "name": "WOUND-CARE GAUZE BIG", "unit": "pcs", "quantity": 20, "description": "Large honey-based povidone iodine dressing for advanced wound healing and infection prevention."}, {"id": 5, "name": "HYDROCOLLOID PATCHES", "unit": "packets", "quantity": 3, "description": "Self-adhesive hydrocolloid patches for minor wound care and faster healing."}]', 
 'standard', 'pending'),
('Dr. Ahmed Hassan', 'ahmed.hassan@surgery.ng', '+234 803 456 7890', '789 Surgery Lane, Operating Theater Complex, OT 13579', 
 '[{"id": 4, "name": "ADVANCED FOAM DRESSING", "unit": "carton", "quantity": 2, "description": "Highly absorbent foam dressing designed for chronic and acute wound management."}]', 
 'overnight', 'delivered'),
('Pharmacist Jane Adebayo', 'jane.adebayo@pharmacy.ng', '+234 804 567 8901', '321 Pharmacy Road, Medical Shopping Center, MC 24680', 
 '[{"id": 1, "name": "HERA WOUND GEL 100g", "unit": "tubes", "quantity": 10, "description": "Advanced wound healing gel with honey-based formula. Large size for extended treatment."}, {"id": 2, "name": "HERA WOUND GEL 40g", "unit": "tubes", "quantity": 15, "description": "Advanced wound healing gel with honey-based formula. Compact size for personal use."}]', 
 'standard', 'confirmed'),
('Dr. Emmanuel Okonkwo', 'emmanuel.okonkwo@clinic.ng', '+234 805 678 9012', '654 Treatment Avenue, Healthcare Plaza, HP 97531', 
 '[{"id": 3, "name": "WOUND-CARE GAUZE BIG", "unit": "pcs", "quantity": 50, "description": "Large honey-based povidone iodine dressing for advanced wound healing and infection prevention."}, {"id": 4, "name": "ADVANCED FOAM DRESSING", "unit": "pcs", "quantity": 25, "description": "Highly absorbent foam dressing designed for chronic and acute wound management."}, {"id": 5, "name": "HYDROCOLLOID PATCHES", "unit": "packets", "quantity": 8, "description": "Self-adhesive hydrocolloid patches for minor wound care and faster healing."}]', 
 'express', 'pending');

-- Sample notifications
INSERT INTO notifications (type, title, message, target_user_id) VALUES
('order_confirmed', 'Order Confirmed', 'Your order has been confirmed and is being prepared for delivery.', NULL),
('new_product', 'New Product Available', 'HERA WOUND GEL 40g is now available in our catalog.', NULL),
('delivery_update', 'Delivery Update', 'Your order is out for delivery and will arrive today.', NULL);

-- Sample events
INSERT INTO events (title, description, event_type, start_date, end_date, is_active) VALUES
('Medical Supply Training Workshop', 'Learn about the latest wound care products and best practices.', 'training', NOW() + INTERVAL '7 days', NOW() + INTERVAL '8 days', true),
('New Product Launch', 'Introducing our latest range of advanced wound care solutions.', 'announcement', NOW(), NOW() + INTERVAL '30 days', true);

-- Create optimized views for common queries
CREATE OR REPLACE VIEW active_products AS
SELECT p.*, 
       COALESCE(pi.image_url, '') as primary_image,
       COALESCE(pv.video_url, '') as featured_video
FROM products p
LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = true
LEFT JOIN product_videos pv ON p.id = pv.product_id AND pv.is_featured = true
WHERE p.is_active = true AND p.in_stock = true
ORDER BY p.sort_order, p.name;

CREATE OR REPLACE VIEW order_summary AS
SELECT o.id, o.uuid, o.customer_name, o.customer_email, o.status,
       o.delivery_method, o.created_at, o.updated_at,
       jsonb_array_length(o.products) as product_count,
       (
         SELECT SUM((item->>'quantity')::integer)
         FROM jsonb_array_elements(o.products) as item
       ) as total_items
FROM orders o
ORDER BY o.created_at DESC;

-- Set up row-level security for sharing (optional - can be enabled later)
-- ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Analyze tables for optimal query planning
ANALYZE customers;
ANALYZE products;
ANALYZE orders;
ANALYZE notifications;
ANALYZE distributors;

-- Grant permissions for sharing
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO admin;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO admin;

-- Create a read-only role for analytics/reporting
CREATE ROLE readonly WITH LOGIN PASSWORD 'readonly_access';
GRANT CONNECT ON DATABASE astro_bsm_portal TO readonly;
GRANT USAGE ON SCHEMA public TO readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly;

COMMIT;
