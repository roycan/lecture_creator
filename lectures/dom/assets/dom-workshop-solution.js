// ============================================================
// MISSION 02 — THE LIVING MISSION BOARD
// dom-workshop-solution.js — TEACHER ANSWER SHEET (pilot 01)
// ------------------------------------------------------------
// NEVER reaches students: the filename contains "solution" and
// scripts/stage-student-assets.mjs EXCLUDE_RE = /solution|quiz\.md$|\.test\.js$/i
// strips it from the published site and the student ZIP.
// This file is the complete, tested core (Circuits 1–4).
// Extensions E1/E2 are provided as COMMENTED reference blocks at
// the bottom — uncomment only per the notes there.
// ============================================================

// ------------------------------------------------------------
// CIRCUIT 1 — POWER (D1: select → verify → listen → change)
// ------------------------------------------------------------
const powerBtn = document.getElementById('power-btn');
const statusEl = document.getElementById('status');

// Verify both selections before trusting them (Law 2 evidence):
console.log(powerBtn);   // <button id="power-btn" …> — NOT null
console.log(statusEl);   // <span id="status">OFFLINE</span> — NOT null

powerBtn.addEventListener('click', function () {
  statusEl.textContent = 'ONLINE';
});

// ------------------------------------------------------------
// CIRCUIT 2 + CIRCUIT 3 — ONE handler, Mission 1 (D2 then D3)
// Circuit 3 deliberately EXTENDS this handler instead of adding a
// second one: multiple small DOM operations cooperating to restore
// one system = one click does everything.
// ------------------------------------------------------------
const mission1Title = document.getElementById('mission-1-title');
const briefingEl = document.getElementById('briefing');
const mission1Badge = document.getElementById('mission-1-badge');
const mission1Intel = document.getElementById('mission-1-intel');

document.getElementById('mission-1-open').addEventListener('click', function () {
  // Circuit 2 — read one element's text, write it into another:
  briefingEl.textContent = 'Selected: ' + mission1Title.textContent;

  // Circuit 3 — switch STATE classes only; CSS owns every color,
  // plus the label text so the badge doesn't say STANDBY while styled active:
  mission1Badge.textContent = 'ACTIVE';
  mission1Badge.classList.remove('stby');
  mission1Badge.classList.add('active');
  mission1Intel.classList.remove('shuttered');
  mission1Intel.classList.add('revealed');
});

// ------------------------------------------------------------
// CIRCUIT 4 — TRANSFER (You): Mission 2, same pattern, new ids
// ------------------------------------------------------------
const mission2Title = document.getElementById('mission-2-title');
const mission2Badge = document.getElementById('mission-2-badge');
const mission2Intel = document.getElementById('mission-2-intel');

document.getElementById('mission-2-open').addEventListener('click', function () {
  briefingEl.textContent = 'Selected: ' + mission2Title.textContent;

  mission2Badge.textContent = 'ACTIVE';
  mission2Badge.classList.remove('stby');
  mission2Badge.classList.add('active');
  mission2Intel.classList.remove('shuttered');
  mission2Intel.classList.add('revealed');
});

// ------------------------------------------------------------
// STRETCH (worksheet): Mission 3 + shutter TOGGLE
// Deliberately uses class.toggle('revealed') so a second click
// closes the shutter while the badge/briefing logic stays stable.
// ------------------------------------------------------------
const mission3Title = document.getElementById('mission-3-title');
const mission3Badge = document.getElementById('mission-3-badge');
const mission3Intel = document.getElementById('mission-3-intel');

document.getElementById('mission-3-open').addEventListener('click', function () {
  briefingEl.textContent = 'Selected: ' + mission3Title.textContent;

  mission3Badge.textContent = 'ACTIVE';
  mission3Badge.classList.remove('stby');
  mission3Badge.classList.add('active');
  mission3Intel.classList.toggle('revealed'); // click 2 closes it again
});

// ============================================================
// EXTENSIONS (45-minute version) — COMMENTED REFERENCE ONLY.
//
// E1 note: E1 REPLACES Circuits 2–4 (one loop, all cards). Before
// uncommenting E1, comment out the three per-mission handlers above,
// otherwise both run on every click (harmless but confusing).
//
// E2 note: paint-then-refactor demo for one badge; the direct style
// line is the "before", the class line is the "after".
// ============================================================
//
// const openButtons = document.querySelectorAll('.open');
// openButtons.forEach(function (btn) {
//   btn.addEventListener('click', function () {
//     const card = btn.closest('.card');
//     const title = card.querySelector('h3').textContent;
//     briefingEl.textContent = 'Selected: ' + title;
//     card.querySelector('.badge').classList.remove('stby');
//     card.querySelector('.badge').classList.add('active');
//     card.querySelector('.intel').classList.remove('shuttered');
//     card.querySelector('.intel').classList.add('revealed');
//   });
// });
//
// // E2 — direct paint (observe), then refactor to a class:
// // const b = document.getElementById('mission-1-badge');
// // b.style.backgroundColor = '#f59e0b';   ← "before": JS paints
// // b.style.color = '#0e1726';
// // …then delete both lines and write:  b.classList.add('badge-hot');
// // (with .badge-hot { … } added to dom-workshop.css by the TEACHER,
// //  since students never edit the CSS.)