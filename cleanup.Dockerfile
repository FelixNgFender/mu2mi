FROM alpine:3.22

WORKDIR /app

COPY scripts/monthly-cleanup.sql ./monthly-cleanup.sql

ARG PG_VERSION='16'

RUN apk add --update --no-cache postgresql${PG_VERSION}-client

CMD pg_isready --dbname=$DATABASE_URL && \
  psql --version && \
  psql $DATABASE_URL -f ./monthly-cleanup.sql
