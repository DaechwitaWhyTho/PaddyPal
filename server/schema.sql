CREATE TABLE scan_history (
  id SERIAL PRIMARY KEY,
  image_name VARCHAR(255),
  disease_name VARCHAR(255) NOT NULL,
  confidence_score NUMERIC(5,4) NOT NULL,
  scanned_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE chat_messages (
  id SERIAL PRIMARY KEY,
  scan_id INTEGER REFERENCES scan_history(id) ON DELETE CASCADE,
  role VARCHAR(10) NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE users (
  user_id        SERIAL PRIMARY KEY,
  name           VARCHAR(100) NOT NULL,
  email          VARCHAR(255) UNIQUE NOT NULL,
  password_hash  TEXT NOT NULL,
  phone          VARCHAR(20),
  reset_otp      VARCHAR(6),
  otp_expires_at TIMESTAMP,
  created_at     TIMESTAMP DEFAULT NOW()
);

-- 2. Link existing scan_history rows to a user, so each scan/chat thread
--    belongs to someone and can be listed back as "previous chats".
-- Linking scan_history to users with a foreign key constraint
-- so that a user can see their previous scans and chats
-- if a user is deleted, their scan history is also deleted.
ALTER TABLE scan_history
ADD COLUMN user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE;

ALTER TABLE scan_history ALTER COLUMN scanned_at TYPE TIMESTAMPTZ USING scanned_at AT TIME ZONE 'UTC';
ALTER TABLE chat_messages ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at AT TIME ZONE 'UTC';
