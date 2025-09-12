-- Custom SQL migration file, put your code below! --
-- https://github.com/animir/node-rate-limiter-flexible/wiki/PostgreSQL#usage
CREATE TABLE IF NOT EXISTS rate_limiter_track_processing (
    key varchar(255) PRIMARY KEY,
    points integer NOT NULL DEFAULT 0,
    expire bigint
)
