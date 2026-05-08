#!/bin/bash

# Docker build script
#   - Downloads `all-MiniLM-L6-v2` into `src/`
#   - Copies `feeds.csv` into `src/`
#   - Builds Docker image
#
# Usage:
#   ./build.sh [<tag>]
#
#   <tag> (optional) is the image tag for the built image; defaults to latest
#
#   Example:
#       ./build.sh test

set -eu

tag=${1:-latest}

# Download `all-MiniLM-L6-v2` model into `src/`
source .venv/Scripts/activate
python download_model.py

# Copy `feeds.csv` into `src/`
cp ../feeds.csv ./src/feeds.csv

# Build Docker image
docker buildx build --platform linux/amd64 --provenance=false -t el-punto:$tag .
