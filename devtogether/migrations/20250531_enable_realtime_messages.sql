-- Enable Realtime for messages table
-- Execute this in your Supabase SQL Editor

-- Enable realtime for the messages table
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- Verify realtime is enabled (optional check)
SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime'; 