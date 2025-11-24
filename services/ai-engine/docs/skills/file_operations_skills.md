# File Operations Skills

## Overview
File operations skills provide capabilities for reading, writing, and manipulating files and documents.

## Skills

### Read File
**ID**: `read_file`  
**Type**: `built_in`  
**Category**: `file_operations`  
**Complexity**: `basic`

**Description**: Read file contents with support for multiple formats (text, JSON, CSV, PDF, etc.).

**Usage Example**:
```python
result = await execute_skill(
    skill_id="read_file",
    context={
        "file_path": "/path/to/document.pdf",
        "extract_text": True,
        "parse_tables": True
    }
)
```

**Returns**: File contents with metadata

---

### Write File
**ID**: `write_file`  
**Type**: `built_in`  
**Category**: `file_operations`  
**Complexity**: `basic`

**Description**: Write content to files with format conversion support.

**Usage**: Saving reports, exporting data, creating documents

---

### Edit File
**ID**: `edit_file`  
**Type**: `built_in`  
**Category**: `file_operations`  
**Complexity**: `intermediate`

**Description**: Make targeted edits to files with search/replace and line-based operations.

**Usage Example**:
```python
result = await execute_skill(
    skill_id="edit_file",
    context={
        "file_path": "/path/to/config.yaml",
        "operation": "update",
        "changes": [
            {"find": "old_value", "replace": "new_value"}
        ]
    }
)
```

---

### List Directory
**ID**: `list_directory`  
**Type**: `built_in`  
**Category**: `file_operations`  
**Complexity**: `basic`

**Description**: List files and directories with filtering and metadata.

**Usage**: File discovery, workspace organization, batch processing

---

### File Conversion
**ID**: `file_conversion`  
**Type**: `custom`  
**Category**: `file_operations`  
**Complexity**: `intermediate`

**Description**: Convert files between formats (PDF, DOCX, Markdown, HTML, etc.).

**Usage**: Document processing, format standardization

**Best Practices**:
- Validate file paths before operations
- Check file permissions
- Handle large files efficiently
- Backup before editing
- Verify write operations

---

## Security
File operations include:
- Path validation and sanitization
- Permission checks
- Sandbox restrictions
- Audit logging

## See Also
- [Execution Skills](./execution_skills.md)
- [Data Retrieval Skills](./data_retrieval_skills.md)

