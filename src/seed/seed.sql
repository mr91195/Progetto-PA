CREATE DATABASE prga;
\c prga

CREATE TABLE users (
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) PRIMARY KEY,
    token INTEGER NOT NULL,
    role VARCHAR(255) NOT NULL
);

CREATE TABLE store (
    id SERIAL PRIMARY KEY,
    food VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL
);

--CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE orders (
  uuid UUID PRIMARY KEY ,
  request_order JSON[] NOT NULL,
  created_at TIMESTAMP NOT NULL,
  created_by VARCHAR(255) NOT NULL,
  status VARCHAR(255) NOT NULL 
);

CREATE TABLE load_order (
    uuid UUID NOT NULL,
    foodIndex INTEGER NOT NULL,
    food VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    deviation INTEGER NOT NULL
);

-- Inserimento di dati di esempio nella tabella Users
INSERT INTO users (username, email, token, role) VALUES 
    ('operatore1','op1@mailnator.com', 15, 'user'),
    ('operatore2','op2@mailnator.com', 5, 'user'),
    ('admin','admin@genericmail.com', 0, 'admin');