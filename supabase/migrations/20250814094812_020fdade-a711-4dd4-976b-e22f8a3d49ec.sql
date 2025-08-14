-- Activate existing subscription plans and add proper data
UPDATE subscription_plans 
SET 
  is_active = true,
  updated_at = now()
WHERE id IN ('72001343-1cdf-4dd8-8aa1-99bd3f80155d', '426778f2-e2dc-451d-bc72-e9aceae0dda8');

-- Update Family Connection plan with proper features and description
UPDATE subscription_plans 
SET 
  description = 'Essential family safety with emergency contacts and location sharing',
  features = '["Emergency SOS button", "Family member alerts", "Location sharing", "Basic support"]'::jsonb,
  is_popular = false,
  sort_order = 1
WHERE id = '72001343-1cdf-4dd8-8aa1-99bd3f80155d';

-- Update Premium Protection plan with proper features and description  
UPDATE subscription_plans 
SET 
  description = 'Advanced protection with AI monitoring and premium features',
  features = '["All Family Connection features", "AI health monitoring", "24/7 priority support", "Advanced analytics", "Multiple device support"]'::jsonb,
  is_popular = true,
  sort_order = 2
WHERE id = '426778f2-e2dc-451d-bc72-e9aceae0dda8';

-- Insert additional subscription plan for more variety
INSERT INTO subscription_plans (
  id,
  name, 
  description,
  price,
  currency,
  billing_interval,
  features,
  is_active,
  is_popular,
  sort_order,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'Senior Care Plus',
  'Comprehensive care package designed for seniors with enhanced monitoring',
  9.99,
  'EUR',
  'month',
  '["All Premium features", "Senior-specific health monitoring", "Family dashboard access", "Medical alert integration", "Medication reminders", "Fall detection"]'::jsonb,
  true,
  false,
  3,
  now(),
  now()
);