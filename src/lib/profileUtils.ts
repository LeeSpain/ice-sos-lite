import { supabase } from '@/integrations/supabase/client';

// Calculate profile completion percentage based on filled fields
export const calculateProfileCompletion = (profile: any): number => {
  if (!profile) return 0;

  const fields = [
    'first_name',
    'last_name', 
    'phone',
    'address',
    'country',
    'date_of_birth',
    'blood_type',
    'language_preference'
  ];

  const arrayFields = [
    'medical_conditions',
    'allergies', 
    'medications',
    'emergency_contacts'
  ];

  let filledCount = 0;
  const totalFields = fields.length + arrayFields.length;

  // Check regular fields
  fields.forEach(field => {
    if (profile[field] && profile[field].toString().trim() !== '') {
      filledCount++;
    }
  });

  // Check array fields
  arrayFields.forEach(field => {
    if (profile[field] && Array.isArray(profile[field]) && profile[field].length > 0) {
      filledCount++;
    }
  });

  return Math.round((filledCount / totalFields) * 100);
};

// Update profile completion percentage in database
export const updateProfileCompletion = async (userId: string) => {
  try {
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (fetchError) {
      console.error('Error fetching profile:', fetchError);
      return;
    }

    if (profile) {
      const completionPercentage = calculateProfileCompletion(profile);
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_completion_percentage: completionPercentage })
        .eq('user_id', userId);

      if (updateError) {
        console.error('Error updating profile completion:', updateError);
      }
    }
  } catch (error) {
    console.error('Error in updateProfileCompletion:', error);
  }
};