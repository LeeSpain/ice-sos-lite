import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const mockCustomers = [
      {
        email: 'james.anderson@demo.icesoslite.com',
        password: 'Demo123!@#',
        first_name: 'James',
        last_name: 'Anderson',
        phone: '+34612345001',
        country: 'Spain',
        country_code: 'ES',
        date_of_birth: '1985-03-15',
        address: 'Calle Mayor 45, 03001 Alicante, Spain',
        medical_conditions: ['Type 2 Diabetes', 'High Blood Pressure'],
        allergies: ['Penicillin', 'Shellfish'],
        medications: ['Metformin 500mg twice daily', 'Lisinopril 10mg once daily'],
        blood_type: 'A+',
        emergency_contacts: [{ name: 'Sarah Anderson', phone: '+34612345002', relationship: 'Wife', priority: 1 }],
        language_preference: 'en',
        has_spain_call_center: true
      },
      {
        email: 'maria.garcia@demo.icesoslite.com',
        password: 'Demo123!@#',
        first_name: 'Maria',
        last_name: 'Garcia',
        phone: '+34622345003',
        country: 'Spain',
        country_code: 'ES',
        date_of_birth: '1978-07-22',
        address: 'Avenida de la Constitución 78, 41001 Sevilla, Spain',
        medical_conditions: ['Asthma'],
        allergies: ['Pollen', 'Dust mites'],
        medications: ['Albuterol inhaler as needed', 'Singulair 10mg once daily'],
        blood_type: 'O+',
        emergency_contacts: [{ name: 'Carlos Garcia', phone: '+34622345004', relationship: 'Husband', priority: 1 }],
        language_preference: 'es',
        has_spain_call_center: true
      },
      {
        email: 'robert.thompson@demo.icesoslite.com',
        password: 'Demo123!@#',
        first_name: 'Robert',
        last_name: 'Thompson',
        phone: '+34632345005',
        country: 'Spain',
        country_code: 'ES',
        date_of_birth: '1962-11-08',
        address: 'Plaza de España 12, 29015 Málaga, Spain',
        medical_conditions: ['Heart Disease', 'Arthritis', 'Osteoporosis'],
        allergies: ['Aspirin', 'NSAIDs'],
        medications: ['Atorvastatin 40mg once daily', 'Clopidogrel 75mg once daily', 'Calcium 600mg twice daily'],
        blood_type: 'B+',
        emergency_contacts: [{ name: 'Linda Thompson', phone: '+34632345006', relationship: 'Wife', priority: 1 }],
        language_preference: 'en',
        has_spain_call_center: true
      },
      {
        email: 'sophie.martin@demo.icesoslite.com',
        password: 'Demo123!@#',
        first_name: 'Sophie',
        last_name: 'Martin',
        phone: '+33642345007',
        country: 'France',
        country_code: 'FR',
        date_of_birth: '1990-05-18',
        address: '15 Rue de la République, 06000 Nice, France',
        medical_conditions: ['Epilepsy'],
        allergies: ['Latex'],
        medications: ['Levetiracetam 500mg twice daily'],
        blood_type: 'AB+',
        emergency_contacts: [{ name: 'Pierre Martin', phone: '+33642345008', relationship: 'Brother', priority: 1 }],
        language_preference: 'fr',
        has_spain_call_center: false
      },
      {
        email: 'hans.mueller@demo.icesoslite.com',
        password: 'Demo123!@#',
        first_name: 'Hans',
        last_name: 'Mueller',
        phone: '+49652345009',
        country: 'Germany',
        country_code: 'DE',
        date_of_birth: '1970-09-30',
        address: 'Hauptstraße 89, 10115 Berlin, Germany',
        medical_conditions: ['COPD', 'Hypertension', 'Type 2 Diabetes'],
        allergies: ['Sulfa drugs'],
        medications: ['Tiotropium inhaler once daily', 'Amlodipine 5mg once daily', 'Glipizide 10mg twice daily'],
        blood_type: 'O-',
        emergency_contacts: [{ name: 'Greta Mueller', phone: '+49652345010', relationship: 'Wife', priority: 1 }],
        language_preference: 'de',
        has_spain_call_center: false
      }
    ]

    const results = []

    for (const customer of mockCustomers) {
      let userId: string;
      
      // Create auth user or get existing
      const { data: authData, error: authError } = await supabaseClient.auth.admin.createUser({
        email: customer.email,
        password: customer.password,
        email_confirm: true,
        user_metadata: {
          first_name: customer.first_name,
          last_name: customer.last_name,
          phone: customer.phone
        }
      })

      if (authError) {
        // If user exists, try to find them
        if (authError.message?.includes('already been registered')) {
          const { data: existingUsers } = await supabaseClient.auth.admin.listUsers();
          const existingUser = existingUsers?.users?.find(u => u.email === customer.email);
          if (existingUser) {
            userId = existingUser.id;
            console.log(`Using existing user ${customer.email}`);
          } else {
            console.error(`Failed to create user ${customer.email}:`, authError)
            results.push({ email: customer.email, status: 'failed', error: authError.message })
            continue
          }
        } else {
          console.error(`Failed to create user ${customer.email}:`, authError)
          results.push({ email: customer.email, status: 'failed', error: authError.message })
          continue
        }
      } else {
        userId = authData.user.id;
      }

      // Upsert profile with complete data
      const { error: profileError } = await supabaseClient
        .from('profiles')
        .upsert({
          user_id: userId,
          phone: customer.phone,
          country: customer.country,
          country_code: customer.country_code,
          date_of_birth: customer.date_of_birth,
          address: customer.address,
          medical_conditions: customer.medical_conditions,
          allergies: customer.allergies,
          medications: customer.medications,
          blood_type: customer.blood_type,
          emergency_contacts: customer.emergency_contacts,
          language_preference: customer.language_preference,
          preferred_language: customer.language_preference,
          profile_completion_percentage: 100,
          subscription_regional: true,
          has_spain_call_center: customer.has_spain_call_center,
          location_sharing_enabled: true,
          transferred_to_care: false,
          care_transfer_status: 'not_transferred'
        }, {
          onConflict: 'user_id'
        })

      if (profileError) {
        console.error(`Failed to update profile for ${customer.email}:`, profileError)
        results.push({ email: customer.email, status: 'profile_failed', error: profileError.message })
        continue
      }

      // Upsert subscription (removed payment_status as it doesn't exist in schema)
      const { error: subError } = await supabaseClient
        .from('subscribers')
        .upsert({
          user_id: userId,
          email: customer.email,
          subscribed: true,
          subscription_tier: 'Premium Protection',
          subscription_start: new Date().toISOString(),
          subscription_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
        }, {
          onConflict: 'user_id'
        })

      if (subError) {
        console.error(`Failed to create subscription for ${customer.email}:`, subError)
        results.push({ email: customer.email, status: 'subscription_failed', error: subError.message })
        continue
      }

      results.push({ email: customer.email, status: 'success', user_id: userId })
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error seeding customers:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
