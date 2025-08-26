-- Clean up user ridhiv8@gmail.com and related data for fresh signup testing

-- Delete unused verification codes for this email
DELETE FROM verification_codes WHERE email = 'ridhiv8@gmail.com';

-- Delete the user from auth.users (this will cascade to any related data)
DELETE FROM auth.users WHERE email = 'ridhiv8@gmail.com';