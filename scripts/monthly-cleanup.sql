-- Delete assets and tracks older than 30 days
-- Careful to sync with table names in schema
BEGIN;

DELETE FROM track
WHERE
    updated_at < NOW() - INTERVAL '30 days'
    OR created_at < NOW() - INTERVAL '30 days';

DELETE FROM asset
WHERE
    updated_at < NOW() - INTERVAL '30 days'
    OR created_at < NOW() - INTERVAL '30 days';

COMMIT;
