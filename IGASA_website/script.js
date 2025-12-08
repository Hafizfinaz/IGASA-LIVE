/* -------------------- FIREBASE IMPORTS -------------------- */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set, onValue, push } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

/* -------------------- CONFIG -------------------- */
const firebaseConfig = {
    apiKey: "AIzaSyDAIjT7yNtQqYiXXUiSKpIneuC0GvUAUms",
    authDomain: "igasa-fest.firebaseapp.com",
    databaseURL: "https://igasa-fest-default-rtdb.firebaseio.com",
    projectId: "igasa-fest",
    storageBucket: "igasa-fest.firebasestorage.app",
    messagingSenderId: "628113103388",
    appId: "1:628113103388:web:7dac04d2c79fbc69dc1dd9",
    measurementId: "G-NP9WMJKJKH"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

/* -------------------- VARIABLES -------------------- */
let currentScores = { Nexara: 0, Ignara: 0, Zonara: 0, Lunara: 0 };
let allResultsData = {};
let isAdmin = false;
const ADMIN_PASSWORD = "yakun123igasa"; // Your Password
const POINTS = { first: 5, second: 3, third: 1 };

/* -------------------- 1. EMERGENCY LOCK ON LOAD -------------------- */
document.addEventListener("DOMContentLoaded", function () {
    isAdmin = false;
    enableEditing(false);
});

/* -------------------- 2. DATABASE LISTENERS -------------------- */
onValue(ref(db, 'scores'), (snapshot) => {
    const data = snapshot.val();
    if (data) {
        currentScores = data;
        if (!isAdmin) updateScoreboardDisplay();
    }
});

onValue(ref(db, 'results'), (snapshot) => {
    const data = snapshot.val();
    allResultsData = data || {};
    clearAllLists();
    if (data) { 
        // Reverse array to show newest first
        Object.values(data).reverse().forEach(item => addResultHTML(item)); 
    }
});

onValue(ref(db, 'events'), (snapshot) => {
    const data = snapshot.val();
    const list = document.getElementById("events-list");
    list.innerHTML = "";
    if (data) {
        Object.values(data).forEach(item => {
            const d = item.date || "";
            const t = item.time || "";
            const desc = item.desc || "";
            const div = document.createElement("div");
            div.className = "event-item";
            div.innerHTML = `<div class="event-date">${d}</div><div class="event-time">${t}</div><div class="event-desc">${desc}</div>`;
            list.appendChild(div);
        });
        if (!isAdmin) enableEditing(false);
    }
});

/* -------------------- 3. DISPLAY LOGIC -------------------- */
function updateScoreboardDisplay() {
    if (document.querySelector('.nexara .wing-score')) document.querySelector('.nexara .wing-score').innerText = currentScores.Nexara || 0;
    if (document.querySelector('.ignara .wing-score')) document.querySelector('.ignara .wing-score').innerText = currentScores.Ignara || 0;
    if (document.querySelector('.sonara .wing-score')) document.querySelector('.sonara .wing-score').innerText = currentScores.Zonara || 0;
    if (document.querySelector('.lunara .wing-score')) document.querySelector('.lunara .wing-score').innerText = currentScores.Lunara || 0;
}

function clearAllLists() {
    ['list-general', 'list-senior', 'list-junior', 'list-subjunior'].forEach(id => {
        const el = document.getElementById(id);
        if(el) el.innerHTML = "";
    });
}

// THIS FUNCTION RENDERS THE HTML ON THE SCREEN
function addResultHTML(data) {
    const container = document.getElementById(data.sectionId);
    if (!container) return;

    const p = data.program || "Unknown Program";
    const c = data.category || "General"; // Gets the category correctly

    const div = document.createElement("div");
    // div.className = "result-item"; // Removed wrapping div to match your CSS style
    
    div.innerHTML = `
    <div class="comp-row">
        <div class="comp-info">
            <div class="comp-title" contenteditable="false">${p}</div>
            <div class="comp-cat" contenteditable="false">${c}</div> </div>
        <div class="comp-winners">
            <div class="winner-line rank-1">
                <span class="w-rank">1st:</span>
                <span class="w-house">${data.first?.wing || ""}</span> - 
                <span class="w-name">${data.first?.name || ""}</span>
                <span class="w-chest">${data.first?.chest || ""}</span>
            </div>
            <div class="winner-line rank-2">
                <span class="w-rank">2nd:</span>
                <span class="w-house">${data.second?.wing || ""}</span> - 
                <span class="w-name">${data.second?.name || ""}</span>
                <span class="w-chest">${data.second?.chest || ""}</span>
            </div>
            <div class="winner-line rank-3">
                <span class="w-rank">3rd:</span>
                <span class="w-house">${data.third?.wing || ""}</span> - 
                <span class="w-name">${data.third?.name || ""}</span>
                <span class="w-chest">${data.third?.chest || ""}</span>
            </div>
        </div>
    </div>`;
    
    container.appendChild(div);
}

/* -------------------- 4. ADMIN & SECURITY -------------------- */
window.toggleAdminMode = function () {
    if (!isAdmin) {
        const pass = prompt("Enter Admin Password:");
        if (pass === ADMIN_PASSWORD) {
            isAdmin = true;
            document.querySelector('.admin-controls').classList.add('unlocked');
            document.getElementById('add-res-btn').style.display = 'inline-block';
            document.getElementById('add-evt-btn').style.display = 'inline-block';
            document.getElementById('save-btn').style.display = 'inline-block';
            document.getElementById('reset-btn').style.display = 'inline-block';
            document.getElementById('admin-lock-btn').innerText = "🔓 LOGOUT";
            enableEditing(true);
            alert("Admin Mode Unlocked.");
        } else {
            alert("Wrong Password");
        }
    } else {
        isAdmin = false;
        location.reload();
    }
};

function enableEditing(enable) {
    const editables = document.querySelectorAll('.wing-score, .event-date, .event-time, .event-desc, .comp-title');
    editables.forEach(el => {
        el.contentEditable = enable ? "true" : "false";
        if (enable) {
            el.classList.add('editable-active');
            el.style.pointerEvents = "auto";
        } else {
            el.classList.remove('editable-active');
            el.style.pointerEvents = "none";
        }
    });
}

/* -------------------- 5. PUBLISH MANUAL EDITS -------------------- */
window.pushToFirebase = function () {
    if (!isAdmin) return;
    const n = parseInt(document.querySelector('.nexara .wing-score').innerText) || 0;
    const i = parseInt(document.querySelector('.ignara .wing-score').innerText) || 0;
    const z = parseInt(document.querySelector('.sonara .wing-score').innerText) || 0;
    const l = parseInt(document.querySelector('.lunara .wing-score').innerText) || 0;
    const manualScores = { Nexara: n, Ignara: i, Zonara: z, Lunara: l };
    
    set(ref(db, 'scores'), manualScores)
        .then(() => alert("Scores Updated & Published Live!"))
        .catch((error) => alert("Error: " + error));
};

/* -------------------- 6. ADD DATA POPUP -------------------- */
let currentMode = "result";

window.confirmAdd = function () {
    if (currentMode === 'result') saveNewResult();
    else saveNewEvent();
    window.closeModal();
};

function saveNewResult() {
    const sectionId = document.getElementById('new-section').value;
    const program = document.getElementById('new-title').value;
    const category = document.getElementById('new-cat').value; // Reads the Dropdown Value

    // Helper to format chest no
    const getChest = (id) => {
        const val = document.getElementById(id).value;
        return val ? `(C:${val})` : "";
    };

    const r1 = { 
        wing: document.getElementById('new-rank1').value, 
        name: document.getElementById('name-1').value,
        chest: getChest('chest-1')
    };
    const r2 = { 
        wing: document.getElementById('new-rank2').value, 
        name: document.getElementById('name-2').value,
        chest: getChest('chest-2')
    };
    const r3 = { 
        wing: document.getElementById('new-rank3').value, 
        name: document.getElementById('name-3').value,
        chest: getChest('chest-3')
    };

    if (!program) return alert("Please enter Program Name");

    // Auto-Calculate Scores
    if (r1.wing) currentScores[r1.wing] = (currentScores[r1.wing] || 0) + POINTS.first;
    if (r2.wing) currentScores[r2.wing] = (currentScores[r2.wing] || 0) + POINTS.second;
    if (r3.wing) currentScores[r3.wing] = (currentScores[r3.wing] || 0) + POINTS.third;

    // Save to Firebase
    push(ref(db, 'results'), { sectionId, program, category, first: r1, second: r2, third: r3 });
    set(ref(db, 'scores'), currentScores);

    alert("Result Added & Scores Updated!");
}

function saveNewEvent() {
    push(ref(db, 'events'), {
        date: document.getElementById('new-date').value,
        time: document.getElementById('new-time').value,
        desc: document.getElementById('new-desc').value
    });
    alert("Event Added!");
}

/* -------------------- 7. UI HELPERS -------------------- */
window.openTab = function (tabName) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(tabName).classList.add('active');
};

window.openModal = function (type) {
    currentMode = type;
    document.getElementById('addModal').style.display = 'flex';
    document.getElementById('result-inputs').style.display = type === 'result' ? 'flex' : 'none';
    document.getElementById('event-inputs').style.display = type === 'result' ? 'none' : 'flex';
};

window.closeModal = function () { document.getElementById('addModal').style.display = 'none'; };
window.resetData = function () { if (confirm("DELETE ALL DATA?")) { set(ref(db, 'scores'), { Nexara: 0, Ignara: 0, Zonara: 0, Lunara: 0 }); set(ref(db, 'results'), null); set(ref(db, 'events'), null); location.reload(); } };

/* -------------------- 8. BACKGROUND ANIMATION -------------------- */
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
let width, height, particles;
function resize() { width = canvas.width = window.innerWidth; height = canvas.height = window.innerHeight; }
class Particle {
    constructor() { this.reset(); this.y = Math.random() * height; }
    reset() { this.x = Math.random() * width; this.y = height + Math.random() * 100; this.speedY = Math.random() * 1 + 0.5; this.size = Math.random() * 33 + 2; this.swing = Math.random() * 2; this.swingStep = 0; }
    update() { this.y -= this.speedY; this.swingStep += 0.02; this.x += Math.sin(this.swingStep) * this.swing * 0.1; if (this.y + this.size < 0) this.reset(); }
    draw() { ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255, 255, 255, 0.05)'; ctx.strokeStyle = 'rgba(255, 50, 50, 0.2)'; ctx.lineWidth = 2; ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.arc(this.x - this.size * 0.3, this.y - this.size * 0.3, this.size * 0.2, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'; ctx.fill(); }
}
function initParticles() { particles = []; const count = window.innerWidth < 768 ? 30 : 60; for (let i = 0; i < count; i++) particles.push(new Particle()); }
function animate() { ctx.clearRect(0, 0, width, height); for (let i = 0; i < particles.length; i++) { particles[i].update(); particles[i].draw(); } requestAnimationFrame(animate); }
window.addEventListener('resize', () => { resize(); initParticles(); }); resize(); initParticles(); animate();
