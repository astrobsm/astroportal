-- Database Migration Script for ASTRO-BSM Portal
-- Safely migrates existing database to optimized schema
-- Run this after backing up your current database

-- Start transaction for safe migration
BEGIN;

-- Add UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Add new columns to existing tables

-- Add UUID and timestamp columns to customers if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'uuid') THEN
        ALTER TABLE customers ADD COLUMN uuid UUID DEFAULT uuid_generate_v4() UNIQUE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'last_active') THEN
        ALTER TABLE customers ADD COLUMN last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'is_active') THEN
        ALTER TABLE customers ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'updated_at') THEN
        ALTER TABLE customers ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END
$$;

-- Add UUID and other columns to products if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'uuid') THEN
        ALTER TABLE products ADD COLUMN uuid UUID DEFAULT uuid_generate_v4() UNIQUE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'sort_order') THEN
        ALTER TABLE products ADD COLUMN sort_order INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'is_active') THEN
        ALTER TABLE products ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'updated_at') THEN
        ALTER TABLE products ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END
$$;

-- Add UUID and other columns to orders if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'uuid') THEN
        ALTER TABLE orders ADD COLUMN uuid UUID DEFAULT uuid_generate_v4() UNIQUE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'estimated_delivery') THEN
        ALTER TABLE orders ADD COLUMN estimated_delivery DATE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'actual_delivery') THEN
        ALTER TABLE orders ADD COLUMN actual_delivery DATE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'updated_at') THEN
        ALTER TABLE orders ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END
$$;

-- Add UUID to notifications if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'uuid') THEN
        ALTER TABLE notifications ADD COLUMN uuid UUID DEFAULT uuid_generate_v4() UNIQUE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'metadata') THEN
        ALTER TABLE notifications ADD COLUMN metadata JSONB DEFAULT '{}';
    END IF;
END
$$;

-- Create new tables if they don't exist

-- Distributors table
CREATE TABLE IF NOT EXISTS distributors (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    region VARCHAR(100) NOT NULL,
    contact_person VARCHAR(255),
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    address TEXT,
    is_active BOOLEAN DEFAULT true,
    coverage_areas TEXT[],
    specialties TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product Images table
CREATE TABLE IF NOT EXISTS product_images (
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

-- Product Videos table
CREATE TABLE IF NOT EXISTS product_videos (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    video_url TEXT NOT NULL,
    video_type VARCHAR(50) DEFAULT 'youtube',
    title VARCHAR(255),
    description TEXT,
    thumbnail_url TEXT,
    duration INTEGER,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_type VARCHAR(50) DEFAULT 'announcement',
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

-- Content Blocks table
CREATE TABLE IF NOT EXISTS content_blocks (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    block_type VARCHAR(50) NOT NULL,
    title VARCHAR(255),
    content JSONB NOT NULL DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    page_section VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes if they don't exist (using IF NOT EXISTS equivalent)
DO $$
BEGIN
    -- Customers indexes
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'idx_customers_email' AND n.nspname = 'public') THEN
        CREATE INDEX CONCURRENTLY idx_customers_email ON customers(email);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'idx_customers_uuid' AND n.nspname = 'public') THEN
        CREATE INDEX CONCURRENTLY idx_customers_uuid ON customers(uuid);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'idx_customers_active' AND n.nspname = 'public') THEN
        CREATE INDEX CONCURRENTLY idx_customers_active ON customers(is_active, last_active);
    END IF;
    
    -- Products indexes
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'idx_products_category' AND n.nspname = 'public') THEN
        CREATE INDEX CONCURRENTLY idx_products_category ON products(category);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'idx_products_active' AND n.nspname = 'public') THEN
        CREATE INDEX CONCURRENTLY idx_products_active ON products(is_active, in_stock);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'idx_products_uuid' AND n.nspname = 'public') THEN
        CREATE INDEX CONCURRENTLY idx_products_uuid ON products(uuid);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'idx_products_sort' AND n.nspname = 'public') THEN
        CREATE INDEX CONCURRENTLY idx_products_sort ON products(sort_order, name);
    END IF;
    
    -- Orders indexes
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'idx_orders_customer_id' AND n.nspname = 'public') THEN
        CREATE INDEX CONCURRENTLY idx_orders_customer_id ON orders(customer_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'idx_orders_status' AND n.nspname = 'public') THEN
        CREATE INDEX CONCURRENTLY idx_orders_status ON orders(status);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'idx_orders_created_at' AND n.nspname = 'public') THEN
        CREATE INDEX CONCURRENTLY idx_orders_created_at ON orders(created_at DESC);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'idx_orders_uuid' AND n.nspname = 'public') THEN
        CREATE INDEX CONCURRENTLY idx_orders_uuid ON orders(uuid);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'idx_orders_email' AND n.nspname = 'public') THEN
        CREATE INDEX CONCURRENTLY idx_orders_email ON orders(customer_email);
    END IF;
    
    -- JSONB indexes
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'idx_orders_products_gin' AND n.nspname = 'public') THEN
        CREATE INDEX CONCURRENTLY idx_orders_products_gin ON orders USING GIN (products);
    END IF;
    
    -- Full-text search indexes
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'idx_products_search' AND n.nspname = 'public') THEN
        CREATE INDEX CONCURRENTLY idx_products_search ON products USING GIN (to_tsvector('english', name || ' ' || description));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'idx_customers_search' AND n.nspname = 'public') THEN
        CREATE INDEX CONCURRENTLY idx_customers_search ON customers USING GIN (to_tsvector('english', name || ' ' || email));
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Some indexes may already exist or need to be created manually';
END
$$;

-- Create or replace the update function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers if they don't exist
DO $$
BEGIN
    -- Customers trigger
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_customers_updated_at') THEN
        CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Products trigger
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_products_updated_at') THEN
        CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Orders trigger
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_orders_updated_at') THEN
        CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Distributors trigger
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_distributors_updated_at') THEN
        CREATE TRIGGER update_distributors_updated_at BEFORE UPDATE ON distributors
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END
$$;

-- Insert sample distributors if table is empty
INSERT INTO distributors (name, region, contact_person, phone, email, coverage_areas, specialties)
SELECT 'Southeast Medical Supplies', 'ANAMBRA/SOUTH-EAST', 'FABIAN', '+234 803 609 4136', 'fabian@southeast-med.com', ARRAY['Anambra', 'Imo', 'Abia', 'Ebonyi', 'Enugu'], ARRAY['Wound Care', 'Advanced Dressings']
WHERE NOT EXISTS (SELECT 1 FROM distributors WHERE name = 'Southeast Medical Supplies');

INSERT INTO distributors (name, region, contact_person, phone, email, coverage_areas, specialties)
SELECT 'Lagos Healthcare Solutions', 'LAGOS/SOUTH-WEST', 'IKECHUKWU', '+234 803 732 5194', 'ikechukwu@lagos-health.com', ARRAY['Lagos', 'Ogun', 'Oyo', 'Osun', 'Ondo', 'Ekiti'], ARRAY['General Medical', 'Surgical Supplies']
WHERE NOT EXISTS (SELECT 1 FROM distributors WHERE name = 'Lagos Healthcare Solutions');

INSERT INTO distributors (name, region, contact_person, phone, email, coverage_areas, specialties)
SELECT 'Northern Medical Center', 'ABUJA/NORTH', 'ANIAGBOSO DAVIDSON', '+234 805 850 1919', 'davidson@northern-med.com', ARRAY['Abuja', 'Kaduna', 'Kano', 'Plateau', 'Niger'], ARRAY['Hospital Supplies', 'Specialized Care']
WHERE NOT EXISTS (SELECT 1 FROM distributors WHERE name = 'Northern Medical Center');

INSERT INTO distributors (name, region, contact_person, phone, email, coverage_areas, specialties)
SELECT 'Delta Medical Distributors', 'WARRI/SOUTH-SOUTH', 'DOUGLAS ONYEMA', '+234 802 135 2164', 'douglas@delta-med.com', ARRAY['Delta', 'Rivers', 'Bayelsa', 'Cross River', 'Akwa Ibom', 'Edo'], ARRAY['Offshore Medical', 'Emergency Care']
WHERE NOT EXISTS (SELECT 1 FROM distributors WHERE name = 'Delta Medical Distributors');

INSERT INTO distributors (name, region, contact_person, phone, email, coverage_areas, specialties)
SELECT 'Enugu Medical Hub', 'NSUKKA/ENUGU', 'CHIKWENDU CHINONSO', '+234 806 710 4155', 'chinonso@enugu-hub.com', ARRAY['Enugu', 'Nsukka', 'Awka'], ARRAY['University Medical', 'Research Supplies']
WHERE NOT EXISTS (SELECT 1 FROM distributors WHERE name = 'Enugu Medical Hub');

-- Create or replace optimized views
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

-- Update existing product sort orders if they're all 0
UPDATE products SET sort_order = id WHERE sort_order = 0;

-- Analyze tables for optimal query planning
ANALYZE customers;
ANALYZE products;
ANALYZE orders;
ANALYZE notifications;
ANALYZE distributors;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO admin;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO admin;

-- Create read-only role if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'readonly') THEN
        CREATE ROLE readonly WITH LOGIN PASSWORD 'readonly_access';
    END IF;
END
$$;

GRANT CONNECT ON DATABASE astro_bsm_portal TO readonly;
GRANT USAGE ON SCHEMA public TO readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly;

COMMIT;

-- Display migration summary
SELECT 
    'Migration completed successfully!' as status,
    (SELECT COUNT(*) FROM customers) as total_customers,
    (SELECT COUNT(*) FROM products) as total_products,
    (SELECT COUNT(*) FROM orders) as total_orders,
    (SELECT COUNT(*) FROM distributors) as total_distributors,
    (SELECT COUNT(*) FROM notifications) as total_notifications;
