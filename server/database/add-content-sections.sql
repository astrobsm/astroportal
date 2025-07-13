-- Add new content sections for homepage
-- Product slideshow, testimonials, and FAQs

-- Product slideshow images table
CREATE TABLE IF NOT EXISTS slideshow_images (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    description TEXT,
    image_url VARCHAR(500) NOT NULL,
    alt_text VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Patient testimonials table
CREATE TABLE IF NOT EXISTS testimonials (
    id SERIAL PRIMARY KEY,
    patient_name VARCHAR(255) NOT NULL,
    patient_title VARCHAR(255), -- e.g., "Diabetic Patient", "Wound Care Specialist"
    testimonial_text TEXT NOT NULL,
    patient_image_url VARCHAR(500),
    product_used VARCHAR(255), -- Which product they used
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- FAQ table
CREATE TABLE IF NOT EXISTS faqs (
    id SERIAL PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category VARCHAR(100), -- e.g., "Products", "Ordering", "Delivery"
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data for slideshow images
INSERT INTO slideshow_images (title, description, image_url, alt_text, display_order) VALUES
('Advanced Wound Care Solutions', 'Our comprehensive range of medical-grade wound care products', '/uploads/slideshow-sample-1.jpg', 'Medical wound care products display', 1),
('Professional Healthcare Partnership', 'Trusted by healthcare professionals nationwide', '/uploads/slideshow-sample-2.jpg', 'Healthcare professionals using our products', 2),
('Quality Assurance', 'All products meet highest medical standards and certifications', '/uploads/slideshow-sample-3.jpg', 'Quality testing and certification process', 3);

-- Insert sample testimonials
INSERT INTO testimonials (patient_name, patient_title, testimonial_text, product_used, rating, display_order) VALUES
('Dr. Sarah Johnson', 'Wound Care Specialist', 'The HERA WOUND GEL has significantly improved healing times for my patients. The results speak for themselves.', 'HERA WOUND GEL', 5, 1),
('Michael Rodriguez', 'Diabetic Patient', 'After struggling with slow-healing wounds, the WOUNDCLEX cleaning solution made a remarkable difference in my recovery.', 'WOUNDCLEX 500MLS', 5, 2),
('Nurse Patricia Williams', 'ICU Nurse', 'The wound care gauze is exceptional quality. Easy to apply and provides excellent protection for our patients.', 'WOUND-CARE GAUZE', 5, 3),
('James Thompson', 'Elderly Patient', 'The complete dressing kit had everything I needed for proper wound care at home. Very convenient and effective.', 'COMPLETE DRESSING KIT', 4, 4);

-- Insert sample FAQs
INSERT INTO faqs (question, answer, category, display_order) VALUES
('What makes your wound care products different?', 'Our products are medical-grade, clinically tested, and designed specifically for advanced wound healing. We use premium materials and follow strict quality standards.', 'Products', 1),
('How quickly can I receive my order?', 'We offer same-day delivery for urgent orders and standard next-day delivery. Emergency medical supplies can be arranged for immediate pickup.', 'Delivery', 2),
('Are your products suitable for diabetic patients?', 'Yes, our products are specifically formulated to be safe and effective for diabetic patients and those with sensitive skin conditions.', 'Products', 3),
('Do you provide bulk ordering for healthcare facilities?', 'Absolutely! We offer special pricing and dedicated support for hospitals, clinics, and healthcare facilities with bulk ordering needs.', 'Ordering', 4),
('What if I need help choosing the right product?', 'Our medical advisors are available 24/7 to help you select the appropriate wound care products based on your specific needs.', 'Support', 5),
('Are your products covered by insurance?', 'Many of our medical-grade products are covered by health insurance. We can provide documentation needed for insurance claims.', 'Insurance', 6);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_slideshow_images_active_order ON slideshow_images(is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_testimonials_active_featured ON testimonials(is_active, is_featured, display_order);
CREATE INDEX IF NOT EXISTS idx_faqs_active_category ON faqs(is_active, category, display_order);
