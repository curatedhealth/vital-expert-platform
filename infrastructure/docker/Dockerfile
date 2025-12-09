# VITAL Platform - API Server Dockerfile
# Multi-stage build for optimized production image
# Version: 1.0.0

# =============================================================================
# Stage 1: Base Python Environment
# =============================================================================
FROM python:3.11-slim as base

# Prevent Python from writing pyc files and buffering stdout/stderr
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app/src \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

# =============================================================================
# Stage 2: Dependencies
# =============================================================================
FROM base as dependencies

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --upgrade pip && \
    pip install -r requirements.txt

# Download spacy model if needed
RUN python -m spacy download en_core_web_sm || true

# =============================================================================
# Stage 3: Development
# =============================================================================
FROM dependencies as development

# Copy source code
COPY . .

# Create non-root user
RUN useradd --create-home --shell /bin/bash appuser && \
    chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE 8000

# Development command with hot reload
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

# =============================================================================
# Stage 4: Production API
# =============================================================================
FROM dependencies as api

# Copy only necessary source code
COPY src/ ./src/
COPY pyproject.toml ./

# Create non-root user
RUN useradd --create-home --shell /bin/bash appuser && \
    mkdir -p /app/logs && \
    chown -R appuser:appuser /app
USER appuser

# Create logs directory
RUN mkdir -p /app/logs

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Production command with multiple workers
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4", "--loop", "uvloop", "--http", "httptools"]

# =============================================================================
# Stage 5: Testing
# =============================================================================
FROM dependencies as test

# Copy all source including tests
COPY . .

# Install test dependencies
RUN pip install pytest pytest-asyncio pytest-cov httpx

# Run tests
CMD ["pytest", "tests/", "-v", "--cov=src", "--cov-report=xml"]


