#!/bin/bash
# Fix SSL certificates for Python on macOS
#
# This script installs SSL certificates needed for Neo4j Aura connections

echo "=" * 60
echo "SSL Certificate Fix for Python on macOS"
echo "=" * 60
echo ""

# Find Python installation
PYTHON_VERSION=$(python3 --version 2>&1 | awk '{print $2}' | cut -d. -f1,2)
echo "Python version: $PYTHON_VERSION"

# Method 1: Try to run the Install Certificates command if it exists
CERT_COMMAND="/Applications/Python ${PYTHON_VERSION}/Install Certificates.command"
if [ -f "$CERT_COMMAND" ]; then
    echo "✅ Found Python certificate installer"
    echo "Running: $CERT_COMMAND"
    "$CERT_COMMAND"
    echo "✅ Certificates installed"
    exit 0
fi

# Method 2: Install certifi and link to system
echo "Installing certifi package..."
pip3 install --upgrade certifi

# Method 3: Create symbolic link (for some Python installations)
CERT_FILE=$(python3 -c "import certifi; print(certifi.where())")
echo "Certifi certificate bundle: $CERT_FILE"

# Set environment variable
export SSL_CERT_FILE="$CERT_FILE"
export REQUESTS_CA_BUNDLE="$CERT_FILE"

echo ""
echo "✅ Certificate configuration complete"
echo ""
echo "Add these to your shell profile (.zshrc or .bashrc):"
echo "export SSL_CERT_FILE=\"$CERT_FILE\""
echo "export REQUESTS_CA_BUNDLE=\"$CERT_FILE\""
echo ""
