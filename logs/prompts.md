# 🧠 AI Context Restoration Prompts

Quick reference for restoring project context in new chat sessions.

---

## 🚀 Essential: Full Context Restore

**Use this at the start of every new chat session:**

```
Read these files to restore project context:
- logs/project-overview.md
- logs/technical-architecture.md
- logs/export-system-deep-dive.md
- logs/known-issues-and-workarounds.md

After reading, summarize: What is this project, what's its current state, 
and what are the key things I should know?
```

---

## 🎯 Common Scenarios

### Working on Export Functionality
```
Read logs/export-system-deep-dive.md and logs/technical-architecture.md.
I need to modify the HTML export feature.
```

### Student/Teacher Reports Problem
```
Read logs/known-issues-and-workarounds.md. 
[Describe the problem they're reporting]
```

### Adding New Feature
```
Read logs/project-overview.md and logs/technical-architecture.md.
I want to add: [describe feature]
```

### Debugging Export Issue
```
Read logs/export-system-deep-dive.md and logs/known-issues-and-workarounds.md.
The exported HTML file is showing: [describe error]
```

### Understanding Why We Made a Decision
```
Read logs/export-system-deep-dive.md, specifically the section on 
"Why Single HTML (Not ZIP)". I need to understand our architecture decisions.
```

---

## 📚 What Each Log Contains

| File | Purpose | When to Read |
|------|---------|--------------|
| `project-overview.md` | What/why/who, project goals | Starting new work, understanding purpose |
| `technical-architecture.md` | How it's built, file structure | Understanding code organization |
| `export-system-deep-dive.md` | Core feature implementation | Working on export functionality |
| `known-issues-and-workarounds.md` | Problems & solutions | Debugging, support questions |

---

## 🔄 Partial Context (Faster)

**If you only need quick context on a specific area:**

### Just the Export System
```
Read logs/export-system-deep-dive.md
```

### Just Known Issues
```
Read logs/known-issues-and-workarounds.md
```

### Just Project Purpose
```
Read logs/project-overview.md
```

---

## 💡 Tips for Efficient Prompts

1. **Always start with file reading** - Don't ask questions before giving AI context
2. **Be specific** - "Read X, then help me with Y" works better than just "Help me with Y"
3. **Combine files** - For complex work, read 2-3 relevant files together
4. **Reference sections** - You can ask AI to focus on specific sections within files

---

## 🆘 Emergency Quick Start

**If you're in a hurry and just need the basics:**

```
Read logs/project-overview.md quickly. This is a markdown-to-HTML 
presentation tool for students. What do I need to know to get started?
```

---

## 📝 Updating These Logs

**When to ask AI to update logs:**
- After fixing a major bug
- After adding significant features
- When discovering new platform issues
- After making architectural decisions

**How to ask:**
```
We just [did X]. Please update logs/[relevant-file].md to reflect this change.
```

---

## 🎓 Example Session Start

**Typical conversation flow:**

1. **You:** *(Paste full context restore prompt)*
2. **AI:** *(Reads files, provides summary)*
3. **You:** "I need to fix the voice loading issue on Linux"
4. **AI:** *(Already has context, can help immediately)*

---

**Last Updated:** October 19, 2025  
**Project:** Lecture Creator - Markdown to Audio Presentation Tool
