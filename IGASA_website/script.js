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

/* -------------------- DATA & VARIABLES -------------------- */
let currentScores = { Nexara: 0, Ignara: 0, Zonara: 0, Lunara: 0 };
let allResultsData = {};
let isAdmin = false;
const ADMIN_PASSWORD = "yakun123igasa"; // CHANGE THIS

// ===> PASTE YOUR PDF PROGRAMS HERE <===
const PROGRAM_LIST = {
    "list-general": ["March Past", "Spelling Bee", "Football", "Quiz"],
    "list-senior": ["Mappilappattu", "Speech Malayalam", "Speech English", "Essay Writing"],
    "list-junior": ["Mappilappattu", "Story Telling", "Painting", "Pencil Drawing"],
    "list-subjunior": ["Coloring", "Running Race", "Action Song"]
};

/* -------------------- LISTENERS -------------------- */
document.addEventListener("DOMContentLoaded", function () {
    isAdmin = false;
    enableEditing(false);
    updateProgramList(); // Load initial list
});

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
        Object.values(data).reverse().forEach(item => addResultHTML(item)); 
    }
});

onValue(ref(db, 'events'), (snapshot) => {
    const data = snapshot.val();
    const list = document.getElementById("events-list");
    list.innerHTML = "";
    if (data) {
        Object.values(data).forEach(item => {
            const div = document.createElement("div");
            div.className = "event-item";
            div.innerHTML = `<div class="event-date">${item.date}</div><div class="event-time">${item.time}</div><div class="event-desc">${item.desc}</div>`;
            list.appendChild(div);
        });
        if (!isAdmin) enableEditing(false);
    }
});

/* -------------------- DISPLAY LOGIC -------------------- */
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

function addResultHTML(data) {
    const container = document.getElementById(data.sectionId);
    if (!container) return;

    // Helper to format winner string (e.g., "Nexara & Ignara")
    const formatWinner = (w1, w2, n1, n2) => {
        let text = `<b>${w1}</b>`;
        if(n1) text += ` - ${n1}`;
        if(w2) {
            text += ` <br>& <b>${w2}</b>`;
            if(n2) text += ` - ${n2}`;
        }
        return text;
    };

    const div = document.createElement("div");
    div.innerHTML = `
    <div class="comp-row">
        <div class="comp-info">
            <div class="comp-title">${data.program}</div>
            <div class="comp-cat" style="color:#aaa;">${data.category} | ${data.type.toUpperCase()}</div>
        </div>
        <div class="comp-winners">
            <div class="winner-line rank-1"><span class="w-rank">1st:</span> <span>${formatWinner(data.first.wing, data.first.tieWing, data.first.name, data.first.tieName)}</span></div>
            <div class="winner-line rank-2"><span class="w-rank">2nd:</span> <span>${formatWinner(data.second.wing, data.second.tieWing, data.second.name, data.second.tieName)}</span></div>
            <div class="winner-line rank-3"><span class="w-rank">3rd:</span> <span>${formatWinner(data.third.wing, data.third.tieWing, data.third.name, data.third.tieName)}</span></div>
        </div>
    </div>`;
    
    container.appendChild(div);
}

/* -------------------- ADD RESULT LOGIC (UPDATED) -------------------- */
window.updateProgramList = function() {
    const section = document.getElementById('new-section').value;
    const select = document.getElementById('new-program-select');
    select.innerHTML = "";
    
    const programs = PROGRAM_LIST[section] || ["Other"];
    programs.forEach(prog => {
        const option = document.createElement("option");
        option.value = prog;
        option.text = prog;
        select.appendChild(option);
    });
}

window.confirmAdd = function () {
    if (currentMode === 'result') saveNewResult();
    else saveNewEvent();
    window.closeModal();
};

function saveNewResult() {
    const sectionId = document.getElementById('new-section').value;
    const program = document.getElementById('new-program-select').value;
    const category = document.getElementById('new-cat').value;
    const type = document.getElementById('new-type').value; // Single or Group

    // Define Points based on Type
    const pt = type === 'group' ? {1:10, 2:5, 3:3} : {1:5, 2:3, 3:1};

    // Gather Data
    const r1 = { wing: document.getElementById('new-rank1').value, name: document.getElementById('name-1').value, tieWing: document.getElementById('new-rank1-tie').value, tieName: document.getElementById('name-1-tie').value };
    const r2 = { wing: document.getElementById('new-rank2').value, name: document.getElementById('name-2').value, tieWing: document.getElementById('new-rank2-tie').value, tieName: document.getElementById('name-2-tie').value };
    const r3 = { wing: document.getElementById('new-rank3').value, name: document.getElementById('name-3').value, tieWing: document.getElementById('new-rank3-tie').value, tieName: document.getElementById('name-3-tie').value };

    if (!program) return alert("Select a program");

    // Helper to Add Points
    const addScore = (wing, points) => {
        if(wing) currentScores[wing] = (currentScores[wing] || 0) + points;
    };

    // Calculate Points (Handling Ties)
    addScore(r1.wing, pt[1]); addScore(r1.tieWing, pt[1]);
    addScore(r2.wing, pt[2]); addScore(r2.tieWing, pt[2]);
    addScore(r3.wing, pt[3]); addScore(r3.tieWing, pt[3]);

    // Save to Firebase
    push(ref(db, 'results'), { 
        sectionId, program, category, type,
        first: r1, second: r2, third: r3 
    });
    set(ref(db, 'scores'), currentScores);

    alert("Result Added & Points Calculated!");
}

function saveNewEvent() {
    push(ref(db, 'events'), {
        date: document.getElementById('new-date').value,
        time: document.getElementById('new-time').value,
        desc: document.getElementById('new-desc').value
    });
    alert("Event Added!");
}

/* -------------------- ADMIN & UI -------------------- */
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
    // Basic editing is disabled in this version to rely on the Add Modal for accuracy
}

window.pushToFirebase = function () {
    if (!isAdmin) return;
    set(ref(db, 'scores'), currentScores).then(() => alert("Synced!"));
};

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

// --- BUBBLES ---
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
