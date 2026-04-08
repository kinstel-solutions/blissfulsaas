-- Fix the trigger to look into raw_user_meta_data and handle THERAPIST roles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  v_role text;
BEGIN
  -- We now extract role from raw_user_meta_data (where options.data goes)
  v_role := COALESCE(new.raw_user_meta_data->>'role', 'PATIENT');

  INSERT INTO public."User" (id, email, role, "updatedAt")
  VALUES (
    new.id,
    new.email,
    CAST(v_role AS public."Role"),
    NOW()
  );

  IF v_role = 'PATIENT' THEN
    INSERT INTO public."Patient" ("userId", "firstName", "lastName", "updatedAt")
    VALUES (
      new.id,
      new.raw_user_meta_data->>'first_name',
      new.raw_user_meta_data->>'last_name',
      NOW()
    );
  ELSIF v_role = 'THERAPIST' THEN
    INSERT INTO public."Therapist" ("userId", "firstName", "lastName", "bio", "specialities", "updatedAt")
    VALUES (
      new.id,
      new.raw_user_meta_data->>'first_name',
      new.raw_user_meta_data->>'last_name',
      new.raw_user_meta_data->>'bio',
      ARRAY[]::text[], -- Empty specialities for now or handle from metadata
      NOW()
    );
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
