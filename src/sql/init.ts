// Types
const platform_type = `
DROP TYPE IF EXISTS platforms CASCADE;
CREATE TYPE platforms AS ENUM ('YouTube', 'Twitch', 'Chaturbate', 'Selfhosted');
`;

const languages_type = `
DROP TYPE IF EXISTS languages CASCADE;
CREATE TYPE languages AS ENUM ('English', 'German', 'French', 'Italian');
`;

const categories_type = `
DROP TYPE IF EXISTS categories CASCADE;
CREATE TYPE categories AS ENUM ('Gaming', 'Learning', 'Talk', 'Erotics');
`;

const statuses_type = `
DROP TYPE IF EXISTS statuses CASCADE;
CREATE TYPE statuses AS ENUM ('active', 'closed');
`;

const plan_type = `
DROP TYPE IF EXISTS plan_types CASCADE;
CREATE TYPE plan_types AS ENUM ('basic', 'premium');
`;

const paid_statuses_type = `
DROP TYPE IF EXISTS paid_statuses CASCADE;
CREATE TYPE paid_statuses AS ENUM ('paid', 'unpaid', 'canceled');
`;

// Tables
const streamer_table = `
DROP TABLE IF EXISTS streamer CASCADE;
CREATE TABLE streamer (
    id varchar(12) PRIMARY KEY,
    name varchar(20) UNIQUE NOT NULL,
    alias varchar(24) UNIQUE NOT NULL,
    socket varchar(20) UNIQUE
);
`;
const animation_table = `
DROP TABLE IF EXISTS animation CASCADE;
CREATE TABLE animation (
    id integer PRIMARY KEY,
    streamer varchar(12) REFERENCES streamer(id),
    size integer,
    color varchar(10)
);
`;

const wallet_table = `
DROP TABLE IF EXISTS wallet CASCADE;
CREATE TABLE wallet (
    streamer varchar(12) REFERENCES streamer(id),
    restore_height integer,
    last_sync_height integer
);
`;

const category_table = `
DROP TABLE IF EXISTS category CASCADE;
CREATE TABLE category (
    id integer PRIMARY KEY,
    streamer varchar(12) REFERENCES streamer(id),
    name categories
);
`;

const stream_table = `
DROP TABLE IF EXISTS stream CASCADE;
CREATE TABLE stream (
    streamer varchar(12) REFERENCES streamer(id),
    url varchar(100),
    platform platforms,
    language languages,
    category integer REFERENCES category(id)
);
`;

const account_table = `
DROP TABLE IF EXISTS account CASCADE;
CREATE TABLE account (
    streamer varchar(12) REFERENCES streamer(id),
    creation_date timestamp,
    status statuses
);
`;

const invoice_table = `
DROP TABLE IF EXISTS invoice CASCADE;
CREATE TABLE invoice (
    id integer PRIMARY KEY,
    streamer varchar(12) REFERENCES streamer(id),
    start_date timestamp,
    end_date timestamp,
    plan_type plan_types,
    paid_status paid_statuses,
    subaddress varchar(95)
);
`;

const donation_table = `
DROP TABLE IF EXISTS donation CASCADE;
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
`;

const dontaion_settings_table = `
DROP TABLE IF EXISTS donation_settings CASCADE;
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
`;

export const drop_db = `
DROP DATABASE IF EXISTS tipxmr;
`;


export const types = [
  platform_type,
  languages_type,
  categories_type,
  statuses_type,
  plan_type,
  paid_statuses_type,
];

export const tables = [
  streamer_table,
  animation_table,
  wallet_table,
  category_table,
  stream_table,
  account_table,
  invoice_table,
  donation_table,
  dontaion_settings_table,
];
