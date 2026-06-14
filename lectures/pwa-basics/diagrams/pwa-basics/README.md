# Progressive Web Apps (PWA) Diagrams

This folder contains Mermaid diagram source files for the PWA Basics lecture, optimized for the Philippine context.

## Diagrams

### 1. Service Worker Lifecycle (`01-service-worker-lifecycle.mmd`)
**Purpose:** Illustrates the complete lifecycle of a service worker from installation to termination

**Shows:**
- Installing state (downloading and caching)
- Installed/Waiting state (ready but waiting for old SW)
- Activating state (taking control)
- Activated state (fully operational)
- Idle → Fetching → Terminated cycle
- Error and Redundant states

**Philippine Context:**
- Terminated state saves memory (budget phones)
- Caching during install reduces data costs
- Persistent operation during brownouts

**Use in lecture:** Section 4 (Service Workers), Section 5 (Caching Strategies)

---

### 2. Caching Strategies (`02-caching-strategies.mmd`)
**Purpose:** Compares three main caching strategies with Philippine use cases

**Shows:**
- **Cache First (Offline First):** Check cache → Return cached → Fetch on miss
- **Network First:** Try network → Update cache → Fallback to cache on error
- **Stale While Revalidate:** Return cache immediately → Update in background

**Philippine Context:**
- Cache First: ₱50 once vs ₱280 weekly with Network First
- Data cost calculations for each strategy
- Brownout scenarios and reliability
- Best practices for ₱50/week load budget

**Use in lecture:** Section 5 (Caching Strategies), Section 6 (Offline Detection)

---

### 3. PWA Architecture (`03-pwa-architecture.mmd`)
**Purpose:** Complete system architecture showing all PWA components and their interactions

**Shows:**
- Web Application (HTML, CSS, JS)
- Service Worker with event handlers (install, activate, fetch, sync, push)
- Cache Storage and IndexedDB
- manifest.json and app icons
- Network layer
- Data flow between components

**Philippine Examples:**
- Sari-sari store inventory app architecture
- 100 KB total download vs GB for native apps
- Storage on 16 GB budget phones

**Use in lecture:** Section 1 (What is PWA), Section 3 (manifest.json), Section 4 (Service Workers)

---

### 4. Installation Flow (`04-installation-flow.mmd`)
**Purpose:** Step-by-step sequence diagram of PWA installation process

**Shows:**
- Initial visit and criteria checking
- beforeinstallprompt event
- Custom install button
- User accepts/rejects
- appinstalled event
- Launching from home screen

**Philippine Context:**
- 30-second engagement threshold (adapted for limited data)
- Custom UI explaining data savings ("Save ₱200+/month")
- Benefits-focused messaging (brownout-proof, instant loading)

**Use in lecture:** Section 3 (manifest.json), Section 7 (Installability), Section 8 (Testing)

---

### 5. Offline/Online States (`05-offline-online-states.mmd`)
**Purpose:** State machine showing online/offline transitions and app behavior in each state

**Shows:**
- Online state: Fetching fresh, caching responses, immediate sync
- Offline state: Serving cached, queuing for Background Sync
- State transitions (connection lost/restored)
- Detection methods (navigator.onLine, fetch with timeout, service worker)

**Philippine Context:**
- Brownout scenarios (4-6 hours daily)
- Background Sync queues data for later
- Zero data cost when offline
- Reliability during power outages

**Use in lecture:** Section 6 (Offline Detection), Section 5 (Caching Strategies)

---

### 6. Philippine Benefits Comparison (`06-philippine-benefits.mmd`)
**Purpose:** Visual comparison showing why PWAs matter specifically for Filipino users

**Shows:**
- Regular Website costs: ₱300/month, 10s load times, no offline
- PWA costs: ₱50/month, <1s load times, full offline
- Monthly savings: ₱250/month per user
- Time savings: 90% faster
- Reliability: 100% uptime vs 62.5%

**Philippine Examples:**
- Student portal: ₱1,520 saved monthly per student
- Barangay services: works during brownouts
- Tricycle drivers: ₱4,200 saved monthly
- Budget phone storage comparison (16 GB)

**Use in lecture:** Section 2 (Why PWAs Matter in Philippines), Section 9 (When to Use PWAs)

---

## Exporting to PNG

### Using Mermaid CLI

1. **Install mermaid-cli:**
   ```bash
   npm install -g @mermaid-js/mermaid-cli
   ```

2. **Export single diagram:**
   ```bash
   mmdc -i 01-service-worker-lifecycle.mmd -o ../../diagrams/service-worker-lifecycle.png -b transparent
   ```

3. **Export all diagrams:**
   ```bash
   # From diagram-src/pwa-basics/ folder
   for file in *.mmd; do
       name="${file%.mmd}"
       mmdc -i "$file" -o "../../diagrams/${name}.png" -b transparent -w 2400
   done
   ```

4. **High-resolution export (for printing):**
   ```bash
   mmdc -i 02-caching-strategies.mmd -o ../../diagrams/caching-strategies.png -b transparent -w 3600 -s 2
   ```

### Using Mermaid Live Editor

1. Go to https://mermaid.live/
2. Copy diagram code from .mmd file (without the ```mermaid wrapper)
3. Paste into editor
4. Click "Actions" → "PNG" or "SVG"
5. Save to `diagrams/` folder

### Using VS Code Extension

1. Install "Markdown Preview Mermaid Support" extension
2. Open .mmd file in VS Code
3. Right-click diagram preview → Export as PNG
4. Save to `diagrams/` folder with matching name

---

## File Naming Convention

Format: `##-descriptive-name.mmd`

Where:
- `##` = Two-digit number (01, 02, etc.)
- `descriptive-name` = Lowercase with hyphens
- `.mmd` = Mermaid file extension

Examples:
- `01-service-worker-lifecycle.mmd`
- `02-caching-strategies.mmd`
- `06-philippine-benefits.mmd`

---

## Color Scheme

Diagrams use consistent, accessible colors:
- **Light Blue** (`#e3f2fd`) - Web apps, user-facing elements
- **Yellow** (`#fff9e6`) - Service workers, processing
- **Green** (`#e8f5e9`) - Cache storage, success states
- **Pink** (`#fce4ec`) - Manifest, metadata
- **Purple** (`#f3e5f5`) - Network, external services
- **Orange** (`#fff3e0`) - Commands, actions
- **Red** (`#ffebee`) - Errors, offline states (sparingly)

**Accessibility:**
- Sufficient contrast for color-blind users
- Text labels don't rely on color alone
- Icons supplement color coding

---

## Philippine Context

All diagrams are optimized for Philippine users:

### Data Costs:
- Based on real prepaid load pricing (₱1 ≈ 10 KB)
- ₱50-300/week typical budget for students/workers
- Shows savings calculations (regular vs PWA)

### Network Conditions:
- 2G/3G speed assumptions (50-500 Kbps)
- Spotty connections (Metro Manila, provincial)
- Brownout schedules (4-6 hours daily typical)

### Devices:
- Budget phones (16-32 GB storage, 1-2 GB RAM)
- Older Android versions (7.0+)
- Touch-first interfaces

### Use Cases:
- Sari-sari stores (inventory, prices)
- Barangay services (forms, announcements)
- Student portals (grades, materials)
- Tricycle routes (schedules, fares)

---

## Diagram Types Used

### State Diagrams:
- `01-service-worker-lifecycle.mmd` - Service worker states
- `05-offline-online-states.mmd` - Connection states

**Best for:** Showing different states and transitions

### Flowcharts:
- `02-caching-strategies.mmd` - Decision trees for caching
- `03-pwa-architecture.mmd` - System components
- `06-philippine-benefits.mmd` - Comparisons

**Best for:** Showing processes and relationships

### Sequence Diagrams:
- `04-installation-flow.mmd` - Time-based interactions

**Best for:** Showing interactions between components over time

---

## Integration with Lecture

Each diagram is referenced in specific lecture sections:

```markdown
## Section 4: Service Workers

A service worker is a JavaScript file that runs in the background...

![Service Worker Lifecycle](diagrams/service-worker-lifecycle.png)

As you can see in the diagram, the service worker goes through several states...
```

**Embedding in HTML:**
```html
<figure class="image">
  <img src="diagrams/service-worker-lifecycle.png" 
       alt="Service Worker Lifecycle showing states from installing to terminated">
  <figcaption>Figure 4.1: Service Worker Lifecycle</figcaption>
</figure>
```

---

## Maintenance

When updating diagrams:

### Content Updates:
- Keep Philippine pricing current (check prepaid load rates annually)
- Update phone specs as budget models improve
- Adjust network speeds as infrastructure improves

### Styling Updates:
- Maintain consistent colors across all diagrams
- Keep text labels clear and concise
- Test on mobile devices (diagrams should be readable on phones)

### Adding New Diagrams:
1. Follow naming convention (next number + descriptive name)
2. Include export command at bottom
3. Add Philippine context where relevant
4. Document in this README
5. Update lecture to reference new diagram

---

## Export Settings

### Recommended Settings:
```bash
mmdc -i input.mmd \
     -o output.png \
     -b transparent \     # Transparent background
     -w 2400 \            # Width in pixels (hi-res)
     -s 2                 # Scale factor (even sharper)
```

### For Web Use:
- Width: 1200-2400px
- Format: PNG (better than JPEG for diagrams)
- Background: Transparent

### For Print:
- Width: 3600px
- Scale: 2
- Format: PNG or SVG
- Background: White

---

## Troubleshooting Export

### Issue: Text is too small
**Solution:** Increase width with `-w` flag or scale with `-s` flag

### Issue: Colors look different
**Solution:** Use `-b transparent` and set background in CSS/HTML

### Issue: Diagram is cut off
**Solution:** Add more space in Mermaid source or increase canvas size

### Issue: Export fails
**Solution:** Check Mermaid syntax with Live Editor first

---

## Alternative Formats

### SVG Export:
```bash
mmdc -i input.mmd -o output.svg
```
**Advantages:** Infinitely scalable, small file size
**Disadvantages:** May not render consistently in all contexts

### PDF Export:
```bash
mmdc -i input.mmd -o output.pdf
```
**Advantages:** Perfect for printing, preserves quality
**Disadvantages:** Larger file size

---

## License

These diagrams are part of the Lecture Creator project and follow the same license.

**Philippine Context:**
- Examples use generic scenarios (no specific real businesses)
- Pricing based on publicly available prepaid load rates
- Free for educational use

---

## Contributing

When creating new PWA diagrams:
1. Focus on Philippine user scenarios
2. Include data cost calculations
3. Show brownout/offline benefits
4. Use clear, simple language (Grade 9 level)
5. Test on mobile devices
6. Document in this README

---

**Last updated:** November 13, 2025  
**Diagrams created:** 6  
**Total lines of code:** ~2,500 lines  
**Philippine examples:** 15+ scenarios
