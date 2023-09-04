CREATE DATABASE prga;
\c prga
CREATE TABLE users (
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) PRIMARY KEY,
    token VARCHAR(255),
    role VARCHAR(255)
);

-- Inserimento di dati di esempio nella tabella Users
INSERT INTO Users (username, email, token, role) VALUES 
    ('user1','user1@genericmail.com', 17.5, 'user'),
    ('user2','user2@genericmail.com', 12.5, 'user'),
    ('user3','user3@genericmail.com', 0, 'user'),
    ('admin1','admin@genericmail.com', 0, 'admin');