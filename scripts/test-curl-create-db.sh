#!/bin/bash
# Test creating database with curl to bypass SDK

source .env.local

curl -X POST https://api.notion.com/v1/databases \
  -H "Authorization: Bearer ${NOTION_API_KEY}" \
  -H "Content-Type: application/json" \
  -H "Notion-Version: 2022-06-28" \
  -d '{
    "parent": {
      "type": "page_id",
      "page_id": "277345b0299e80ceb179eec50f02a23f"
    },
    "title": [
      {
        "type": "text",
        "text": {
          "content": "CURL TEST Database"
        }
      }
    ],
    "properties": {
      "Name": {
        "title": {}
      },
      "Status": {
        "select": {
          "options": [
            {"name": "Active", "color": "green"},
            {"name": "Inactive", "color": "gray"}
          ]
        }
      },
      "Description": {
        "rich_text": {}
      }
    }
  }' | jq .
