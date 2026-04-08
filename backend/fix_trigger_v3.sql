-- Fix the trigger by removing columns that don't exist in our current Prisma schema
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  v_role text;
BEGIN
  v_role := COALESCE(new.raw_user_meta_data->>'role', 'PATIENT');

  -- User has updatedAt
  INSERT INTO public."User" (id, email, role, "updatedAt")
  VALUES (
    new.id,
    new.email,
    CAST(v_role AS public."Role"),
    NOW()
  );

  -- Patient does NOT have updatedAt in schema.prisma
  IF v_role = 'PATIENT' THEN
    INSERT INTO public."Patient" ("userId", "firstName", "lastName")
    VALUES (
      new.id,
      new.raw_user_meta_data->>'first_name',
      new.raw_user_meta_data->>'last_name'
    );
  -- Therapist does NOT have updatedAt in schema.prisma
  ELSIF v_role = 'THERAPIST' THEN
    INSERT INTO public."Therapist" ("userId", "firstName", "lastName", "bio", "specialities")
    VALUES (
      new.id,
      new.raw_user_meta_data->>'first_name',
      new.raw_user_meta_data->>'last_name',
      new.raw_user_meta_data->>'bio',
      ARRAY[]::text[] 
    );
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
