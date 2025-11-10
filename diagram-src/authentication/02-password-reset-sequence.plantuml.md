# Admin Password Reset Sequence (PlantUML)

**Diagram Type:** Sequence Diagram  
**Tool:** PlantUML  
**Purpose:** Show admin-assisted password reset flow with in-person verification  
**Used in:** Section 8 - Admin-Assisted Password Reset

---

## PlantUML Code

```plantuml
@startuml
!theme plain
skinparam backgroundColor #FFFFFF
skinparam sequenceMessageAlign center
skinparam BoxPadding 10

title Admin-Assisted Password Reset Flow

actor "User\n(Juan)" as User
actor "Admin\n(Barangay Official)" as Admin
participant "System\n(Web App)" as System
database "Database" as DB

== Step 1: User Requests Reset ==
User -> Admin: "I forgot my password"\n(in person, shows ID)
activate Admin
Admin -> Admin: Verify identity\n(Check ID card)
Admin -> System: Click "Reset Password"\nfor Juan's account
activate System

== Step 2: System Generates Temp Password ==
System -> System: Generate random\ntemp password\n(e.g., "Temp45892")
System -> System: Hash password with bcrypt:\nbcrypt.hashSync(tempPassword, 10)
System -> DB: UPDATE users SET\npassword = hashed,\nmust_change_password = 1\nWHERE id = Juan's ID
activate DB
DB --> System: ✓ Update successful
deactivate DB

== Step 3: Admin Gives Temp Password ==
System --> Admin: Display temp password:\n"Temp45892"
note right of Admin
  **IMPORTANT:**
  Temp password shown ONCE
  Not stored anywhere else
  Admin must write it down
end note
deactivate System

Admin -> User: Give temp password\n(written on paper)
deactivate Admin

== Step 4: User Logs In & Changes Password ==
User -> System: Login with temp password
activate System
System -> DB: SELECT * FROM users\nWHERE username = 'juan'
activate DB
DB --> System: User data\n(must_change_password = 1)
deactivate DB

System -> System: Check bcrypt.compareSync()
System --> User: ✓ Login success\nRedirect to /change-password
deactivate System

== Step 5: Forced Password Change ==
User -> System: Submit new password
activate System
System -> System: Validate password\n(length, confirmation match)
System -> System: Hash new password:\nbcrypt.hashSync(newPassword, 10)
System -> DB: UPDATE users SET\npassword = hashed,\nmust_change_password = 0\nWHERE id = Juan's ID
activate DB
DB --> System: ✓ Update successful
deactivate DB
System --> User: ✓ Password changed!\nRedirect to dashboard
deactivate System

@enduml
```

---

## Rendering Instructions

**Using PlantUML JAR:**
```bash
java -jar plantuml.jar 02-password-reset-sequence.plantuml.md -o ../../diagrams/authentication/
```

**Using Kroki:**
```bash
curl -X POST https://kroki.io/plantuml/png -d @diagram.puml > password-reset-sequence.png
```

**Using Online Editor:**
Visit: http://www.plantuml.com/plantuml/uml/

---

## Expected Output

A vertical sequence diagram showing:
1. **5 phases** clearly separated with `== headers ==`
2. **4 actors/participants:** User, Admin, System, Database
3. **Activation bars** showing when each component is "working"
4. **Notes** highlighting important security points
5. **Color coding** for different types of messages

**Key visual elements:**
- Dashed return arrows for responses
- Solid arrows for actions
- Database cylinder shape
- Actors with stick figures
- Note box explaining temp password is shown once

---

## Notes

- PlantUML is **industry standard** for sequence diagrams
- Supports complex interactions (loops, alternatives, notes)
- Clear visual hierarchy with activation boxes
- Shows both "happy path" and important details (bcrypt calls, database updates)
- Separates 5 distinct phases of the reset process
