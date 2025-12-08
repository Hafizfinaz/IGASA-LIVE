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
const ADMIN_PASSWORD = "yakun123igasa"; // CHANGE THIS!
const POINTS = { first: 10, second: 7, third: 5 };

/* -------------------- 1. EMERGENCY LOCK ON LOAD -------------------- */
document.addEventListener("DOMContentLoaded", function () {
    isAdmin = false;
    enableEditing(false); // Lock everything immediately
});

/* -------------------- 2. DATABASE LISTENERS -------------------- */
onValue(ref(db, 'scores'), (snapshot) => {
    const data = snapshot.val();
    if (data) {
        currentScores = data;
        // Only update display if we are NOT currently editing (to prevent jumping text)
        if (!isAdmin) updateScoreboardDisplay();
    }
});

onValue(ref(db, 'results'), (snapshot) => {
    const data = snapshot.val();
    allResultsData = data || {};
    clearAllLists();
    if (data) { Object.values(data).forEach(item => addResultHTML(item)); }
});

onValue(ref(db, 'events'), (snapshot) => {
    const data = snapshot.val();
    const list = document.getElementById("events-list");
    list.innerHTML = "";
    if (data) {
        Object.values(data).forEach(item => {
            // Fix for "undefined" error - checks if data exists first
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
    // We use innerText to safely set the score
    if (document.querySelector('.nexara .wing-score')) document.querySelector('.nexara .wing-score').innerText = currentScores.Nexara || 0;
    if (document.querySelector('.ignara .wing-score')) document.querySelector('.ignara .wing-score').innerText = currentScores.Ignara || 0;
    if (document.querySelector('.sonara .wing-score')) document.querySelector('.sonara .wing-score').innerText = currentScores.Zonara || 0;
    if (document.querySelector('.lunara .wing-score')) document.querySelector('.lunara .wing-score').innerText = currentScores.Lunara || 0;
}

function clearAllLists() {
    ['list-general', 'list-senior', 'list-junior', 'list-subjunior'].forEach(id => {
        document.getElementById(id).innerHTML = "";
    });
}

function addResultHTML(data) {
    const container = document.getElementById(data.sectionId);
    if (!container) return;

    // Validate data to prevent "undefined"
    const p = data.program || "Unknown Program";
    const c = data.category || "General";

    const div = document.createElement("div");
    div.className = "result-item";
    // div.innerHTML = `
    //     <div class="res-header"><span class="res-title">${p}</span><span class="res-cat">${c}</span></div>
    //     <div class="res-winners">
    //         <div class="winner-row gold">🥇 <b>${data.first?.wing || ""}</b> - ${data.first?.name || ""}</div>
    //         <div class="winner-row silver">🥈 <b>${data.second?.wing || ""}</b> - ${data.second?.name || ""}</div>
    //         <div class="winner-row bronze">🥉 <b>${data.third?.wing || ""}</b> - ${data.third?.name || ""}</div>
    //     </div>`;

    div.innerHTML = `<div class="comp-row">
                <div class="comp-info">
                  <div class="comp-title" contenteditable="false">
                    ${p}
                  </div>
                  <div class="comp-cat" contenteditable="false">Sports</div>
                </div>
                <div class="comp-winners">
                  <div class="winner-line rank-1">
                    <span class="w-rank">1st:</span>
                    <span class="w-house">${data.first?.wing || ""}</span>
                  </div>
                  <div class="winner-line rank-2">
                    <span class="w-rank">2nd:</span>
                    <span class="w-house">${data.second?.wing || ""}</span>
                  </div>
                  <div class="winner-line rank-3">
                    <span class="w-rank">3rd:</span>
                    <span class="w-house">${data.third?.wing|| ""}</span>
                  </div>
                </div>
              </div>`
    container.appendChild(div);
}

/* -------------------- 4. ADMIN & SECURITY -------------------- */
window.toggleAdminMode = function () {
    if (!isAdmin) {
        const pass = prompt("Enter Admin Password:");
        if (pass === ADMIN_PASSWORD) {
            isAdmin = true;
            document.querySelector('.admin-controls').classList.add('unlocked');

            // Show Buttons
            document.getElementById('add-res-btn').style.display = 'inline-block';
            document.getElementById('add-evt-btn').style.display = 'inline-block';
            document.getElementById('save-btn').style.display = 'inline-block';
            document.getElementById('reset-btn').style.display = 'inline-block';
            document.getElementById('admin-lock-btn').innerText = "🔓 LOGOUT";

            enableEditing(true);
            alert("Admin Mode Unlocked. You can now click scores to edit them manually!");
        } else {
            alert("Wrong Password");
        }
    } else {
        isAdmin = false;
        location.reload();
    }
};

function enableEditing(enable) {
    // This allows you to click and type on the text
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

/* -------------------- 5. PUBLISH MANUAL EDITS (NEW FEATURE) -------------------- */
window.pushToFirebase = function () {
    if (!isAdmin) return;

    // 1. Read the numbers currently on your screen
    const n = parseInt(document.querySelector('.nexara .wing-score').innerText) || 0;
    const i = parseInt(document.querySelector('.ignara .wing-score').innerText) || 0;
    const z = parseInt(document.querySelector('.sonara .wing-score').innerText) || 0;
    const l = parseInt(document.querySelector('.lunara .wing-score').innerText) || 0;

    const manualScores = { Nexara: n, Ignara: i, Zonara: z, Lunara: l };

    // 2. Save them to Firebase
    set(ref(db, 'scores'), manualScores)
        .then(() => {
            alert("Scores Updated & Published Live!");
        })
        .catch((error) => {
            alert("Error: " + error);
        });
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
    const category = document.getElementById('new-cat').value;

    const r1 = { wing: document.getElementById('new-rank1').value, name: document.getElementById('name-1').value };
    const r2 = { wing: document.getElementById('new-rank2').value, name: document.getElementById('name-2').value };
    const r3 = { wing: document.getElementById('new-rank3').value, name: document.getElementById('name-3').value };

    if (!program) return alert("Please enter Program Name");

    // Auto-Calculate Scores
    if (r1.wing) currentScores[r1.wing] = (currentScores[r1.wing] || 0) + POINTS.first;
    if (r2.wing) currentScores[r2.wing] = (currentScores[r2.wing] || 0) + POINTS.second;
    if (r3.wing) currentScores[r3.wing] = (currentScores[r3.wing] || 0) + POINTS.third;

    // Save
    push(ref(db, 'results'), { sectionId, program, category, first: r1, second: r2, third: r3 });
    set(ref(db, 'scores'), currentScores);

    // Update screen immediately
    updateScoreboardDisplay();
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

// Leaderboard Logic (Same as before)
document.querySelectorAll('.cat-header').forEach(header => {
    header.addEventListener('click', () => {
        const listId = header.parentElement.querySelector('div[id^="list-"]').id;
        showStudentLeaderboard(listId, header.innerText);
    });
});
function showStudentLeaderboard(sectionId, titleName) {
    let studentScores = {};
    Object.values(allResultsData).forEach(res => {
        if (res.sectionId === sectionId) {
            const addPoints = (s, p) => {
                if (!s || !s.name) return;
                const key = s.name.trim().toLowerCase();
                if (!studentScores[key]) studentScores[key] = { name: s.name, wing: s.wing, total: 0 };
                studentScores[key].total += p;
            };
            addPoints(res.first, POINTS.first); addPoints(res.second, POINTS.second); addPoints(res.third, POINTS.third);
        }
    });
    let ranking = Object.values(studentScores).sort((a, b) => b.total - a.total);
    let rows = ranking.map((s, i) => `<tr><td style="padding:5px;">#${i + 1}</td><td style="padding:5px;"><b>${s.name}</b> (${s.wing})</td><td style="padding:5px; color:red;">${s.total}</td></tr>`).join("");
    if (!rows) rows = "<tr><td colspan='3' style='text-align:center'>No points yet</td></tr>";
    document.querySelector('.modal-content').innerHTML = `<h2 style="text-align:center;">${titleName} TOP STUDENTS</h2><table style="width:100%; border-collapse:collapse; text-align:left;">${rows}</table><button onclick="document.getElementById('addModal').style.display='none'; location.reload();" style="width:100%; margin-top:15px; padding:10px;">CLOSE</button>`;
    document.getElementById('addModal').style.display = 'flex';
}

/* -------------------- 8. BACKGROUND ANIMATION -------------------- */
const canvas = document.getElementById('bg-canvas');
if (canvas) {
    // const ctx=canvas.getContext('2d'); let w,h,p=[];
    // const resize=()=>{w=canvas.width=window.innerWidth;h=canvas.height=window.innerHeight;};
    // class P{constructor(){this.reset();}reset(){this.x=Math.random()*w;this.y=h+Math.random()*100;this.s=Math.random()*1+0.5;}update(){this.y-=this.s;if(this.y<0)this.reset();}draw(){ctx.beginPath();ctx.arc(this.x,this.y,Math.random()*3,0,Math.PI*2);ctx.fillStyle='rgba(255,255,255,0.1)';ctx.fill();}}
    // const anim=()=>{ctx.clearRect(0,0,w,h);p.forEach(x=> {x.update();x.draw();});requestAnimationFrame(anim);};
    // window.onresize=()=>{resize();p=[];for(let i=0;i<50;i++)p.push(new P());};
    // resize();for(let i=0;i<50;i++)p.push(new P());anim();
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
}

