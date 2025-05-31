-- Add updated_at column to messages table for message editing support
ALTER TABLE messages ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update existing messages to have updated_at = created_at
UPDATE messages SET updated_at = created_at WHERE updated_at IS NULL;

-- Set updated_at to NOT NULL after populating existing records
ALTER TABLE messages ALTER COLUMN updated_at SET NOT NULL;

-- Create trigger to automatically update updated_at on message updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_messages_updated_at 
    BEFORE UPDATE ON messages 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column(); 