#!/bin/bash
# Development server startup script

# Initialize database if schema exists and db doesn't
if [ -f "schema.sql" ] && [ ! -f "dev.db" ]; then
    echo "Initializing database..."
    sqlite3 dev.db < schema.sql
fi

# Install dependencies if needed
if ! command -v uvicorn &> /dev/null; then
    pip install uv
    uv pip install --system -e .
fi

# Start uvicorn with reload
uvicorn src.main:app --host 0.0.0.0 --port 3001 --reload
