-- Drop
DROP TABLE IF EXISTS password_reset_codes CASCADE;
DROP TABLE IF EXISTS refresh_tokens CASCADE;
DROP TABLE IF EXISTS user_devices CASCADE;
DROP TABLE IF EXISTS balance_history CASCADE;
DROP TABLE IF EXISTS user_history CASCADE;
DROP TABLE IF EXISTS winner_sequences CASCADE;
DROP TABLE IF EXISTS pot CASCADE;
DROP TABLE IF EXISTS autoplay_boards CASCADE;
DROP TABLE IF EXISTS boards CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS purchases CASCADE;
DROP TABLE IF EXISTS games CASCADE;

-- Create
CREATE TABLE games (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    field_count INT NOT NULL DEFAULT 16
);

CREATE TABLE transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    user_id UUID NOT NULL,
    credits INTEGER NOT NULL,
    mobilepay_transaction_number VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    reviewed_by_user_id UUID,
    reviewed_at TIMESTAMPTZ,
    CONSTRAINT transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES "AspNetUsers" ("Id") ON DELETE CASCADE,
    CONSTRAINT transactions_reviewed_by_user_id_fkey FOREIGN KEY (reviewed_by_user_id) REFERENCES "AspNetUsers" ("Id") ON DELETE SET NULL,
    CONSTRAINT transactions_status_check CHECK (status IN ('pending', 'accepted', 'denied'))
);

CREATE TABLE purchases (
       id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
       timestamp TIMESTAMPTZ NOT NULL DEFAULT (CURRENT_TIMESTAMP),
       price INTEGER NOT NULL
);

CREATE TABLE boards (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    user_id UUID NOT NULL,
    game_id UUID NOT NULL,
    configuration INTEGER[] NOT NULL,
    purchase_id UUID NOT NULL,
    CONSTRAINT boards_user_id_fkey FOREIGN KEY (user_id) REFERENCES "AspNetUsers" ("Id") ON DELETE CASCADE,
    CONSTRAINT boards_game_id_fkey FOREIGN KEY (game_id) REFERENCES games (id) ON DELETE CASCADE,
    CONSTRAINT boards_purchase_id_fkey FOREIGN KEY (purchase_id) REFERENCES purchases (id) ON DELETE CASCADE
);

CREATE TABLE autoplay_boards (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    user_id UUID NOT NULL,
    configuration INTEGER[] NOT NULL,
    purchase_id UUID NOT NULL,
    CONSTRAINT autoplay_boards_user_id_fkey FOREIGN KEY (user_id) REFERENCES "AspNetUsers" ("Id") ON DELETE CASCADE,
    CONSTRAINT autoplay_boards_purchase_id_fkey FOREIGN KEY (purchase_id) REFERENCES purchases (id) ON DELETE CASCADE
);

CREATE TABLE pot (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    rollover_amount INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE winner_sequences (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    game_id UUID NOT NULL,
    sequence INTEGER[] NOT NULL,
    CONSTRAINT winner_sequences_game_id_fkey FOREIGN KEY (game_id) REFERENCES games (id) ON DELETE CASCADE
);

CREATE TABLE user_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    affected_user_id UUID NOT NULL,
    change_made_by_user_id UUID NOT NULL,
    email VARCHAR(256) NOT NULL,
    password_hash TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    status VARCHAR(50) NOT NULL,
    CONSTRAINT user_history_affected_user_id_fkey FOREIGN KEY (affected_user_id) REFERENCES "AspNetUsers" ("Id") ON DELETE CASCADE,
    CONSTRAINT user_history_change_made_by_user_id_fkey FOREIGN KEY (change_made_by_user_id) REFERENCES "AspNetUsers" ("Id") ON DELETE SET NULL
);

CREATE TABLE balance_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    user_id UUID NOT NULL,
    amount INTEGER NOT NULL,
    additional_id UUID,
    action VARCHAR(50) NOT NULL,
    CONSTRAINT balance_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES "AspNetUsers" ("Id") ON DELETE CASCADE,
    CHECK (action IN ('user_bought', 'user_used', 'admin_assigned', 'admin_revoked', 'won_prize'))
);

CREATE TABLE user_devices (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL,
    device_id TEXT NOT NULL,
    device_name TEXT NOT NULL,
    last_used_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_ip TEXT,
    user_agent TEXT,
    FOREIGN KEY (user_id) REFERENCES "AspNetUsers" ("Id") ON DELETE CASCADE
);

CREATE TABLE refresh_tokens (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL,
    device_id UUID,
    replaced_by_token_id UUID,
    token TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    revoked_by_ip TEXT,
    created_by_ip TEXT,
    FOREIGN KEY (user_id) REFERENCES "AspNetUsers" ("Id") ON DELETE CASCADE,
    FOREIGN KEY (device_id) REFERENCES user_devices (id),
    FOREIGN KEY (replaced_by_token_id) REFERENCES refresh_tokens (id)
);

CREATE TABLE password_reset_codes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMPTZ NOT NULL,
    email VARCHAR(256) NOT NULL,
    code VARCHAR(6) NOT NULL,
    token TEXT NOT NULL,
    is_used BOOLEAN NOT NULL DEFAULT false,
    ip_address TEXT,
    attempt_count INT NOT NULL DEFAULT 0
);

-- Indexes
CREATE INDEX ix_transactions_user_id ON transactions(user_id);
CREATE INDEX ix_transactions_status ON transactions(status);
CREATE INDEX ix_transactions_timestamp ON transactions(timestamp);
CREATE INDEX ix_boards_user_id ON boards (user_id);
CREATE INDEX ix_boards_game_id ON boards (game_id);
CREATE INDEX ix_boards_purchase_id ON boards (purchase_id);
CREATE INDEX ix_autoplay_boards_user_id ON autoplay_boards (user_id);
CREATE INDEX ix_autoplay_boards_purchase_id ON autoplay_boards (purchase_id);
CREATE INDEX ix_games_start_time ON games (start_time);
CREATE INDEX ix_games_end_time ON games (end_time);
CREATE INDEX ix_winner_sequences_game_id ON winner_sequences (game_id);
CREATE INDEX ix_user_history_affected_user_id ON user_history (affected_user_id);
CREATE INDEX ix_user_history_change_made_by_user_id ON user_history (change_made_by_user_id);
CREATE INDEX ix_user_history_timestamp ON user_history (timestamp);
CREATE INDEX ix_balance_history_user_id ON balance_history (user_id);
CREATE INDEX ix_balance_history_action ON balance_history (action);
CREATE INDEX ix_balance_history_timestamp ON balance_history (timestamp);
CREATE INDEX ix_user_devices_user_id ON user_devices (user_id);
CREATE INDEX ix_user_devices_device_id ON user_devices (device_id);
CREATE INDEX ix_user_devices_last_used_at ON user_devices (last_used_at);
CREATE INDEX ix_refresh_tokens_user_id ON refresh_tokens (user_id);
CREATE INDEX ix_refresh_tokens_device_id ON refresh_tokens (device_id);
CREATE INDEX ix_refresh_tokens_expires_at ON refresh_tokens (expires_at);
CREATE INDEX ix_password_reset_codes_email ON password_reset_codes (email);
CREATE INDEX ix_password_reset_codes_expires_at ON password_reset_codes (expires_at);

CREATE UNIQUE INDEX ix_user_devices_user_device ON user_devices (user_id, device_id);