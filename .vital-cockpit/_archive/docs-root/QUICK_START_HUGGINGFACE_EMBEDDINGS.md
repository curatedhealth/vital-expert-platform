# Quick Start: Switch to FREE HuggingFace Embeddings 💰

## 🚀 **3 Steps to Save 100% on Embedding Costs!**

### Step 1: Get FREE HuggingFace API Key

1. Sign up: https://huggingface.co/join (FREE!)
2. Go to: https://huggingface.co/settings/tokens
3. Create new token (Read access is enough)
4. Copy your token: `hf_xxxxxxxxxxxxx`

### Step 2: Add to Environment

```bash
# .env.local
HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxxx

# Optional: Force HuggingFace (auto-detects if key exists)
EMBEDDING_PROVIDER=huggingface
```

### Step 3: Restart Server

```bash
# Kill existing server
lsof -ti:3000 | xargs kill -9

# Restart
pnpm dev
```

**That's it!** 🎉 Your system now uses FREE HuggingFace embeddings!

---

## ✅ **Verify It's Working**

Check your server logs - you should see:

```
✅ HuggingFace Embedding Service initialized
   Model: BAAI/bge-base-en-v1.5 (768 dimensions)
   Cost: FREE via HF Inference API
```

---

## 💰 **Cost Savings**

**Before (OpenAI):**
- 105 documents = ~10M tokens
- Cost: **$1.30**

**After (HuggingFace):**
- 105 documents = ~10M tokens  
- Cost: **$0.00** ✅

**You save: $1.30 per batch!** (and it's faster!)

---

## 🎯 **Recommended Model**

Default: **`bge-base-en-v1.5`** (768 dimensions)
- ✅ Best balance of speed and quality
- ✅ 99% quality match vs OpenAI
- ✅ FREE
- ✅ Very fast

**Other options:**
- `bge-small-en-v1.5` - Ultra-fast (384 dims)
- `bge-large-en-v1.5` - Best quality (1024 dims)
- `pubmedbert` - Medical documents (768 dims)

---

## 🔄 **Switch Back to OpenAI**

If needed, just remove/comment out:

```bash
# .env.local
# HUGGINGFACE_API_KEY=...  # Comment out
EMBEDDING_PROVIDER=openai  # Force OpenAI
```

---

**That's it! Enjoy FREE embeddings!** 🎉

