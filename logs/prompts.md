# 🧠 AI Context Restoration Prompts

Quick reference for restoring project context in new chat sessions.

---

## 🚀 Essential: Full Context Restore

**Use this at the start of every new chat session:**

```
Read these files to restore project context:
- logs/SESSION-CONTEXT.md (patterns, conventions, examples)
- logs/project-overview.md (what/why/who)
- logs/technical-architecture.md (how it's built)
- logs/FOLDER-STRUCTURE.md (organization)

After reading, summarize: What is this project, what's its current state, 
and what are the key things I should know?
```

**For creating new lectures, also read:**
```
- logs/LECTURE-CREATION-PATTERN.md (step-by-step workflow)
- logs/ajax-fetch-implementation-2025-11-10.md (reference example)
```

---

## 🎯 Common Scenarios

### Creating a New Lecture
```
Read logs/SESSION-CONTEXT.md and logs/LECTURE-CREATION-PATTERN.md.
I want to create a lecture on: [topic]
Target audience: Grade 9 Filipino students
```

### Understanding Project Patterns
```
Read logs/SESSION-CONTEXT.md.
I need to understand the conventions and patterns used in this project.
```

### Understanding Folder Organization
```
Read logs/FOLDER-STRUCTURE.md.
Where should I put [type of file]?
```

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

### Seeing a Reference Implementation
```
Read logs/ajax-fetch-implementation-2025-11-10.md.
Show me what a complete lecture implementation looks like.
```

---

## 📚 What Each Log Contains

| File | Purpose | When to Read |
|------|---------|--------------|
| `SESSION-CONTEXT.md` | Patterns, conventions, examples | **Start here** - Quick restoration |
| `FOLDER-STRUCTURE.md` | Organization, where files go | Understanding project layout |
| `LECTURE-CREATION-PATTERN.md` | Step-by-step lecture workflow | Creating new lectures |
| `ajax-fetch-implementation-2025-11-10.md` | Complete reference example | Seeing a full implementation |
| `project-overview.md` | What/why/who, project goals | Understanding overall purpose |
| `technical-architecture.md` | How it's built, file structure | Understanding code organization |
| `export-system-deep-dive.md` | Core feature implementation | Working on export functionality |
| `known-issues-and-workarounds.md` | Problems & solutions | Debugging, support questions |

---

## 🔄 Partial Context (Faster)

**If you only need quick context on a specific area:**

### Just Patterns & Conventions (Fastest)
```
Read logs/SESSION-CONTEXT.md
```

### Just Folder Organization
```
Read logs/FOLDER-STRUCTURE.md
```

### Just Lecture Creation Workflow
```
Read logs/LECTURE-CREATION-PATTERN.md
```

### Just Reference Example
```
Read logs/ajax-fetch-implementation-2025-11-10.md
```

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
Read logs/SESSION-CONTEXT.md. This is a markdown-to-HTML presentation tool 
for Grade 9 Filipino students. I need to [task]. What patterns should I follow?
```

**For creating a new lecture fast:**
```
Read logs/SESSION-CONTEXT.md and logs/LECTURE-CREATION-PATTERN.md.
I need to create a lecture on [topic]. Show me the checklist.
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

## 🎓 Example Session Starts

### Working on Existing Features
**Typical conversation flow:**

1. **You:** *(Paste full context restore prompt)*
2. **AI:** *(Reads files, provides summary)*
3. **You:** "I need to fix the voice loading issue on Linux"
4. **AI:** *(Already has context, can help immediately)*

### Creating a New Lecture
**Optimized flow:**

1. **You:** 
```
Read logs/SESSION-CONTEXT.md, logs/LECTURE-CREATION-PATTERN.md, 
and logs/ajax-fetch-implementation-2025-11-10.md.

I want to create a lecture on CSS Grid for Grade 9 students.
```

2. **AI:** *(Understands patterns, ready to follow workflow)*

3. **You:** "Let's start with planning the sections"

4. **AI:** *(Follows established pattern, suggests Philippine context)*

---

## 📂 Log File Hierarchy

**Essential (Read First):**
1. `SESSION-CONTEXT.md` - Patterns & conventions
2. `FOLDER-STRUCTURE.md` - File organization

**For Creating Lectures:**
3. `LECTURE-CREATION-PATTERN.md` - Workflow
4. `ajax-fetch-implementation-2025-11-10.md` - Reference

**For App Development:**
5. `project-overview.md` - Purpose
6. `technical-architecture.md` - Structure
7. `export-system-deep-dive.md` - Export feature
8. `known-issues-and-workarounds.md` - Bugs & fixes

---

**Last Updated:** November 10, 2025  
**Project:** Lecture Creator - Markdown to Audio Presentation Tool

````
