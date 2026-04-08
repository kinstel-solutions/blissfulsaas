-- Create a function that handles the trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public."User" (id, email, role)
  VALUES (
    new.id,
    new.email,
    CAST(COALESCE(new.raw_app_meta_data->>'role', 'PATIENT') AS public."Role")
  );

  IF COALESCE(new.raw_app_meta_data->>'role', 'PATIENT') = 'PATIENT' THEN
    INSERT INTO public."Patient" ("userId", "firstName", "lastName")
    VALUES (
      new.id,
      new.raw_user_meta_data->>'first_name',
      new.raw_user_meta_data->>'last_name'
    );
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
