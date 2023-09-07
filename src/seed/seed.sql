CREATE DATABASE prga;
\c prga

CREATE TABLE users (
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) PRIMARY KEY,
    token VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL
);

CREATE TABLE store (
    id SERIAL PRIMARY KEY,
    food VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL
);

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE orders (
  orderId SERIAL PRIMARY KEY,
  uuid UUID NOT NULL DEFAULT uuid_generate_v4(),
  requestOrder JSONB NOT NULL,
  load JSONB,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  byUser VARCHAR(255) NOT NULL,
  status VARCHAR(255) NOT NULL DEFAULT 'creato'
);


-- Inserimento di dati di esempio nella tabella Users
INSERT INTO users (username, email, token, role) VALUES 
    ('user1','user1@genericmail.com', 17.5, 'user'),
    ('user2','user2@genericmail.com', 12.5, 'user'),
    ('user3','user3@genericmail.com', 0, 'user'),
    ('admin1','admin@genericmail.com', 0, 'admin');
-- INserimento di dati di esempio nella tabella store
INSERT INTO store (food, quantity) VALUES 
    ('frumento', 10);

-- Inserimento di un esempio di ordes
INSERT INTO orders (requestOrder, byUser, status)
VALUES (
  '[{"foodIndex": 1, "food": "frumento", "quantity": 2}, {"foodIndex": 2, "food": "cereali", "quantity": 1}]','user1', 'creato');

--'[{"food": "Pasta", "quantity": 2, "timestampLoad": NOW()}]'



