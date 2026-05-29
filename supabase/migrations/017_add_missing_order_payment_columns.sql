-- Ensure payment confirmation RPC has every column it writes to.
-- Some local databases may have applied newer RPC migrations without migration 013.

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS payment_method_details TEXT;

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS payment_confirmed_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS payment_verified_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS payment_verified_by UUID REFERENCES auth.users(id);

NOTIFY pgrst, 'reload schema';
