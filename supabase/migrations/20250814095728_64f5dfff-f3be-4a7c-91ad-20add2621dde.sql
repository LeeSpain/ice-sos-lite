-- Remove the unauthorized "Senior Care Plus" plan
DELETE FROM public.subscription_plans 
WHERE id = 'ff2c8c11-7a34-4af6-8d04-4140c290da16' 
AND name = 'Senior Care Plus';