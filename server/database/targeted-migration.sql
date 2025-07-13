-- Targeted Database Migration for ASTRO-BSM Portal
-- Adds only missing columns to existing schema

BEGIN;

-- Add missing columns to products table
DO $$
BEGIN
    -- Add uuid column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'uuid') THEN
        ALTER TABLE products ADD COLUMN uuid UUID DEFAULT gen_random_uuid() UNIQUE;
        UPDATE products SET uuid = gen_random_uuid() WHERE uuid IS NULL;
    END IF;
    
    -- Add is_active column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'is_active') THEN
        ALTER TABLE products ADD COLUMN is_active BOOLEAN DEFAULT true;
        UPDATE products SET is_active = true WHERE is_active IS NULL;
    END IF;
    
    -- Add sort_order column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'sort_order') THEN
        ALTER TABLE products ADD COLUMN sort_order INTEGER DEFAULT 0;
        UPDATE products SET sort_order = id WHERE sort_order IS NULL;
    END IF;
END
$$;

-- Add missing columns to orders table
DO $$
BEGIN
    -- Add uuid column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'uuid') THEN
        ALTER TABLE orders ADD COLUMN uuid UUID DEFAULT gen_random_uuid() UNIQUE;
        UPDATE orders SET uuid = gen_random_uuid() WHERE uuid IS NULL;
    END IF;
    
    -- Add customer_name column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'customer_name') THEN
        ALTER TABLE orders ADD COLUMN customer_name VARCHAR(255);
        -- Try to populate from existing data if possible
        UPDATE orders SET customer_name = COALESCE(
            (SELECT name FROM customers WHERE customers.id = orders.customer_id),
            'Unknown Customer'
        ) WHERE customer_name IS NULL;
        -- Make it NOT NULL after populating
        ALTER TABLE orders ALTER COLUMN customer_name SET NOT NULL;
    END IF;
    
    -- Add customer_email column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'customer_email') THEN
        ALTER TABLE orders ADD COLUMN customer_email VARCHAR(255);
        -- Try to populate from existing data if possible
        UPDATE orders SET customer_email = COALESCE(
            (SELECT email FROM customers WHERE customers.id = orders.customer_id),
            'unknown@example.com'
        ) WHERE customer_email IS NULL;
        -- Make it NOT NULL after populating
        ALTER TABLE orders ALTER COLUMN customer_email SET NOT NULL;
    END IF;
    
    -- Add customer_phone column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'customer_phone') THEN
        ALTER TABLE orders ADD COLUMN customer_phone VARCHAR(50);
        -- Try to populate from existing data if possible
        UPDATE orders SET customer_phone = (
            SELECT phone FROM customers WHERE customers.id = orders.customer_id
        ) WHERE customer_phone IS NULL;
    END IF;
    
    -- Add notes column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'notes') THEN
        ALTER TABLE orders ADD COLUMN notes TEXT;
    END IF;
    
    -- Add estimated_delivery column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'estimated_delivery') THEN
        ALTER TABLE orders ADD COLUMN estimated_delivery DATE;
    END IF;
    
    -- Add actual_delivery column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'actual_delivery') THEN
        ALTER TABLE orders ADD COLUMN actual_delivery DATE;
    END IF;
END
$$;

-- Add missing columns to customers table
DO $$
BEGIN
    -- Add uuid column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'uuid') THEN
        ALTER TABLE customers ADD COLUMN uuid UUID DEFAULT gen_random_uuid() UNIQUE;
        UPDATE customers SET uuid = gen_random_uuid() WHERE uuid IS NULL;
    END IF;
    
    -- Add last_active column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'last_active') THEN
        ALTER TABLE customers ADD COLUMN last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    -- Add is_active column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'is_active') THEN
        ALTER TABLE customers ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
END
$$;

-- Add missing columns to notifications table
DO $$
BEGIN
    -- Add uuid column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'uuid') THEN
        ALTER TABLE notifications ADD COLUMN uuid UUID DEFAULT gen_random_uuid() UNIQUE;
        UPDATE notifications SET uuid = gen_random_uuid() WHERE uuid IS NULL;
    END IF;
    
    -- Add metadata column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'metadata') THEN
        ALTER TABLE notifications ADD COLUMN metadata JSONB DEFAULT '{}';
    END IF;
END
$$;

-- Create missing indexes if they don't exist
DO $$
BEGIN
    -- Products indexes
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'idx_products_uuid' AND n.nspname = 'public') THEN
        CREATE INDEX CONCURRENTLY idx_products_uuid ON products(uuid);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'idx_products_active' AND n.nspname = 'public') THEN
        CREATE INDEX CONCURRENTLY idx_products_active ON products(is_active, in_stock);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'idx_products_sort' AND n.nspname = 'public') THEN
        CREATE INDEX CONCURRENTLY idx_products_sort ON products(sort_order, name);
    END IF;
    
    -- Orders indexes
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'idx_orders_uuid' AND n.nspname = 'public') THEN
        CREATE INDEX CONCURRENTLY idx_orders_uuid ON orders(uuid);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'idx_orders_email' AND n.nspname = 'public') THEN
        CREATE INDEX CONCURRENTLY idx_orders_email ON orders(customer_email);
    END IF;
    
    -- Customers indexes
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'idx_customers_uuid' AND n.nspname = 'public') THEN
        CREATE INDEX CONCURRENTLY idx_customers_uuid ON customers(uuid);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'idx_customers_active' AND n.nspname = 'public') THEN
        CREATE INDEX CONCURRENTLY idx_customers_active ON customers(is_active, last_active);
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

-- Analyze tables for optimal query planning
ANALYZE customers;
ANALYZE products;
ANALYZE orders;
ANALYZE notifications;

COMMIT;

-- Display migration summary
SELECT 
    'Targeted migration completed successfully!' as status,
    (SELECT COUNT(*) FROM customers) as total_customers,
    (SELECT COUNT(*) FROM products) as total_products,
    (SELECT COUNT(*) FROM orders) as total_orders,
    (SELECT COUNT(*) FROM notifications) as total_notifications;
