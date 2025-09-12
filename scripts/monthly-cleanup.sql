-- Delete assets and tracks older than 30 days
-- Careful to sync with table names in schema
DELETE FROM track
WHERE
    updated_at < NOW() - INTERVAL '30 days'
    OR created_at < NOW() - INTERVAL '30 days';
