"""
Modal Deployment Configuration for VITAL AI Engine

This file configures Modal deployment for the Python AI Engine.
Modal provides serverless containers with automatic scaling.

Usage:
    modal deploy services/ai-engine/modal_deploy.py
"""

import modal

# Create Modal app
app = modal.App("vital-ai-engine")

# Define the image with all dependencies
image = (
    modal.Image.debian_slim(python_version="3.12")
    .apt_install("curl", "gcc", "build-essential")  # For building Python packages
    .copy_local_file("requirements.txt", "/app/requirements.txt")
    .pip_install("-r", "/app/requirements.txt")  # Install from requirements.txt
    .copy_local_dir("src", "/app/src")
    .copy_local_file("start.py", "/app/start.py")
)

# Define secrets (set these in Modal dashboard or via CLI)
secrets = [
    modal.Secret.from_name("vital-ai-engine-secrets"),  # Create this in Modal dashboard
]


@app.function(
    image=image,
    secrets=secrets,
    container_idle_timeout=300,  # 5 minutes
    timeout=300,  # 5 minutes max execution time
    cpu=2.0,  # 2 CPUs
    memory=4096,  # 4GB RAM
    allow_concurrent_inputs=10,  # Handle 10 concurrent requests
    healthcheck_path="/health",
)
@modal.web_endpoint(method="GET", label="health")
def health():
    """Health check endpoint for Modal."""
    return {"status": "healthy", "service": "vital-ai-engine"}


@app.function(
    image=image,
    secrets=secrets,
    container_idle_timeout=300,
    timeout=300,
    cpu=2.0,
    memory=4096,
    allow_concurrent_inputs=10,
    healthcheck_path="/health",
)
@modal.asgi_app(label="vital-ai-engine")
def fastapi_app():
    """Main FastAPI application."""
    import sys
    import os
    
    # Set Python path - Modal runs from /app
    sys.path.insert(0, "/app/src")
    os.chdir("/app/src")
    
    # Import and return FastAPI app
    from main import app
    
    return app


# Alternative: Deploy as a web service with custom domain
@app.function(
    image=image,
    secrets=secrets,
    container_idle_timeout=300,
    timeout=300,
    cpu=2.0,
    memory=4096,
    allow_concurrent_inputs=10,
)
@modal.web_endpoint(
    method="POST",
    label="api",
    # custom_domains=["api.vital.expert"]  # Uncomment to use custom domain
)
def api():
    """API endpoint handler."""
    # This will be handled by the FastAPI ASGI app
    pass


if __name__ == "__main__":
    # For local testing
    with app.run():
        print("Modal app is running locally")
