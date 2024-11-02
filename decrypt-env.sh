#!/bin/sh

FILE=".env"

if [ -f "$FILE" ]; then
    if [ -z "$ANSIBLE_VAULT_PASSWORD" ]; then
        echo "Error: ANSIBLE_VAULT_PASSWORD environment variable is not set."
        exit 1
    fi

    echo "$ANSIBLE_VAULT_PASSWORD" >/tmp/vault_password

    ansible-vault decrypt "$FILE" --vault-password-file=/tmp/vault_password

    rm /tmp/vault_password
else
    echo "No encrypted .env file found."
fi
