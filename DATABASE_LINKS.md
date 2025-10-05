# All VITAL Path Notion Database Links

## 🔗 Direct Links to All 12 Databases

### Primary Databases (Start Here)

1. **Capabilities Registry**
   https://www.notion.so/15dd88a6dfc248ebb2e9e47e0ea8fb22

2. **Agents Registry**
   https://www.notion.so/15dd88a6dfc2483593d3eaaa17ea0de6

### Organizational Structure

3. **Organizational Functions**
   https://www.notion.so/15dd88a6dfc24e3c9b65c9f0cd4f95b1

4. **Departments**
   https://www.notion.so/15dd88a6dfc2497cab31f93eb0a97c74

5. **Roles**
   https://www.notion.so/15dd88a6dfc24f18bb6bce77c092d0de

6. **Responsibilities**
   https://www.notion.so/15dd88a6dfc2495bb89df4d1bf8e139d

### Supporting Databases

7. **Competencies**
   https://www.notion.so/15dd88a6dfc24d23a54fd14ce27dd0e9

8. **Prompts Library**
   https://www.notion.so/15dd88a6dfc248ac8e99fe1f2cd7c5df

9. **Tools Registry**
   https://www.notion.so/15dd88a6dfc24baeb9e9f40d4e13a7a6

10. **Workflows**
    https://www.notion.so/15dd88a6dfc243809f52d5e354aa03e1

11. **RAG Knowledge Base**
    https://www.notion.so/15dd88a6dfc24a97bb17f8d9c7f8d2de

12. **Jobs to Be Done**
    https://www.notion.so/15dd88a6dfc2433bb034c1d0116e2cb1

---

## 🔑 How to Share Each Database

For EACH link above:

1. Click the link to open the database
2. Click **"Share"** button (top-right)
3. Type: **VITAL Expert Sync**
4. Select it and grant "Full access"
5. Click "Invite" or "Share"

---

## ⚡ Faster Option: Share Parent Page

If you can see the "VITAL Path - Master Database Hub" page with all these databases listed inside:

1. Go to: https://www.notion.so/curatedhealth/VITAL-Path-Master-Database-Hub-2753dedf9856801d8217d2db804de0af
2. Share that parent page with "VITAL Expert Sync"
3. All 12 databases inherit access automatically

---

## 🔍 After Sharing

Verify access:
```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path"
node scripts/verify-all-databases.js
```

Should show ✅ for all Notion databases!

---

## 🚀 Then Sync Your Data

```bash
# Sync 5 capabilities
npm run notion:sync-to -- --table=capabilities

# Sync 254 agents
npm run notion:sync-to -- --table=agents
```
