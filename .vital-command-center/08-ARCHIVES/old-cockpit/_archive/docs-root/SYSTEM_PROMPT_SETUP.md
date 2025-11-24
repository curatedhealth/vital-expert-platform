# Quick Setup Guide - Hybrid System Prompt Generation

## Prerequisites

1. **OpenAI API Key** (for AI-Optimized generation)
2. **Node.js 18+** installed
3. **Next.js application** running

---

## 🚀 Setup Instructions

### Step 1: Install OpenAI SDK

```bash
npm install openai
```

### Step 2: Configure Environment Variables

Add to `.env.local`:

```env
OPENAI_API_KEY=sk-your-api-key-here
```

Get your API key from: https://platform.openai.com/api-keys

### Step 3: Test the Implementation

1. Start your development server:
```bash
npm run dev
```

2. Navigate to `/agents` page
3. Click "Create Agent" or edit an existing agent
4. Fill in agent attributes across tabs
5. Go to Safety tab
6. Scroll to bottom
7. Select Template-Based or AI-Optimized
8. Click "Generate"

---

## ✅ Verification

### Template-Based (Should work immediately)
- ✅ No API key required
- ✅ Instant generation
- ✅ Shows success message
- ✅ Switches to Basic Info tab
- ✅ System prompt populated

### AI-Optimized (Requires API key)
- ✅ Shows loading spinner
- ✅ Takes 2-10 seconds
- ✅ Shows success with token count
- ✅ Switches to Basic Info tab
- ✅ System prompt populated with natural language

---

## 🐛 Troubleshooting

### Error: "OpenAI API key is invalid or missing"

**Solution:**
1. Check `.env.local` has `OPENAI_API_KEY`
2. Restart dev server after adding env variable
3. Verify API key is active at platform.openai.com

### Error: "OpenAI API quota exceeded"

**Solution:**
1. Check usage at platform.openai.com/usage
2. Add payment method if on free tier
3. Use Template-Based mode as fallback

### AI generation slow or timing out

**Solution:**
1. Check internet connection
2. Use Template-Based mode (instant)
3. Reduce `max_tokens` in `/api/generate-system-prompt/route.ts`

---

## 💰 Cost Estimation

**AI-Optimized Mode:**
- Model: GPT-4o
- Input: ~1500-2000 tokens (agent data)
- Output: ~1000-1500 tokens (generated prompt)
- **Total: ~2500-3500 tokens**
- **Cost: $0.02-$0.05 per generation**

**Monthly estimate:**
- 10 agents/day × 30 days = 300 generations
- 300 × $0.03 = **~$9/month**

**Template-Based Mode:**
- **Cost: $0.00** (free)

---

## 🎯 Usage Tips

1. **Start with Template-Based** to understand structure
2. **Try AI-Optimized** for comparison
3. **Use Template for production** (auditable, compliant)
4. **Use AI for prototyping** (faster iteration)
5. **Always review** generated prompts before saving

---

## 📚 Next Steps

- Read full documentation: `docs/SYSTEM_PROMPT_GENERATION.md`
- Review API code: `src/app/api/generate-system-prompt/route.ts`
- Check UI implementation: `src/features/chat/components/agent-creator.tsx`

---

**Setup Complete!** 🎉

You now have hybrid system prompt generation enabled.
