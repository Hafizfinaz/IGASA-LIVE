/* -------------------- FIREBASE IMPORTS -------------------- */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set, onValue, push } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

/* -------------------- YOUR FIREBASE CONFIG -------------------- */
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

/* -------------------- INITIALIZE APP -------------------- */
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

/* -------------------- GLOBAL VARIABLES -------------------- */
let currentScores = { Nexara: 0, Ignara: 0, Zonara: 0, Lunara: 0 };
let allResultsData = {}; // Store all results here for calculation
let isAdmin = false;
const ADMIN_PASSWORD = "1234"; 

const POINTS = { first: 10, second: 7, third: 5 };

/* -------------------- 1. LISTEN FOR DATA -------------------- */
// Listen for SCORES (Wings)
onValue(ref(db, 'scores'), (snapshot) => {
    const data = snapshot.val();
    if (data) {
        currentScores = data;
        updateScoreboardDisplay();
    }
});

// Listen for RESULTS (Competitions)
onValue(ref(db, 'results'), (snapshot) => {
    const data = snapshot.val();
    allResultsData = data || {}; // Save for leaderboard calculation
    
    clearAllLists();
    if (data) {
        Object.values(data).forEach(item => {
            addResultHTML(item);
        });
    }
});

// Listen for EVENTS (Schedule)
onValue(ref(db, 'events'), (snapshot) => {
    const data = snapshot.val();
    const list = document.getElementById("events-list");
    list.innerHTML = "";
    if (data) {
        Object.values(data).forEach(item => {
            const div = document.createElement("div");
            div.className = "event-item";
            div.innerHTML = `
                <div class="event-date">${item.date}</div>
                <div class="event-time">${item.time}</div>
                <div class="event-desc">${item.desc}</div>`;
            list.appendChild(div);
        });
    }
});

/* -------------------- 2. DISPLAY FUNCTIONS -------------------- */
function updateScoreboardDisplay() {
    // Updates the big numbers at the top
    if(document.querySelector('.nexara .wing-score')) document.querySelector('.nexara .wing-score').innerText = currentScores.Nexara || 0;
    if(document.querySelector('.ignara .wing-score')) document.querySelector('.ignara .wing-score').innerText = currentScores.Ignara || 0;
    if(document.querySelector('.sonara .wing-score')) document.querySelector('.sonara .wing-score').innerText = currentScores.Zonara || 0;
    if(document.querySelector('.lunara .wing-score')) document.querySelector('.lunara .wing-score').innerText = currentScores.Lunara || 0;
}

function clearAllLists() {
    ['list-general', 'list-senior', 'list-junior', 'list-subjunior'].forEach(id => {
        document.getElementById(id).innerHTML = "";
    });
}

function addResultHTML(data) {
    const container = document.getElementById(data.sectionId);
    if (!container) return;

    const div = document.createElement("div");
    div.className = "result-item";
    div.innerHTML = `
        <div class="res-header">
            <span class="res-title">${data.program}</span>
            <span class="res-cat">${data.category}</span>
        </div>
        <div class="res-winners">
            <div class="winner-row gold">🥇 <b>${data.first.wing}</b> - ${data.first.name} (${data.first.chest})</div>
            <div class="winner-row silver">🥈 <b>${data.second.wing}</b> - ${data.second.name} (${data.second.chest})</div>
            <div class="winner-row bronze">🥉 <b>${data.third.wing}</b> - ${data.third.name} (${data.third.chest})</div>
        </div>
    `;
    container.appendChild(div);
}

/* -------------------- 3. STUDENT LEADERBOARD (NEW FEATURE) -------------------- */

// Add Click Events to the Headers (Senior, Junior, etc.)
document.querySelectorAll('.cat-header').forEach(header => {
    header.style.cursor = "pointer";
    header.innerHTML += " <span style='font-size:0.7em; opacity:0.7;'>(Click for Rank)</span>";
    
    header.addEventListener('click', (e) => {
        // Find which section this is (General, Senior, etc.)
        const parent = header.parentElement; // .category-section
        const listDiv = parent.querySelector('div[id^="list-"]'); // gets id="list-senior"
        const sectionId = listDiv.id;
        
        showStudentLeaderboard(sectionId, header.innerText.replace("(Click for Rank)", ""));
    });
});

function showStudentLeaderboard(sectionId, titleName) {
    // 1. Calculate Scores for this section
    let studentScores = {};

    Object.values(allResultsData).forEach(res => {
        if (res.sectionId === sectionId) {
            // Helper to add points
            const addPoints = (student, points) => {
                if(!student || !student.name) return;
                const key = student.name.trim().toLowerCase() + "-" + (student.chest || ""); // Unique ID
                if(!studentScores[key]) {
                    studentScores[key] = {
                        name: student.name,
                        chest: student.chest,
                        wing: student.wing,
                        total: 0
                    };
                }
                studentScores[key].total += points;
            };

            addPoints(res.first, POINTS.first);
            addPoints(res.second, POINTS.second);
            addPoints(res.third, POINTS.third);
        }
    });

    // 2. Convert to Array and Sort
    let ranking = Object.values(studentScores).sort((a, b) => b.total - a.total);

    // 3. Build Popup HTML
    let tableRows = ranking.map((s, index) => `
        <tr style="border-bottom:1px solid #333;">
            <td style="padding:8px;">#${index + 1}</td>
            <td style="padding:8px;"><b>${s.name}</b> <br><small style="color:#888;">${s.wing} ${s.chest ? '('+s.chest+')' : ''}</small></td>
            <td style="padding:8px; color:var(--neon-red); font-weight:bold;">${s.total}</td>
        </tr>
    `).join("");

    if(ranking.length === 0) tableRows = "<tr><td colspan='3' style='padding:20px; text-align:center;'>No results yet!</td></tr>";

    // 4. Show in Modal (We reuse the existing modal container for simplicity)
    const modal = document.getElementById('addModal');
    const content = document.querySelector('.modal-content');
    
    // Save original content to restore later
    if(!window.originalModalContent) window.originalModalContent = content.innerHTML;
    
    content.innerHTML = `
        <h2 style="text-align:center; color:var(--neon-red);">${titleName} TOP STUDENTS</h2>
        <div style="max-height:60vh; overflow-y:auto; margin-top:10px;">
            <table style="width:100%; text-align:left; border-collapse:collapse;">
                <thead style="background:#222; color:#fff;">
                    <tr>
                        <th style="padding:10px;">Rank</th>
                        <th style="padding:10px;">Student</th>
                        <th style="padding:10px;">Pts</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
        </div>
        <button onclick="closeLeaderboard()" style="width:100%; padding:10px; margin-top:20px; background:#333; color:white; border:none; border-radius:5px; cursor:pointer;">CLOSE</button>
    `;
    
    modal.style.display = 'flex';
}

window.closeLeaderboard = function() {
    const modal = document.getElementById('addModal');
    modal.style.display = 'none';
    // Restore the "Add Result" form for next time
    if(window.originalModalContent) {
        document.querySelector('.modal-content').innerHTML = window.originalModalContent;
        // Re-attach event listeners for the restored buttons
        // (We assume the HTML onclick attributes handle the basics)
    }
};


/* -------------------- 4. ADMIN FUNCTIONS -------------------- */
let currentMode = "result"; // 'result' or 'event'

window.confirmAdd = function() {
    if (currentMode === 'result') saveNewResult();
    else saveNewEvent();
    window.closeModal();
};

function saveNewResult() {
    // Get Inputs
    const sectionId = document.getElementById('new-section').value;
    const program = document.getElementById('new-title').value;
    const category = document.getElementById('new-cat').value;
    
    const r1 = { wing: document.getElementById('new-rank1').value, name: document.getElementById('name-1').value, chest: document.getElementById('chest-1').value };
    const r2 = { wing: document.getElementById('new-rank2').value, name: document.getElementById('name-2').value, chest: document.getElementById('chest-2').value };
    const r3 = { wing: document.getElementById('new-rank3').value, name: document.getElementById('name-3').value, chest: document.getElementById('chest-3').value };

    if(!program) return alert("Please enter a Program Name");

    // Update Scores
    if (r1.wing) currentScores[r1.wing] = (currentScores[r1.wing] || 0) + POINTS.first;
    if (r2.wing) currentScores[r2.wing] = (currentScores[r2.wing] || 0) + POINTS.second;
    if (r3.wing) currentScores[r3.wing] = (currentScores[r3.wing] || 0) + POINTS.third;

    // Save to DB
    push(ref(db, 'results'), { sectionId, program, category, first: r1, second: r2, third: r3 });
    set(ref(db, 'scores'), currentScores);
    
    alert("Saved!");
}

function saveNewEvent() {
    const date = document.getElementById('new-date').value;
    const time = document.getElementById('new-time').value;
    const desc = document.getElementById('new-desc').value;
    push(ref(db, 'events'), { date, time, desc });
}


/* -------------------- 5. UI HELPERS -------------------- */
window.openTab = function(tabName) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(tabName).classList.add('active');
    // Identify which button was clicked is hard without 'this', so we rely on class matching or simpler UI
};

window.openModal = function(type) {
    currentMode = type;
    const modal = document.getElementById('addModal');
    
    // Ensure we are in "Form Mode" not "Leaderboard Mode"
    if(window.originalModalContent && document.querySelector('table')) {
         document.querySelector('.modal-content').innerHTML = window.originalModalContent;
    }

    modal.style.display = 'flex';
    
    // Toggle Inputs
    const resInputs = document.getElementById('result-inputs');
    const evtInputs = document.getElementById('event-inputs');
    const title = document.getElementById('modal-title');
    
    if(resInputs && evtInputs) {
        if (type === 'result') {
            title.innerText = 'ADD RESULT';
            resInputs.style.display = 'flex';
            evtInputs.style.display = 'none';
        } else {
            title.innerText = 'ADD EVENT';
            resInputs.style.display = 'none';
            evtInputs.style.display = 'flex';
        }
    }
};

window.closeModal = function() {
    document.getElementById('addModal').style.display = 'none';
};

window.toggleAdminMode = function() {
    const pass = prompt("Enter Admin Password:");
    if (pass === ADMIN_PASSWORD) { 
        document.querySelector('.admin-controls').classList.add('unlocked');
        // Force buttons to show
        ['add-res-btn', 'add-evt-btn', 'save-btn', 'reset-btn'].forEach(id => {
            const el = document.getElementById(id);
            if(el) el.style.display = "inline-block";
        });
        document.getElementById('admin-lock-btn').style.display = "none";
        alert("Admin Mode Unlocked");
    } else {
        alert("Wrong Password");
    }
};

window.pushToFirebase = function() { alert("Data is already live!"); };

window.resetData = function() {
    if(confirm("DELETE ALL DATA?")) {
        set(ref(db, 'scores'), { Nexara: 0, Ignara: 0, Zonara: 0, Lunara: 0 });
        set(ref(db, 'results'), null);
        set(ref(db, 'events'), null);
        location.reload();
    }
};

// Background Bubble Animation (Kept from your original request)
const canvas = document.getElementById('bg-canvas');
if(canvas) {
    const ctx = canvas.getContext('2d');
    let width, height, particles = [];
    function resize() { width = canvas.width = window.innerWidth; height = canvas.height = window.innerHeight; }
    class Particle {
        constructor() { this.reset(); this.y = Math.random() * height; }
        reset() {
            this.x = Math.random() * width; this.y = height + Math.random() * 100;
            this.speedY = Math.random() * 1 + 0.5; this.size = Math.random() * 30 + 2;
        }
        update() { this.y -= this.speedY; if (this.y + this.size < 0) this.reset(); }
        draw() {
            ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.05)'; ctx.fill();
        }
    }
    function animate() {
        ctx.clearRect(0, 0, width, height);
        particles.forEach(p => { p.update(); p.draw(); });
        requestAnimationFrame(animate);
    }
    window.addEventListener('resize', () => { resize(); particles = []; for(let i=0; i<50; i++) particles.push(new Particle()); });
    resize(); for(let i=0; i<50; i++) particles.push(new Particle()); animate();
}
