#!/usr/bin/env sh
set -eu

SSL_DIR=/var/lib/postgresql/ssl
mkdir -p "$SSL_DIR"

openssl req -new -x509 -days 3650 -nodes -text \
  -out "$SSL_DIR/server.crt" \
  -keyout "$SSL_DIR/server.key" \
  -subj "/CN=postgres"

chown postgres:postgres "$SSL_DIR/server.crt" "$SSL_DIR/server.key"
chmod 600 "$SSL_DIR/server.key"
chmod 644 "$SSL_DIR/server.crt"

exec docker-entrypoint.sh postgres \
  -c ssl=on \
  -c ssl_cert_file="$SSL_DIR/server.crt" \
  -c ssl_key_file="$SSL_DIR/server.key"
