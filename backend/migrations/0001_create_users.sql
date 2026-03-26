-- Migration: 0001_create_users
-- Creates the users table for account management

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           TEXT UNIQUE NOT NULL,
    password_hash   TEXT NOT NULL,
    display_name    TEXT NOT NULL,
    language_pref   TEXT NOT NULL DEFAULT 'en' CHECK (language_pref IN ('en', 'fa')),
    role            TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
