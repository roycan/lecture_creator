# 🗄️ Archive Folder

**Purpose:** Storage for completed planning documents and superseded file versions.

**Last Updated:** November 10, 2025

---

## What Goes Here

### ✅ Should Be Archived

- **Completed planning documents** - After implementation is finished
- **Old file versions** - When files are significantly refactored
- **Implementation logs** - After being summarized in main logs
- **Feasibility studies** - After decisions have been made
- **Experimental code** - After finalizing production version
- **Draft documents** - After final version is completed
- **Old organizational structures** - After reorganization

### ❌ Should NOT Be Archived

- **Active documentation** - Currently referenced files
- **Current implementations** - Files still in use
- **Session patterns** - Files in `logs/` that survive summarization
- **Live lecture files** - Active markdown/HTML/JSON in use
- **Current diagrams** - Active source and PNG files

---

## Organization Guidelines

### File Naming
Add context to archived files:
- **Date prefix:** `2025-11-10-old-planning.md`
- **Version suffix:** `implementation-v1.md`, `implementation-v2.md`
- **Descriptive:** `feasibility-export-methods.md`

### Optional Subfolders
If archive grows large, consider:
```
archive/
├── planning/          (Old planning docs)
├── implementations/   (Old versions)
├── experiments/       (Prototype code)
└── studies/          (Feasibility analyses)
```

---

## When to Archive

### After Completing Implementation
- Move planning docs here after lecture is complete
- Example: After creating ajax-fetch lecture, archive planning notes

### After Major Refactoring
- Keep old version before making big changes
- Example: Backup old dashboard before redesign

### After Decision Points
- Archive feasibility studies after choosing approach
- Example: After choosing folder structure, archive alternatives

### During Reorganization
- Backup old structure before major changes
- Example: Before moving files, archive old organization

### Before Deletion
- Archive instead of delete (preservation)
- Can reference later if needed

---

## Current Contents

*(Update this section as files are archived)*

### Planning Documents

### Old Implementations

### Feasibility Studies

### Experiments

---

## Retrieval

### Finding Archived Files
```bash
# List all archived items
ls -la archive/

# Search by keyword
find archive/ -name "*keyword*"

# Recent archives
ls -lt archive/ | head
```

### Restoring from Archive
If you need an old version:
1. Copy from archive to working location
2. Do NOT delete from archive (keep history)
3. Rename if needed to avoid conflicts

---

## Best Practices

### Before Archiving
- ✅ Make sure file is truly obsolete
- ✅ Check no current references to it
- ✅ Add date or version to filename
- ✅ Update this README if significant

### Archiving Process
1. Copy file to archive/ (don't move yet)
2. Verify archived copy is complete
3. Remove from original location
4. Update any documentation references
5. Note in this README if significant

### Maintenance
- Review archive quarterly
- Consider deleting truly obsolete items after 1 year
- Keep significant historical documents permanently
- Document major deletions

---

## Related Documentation

- **Active patterns:** `logs/SESSION-CONTEXT.md`
- **Folder structure:** `logs/FOLDER-STRUCTURE.md`
- **Current workflows:** `logs/LECTURE-CREATION-PATTERN.md`

---

**Philosophy:** Archive for history, not for clutter. Keep what might be useful later, delete what's truly obsolete.
