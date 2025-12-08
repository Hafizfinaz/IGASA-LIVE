// /* -------------------- FIREBASE IMPORTS -------------------- */
// import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
// import { getDatabase, ref, set, onValue, push } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// /* -------------------- CONFIG -------------------- */
// const firebaseConfig = {
//     apiKey: "AIzaSyDAIjT7yNtQqYiXXUiSKpIneuC0GvUAUms",
//     authDomain: "igasa-fest.firebaseapp.com",
//     databaseURL: "https://igasa-fest-default-rtdb.firebaseio.com",
//     projectId: "igasa-fest",
//     storageBucket: "igasa-fest.firebasestorage.app",
//     messagingSenderId: "628113103388",
//     appId: "1:628113103388:web:7dac04d2c79fbc69dc1dd9",
//     measurementId: "G-NP9WMJKJKH"
// };

// const app = initializeApp(firebaseConfig);
// const db = getDatabase(app);

// /* -------------------- VARIABLES -------------------- */
// let currentScores = { Nexara: 0, Ignara: 0, Zonara: 0, Lunara: 0 };
// let allResultsData = {};
// let isAdmin = false;
// const ADMIN_PASSWORD = "yakun123igasa"; // Your Password
// const POINTS = { first: 5, second: 3, third: 1 };

// /* -------------------- 1. EMERGENCY LOCK ON LOAD -------------------- */
// document.addEventListener("DOMContentLoaded", function () {
//     isAdmin = false;
//     enableEditing(false);
// });

// /* -------------------- 2. DATABASE LISTENERS -------------------- */
// onValue(ref(db, 'scores'), (snapshot) => {
//     const data = snapshot.val();
//     if (data) {
//         currentScores = data;
//         if (!isAdmin) updateScoreboardDisplay();
//     }
// });

// onValue(ref(db, 'results'), (snapshot) => {
//     const data = snapshot.val();
//     allResultsData = data || {};
//     clearAllLists();
//     if (data) { 
//         // Reverse array to show newest first
//         Object.values(data).reverse().forEach(item => addResultHTML(item)); 
//     }
// });

// onValue(ref(db, 'events'), (snapshot) => {
//     const data = snapshot.val();
//     const list = document.getElementById("events-list");
//     list.innerHTML = "";
//     if (data) {
//         Object.values(data).forEach(item => {
//             const d = item.date || "";
//             const t = item.time || "";
//             const desc = item.desc || "";
//             const div = document.createElement("div");
//             div.className = "event-item";
//             div.innerHTML = `<div class="event-date">${d}</div><div class="event-time">${t}</div><div class="event-desc">${desc}</div>`;
//             list.appendChild(div);
//         });
//         if (!isAdmin) enableEditing(false);
//     }
// });

// /* -------------------- 3. DISPLAY LOGIC -------------------- */
// function updateScoreboardDisplay() {
//     if (document.querySelector('.nexara .wing-score')) document.querySelector('.nexara .wing-score').innerText = currentScores.Nexara || 0;
//     if (document.querySelector('.ignara .wing-score')) document.querySelector('.ignara .wing-score').innerText = currentScores.Ignara || 0;
//     if (document.querySelector('.sonara .wing-score')) document.querySelector('.sonara .wing-score').innerText = currentScores.Zonara || 0;
//     if (document.querySelector('.lunara .wing-score')) document.querySelector('.lunara .wing-score').innerText = currentScores.Lunara || 0;
// }

// function clearAllLists() {
//     ['list-general', 'list-senior', 'list-junior', 'list-subjunior'].forEach(id => {
//         const el = document.getElementById(id);
//         if(el) el.innerHTML = "";
//     });
// }

// // THIS FUNCTION RENDERS THE HTML ON THE SCREEN
// function addResultHTML(data) {
//     const container = document.getElementById(data.sectionId);
//     if (!container) return;

//     const p = data.program || "Unknown Program";
//     const c = data.category || "General"; // Gets the category correctly

//     const div = document.createElement("div");
//     // div.className = "result-item"; // Removed wrapping div to match your CSS style
    
//     div.innerHTML = `
//     <div class="comp-row">
//         <div class="comp-info">
//             <div class="comp-title" contenteditable="false">${p}</div>
//             <div class="comp-cat" contenteditable="false">${c}</div> </div>
//         <div class="comp-winners">
//             <div class="winner-line rank-1">
//                 <span class="w-rank">1st:</span>
//                 <span class="w-house">${data.first?.wing || ""}</span> - 
//                 <span class="w-name">${data.first?.name || ""}</span>
//                 <span class="w-chest">${data.first?.chest || ""}</span>
//             </div>
//             <div class="winner-line rank-2">
//                 <span class="w-rank">2nd:</span>
//                 <span class="w-house">${data.second?.wing || ""}</span> - 
//                 <span class="w-name">${data.second?.name || ""}</span>
//                 <span class="w-chest">${data.second?.chest || ""}</span>
//             </div>
//             <div class="winner-line rank-3">
//                 <span class="w-rank">3rd:</span>
//                 <span class="w-house">${data.third?.wing || ""}</span> - 
//                 <span class="w-name">${data.third?.name || ""}</span>
//                 <span class="w-chest">${data.third?.chest || ""}</span>
//             </div>
//         </div>
//     </div>`;
    
//     container.appendChild(div);
// }

// /* -------------------- 4. ADMIN & SECURITY -------------------- */
// window.toggleAdminMode = function () {
//     if (!isAdmin) {
//         const pass = prompt("Enter Admin Password:");
//         if (pass === ADMIN_PASSWORD) {
//             isAdmin = true;
//             document.querySelector('.admin-controls').classList.add('unlocked');
//             document.getElementById('add-res-btn').style.display = 'inline-block';
//             document.getElementById('add-evt-btn').style.display = 'inline-block';
//             document.getElementById('save-btn').style.display = 'inline-block';
//             document.getElementById('reset-btn').style.display = 'inline-block';
//             document.getElementById('admin-lock-btn').innerText = "🔓 LOGOUT";
//             enableEditing(true);
//             alert("Admin Mode Unlocked.");
//         } else {
//             alert("Wrong Password");
//         }
//     } else {
//         isAdmin = false;
//         location.reload();
//     }
// };

// function enableEditing(enable) {
//     const editables = document.querySelectorAll('.wing-score, .event-date, .event-time, .event-desc, .comp-title');
//     editables.forEach(el => {
//         el.contentEditable = enable ? "true" : "false";
//         if (enable) {
//             el.classList.add('editable-active');
//             el.style.pointerEvents = "auto";
//         } else {
//             el.classList.remove('editable-active');
//             el.style.pointerEvents = "none";
//         }
//     });
// }

// /* -------------------- 5. PUBLISH MANUAL EDITS -------------------- */
// window.pushToFirebase = function () {
//     if (!isAdmin) return;
//     const n = parseInt(document.querySelector('.nexara .wing-score').innerText) || 0;
//     const i = parseInt(document.querySelector('.ignara .wing-score').innerText) || 0;
//     const z = parseInt(document.querySelector('.sonara .wing-score').innerText) || 0;
//     const l = parseInt(document.querySelector('.lunara .wing-score').innerText) || 0;
//     const manualScores = { Nexara: n, Ignara: i, Zonara: z, Lunara: l };
    
//     set(ref(db, 'scores'), manualScores)
//         .then(() => alert("Scores Updated & Published Live!"))
//         .catch((error) => alert("Error: " + error));
// };

// /* -------------------- 6. ADD DATA POPUP -------------------- */
// let currentMode = "result";

// window.confirmAdd = function () {
//     if (currentMode === 'result') saveNewResult();
//     else saveNewEvent();
//     window.closeModal();
// };

// function saveNewResult() {
//     const sectionId = document.getElementById('new-section').value;
//     const program = document.getElementById('new-title').value;
//     const category = document.getElementById('new-cat').value; // Reads the Dropdown Value

//     // Helper to format chest no
//     const getChest = (id) => {
//         const val = document.getElementById(id).value;
//         return val ? `(C:${val})` : "";
//     };

//     const r1 = { 
//         wing: document.getElementById('new-rank1').value, 
//         name: document.getElementById('name-1').value,
//         chest: getChest('chest-1')
//     };
//     const r2 = { 
//         wing: document.getElementById('new-rank2').value, 
//         name: document.getElementById('name-2').value,
//         chest: getChest('chest-2')
//     };
//     const r3 = { 
//         wing: document.getElementById('new-rank3').value, 
//         name: document.getElementById('name-3').value,
//         chest: getChest('chest-3')
//     };

//     if (!program) return alert("Please enter Program Name");

//     // Auto-Calculate Scores
//     if (r1.wing) currentScores[r1.wing] = (currentScores[r1.wing] || 0) + POINTS.first;
//     if (r2.wing) currentScores[r2.wing] = (currentScores[r2.wing] || 0) + POINTS.second;
//     if (r3.wing) currentScores[r3.wing] = (currentScores[r3.wing] || 0) + POINTS.third;

//     // Save to Firebase
//     push(ref(db, 'results'), { sectionId, program, category, first: r1, second: r2, third: r3 });
//     set(ref(db, 'scores'), currentScores);

//     alert("Result Added & Scores Updated!");
// }

// function saveNewEvent() {
//     push(ref(db, 'events'), {
//         date: document.getElementById('new-date').value,
//         time: document.getElementById('new-time').value,
//         desc: document.getElementById('new-desc').value
//     });
//     alert("Event Added!");
// }

// /* -------------------- 7. UI HELPERS -------------------- */
// window.openTab = function (tabName) {
//     document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
//     document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
//     document.getElementById(tabName).classList.add('active');
// };

// window.openModal = function (type) {
//     currentMode = type;
//     document.getElementById('addModal').style.display = 'flex';
//     document.getElementById('result-inputs').style.display = type === 'result' ? 'flex' : 'none';
//     document.getElementById('event-inputs').style.display = type === 'result' ? 'none' : 'flex';
// };

// window.closeModal = function () { document.getElementById('addModal').style.display = 'none'; };
// window.resetData = function () { if (confirm("DELETE ALL DATA?")) { set(ref(db, 'scores'), { Nexara: 0, Ignara: 0, Zonara: 0, Lunara: 0 }); set(ref(db, 'results'), null); set(ref(db, 'events'), null); location.reload(); } };

// /* -------------------- 8. BACKGROUND ANIMATION -------------------- */
// const canvas = document.getElementById('bg-canvas');
// const ctx = canvas.getContext('2d');
// let width, height, particles;
// function resize() { width = canvas.width = window.innerWidth; height = canvas.height = window.innerHeight; }
// class Particle {
//     constructor() { this.reset(); this.y = Math.random() * height; }
//     reset() { this.x = Math.random() * width; this.y = height + Math.random() * 100; this.speedY = Math.random() * 1 + 0.5; this.size = Math.random() * 33 + 2; this.swing = Math.random() * 2; this.swingStep = 0; }
//     update() { this.y -= this.speedY; this.swingStep += 0.02; this.x += Math.sin(this.swingStep) * this.swing * 0.1; if (this.y + this.size < 0) this.reset(); }
//     draw() { ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255, 255, 255, 0.05)'; ctx.strokeStyle = 'rgba(255, 50, 50, 0.2)'; ctx.lineWidth = 2; ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.arc(this.x - this.size * 0.3, this.y - this.size * 0.3, this.size * 0.2, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'; ctx.fill(); }
// }
// function initParticles() { particles = []; const count = window.innerWidth < 768 ? 30 : 60; for (let i = 0; i < count; i++) particles.push(new Particle()); }
// function animate() { ctx.clearRect(0, 0, width, height); for (let i = 0; i < particles.length; i++) { particles[i].update(); particles[i].draw(); } requestAnimationFrame(animate); }
// window.addEventListener('resize', () => { resize(); initParticles(); }); resize(); initParticles(); animate();


/* -------------------- FIREBASE IMPORTS -------------------- */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set, onValue, push, remove, update } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

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
let currentEditKey = null;
const ADMIN_PASSWORD = "yakun123igasa";

// Points based on section and program type
const POINTS = {
    general: {
        individual: { first: 5, second: 3, third: 1 },
        group: { first: 10, second: 5, third: 3 }
    },
    other: { // For Senior, Junior, Sub Junior
        individual: { first: 5, second: 3, third: 1 },
        group: { first: 5, second: 3, third: 1 }
    }
};

/* -------------------- 1. EMERGENCY LOCK ON LOAD -------------------- */
document.addEventListener("DOMContentLoaded", function () {
    isAdmin = false;
    enableEditing(false);
    // Initialize with one input for each rank
    addWinnerInput('first');
    addWinnerInput('second');
    addWinnerInput('third');
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
        const entries = Object.entries(data);
        entries.reverse().forEach(([key, item]) => addResultHTML(key, item)); 
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

// Render result HTML with edit capability
function addResultHTML(key, data) {
    const container = document.getElementById(data.sectionId);
    if (!container) return;

    const p = data.program || "Unknown Program";
    const c = data.category || "General";
    const programType = data.programType || "individual";

    const div = document.createElement("div");
    div.className = "result-item-wrapper";
    div.dataset.key = key;
    
    // Create winners HTML
    const createWinnerLines = (rank, winners) => {
        if (!winners || winners.length === 0) return '';
        return winners.map(w => `
            <div class="winner-line rank-${rank}">
                <span class="w-rank">${rank === 1 ? '1st' : rank === 2 ? '2nd' : '3rd'}:</span>
                <span class="w-house">${w.wing || ""}</span> - 
                <span class="w-name">${w.name || ""}</span>
                <span class="w-chest">${w.chest || ""}</span>
            </div>
        `).join('');
    };

    const editBtn = isAdmin ? `<button class="edit-result-btn" onclick="window.openEditModal('${key}')">✏️ Edit</button>` : '';
    
    div.innerHTML = `
    <div class="comp-row">
        <div class="comp-info">
            <div class="comp-title" contenteditable="false">${p}</div>
            <div class="comp-cat" contenteditable="false">${c}</div>
        </div>
        <div class="comp-winners">
            ${createWinnerLines(1, data.first)}
            ${createWinnerLines(2, data.second)}
            ${createWinnerLines(3, data.third)}
        </div>
        ${editBtn}
    </div>`;
    
    container.appendChild(div);
}

/* -------------------- 4. MULTIPLE WINNERS INPUT -------------------- */
let winnerCounters = { first: 0, second: 0, third: 0 };

window.addWinnerInput = function(rank) {
    const container = document.getElementById(`${rank}-place-container`);
    const index = winnerCounters[rank]++;
    
    const div = document.createElement('div');
    div.className = 'input-group';
    div.dataset.index = index;
    div.innerHTML = `
        <select class="modal-select winner-wing" data-rank="${rank}">
            <option value="Nexara">Nexara</option>
            <option value="Ignara">Ignara</option>
            <option value="Zonara">Zonara</option>
            <option value="Lunara">Lunara</option>
        </select>
        <input type="text" class="modal-input winner-name" placeholder="Name" data-rank="${rank}">
        <input type="text" class="modal-input winner-chest" placeholder="Chest No" style="width:80px;" data-rank="${rank}">
        <button type="button" class="remove-btn" onclick="this.parentElement.remove()">✖</button>
    `;
    container.appendChild(div);
};

window.addEditWinnerInput = function(rank) {
    const container = document.getElementById(`edit-${rank}-place-container`);
    const index = winnerCounters[rank]++;
    
    const div = document.createElement('div');
    div.className = 'input-group';
    div.dataset.index = index;
    div.innerHTML = `
        <select class="modal-select winner-wing" data-rank="${rank}">
            <option value="Nexara">Nexara</option>
            <option value="Ignara">Ignara</option>
            <option value="Zonara">Zonara</option>
            <option value="Lunara">Lunara</option>
        </select>
        <input type="text" class="modal-input winner-name" placeholder="Name" data-rank="${rank}">
        <input type="text" class="modal-input winner-chest" placeholder="Chest No" style="width:80px;" data-rank="${rank}">
        <button type="button" class="remove-btn" onclick="this.parentElement.remove()">✖</button>
    `;
    container.appendChild(div);
};

function getWinnersFromInputs(rank, isEdit = false) {
    const prefix = isEdit ? 'edit-' : '';
    const container = document.getElementById(`${prefix}${rank}-place-container`);
    const groups = container.querySelectorAll('.input-group');
    
    const winners = [];
    groups.forEach(group => {
        const wing = group.querySelector('.winner-wing').value;
        const name = group.querySelector('.winner-name').value;
        const chestInput = group.querySelector('.winner-chest').value;
        const chest = chestInput ? `(C:${chestInput})` : "";
        
        if (name) { // Only add if name is provided
            winners.push({ wing, name, chest });
        }
    });
    
    return winners.length > 0 ? winners : null;
}

function calculatePoints(sectionId, programType) {
    const isGeneral = sectionId === 'list-general';
    const pointSet = isGeneral ? POINTS.general : POINTS.other;
    return pointSet[programType];
}

/* -------------------- 5. ADMIN & SECURITY -------------------- */
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
            // Re-render to show edit buttons
            clearAllLists();
            Object.entries(allResultsData).reverse().forEach(([key, item]) => addResultHTML(key, item));
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

/* -------------------- 6. PUBLISH MANUAL EDITS -------------------- */
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

/* -------------------- 7. ADD DATA POPUP -------------------- */
let currentMode = "result";

window.confirmAdd = function () {
    if (currentMode === 'result') saveNewResult();
    else saveNewEvent();
};

function saveNewResult() {
    const sectionId = document.getElementById('new-section').value;
    const program = document.getElementById('new-title').value;
    const category = document.getElementById('new-cat').value;
    const programType = document.getElementById('program-type').value;

    const first = getWinnersFromInputs('first');
    const second = getWinnersFromInputs('second');
    const third = getWinnersFromInputs('third');

    if (!program) return alert("Please enter Program Name");
    if (!first && !second && !third) return alert("Please add at least one winner");

    // Calculate points
    const points = calculatePoints(sectionId, programType);
    
    // Update scores
    if (first) first.forEach(w => currentScores[w.wing] = (currentScores[w.wing] || 0) + points.first);
    if (second) second.forEach(w => currentScores[w.wing] = (currentScores[w.wing] || 0) + points.second);
    if (third) third.forEach(w => currentScores[w.wing] = (currentScores[w.wing] || 0) + points.third);

    // Save to Firebase
    push(ref(db, 'results'), { 
        sectionId, 
        program, 
        category, 
        programType,
        first, 
        second, 
        third 
    });
    set(ref(db, 'scores'), currentScores);

    alert("Result Added & Scores Updated!");
    window.closeModal();
    resetModalInputs();
}

function saveNewEvent() {
    push(ref(db, 'events'), {
        date: document.getElementById('new-date').value,
        time: document.getElementById('new-time').value,
        desc: document.getElementById('new-desc').value
    });
    alert("Event Added!");
    window.closeModal();
}

function resetModalInputs() {
    // Reset result inputs
    document.getElementById('new-title').value = '';
    document.getElementById('first-place-container').innerHTML = '';
    document.getElementById('second-place-container').innerHTML = '';
    document.getElementById('third-place-container').innerHTML = '';
    winnerCounters = { first: 0, second: 0, third: 0 };
    addWinnerInput('first');
    addWinnerInput('second');
    addWinnerInput('third');
    
    // Reset event inputs
    document.getElementById('new-date').value = '';
    document.getElementById('new-time').value = '';
    document.getElementById('new-desc').value = '';
}

/* -------------------- 8. EDIT & DELETE FUNCTIONS -------------------- */
window.openEditModal = function(key) {
    if (!isAdmin) return;
    
    currentEditKey = key;
    const data = allResultsData[key];
    if (!data) return;
    
    // Populate edit form
    document.getElementById('edit-title').value = data.program || '';
    document.getElementById('edit-cat').value = data.category || 'Sports';
    document.getElementById('edit-program-type').value = data.programType || 'individual';
    
    // Clear containers
    document.getElementById('edit-first-place-container').innerHTML = '';
    document.getElementById('edit-second-place-container').innerHTML = '';
    document.getElementById('edit-third-place-container').innerHTML = '';
    
    // Populate winners
    if (data.first) {
        data.first.forEach(w => {
            addEditWinnerInput('first');
            const container = document.getElementById('edit-first-place-container');
            const lastGroup = container.lastElementChild;
            lastGroup.querySelector('.winner-wing').value = w.wing;
            lastGroup.querySelector('.winner-name').value = w.name;
            const chestNo = w.chest.replace('(C:', '').replace(')', '');
            lastGroup.querySelector('.winner-chest').value = chestNo;
        });
    }
    
    if (data.second) {
        data.second.forEach(w => {
            addEditWinnerInput('second');
            const container = document.getElementById('edit-second-place-container');
            const lastGroup = container.lastElementChild;
            lastGroup.querySelector('.winner-wing').value = w.wing;
            lastGroup.querySelector('.winner-name').value = w.name;
            const chestNo = w.chest.replace('(C:', '').replace(')', '');
            lastGroup.querySelector('.winner-chest').value = chestNo;
        });
    }
    
    if (data.third) {
        data.third.forEach(w => {
            addEditWinnerInput('third');
            const container = document.getElementById('edit-third-place-container');
            const lastGroup = container.lastElementChild;
            lastGroup.querySelector('.winner-wing').value = w.wing;
            lastGroup.querySelector('.winner-name').value = w.name;
            const chestNo = w.chest.replace('(C:', '').replace(')', '');
            lastGroup.querySelector('.winner-chest').value = chestNo;
        });
    }
    
    document.getElementById('editModal').style.display = 'flex';
};

window.saveEdit = function() {
    if (!currentEditKey) return;
    
    const oldData = allResultsData[currentEditKey];
    const program = document.getElementById('edit-title').value;
    const category = document.getElementById('edit-cat').value;
    const programType = document.getElementById('edit-program-type').value;
    
    const first = getWinnersFromInputs('first', true);
    const second = getWinnersFromInputs('second', true);
    const third = getWinnersFromInputs('third', true);
    
    if (!program) return alert("Please enter Program Name");
    
    // Reverse old scores
    const oldPoints = calculatePoints(oldData.sectionId, oldData.programType || 'individual');
    if (oldData.first) oldData.first.forEach(w => currentScores[w.wing] = (currentScores[w.wing] || 0) - oldPoints.first);
    if (oldData.second) oldData.second.forEach(w => currentScores[w.wing] = (currentScores[w.wing] || 0) - oldPoints.second);
    if (oldData.third) oldData.third.forEach(w => currentScores[w.wing] = (currentScores[w.wing] || 0) - oldPoints.third);
    
    // Apply new scores
    const newPoints = calculatePoints(oldData.sectionId, programType);
    if (first) first.forEach(w => currentScores[w.wing] = (currentScores[w.wing] || 0) + newPoints.first);
    if (second) second.forEach(w => currentScores[w.wing] = (currentScores[w.wing] || 0) + newPoints.second);
    if (third) third.forEach(w => currentScores[w.wing] = (currentScores[w.wing] || 0) + newPoints.third);
    
    // Update Firebase
    update(ref(db, `results/${currentEditKey}`), {
        program,
        category,
        programType,
        first,
        second,
        third
    });
    set(ref(db, 'scores'), currentScores);
    
    alert("Result Updated!");
    window.closeEditModal();
};

window.deleteResult = function() {
    if (!currentEditKey) return;
    if (!confirm("Are you sure you want to delete this result?")) return;
    
    const oldData = allResultsData[currentEditKey];
    
    // Reverse scores
    const points = calculatePoints(oldData.sectionId, oldData.programType || 'individual');
    if (oldData.first) oldData.first.forEach(w => currentScores[w.wing] = (currentScores[w.wing] || 0) - points.first);
    if (oldData.second) oldData.second.forEach(w => currentScores[w.wing] = (currentScores[w.wing] || 0) - points.second);
    if (oldData.third) oldData.third.forEach(w => currentScores[w.wing] = (currentScores[w.wing] || 0) - points.third);
    
    // Delete from Firebase
    remove(ref(db, `results/${currentEditKey}`));
    set(ref(db, 'scores'), currentScores);
    
    alert("Result Deleted!");
    window.closeEditModal();
};

window.closeEditModal = function() {
    document.getElementById('editModal').style.display = 'none';
    currentEditKey = null;
};

/* -------------------- 9. UI HELPERS -------------------- */
window.openTab = function (tabName) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(tabName).classList.add('active');
    document.querySelectorAll('.tab-btn').forEach(btn => {
        if (btn.textContent === tabName.toUpperCase()) btn.classList.add('active');
    });
};

window.openModal = function (type) {
    currentMode = type;
    document.getElementById('addModal').style.display = 'flex';
    document.getElementById('result-inputs').style.display = type === 'result' ? 'flex' : 'none';
    document.getElementById('event-inputs').style.display = type === 'result' ? 'none' : 'flex';
    document.getElementById('modal-title').textContent = type === 'result' ? 'ADD RESULT' : 'ADD EVENT';
};

window.closeModal = function () { 
    document.getElementById('addModal').style.display = 'none';
    resetModalInputs();
};

window.resetData = function () { 
    if (confirm("DELETE ALL DATA?")) { 
        set(ref(db, 'scores'), { Nexara: 0, Ignara: 0, Zonara: 0, Lunara: 0 }); 
        set(ref(db, 'results'), null); 
        set(ref(db, 'events'), null); 
        location.reload(); 
    } 
};

/* -------------------- 10. BACKGROUND ANIMATION -------------------- */
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
