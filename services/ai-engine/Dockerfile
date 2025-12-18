# VITAL AI Engine - Production Dockerfile (Multi-Stage Build)
# Build context: services/ directory (run: docker build -f ai-engine/Dockerfile .)
# Updated: 2025-12-18
FROM python:3.11-slim as builder

# Set environment variables for build
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PIP_PREFER_BINARY=1

# Install system dependencies needed for building Python packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    curl \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy shared-kernel package first (internal dependency)
COPY shared-kernel /app/shared-kernel

# Copy requirements
COPY ai-engine/requirements-docker.txt .

# Install Python dependencies into a virtual environment
RUN python -m venv /opt/venv && \
    /opt/venv/bin/pip install --upgrade pip setuptools wheel && \
    /opt/venv/bin/pip install -e /app/shared-kernel && \
    /opt/venv/bin/pip install --prefer-binary --no-cache-dir -r requirements-docker.txt

# Stage 2: Runtime stage - Minimal production image
FROM python:3.11-slim

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONPATH=/app/src \
    PATH="/opt/venv/bin:$PATH" \
    SSL_CERT_FILE=/opt/venv/lib/python3.11/site-packages/certifi/cacert.pem

# Set working directory
WORKDIR /app

# Install only runtime dependencies (curl for health checks)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Copy virtual environment from builder stage
COPY --from=builder /opt/venv /opt/venv

# Copy application code
COPY ai-engine/src/ ./src/

# Create logs directory with proper permissions
RUN mkdir -p /app/logs && \
    chmod 755 /app/logs

# Create checkpoint directory for LangGraph (before user creation)
RUN mkdir -p /app/data/checkpoints && \
    chmod 755 /app/data

# Create non-root user for security
RUN groupadd -r appuser && \
    useradd -r -g appuser -u 1000 appuser && \
    chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8000

# Health check with proper configuration
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Start the FastAPI app via uvicorn, pointing to src/main.py
CMD ["python3", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--app-dir", "/app/src"]
