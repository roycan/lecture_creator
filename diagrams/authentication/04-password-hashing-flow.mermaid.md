# Password Hashing Flow (Mermaid - Alternate)

**Diagram Type:** Sequence Diagram  
**Tool:** Mermaid  
**Purpose:** Show registration vs login password hashing comparison  
**Used in:** Section 2 - Password Security Basics

---

## Mermaid Code

```mermaid
sequenceDiagram
    actor User
    participant Server as Web Server
    participant DB as Database

    Note over User,DB: REGISTRATION (Storing Password)
    
    User->>Server: Submit registration form<br/>Password: "mypassword123"
    Server->>Server: Validate password<br/>(length, format)
    
    Note right of Server: bcrypt.hashSync()<br/>• Generates random "salt"<br/>• Hashes password + salt<br/>• Takes ~100ms (intentionally slow!)
    
    Server->>Server: Hash password:<br/>bcrypt.hashSync("mypassword123", 10)
    
    Note right of Server: Original: mypassword123<br/><br/>Hashed: $2b$10$N9qo8uLO...<br/><br/>• Cannot be reversed! ✓<br/>• 60 characters long ✓
    
    Server->>DB: INSERT INTO users<br/>SET password = "$2b$10$N9qo..."
    DB-->>Server: ✓ User created
    Server-->>User: Registration successful!<br/>Redirect to login

    Note over User,DB: LOGIN (Verifying Password)
    
    User->>Server: Submit login form<br/>Password: "mypassword123"
    Server->>DB: SELECT * FROM users<br/>WHERE username = '...'
    DB-->>Server: User data:<br/>password = "$2b$10$N9qo..."
    
    Note right of Server: bcrypt.compareSync()<br/>• Takes plain password<br/>• Takes stored hash<br/>• Extracts salt from hash<br/>• Compares results
    
    Server->>Server: Verify password:<br/>bcrypt.compareSync(<br/>"mypassword123", storedHash)
    
    alt Password matches
        Server-->>User: ✓ Login successful!<br/>Create session
    else Password doesn't match
        Server-->>User: ✗ Invalid credentials
    end
```

---

## Rendering Instructions

**If using Mermaid CLI:**
```bash
mmdc -i 04-password-hashing-flow.mermaid.md -o ../../diagrams/authentication/password-hashing-flow.png
```

**If using Kroki:**
```bash
curl -X POST https://kroki.io/mermaid/png -d @diagram.mmd > password-hashing-flow.png
```

**In Markdown (GitHub/many renderers):**
Just include the code block with `mermaid` language tag - it will auto-render!

---

## Expected Output

A sequence diagram showing:
1. **Registration flow (top):**
   - User submits password
   - Server validates
   - Server hashes with bcrypt.hashSync() (note box explains details)
   - Hash stored in database (original password never stored)

2. **Login flow (bottom):**
   - User submits password
   - Server retrieves stored hash
   - Server uses bcrypt.compareSync() (note box explains details)
   - Alt block shows success/failure paths

**Key visual elements:**
- Two major sections separated by Note boxes
- Actor icon for User
- Box icons for Server and Database
- Notes explaining bcrypt functions on the right side
- Alt/else block for login success/failure
- Solid arrows for actions, dashed for responses

---

## Notes

- Simpler syntax than PlantUML
- Clear separation of Registration vs Login
- Notes use `<br/>` for line breaks
- Alt block shows conditional logic
- Emphasizes one-way nature of hashing
- Shows password never stored in plain text
