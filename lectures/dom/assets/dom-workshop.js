// ============================================================
// MISSION 02 — THE LIVING MISSION BOARD
// dom-workshop.js — THE ONLY FILE YOU EDIT.
//
// Loop: edit → Save (Ctrl+S) → Refresh the page (F5) → observe.
// Console: F12 → Console tab. Green/white = info. Red = stop and read.
//
// Your job: fill the four CIRCUIT areas below, in order.
// Everything you need is visible in dom-workshop.html (read it —
// it is read-only for you) and in dom-workshop.css (read-only too).
// ============================================================


// ------------------------------------------------------------
// CIRCUIT 1 — POWER  (demonstrated live by your teacher · D1)
// Goal: the status text changes OFFLINE → ONLINE when the power
//       button is clicked.
//
// TODO 1: make two variables with document.getElementById(...):
//         one for the power button, one for the status text.
//
// TODO 2: prove both exist — console.log(each variable).
//         Save → Refresh → F12. Each must print an element, NOT null.
//
// TODO 3: make the button respond:
//         <your power button variable>.addEventListener('click', function () {
//           // set the status variable's textContent to 'ONLINE'
//         });
// ------------------------------------------------------------


// ------------------------------------------------------------
// CIRCUIT 2 — BRIEFING  (guided together · D2)
// Goal: clicking Mission 1's "Open Intel" button copies Mission 1's
//       TITLE text into the briefing line, prefixed with "Selected: ".
//
// TODO 4: variables for Mission 1's title element and the briefing
//         element (find both ids in the HTML below).
//
// TODO 5: give Mission 1's "Open Intel" button its own click handler.
//         Inside it: READ the title's textContent, then WRITE it into
//         the briefing's textContent, starting with 'Selected: '.
// ------------------------------------------------------------


// ------------------------------------------------------------
// CIRCUIT 3 — SHUTTERS  (guided together · D3)
// Goal: extend the SAME Circuit 2 handler (do NOT write a second
//       handler) so one click also:
//         - moves Mission 1's badge from its standby state to its
//           active state
//         - opens Mission 1's shuttered intel panel
//
// The class names already exist — READ them in dom-workshop.css
// (search for the badge and the shutter states).
//
// TODO 6: inside the Circuit 2 handler, switch Mission 1's badge
//         state using classList — and update its label text so it
//         no longer says STANDBY.
// TODO 7: inside the same handler, reveal Mission 1's intel panel
//         using classList.
//         Reminder: JavaScript must contain NO colors here — CSS paints.
// ------------------------------------------------------------


// ------------------------------------------------------------
// CIRCUIT 4 — TRANSFER  (independent · You)
// Goal: restore Mission 2 completely, on your own. One handler on
//       Mission 2's "Open Intel" button that does all three jobs:
//         briefing update + badge swap + shutter reveal.
//       (Read Mission 2's block in the HTML to find its ids.)
//
// TODO 8: Mission 2's complete handler.
//
// STRETCH: Mission 3 the same way — then make its shutter TOGGLE
//          (click once = open, click again = close).
// ------------------------------------------------------------


// ------------------------------------------------------------
// EXTENSION BAY (45-minute version — only when your teacher says go)
//
// E1: replace the per-mission handlers with ONE loop over all
//     "Open Intel" buttons that works out which card was clicked.
//     (Your teacher will introduce: document.querySelectorAll(...) and
//      buttons.forEach(...))
//
// E2: paint one badge color directly from JavaScript, observe it,
//     then convert it to a CSS class and delete the direct style.
//     Which would you rather maintain?
// ------------------------------------------------------------