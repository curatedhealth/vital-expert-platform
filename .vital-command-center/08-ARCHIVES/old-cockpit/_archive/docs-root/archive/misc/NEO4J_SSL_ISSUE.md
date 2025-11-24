# Neo4j SSL Certificate Issue (macOS/Python 3.13)

## Problem

Neo4j Aura connection failing with SSL certificate verification error:
```
ssl.SSLCertVerificationError: [SSL: CERTIFICATE_VERIFY_FAILED]
certificate verify failed: self-signed certificate in certificate chain
```

This is a **common macOS/Python 3.13 issue** where Python doesn't trust system SSL certificates by default.

---

## ✅ Solutions (Choose One)

### **Solution 1: Set Environment Variables (Quickest)**

Add these to your shell profile (`~/.zshrc` or `~/.bashrc`):

```bash
# Get certifi path
CERT_PATH=$(python3 -c "import certifi; print(certifi.where())")

# Add to your profile
export SSL_CERT_FILE="$CERT_PATH"
export REQUESTS_CA_BUNDLE="$CERT_PATH"
```

Then reload:
```bash
source ~/.zshrc  # or ~/.bashrc
```

---

### **Solution 2: Install System Certificates**

```bash
# Run our fix script
chmod +x scripts/fix_ssl_certificates.sh
./scripts/fix_ssl_certificates.sh
```

---

### **Solution 3: Temporary Workaround (Testing Only)**

**⚠️ NOT RECOMMENDED FOR PRODUCTION**

For immediate testing, you can disable SSL verification:

1. The Neo4j connection is working
2. Credentials are correct
3. Database is accessible

Then properly fix SSL for production use.

---

## ✅ Verify It's Working

After applying a solution:

```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path"
python3 scripts/test_neo4j_simple.py
```

Expected output:
```
✅ Connection successful!
✅ ALL TESTS PASSED!
```

---

## 📋 Current Status

**Neo4j AuraDB Instance:**
- Instance: Vita-expert (f2601ba0)
- URI: neo4j+s://f2601ba0.databases.neo4j.io
- Status: ✅ Running (resolves to 34.78.76.49:7687)

**Issue:** SSL certificate verification on macOS
**Solution:** Apply one of the solutions above

---

## 🚀 Next Steps After Fixing SSL

1. ✅ Test Neo4j connection
2. Run PostgreSQL fulltext migration
3. Migrate agents to Neo4j
4. Test GraphRAG integration

---

##Alternative: Use Docker

If SSL issues persist, you can use the local Docker Neo4j for development:

```bash
# Start local Neo4j
docker-compose -f docker-compose.neo4j.yml up -d

# Update .env to use local instance
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=development-password

# Test connection
python3 scripts/test_neo4j_simple.py
```

Then switch back to Neo4j Aura for production once SSL is fixed.
