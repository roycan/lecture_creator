# Authentication vs Authorization (Graphviz)

**Diagram Type:** Decision Tree / Concept Flow  
**Tool:** Graphviz (DOT)  
**Purpose:** Show distinction between authentication (who you are) and authorization (what you can do)  
**Used in:** Section 1 - Understanding Authentication vs Authorization

---

## Graphviz/DOT Code

```dot
digraph auth_vs_authz {
    rankdir=TB;
    node [shape=box, style=rounded, fontname="Arial"];
    edge [fontname="Arial"];
    
    // Title
    label="Authentication vs Authorization";
    labelloc=t;
    fontsize=18;
    fontname="Arial Bold";
    
    // Define nodes
    user [label="User Visits Page", shape=ellipse, style=filled, fillcolor=lightblue];
    
    subgraph cluster_authentication {
        label="AUTHENTICATION\n(Who are you?)";
        style=filled;
        fillcolor=lightyellow;
        
        login_prompt [label="Show Login Page"];
        enter_credentials [label="User Enters:\nUsername & Password"];
        check_credentials [label="Check Credentials\nin Database", shape=diamond];
        auth_fail [label="Invalid Login\nAccess Denied", style=filled, fillcolor=lightcoral];
        auth_success [label="Create Session\nUser Identified ✓", style=filled, fillcolor=lightgreen];
    }
    
    subgraph cluster_authorization {
        label="AUTHORIZATION\n(What can you do?)";
        style=filled;
        fillcolor=lightcyan;
        
        check_permission [label="Check User Role\n& Permissions", shape=diamond];
        check_resource [label="Check Resource\nAccess Rules", shape=diamond];
        authz_fail [label="403 Forbidden\nNot Authorized", style=filled, fillcolor=lightcoral];
        authz_success [label="Grant Access ✓\nShow Resource", style=filled, fillcolor=lightgreen];
    }
    
    examples [label="EXAMPLES:\n\nAuthentication:\n• Login with username/password\n• Prove you are 'Juan Dela Cruz'\n• Session cookie validates identity\n\nAuthorization:\n• Check if Juan is an admin\n• Check if Juan owns this record\n• Check if Juan's role allows deletion", shape=note, style=filled, fillcolor=lightyellow];
    
    // Flow
    user -> login_prompt;
    login_prompt -> enter_credentials;
    enter_credentials -> check_credentials;
    check_credentials -> auth_fail [label="No Match", color=red];
    check_credentials -> auth_success [label="Match ✓", color=green];
    
    auth_success -> check_permission [label="Authenticated\nNow check permissions"];
    check_permission -> check_resource [label="Has Role ✓", color=green];
    check_permission -> authz_fail [label="No Role", color=red];
    check_resource -> authz_success [label="Allowed ✓", color=green];
    check_resource -> authz_fail [label="Denied", color=red];
    
    // Examples placement
    {rank=same; authz_success; examples;}
}
```

---

## Rendering Instructions

**Command:**
```bash
dot -Tpng 05-auth-vs-authz.graphviz.md -o ../../diagrams/authentication/auth-vs-authz.png
```

**Alternative (if using Kroki):**
```bash
curl -X POST https://kroki.io/graphviz/png -d @diagram.dot > auth-vs-authz.png
```

---

## Expected Output

A top-to-bottom flowchart showing:
1. **Authentication section (yellow box):**
   - User enters credentials
   - System checks database
   - Success: Create session (green)
   - Failure: Access denied (red)

2. **Authorization section (cyan box):**
   - Check user role
   - Check resource permissions
   - Success: Grant access (green)
   - Failure: 403 Forbidden (red)

3. **Examples note box:**
   - Real-world examples of authentication (login, identity)
   - Real-world examples of authorization (roles, permissions)

**Visual elements:**
- Two distinct subgraphs (clusters) for Authentication vs Authorization
- Diamond shapes for decision points
- Color coding: yellow (auth), cyan (authz), green (success), red (failure)
- Note box with practical examples
- Arrows showing flow between the two concepts

---

## Notes

- Uses subgraphs (clusters) to group related concepts
- Clear visual separation between "who you are" and "what you can do"
- Shows authentication MUST happen before authorization
- Diamond shapes for decision points (standard flowchart convention)
- Examples box provides real-world context (Filipino names for relatability)
