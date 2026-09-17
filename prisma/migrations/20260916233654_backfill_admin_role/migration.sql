-- Grant the admin role to the one designated account, wherever this
-- migration runs (local or production). New sign-ups get their role
-- assigned by the database hook in lib/auth.ts, not by migrations —
-- this is only a one-time backfill for a user created before the
-- `role` column existed.
UPDATE "user" SET "role" = 'admin' WHERE "email" = 'levexll764@gmail.com';
