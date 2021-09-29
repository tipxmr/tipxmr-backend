# TYPES 
CREATE TYPE platforms AS ENUM ('YouTube', 'Twitch', 'Chaturbate', 'Selfhosted');

CREATE TYPE languages AS ENUM ('English', 'German', 'French', 'Italian');

CREATE TYPE categories AS ENUM ('Gaming', 'Learning', 'Talk', 'Erotics');

CREATE TYPE statuses AS ENUM ('active', 'closed');

CREATE TYPE plan_types AS ENUM ('basic', 'premium');

CREATE TYPE paid_statuses AS ENUM ('paid', 'unpaid', 'canceled');

# Tables
CREATE TABLE streamer (
    id varchar(12) PRIMARY KEY,
    name varchar(20) UNIQUE NOT NULL,
    alias varchar(24) UNIQUE NOT NULL,
    socket varchar(20) UNIQUE
);

CREATE TABLE animation (
    id integer PRIMARY KEY,
    streamer varchar(12) REFERENCES streamer(id),
    size integer,
    color varchar(10)
);

CREATE TABLE wallet (
    streamer varchar(12) REFERENCES streamer(id),
    restore_height integer,
    last_sync_height integer
);

CREATE TABLE category (
    id integer PRIMARY KEY,
    streamer varchar(12) REFERENCES streamer(id),
    name categories
);

CREATE TABLE stream (
    streamer varchar(12) REFERENCES streamer(id),
    url varchar(100),
    platform platforms,
    language languages,
    category REFERENCES category(id)
);

CREATE TABLE account (
    streamer varchar(12) REFERENCES streamer(id),
    creation_date timestamp,
    status statuses
);

CREATE TABLE invoice (
    id integer PRIMARY KEY,
    streamer varchar(12) REFERENCES streamer(id),
    start_date timestamp,
    end_date timestamp,
    plan_type plan_types,
    paid_status paid_statuses,
    subaddress varchar(95)
);

CREATE TABLE donation (
    id integer PRIMARY KEY,
    streamer varchar(12) REFERENCES streamer(id),
    amount double precision NOT NULL,
    message varchar(256),
    display_time_seconds integer,
    subaddress varchar(95),
    confirmations integer,
    giphy_url varchar(100),
    donor varchar(24),
    timestamp timestamp
);

CREATE TABLE donation_settings (
    streamer varchar(12) REFERENCES streamer(id),
    second_price integer,
    char_price double precision,
    char_limit integer,
    min_amount integer,
    gifs_min_amount double precision,
    goal double precision,
    goal_progress real,
    goal_reached boolean
);