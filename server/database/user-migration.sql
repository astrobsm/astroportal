-- Migration script to add missing columns to existing tables

-- Add missing columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS first_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS last_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS phone VARCHAR(50);

-- Update existing users to have proper names (split username if needed)
UPDATE users 
SET 
    first_name = COALESCE(first_name, SPLIT_PART(username, ' ', 1)),
    last_name = COALESCE(last_name, CASE 
        WHEN SPLIT_PART(username, ' ', 2) != '' THEN SPLIT_PART(username, ' ', 2)
        ELSE 'User'
    END)
WHERE first_name IS NULL OR last_name IS NULL;

-- Make first_name and last_name NOT NULL after setting default values
ALTER TABLE users 
ALTER COLUMN first_name SET NOT NULL,
ALTER COLUMN last_name SET NOT NULL;

-- Fix customer_interactions table if it has wrong column names
DO $$ 
BEGIN
    -- Check if customer_interactions has marketer_id instead of user_id
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customer_interactions' 
        AND column_name = 'marketer_id'
        AND table_schema = 'public'
    ) THEN
        -- Add user_id column if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'customer_interactions' 
            AND column_name = 'user_id'
            AND table_schema = 'public'
        ) THEN
            ALTER TABLE customer_interactions ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
            -- Copy data from marketer_id to user_id
            UPDATE customer_interactions SET user_id = marketer_id WHERE marketer_id IS NOT NULL;
        END IF;
    END IF;
END $$;

-- Create missing indexes that failed earlier
CREATE INDEX IF NOT EXISTS idx_user_activities_status ON user_activities(status);
CREATE INDEX IF NOT EXISTS idx_customer_interactions_customer_id ON customer_interactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_interactions_user_id ON customer_interactions(user_id);

-- Insert default admin user with proper password hash
INSERT INTO users (email, password_hash, first_name, last_name, username, role, status, approved_at)
VALUES (
    'admin@astro-bsm.com',
    '$2b$10$rQJ8.Kz9oVYrPm5S4kX4/.FJnO4LzV3K8mX9wP1qR2sQ3nM5yT7uW', -- hashed "natiss_natiss"
    'System',
    'Administrator', 
    'admin',
    'admin',
    'approved',
    CURRENT_TIMESTAMP
) ON CONFLICT (email) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    status = EXCLUDED.status,
    approved_at = EXCLUDED.approved_at;

-- Create sample manager and marketer users for testing
INSERT INTO users (email, password_hash, first_name, last_name, username, role, status, phone, profile_data)
VALUES 
    (
        'manager1@astro-bsm.com', 
        '$2b$10$example_hash_for_manager123', 
        'John', 
        'Manager', 
        'john_manager',
        'manager', 
        'pending', 
        '+1234567890', 
        '{"department": "operations", "hire_date": "2025-01-01", "employee_id": "MGR001"}'
    ),
    (
        'marketer1@astro-bsm.com', 
        '$2b$10$example_hash_for_marketer123', 
        'Sarah', 
        'Marketer', 
        'sarah_marketer',
        'marketer', 
        'pending', 
        '+1234567891', 
        '{"department": "marketing", "specialization": "digital_marketing", "employee_id": "MKT001"}'
    )
ON CONFLICT (email) DO NOTHING;
