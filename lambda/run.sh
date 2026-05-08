#!/bin/bash

# Local run script
#   - Downloads `all-MiniLM-L6-v2` model into `src/`
#   - Copies `feeds.csv` into `src/`
#   - Runs `lambda_function.lambda_handler`
#
# Usage:
#   ./run.sh

set -eu

# Load env vars from top-level .env
set -a
source ../.env
set +a

# Download `all-MiniLM-L6-v2` model into `src/`
source .venv/Scripts/activate
python download_model.py

# Copy `feeds.csv` into `src/`
cp ../feeds.csv ./src/feeds.csv

# Run `lambda_function.lambda_handler`
python -c 'from src import lambda_function; lambda_function.lambda_handler(None, None)'
