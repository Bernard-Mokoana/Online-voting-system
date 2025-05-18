-- Insert test admin users
INSERT INTO users (username, password, role) VALUES
('admin1', '$2b$10$YourHashedPasswordHere', 'admin'),
('admin2', '$2b$10$YourHashedPasswordHere', 'admin');

-- Insert test voter users
INSERT INTO users (username, password, role) VALUES
('voter1', '$2b$10$YourHashedPasswordHere', 'voter'),
('voter2', '$2b$10$YourHashedPasswordHere', 'voter'),
('voter3', '$2b$10$YourHashedPasswordHere', 'voter');

-- Note: The passwords are hashed versions of 'password123'
-- You can use these credentials to test:
-- Admin users:
-- Username: admin1, Password: password123
-- Username: admin2, Password: password123

-- Voter users:
-- Username: voter1, Password: password123
-- Username: voter2, Password: password123
-- Username: voter3, Password: password123 