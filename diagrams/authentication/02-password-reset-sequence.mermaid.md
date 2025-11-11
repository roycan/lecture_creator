# Admin Password Reset Sequence (Mermaid - Alternate)

**Diagram Type:** Sequence Diagram  
**Tool:** Mermaid  
**Purpose:** Show admin-assisted password reset flow with in-person verification  
**Used in:** Section 8 - Admin-Assisted Password Reset

---

## Mermaid Code

```mermaid
sequenceDiagram
    actor User as User<br/>(Juan)
    actor Admin as Admin<br/>(Barangay Official)
    participant System as System<br/>(Web App)
    participant DB as Database

    Note over User,DB: Step 1: User Requests Reset
    User->>Admin: "I forgot my password"<br/>(in person, shows ID)
    Admin->>Admin: Verify identity<br/>(Check ID card)
    Admin->>System: Click "Reset Password"<br/>for Juan's account

    Note over User,DB: Step 2: System Generates Temp Password
    System->>System: Generate random temp password<br/>(e.g., "Temp45892")
    System->>System: Hash with bcrypt:<br/>bcrypt.hashSync(tempPassword, 10)
    System->>DB: UPDATE users SET<br/>password = hashed,<br/>must_change_password = 1
    DB-->>System: ✓ Update successful

    Note over User,DB: Step 3: Admin Gives Temp Password
    System-->>Admin: Display temp password:<br/>"Temp45892"
    Note right of Admin: IMPORTANT:<br/>Shown ONCE only<br/>Not stored elsewhere<br/>Admin writes it down
    Admin->>User: Give temp password<br/>(written on paper)

    Note over User,DB: Step 4: User Logs In
    User->>System: Login with temp password
    System->>DB: SELECT * FROM users<br/>WHERE username = 'juan'
    DB-->>System: User data<br/>(must_change_password = 1)
    System->>System: Check bcrypt.compareSync()
    System-->>User: ✓ Login success<br/>Redirect to /change-password

    Note over User,DB: Step 5: Forced Password Change
    User->>System: Submit new password
    System->>System: Validate password<br/>(length, match)
    System->>System: Hash new password:<br/>bcrypt.hashSync(newPassword, 10)
    System->>DB: UPDATE users SET<br/>password = hashed,<br/>must_change_password = 0
    DB-->>System: ✓ Update successful
    System-->>User: ✓ Password changed!<br/>Redirect to dashboard
```

---

## Rendering Instructions

**If using Mermaid CLI:**
```bash
mmdc -i 02-password-reset-sequence.mermaid.md -o ../../diagrams/authentication/password-reset-sequence.png
```

**If using Kroki:**
```bash
curl -X POST https://kroki.io/mermaid/png -d @diagram.mmd > password-reset-sequence.png
```

**In Markdown (GitHub/many renderers):**
Just include the code block with `mermaid` language tag - it will auto-render!

---

## Expected Output

A vertical sequence diagram showing:
1. **5 phases** clearly separated with Note boxes
2. **4 participants:** User (Juan), Admin, System, Database
3. **Solid arrows** for actions (→)
4. **Dashed arrows** for responses (-->>)
5. **HTML line breaks** (`<br/>`) for multi-line labels

**Key visual elements:**
- Actor icons for User and Admin
- Box icons for System and Database
- Notes spanning across participants for phase headers
- Side note highlighting security importance
- Clear flow from top to bottom

---

## Notes

- Simpler syntax than PlantUML
- Widely supported (auto-renders in GitHub, GitLab, VS Code)
- Uses `<br/>` for line breaks in labels
- `actor` keyword creates stick figure icons
- Note boxes for phase separation and important callouts
- Good balance between simplicity and detail
