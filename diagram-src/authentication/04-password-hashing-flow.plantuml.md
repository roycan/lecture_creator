# Password Hashing Flow (PlantUML)

**Diagram Type:** Sequence Diagram  
**Tool:** PlantUML  
**Purpose:** Show registration vs login password hashing comparison  
**Used in:** Section 2 - Password Security Basics

---

## PlantUML Code

```plantuml
@startuml
!theme plain
skinparam backgroundColor #FFFFFF
skinparam sequenceMessageAlign center

title Password Hashing: Registration vs Login

actor User
participant "Web Server" as Server
database "Database" as DB

== REGISTRATION (Storing Password) ==

User -> Server: Submit registration form\nPassword: "mypassword123"
activate Server

Server -> Server: Validate password\n(length, format)

note right of Server
  **bcrypt.hashSync()**
  • Generates random "salt"
  • Hashes password + salt
  • Returns combined hash
  • Takes ~100ms (intentionally slow!)
end note

Server -> Server: Hash password:\nbcrypt.hashSync("mypassword123", 10)

note right of Server
  Original: mypassword123
  
  **Hashed Output:**
  $2b$10$N9qo8uLOickgx2Z...
  
  • Cannot be reversed! ✓
  • Unique for this password ✓
  • 60 characters long ✓
end note

Server -> DB: INSERT INTO users\nSET password = "$2b$10$N9qo..."
activate DB
DB --> Server: ✓ User created
deactivate DB

Server --> User: Registration successful!\nRedirect to login
deactivate Server

== LOGIN (Verifying Password) ==

User -> Server: Submit login form\nPassword: "mypassword123"
activate Server

Server -> DB: SELECT * FROM users\nWHERE username = '...'
activate DB
DB --> Server: User data:\npassword = "$2b$10$N9qo..."
deactivate DB

note right of Server
  **bcrypt.compareSync()**
  • Takes plain password
  • Takes stored hash
  • Extracts salt from hash
  • Hashes plain password with that salt
  • Compares results
end note

Server -> Server: Verify password:\nbcrypt.compareSync(\n  "mypassword123",\n  storedHash\n)

alt Password matches
    Server --> User: ✓ Login successful!\nCreate session
else Password doesn't match
    Server --> User: ✗ Invalid credentials
end

deactivate Server

@enduml
```

---

## Rendering Instructions

**Using PlantUML JAR:**
```bash
java -jar plantuml.jar 04-password-hashing-flow.plantuml.md -o ../../diagrams/authentication/
```

**Using Kroki:**
```bash
curl -X POST https://kroki.io/plantuml/png -d @diagram.puml > password-hashing-flow.png
```

**Using Online Editor:**
Visit: http://www.plantuml.com/plantuml/uml/

---

## Expected Output

A sequence diagram showing:
1. **Registration flow (top half):**
   - User submits password
   - Server hashes with bcrypt.hashSync()
   - Hash stored in database
   - Original password NEVER stored

2. **Login flow (bottom half):**
   - User submits password
   - Server gets stored hash from database
   - bcrypt.compareSync() verifies password
   - Success or failure response

**Key visual elements:**
- Clear separation between Registration and Login with `== headers ==`
- Note boxes explaining bcrypt functions
- Note showing actual hash format ($2b$10$...)
- Alt/else block showing success/failure paths
- Activation bars showing when server is "working"

---

## Notes

- Side-by-side comparison makes it clear hashing is used in BOTH flows
- Notes explain the "magic" of bcrypt (one-way, salt, etc.)
- Shows that original password never touches database
- Alt block demonstrates password comparison has two outcomes
- Emphasizes bcrypt is intentionally slow (security feature)
