#!/usr/bin/env bash

monerod --stagenet --rpc-login superuser:abctesting123 --rpc-access-control-origins http://localhost:8080 --db-sync-mode fastest
