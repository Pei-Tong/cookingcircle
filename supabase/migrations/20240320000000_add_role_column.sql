-- Create an enum type for user roles if it doesn't exist
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('user', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add role column to auth.users if it doesn't exist
DO $$ BEGIN
    ALTER TABLE auth.users ADD COLUMN role user_role DEFAULT 'user';
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Create a function to add role column
CREATE OR REPLACE FUNCTION public.add_role_column()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Check if the role column exists
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'auth'
        AND table_name = 'users'
        AND column_name = 'role'
    ) THEN
        -- Create the enum type if it doesn't exist
        IF NOT EXISTS (
            SELECT 1
            FROM pg_type
            WHERE typname = 'user_role'
        ) THEN
            CREATE TYPE user_role AS ENUM ('user', 'admin');
        END IF;

        -- Add the role column
        ALTER TABLE auth.users ADD COLUMN role user_role DEFAULT 'user';
    END IF;
END;
$$; 