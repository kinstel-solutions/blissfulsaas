-- Promote user to ADMIN role
DO $$
DECLARE
    target_user_id UUID;
    target_email TEXT := 'tbs_admin@gmail.com';
BEGIN
    -- 1. Find the user ID from the auth schema
    SELECT id INTO target_user_id FROM auth.users WHERE email = target_email;

    IF target_user_id IS NULL THEN
        RAISE NOTICE 'User with email % not found. Please ensure they have signed up first.', target_email;
    ELSE
        -- 2. Update the role in the public.User table
        UPDATE public."User" 
        SET role = 'ADMIN' 
        WHERE id = target_user_id;

        -- 3. Ensure they have an Admin profile
        INSERT INTO public."Admin" ("userId")
        VALUES (target_user_id)
        ON CONFLICT ("userId") DO NOTHING;

        -- 4. Clean up any other profiles (to keep data clean)
        DELETE FROM public."Patient" WHERE "userId" = target_user_id;
        DELETE FROM public."Therapist" WHERE "userId" = target_user_id;

        RAISE NOTICE 'User % has been promoted to ADMIN.', target_email;
    END IF;
END $$;
