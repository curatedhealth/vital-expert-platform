# Tool Modal Feature - Quick Reference

## 🎯 What It Does
When you click on any tool in the Tools page, a detailed modal opens allowing you to:
- View complete tool information
- Edit tool properties
- Assign tools to agents
- Configure implementation settings

---

## 🖱️ How to Use

### Opening the Modal
1. Navigate to `/tools` page
2. Click on **any tool card** (grid, list, or category view)
3. Modal opens in **view mode**

### Viewing Tool Details
```
┌─────────────────────────────────────────┐
│ arXiv Scientific Papers Search   [Edit]│
│ Search academic papers...               │
├─────────────────────────────────────────┤
│ [Details] [Config] [Agents] [Tasks]    │
├─────────────────────────────────────────┤
│ Tool Name: arXiv Search                 │
│ Category: Research/Literature           │
│ Lifecycle: Production                   │
│ Status: Active                          │
│                                         │
│ Total Calls: 1,234                      │
│ Success Rate: 98.5%                     │
│ Avg Response: 250ms                     │
└─────────────────────────────────────────┘
```

### Editing Tool
1. Click **"Edit"** button (top right)
2. Modify any editable fields:
   - Tool name
   - Description (multi-line)
   - Category (dropdown)
   - Lifecycle stage (dropdown)
   - Active status (toggle)
3. Click **"Save Changes"** or **"Cancel"**

### Assigning to Agents
1. Switch to **"Agents" tab**
2. See list of all active agents:
   ```
   ┌─────────────────────────────────────┐
   │ ○ Research Assistant               │
   │   Helps with literature search     │
   ├─────────────────────────────────────┤
   │ ● Medical Advisor        [Toggle]  │
   │   Provides clinical guidance       │
   └─────────────────────────────────────┘
   ```
3. Toggle switches to assign/unassign
4. Click **"Save Changes"**

### Configuring Implementation
1. Switch to **"Configuration" tab**
2. Update technical details:
   - Implementation type (dropdown)
   - Implementation path (text)
   - Function name (text)
   - Rate limit (number)
   - Cost per execution (number)
   - Max execution time (number)
3. Click **"Save Changes"**

---

## 📋 Tab Overview

| Tab | Purpose | Key Features |
|-----|---------|--------------|
| **Details** | Basic information | Name, description, category, usage stats |
| **Configuration** | Technical setup | Implementation details, limits, costs |
| **Agents** | Assignment | Assign/unassign tools to agents |
| **Tasks** | Workflows | (Coming soon) Task-tool relationships |

---

## 🎨 Visual Elements

### Badges
- **Category**: Blue for Healthcare/FHIR, Purple for NLP, etc.
- **Lifecycle**: 
  - 🟢 Green = Production
  - 🟡 Yellow = Testing
  - ⚪ Gray = Development
- **Status**: Active / Inactive

### Icons
- **Details**: ℹ️ Info icon
- **Configuration**: ⚙️ Settings gear
- **Agents**: 👥 Users icon
- **Tasks**: ☑️ CheckSquare icon

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `ESC` | Close modal |
| `Tab` | Navigate form fields |
| `Enter` | Submit form (when focused on input) |

---

## 🔍 Quick Actions

### From Grid View
```
┌──────────────┐     Click    ┌─────────────────┐
│  Tool Card   │  ───────────> │  Detail Modal   │
│  [Icon]      │              │  [Full Details] │
│  Tool Name   │              │  [Edit/Assign]  │
└──────────────┘              └─────────────────┘
```

### From List View
```
┌────────────────────────────┐
│ [Icon] Tool Name           │  Click → Modal Opens
│        Brief description   │
└────────────────────────────┘
```

### From Category View
```
Healthcare/FHIR (15)
┌────┐ ┌────┐ ┌────┐
│ T1 │ │ T2 │ │ T3 │  Click any → Modal Opens
└────┘ └────┘ └────┘
```

---

## 💾 What Gets Saved

When you click "Save Changes":

✅ **Tool Properties** → `dh_tool` table
- name, description, category
- lifecycle_stage, is_active
- implementation details
- rate limits, costs

✅ **Agent Assignments** → `agent_tool_assignments` table
- Creates new assignments
- Removes unselected assignments
- Updates enabled status

---

## ⚠️ Important Notes

1. **Auto-Reload**: Tools list refreshes after save
2. **Validation**: Required fields checked before save
3. **Cancel Safety**: Changes discarded if you cancel
4. **Read-Only Fields**: Some fields can't be edited (e.g., Code, ID)

---

## 🎯 Common Use Cases

### Use Case 1: Mark Tool as Production-Ready
1. Click tool card
2. Click "Edit"
3. Change Lifecycle Stage → "Production"
4. Save Changes

### Use Case 2: Assign Tool to Multiple Agents
1. Click tool card
2. Go to "Agents" tab
3. Click "Edit" (if not already)
4. Toggle ON for desired agents
5. Save Changes

### Use Case 3: Update Tool Description
1. Click tool card
2. Click "Edit"
3. Update Description field (supports multi-line)
4. Save Changes

### Use Case 4: Configure Rate Limiting
1. Click tool card
2. Go to "Configuration" tab
3. Click "Edit"
4. Set Rate Limit (e.g., 100 per minute)
5. Save Changes

---

## 🚀 Power User Tips

1. **Batch Edits**: Edit multiple fields at once before saving
2. **Quick Close**: Use ESC key or click backdrop
3. **Tab Navigation**: Use Tab key to move through form fields
4. **Category Filter**: Filter tools first, then open modal for quicker access
5. **Agent Names**: Agent list auto-sorts alphabetically

---

## 🐛 Troubleshooting

**Modal won't open?**
- Check console for errors
- Ensure tool data loaded successfully

**Can't edit fields?**
- Make sure you clicked "Edit" button
- Check if you have necessary permissions

**Agents not showing?**
- Ensure agents exist in database
- Check that agents are marked as active

**Changes not saving?**
- Check network connection
- Look for error messages
- Verify all required fields filled

---

## 📞 Support

For issues or questions:
1. Check the comprehensive documentation: `TOOL_DETAIL_MODAL_FEATURE.md`
2. Review the tool registry service code
3. Check browser console for errors

---

**Last Updated**: November 4, 2025  
**Version**: 1.0  
**Status**: Production Ready 🎉

