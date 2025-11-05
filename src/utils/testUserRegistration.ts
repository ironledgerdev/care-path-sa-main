import { supabase } from '@/integrations/supabase/client';

export interface UserRegistrationTestResult {
  success: boolean;
  message: string;
  userId?: string;
  profileCreated?: boolean;
  data?: any;
  error?: any;
}

export const testUserRegistration = async (
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  phone?: string,
  role: 'patient' | 'doctor' | 'admin' = 'patient'
): Promise<UserRegistrationTestResult> => {
  try {
    console.log('🧪 Testing user registration for:', email);

    // Step 1: Check if user already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('email', email)
      .single();

    if (existingProfile) {
      return {
        success: false,
        message: `User with email ${email} already exists`,
        data: existingProfile
      };
    }

    // Step 2: Attempt to register the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          phone,
          role,
        }
      }
    });

    if (authError) {
      return {
        success: false,
        message: `Registration failed: ${authError.message}`,
        error: authError
      };
    }

    if (!authData.user) {
      return {
        success: false,
        message: 'Registration failed: No user data returned',
        data: authData
      };
    }

    console.log('✅ User registered successfully:', authData.user.id);

    // Step 3: Wait a bit for the profile trigger to create the profile
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Step 4: Check if profile was created automatically
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError || !profile) {
      console.log('⚠️ Profile not found, attempting manual creation...');
      
      // Manually create profile if it doesn't exist
      const { data: createdProfile, error: createProfileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email,
          first_name: firstName,
          last_name: lastName,
          phone,
          role,
        })
        .select()
        .single();

      if (createProfileError) {
        return {
          success: false,
          message: `Profile creation failed: ${createProfileError.message}`,
          userId: authData.user.id,
          profileCreated: false,
          error: createProfileError
        };
      }

      return {
        success: true,
        message: 'User registered successfully with manual profile creation',
        userId: authData.user.id,
        profileCreated: true,
        data: {
          user: authData.user,
          profile: createdProfile
        }
      };
    }

    return {
      success: true,
      message: 'User registered successfully with automatic profile creation',
      userId: authData.user.id,
      profileCreated: true,
      data: {
        user: authData.user,
        profile
      }
    };

  } catch (error: any) {
    return {
      success: false,
      message: `Unexpected error: ${error.message}`,
      error
    };
  }
};

export const testUserLogin = async (
  email: string,
  password: string
): Promise<UserRegistrationTestResult> => {
  try {
    console.log('🧪 Testing user login for:', email);

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      return {
        success: false,
        message: `Login failed: ${authError.message}`,
        error: authError
      };
    }

    if (!authData.user) {
      return {
        success: false,
        message: 'Login failed: No user data returned',
        data: authData
      };
    }

    // Check if profile exists
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    return {
      success: true,
      message: 'User logged in successfully',
      userId: authData.user.id,
      profileCreated: !!profile,
      data: {
        user: authData.user,
        profile
      }
    };

  } catch (error: any) {
    return {
      success: false,
      message: `Unexpected error: ${error.message}`,
      error
    };
  }
};

export const testDoctorEnrollment = async (
  email: string,
  firstName: string,
  lastName: string,
  practiceName?: string
): Promise<UserRegistrationTestResult> => {
  try {
    console.log('🧪 Testing doctor enrollment for:', email);

    const enrollmentData = {
      practice_name: practiceName || `${firstName} ${lastName} Medical Practice`,
      speciality: 'General Practitioner',
      qualification: 'MBChB',
      license_number: `TEST${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      years_experience: '5',
      consultation_fee: '500',
      address: '123 Test Medical Street',
      city: 'Cape Town',
      province: 'Western Cape',
      postal_code: '8001',
      bio: 'Test doctor application for automated testing purposes.',
    };

    const applicantData = {
      first_name: firstName,
      last_name: lastName,
      email: email
    };

    // Step 1: Submit doctor enrollment
    const { data: enrollmentResult, error: enrollmentError } = await supabase.functions.invoke('submit-doctor-enrollment', {
      body: {
        form: enrollmentData,
        applicant: applicantData
      }
    });

    if (enrollmentError) {
      return {
        success: false,
        message: `Doctor enrollment failed: ${enrollmentError.message}`,
        error: enrollmentError
      };
    }

    if (!enrollmentResult?.success) {
      return {
        success: false,
        message: 'Doctor enrollment failed: No success confirmation',
        data: enrollmentResult
      };
    }

    console.log('✅ Doctor enrollment submitted successfully');

    // Step 2: Wait a bit for the data to be processed
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Step 3: Verify the pending doctor record was created
    const { data: pendingDoctor, error: pendingError } = await supabase
      .from('pending_doctors')
      .select('*, profiles!pending_doctors_user_id_fkey(*)')
      .eq('practice_name', enrollmentData.practice_name)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (pendingError || !pendingDoctor) {
      return {
        success: false,
        message: `Pending doctor record not found: ${pendingError?.message || 'No data'}`,
        error: pendingError
      };
    }

    // Step 4: Verify the user profile exists
    if (!pendingDoctor.profiles) {
      return {
        success: false,
        message: 'Doctor enrollment succeeded but user profile not found',
        data: pendingDoctor
      };
    }

    return {
      success: true,
      message: 'Doctor enrollment completed successfully - application is pending approval',
      userId: pendingDoctor.user_id,
      profileCreated: true,
      data: {
        pendingDoctor,
        profile: pendingDoctor.profiles
      }
    };

  } catch (error: any) {
    return {
      success: false,
      message: `Unexpected error during doctor enrollment: ${error.message}`,
      error
    };
  }
};

export const verifyDatabaseState = async () => {
  try {
    console.log('🔍 Verifying database state...');

    // Check total counts
    const [profiles, pendingDoctors, doctors, memberships, bookings] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact' }),
      supabase.from('pending_doctors').select('id', { count: 'exact' }),
      supabase.from('doctors').select('id', { count: 'exact' }),
      supabase.from('memberships').select('id', { count: 'exact' }),
      supabase.from('bookings').select('id', { count: 'exact' })
    ]);

    // Get recent data
    const { data: recentProfiles } = await supabase
      .from('profiles')
      .select('id, email, first_name, last_name, role, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    const { data: recentDoctors } = await supabase
      .from('pending_doctors')
      .select('id, practice_name, speciality, status, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    return {
      success: true,
      message: 'Database state verification complete',
      data: {
        counts: {
          profiles: profiles.count || 0,
          pending_doctors: pendingDoctors.count || 0,
          doctors: doctors.count || 0,
          memberships: memberships.count || 0,
          bookings: bookings.count || 0
        },
        recent: {
          profiles: recentProfiles || [],
          doctors: recentDoctors || []
        }
      }
    };

  } catch (error: any) {
    return {
      success: false,
      message: `Database verification failed: ${error.message}`,
      error
    };
  }
};
