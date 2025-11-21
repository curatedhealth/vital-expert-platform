# How to Test the Optimized Workflow Visualization 🧪

## 🌐 Navigation Steps

### 1. **Start Here**
Navigate to: **`http://localhost:3001/workflows`**

This shows the Use Case Catalog with all use cases grouped by domain.

### 2. **Click Any Use Case**
For example, click on **"DTx Clinical Endpoint Selection"** (UC_CD_001)

### 3. **Watch the Performance!**
You should see:
- ✅ **Immediate** skeleton loading UI (no blank screen)
- ✅ **Fast load** (~500ms instead of 10-15 seconds)
- ✅ Performance log in browser console

### 4. **View the Flow Diagram**
Click the **"Flow Diagram"** tab to see:
- 🟢 Start node (animated green circle)
- 🟣 Workflow headers (purple gradient cards)
- 🔵 Task nodes (blue cards with agents/tools/RAG sources)
- 🔴 End node (red circle)

### 5. **Interact with the Visualization**
- **Zoom in/out**: Mouse wheel or controls (top-left)
- **Pan**: Click and drag on empty space
- **Mini-map**: Click to navigate (bottom-right)
- **Select task**: Click any task node to see blue selection ring

---

## 📊 What to Check

### Performance (Console)
Open browser DevTools → Console tab:
```
🚀 Fetching complete use case data...
✅ Loaded in 487ms
📊 Loaded 8 workflows with 13 task groups
```

### Network (DevTools)
Open browser DevTools → Network tab:
- Look for **single request** to `/api/workflows/usecases/UC_CD_001/complete`
- Should complete in **~500ms**
- **No cascading requests** (no more sequential workflow/task calls)

### Loading Experience
- ✅ Skeleton UI appears **instantly**
- ✅ No blank white screen
- ✅ Smooth transition to real content
- ✅ Professional loading animation on Flow Diagram

---

## 🎯 Test Different Use Cases

Try these to see various workflow complexities:

1. **UC_CD_001** (8 workflows, 13 tasks) - Small
2. **UC_MA_001** - Medium
3. Any Market Access use case - Various sizes

All should load in **< 1 second**! ⚡

---

## 🔍 Troubleshooting

### If you see "Route not found"
- Make sure you're at **`/workflows`** not just **`/`** (root)
- Root redirects to `/dashboard`

### If loading is still slow
- Check console for errors
- Verify API endpoint is working: `/api/workflows/usecases/UC_CD_001/complete`
- Try hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)

### If Flow Diagram doesn't show
- Check browser console for React Flow errors
- Verify reactflow is installed: `pnpm list reactflow`
- Make sure you're on the "Flow Diagram" tab

---

## ✅ Success Criteria

You should experience:
- ⚡ **20-30x faster loading** (500ms vs 10-15s)
- 🎨 **Professional loading states** (skeleton UI)
- 🖼️ **Beautiful flow visualization** (React Flow with custom nodes)
- 🎯 **Smooth interactions** (zoom, pan, select)
- 📊 **Clear performance metrics** (console logs)

---

## 🎉 What You're Testing

### Technical Improvements
1. ✅ Single optimized API endpoint (1 call vs 9-17 calls)
2. ✅ Nested database query (1 query vs multiple)
3. ✅ Loading skeletons (immediate feedback)
4. ✅ Performance monitoring (timing logs)

### Visual Improvements
1. ✅ Custom React Flow nodes (Start, Workflow, Task, End)
2. ✅ Color-coded edges (green, purple, blue, red)
3. ✅ Agent/Tool/RAG assignments displayed
4. ✅ Interactive controls and mini-map

---

**Current URL**: `http://localhost:3001`
**Target URL**: **`http://localhost:3001/workflows`** ← Go here!

Then click any use case to see the magic! ✨
