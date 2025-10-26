# Simple single-stage Dockerfile for Railway
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy application code and startup script
COPY . .
COPY start.py /app/start.py
RUN chmod +x /app/start.py

# Expose port
EXPOSE 8000

# Use Python startup script that reads PORT from environment
CMD ["python3", "/app/start.py"]
