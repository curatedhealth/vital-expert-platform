# Import to Notion - Quick Method

## Easiest Way: Use Claude Desktop with MCP

Since you have Notion MCP server connected to Claude Desktop, here's what to do:

### Step 1: Open Claude Desktop

Go to your Claude Desktop app (where Notion MCP is connected)

### Step 2: Copy this exact prompt:

```
Using the Notion MCP server, create a new database in this workspace:
https://www.notion.so/Vital-expert-277345b0299e80ceb179eec50f02a23f

Database Name: "VITAL Path - Agents Registry"

Create it as a table database with these properties:

1. Name (title)
2. Display Name (text)
3. Description (text)
4. Avatar (text)
5. Status (select with options: Active, Inactive, Development, Testing, Deprecated, Planned, Pipeline)
6. Tier (select with options: Core, Tier 1, Tier 2, Tier 3)
7. Department (text)
8. Role (text)
9. Business Function (select with options: Clinical Development, Regulatory Affairs, Medical Affairs, Commercial)
10. Model (select with options: gpt-4, claude-3-opus, claude-3-sonnet)
11. Temperature (number)
12. System Prompt (text)
13. HIPAA Compliant (checkbox)
14. GDPR Compliant (checkbox)
15. Accuracy Score (number)
16. Priority (number)
17. Is Public (checkbox)

After creating, give me the database ID.
```

### Step 3: Get the Database ID

Claude Desktop will create the database and give you the ID. Then come back here and tell me the ID.

### Step 4: I'll Configure the Sync

Once you have the database ID, I'll set up the automatic sync between Notion and Supabase.

---

## Alternative: Manual Creation (5 minutes)

If you prefer to create manually:

1. Go to: https://www.notion.so/Vital-expert-277345b0299e80ceb179eec50f02a23f
2. Type `/table` and press Enter
3. Name it: "VITAL Path - Agents Registry"
4. Click on the table
5. Click "+ Add a property" and add each property from the list above
6. For Select properties, add the options listed
7. When done, click the "..." menu → Copy link
8. Share the link with me and I'll extract the database ID

Which method do you prefer?
