-- Setup Auth Trigger for User Profile Creation
-- This migration sets up the trigger to automatically create user profiles
-- when new users sign up through Supabase Auth

-- The handle_new_user function should already exist from the main schema
-- This migration just sets up the trigger

-- Note: In Supabase, this trigger is typically set up through the Dashboard
-- Go to Authentication > Settings > User Management > User Signup
-- and enable "Create user profile on signup" or similar option

-- Alternative: Set up the trigger manually in the Supabase Dashboard SQL Editor
-- after the main schema is deployed

-- For now, we'll create a simple RPC function that can be called manually
-- to create profiles for existing users if needed

CREATE OR REPLACE FUNCTION public.create_profile_for_user(user_id UUID, email TEXT, full_name TEXT DEFAULT NULL)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  -- Insert or update profile
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (user_id, email, COALESCE(full_name, ''))
  ON CONFLICT (id) 
  DO UPDATE SET 
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    updated_at = NOW();
  
  -- Return success
  result := json_build_object(
    'success', true,
    'user_id', user_id,
    'message', 'Profile created/updated successfully'
  );
  
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    -- Return error
    result := json_build_object(
      'success', false,
      'error', SQLERRM,
      'user_id', user_id
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_profile_for_user TO authenticated;

-- Create a function to sync all existing users
CREATE OR REPLACE FUNCTION public.sync_all_user_profiles()
RETURNS JSON AS $$
DECLARE
  user_record RECORD;
  result JSON;
  success_count INTEGER := 0;
  error_count INTEGER := 0;
  total_count INTEGER := 0;
BEGIN
  -- Count total users
  SELECT COUNT(*) INTO total_count FROM auth.users;
  
  -- Loop through all users and create profiles
  FOR user_record IN 
    SELECT id, email, raw_user_meta_data->>'full_name' as full_name
    FROM auth.users
  LOOP
    BEGIN
      -- Create profile
      INSERT INTO public.profiles (id, email, full_name)
      VALUES (
        user_record.id, 
        user_record.email, 
        COALESCE(user_record.full_name, '')
      )
      ON CONFLICT (id) DO NOTHING;
      
      success_count := success_count + 1;
    EXCEPTION
      WHEN OTHERS THEN
        error_count := error_count + 1;
        -- Log error but continue
        RAISE WARNING 'Failed to create profile for user %: %', user_record.id, SQLERRM;
    END;
  END LOOP;
  
  -- Return summary
  result := json_build_object(
    'success', true,
    'total_users', total_count,
    'profiles_created', success_count,
    'errors', error_count,
    'message', 'Profile sync completed'
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to service role only
GRANT EXECUTE ON FUNCTION public.sync_all_user_profiles TO service_role;
