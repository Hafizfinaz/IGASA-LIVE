// --- 1. IMPORT FIREBASE (DO NOT CHANGE) ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set, onValue, push } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// --- 2. YOUR FIREBASE KEYS ---
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

// --- 3. START THE APP ---
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// --- 4. DATA VARIABLES ---
let currentScores = { Nexara: 0, Ignara: 0, Zonara: 0, Lunara: 0 };
let currentMode = "result"; // 'result' or 'event'

// --- 5. LISTEN FOR LIVE UPDATES (The Magic Part) ---
const scoresRef = ref(db, 'scores');
const resultsRef = ref(db, 'results');
const eventsRef = ref(db, 'events');

// A. When Scores Change in Database -> Update Screen
onValue(scoresRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
        currentScores = data;
        updateScoreboardDisplay();
    }
});

// B. When Results Change -> Update List
onValue(resultsRef, (snapshot) => {
    const data = snapshot.val();
    clearAllLists(); // Wipe old list to prevent duplicates
    if (data) {
        // Data comes back as an object of objects, convert to array
        Object.values(data).forEach(item => {
            addResultHTML(item);
        });
    }
});

// C. When Events Change -> Update List
onValue(eventsRef, (snapshot) => {
    const data = snapshot.val();
    const eventListDiv = document.getElementById("events-list");
    eventListDiv.innerHTML = ""; // Clear list
    if (data) {
        Object.values(data).forEach(item => {
            addEventHTML(item);
        });
    }
});


// --- 6. DISPLAY FUNCTIONS ---

function updateScoreboardDisplay() {
    // Finds the divs based on class names like "wing-box nexara"
    document.querySelector('.nexara .wing-score').innerText = currentScores.Nexara || 0;
    document.querySelector('.ignara .wing-score').innerText = currentScores.Ignara || 0;
    document.querySelector('.sonara .wing-score').innerText = currentScores.Zonara || 0; // Note: Your HTML has 'sonara' class for Zonara
    document.querySelector('.lunara .wing-score').innerText = currentScores.Lunara || 0;
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

function addEventHTML(data) {
    const container = document.getElementById("events-list");
    const div = document.createElement("div");
    div.className = "event-item";
    div.innerHTML = `
        <div class="event-date">${data.date}</div>
        <div class="event-time">${data.time}</div>
        <div class="event-desc">${data.desc}</div>
    `;
    container.appendChild(div);
}


// --- 7. ADMIN FUNCTIONS (Adding Data) ---

// Points Rules
const POINTS = { first: 10, second: 7, third: 5 };

window.confirmAdd = function() {
    if (currentMode === 'result') {
        saveNewResult();
    } else {
        saveNewEvent();
    }
    window.closeModal();
};

function saveNewResult() {
    // 1. Get Inputs
    const sectionId = document.getElementById('new-section').value;
    const program = document.getElementById('new-title').value;
    const category = document.getElementById('new-cat').value;
    
    const r1 = {
        wing: document.getElementById('new-rank1').value,
        name: document.getElementById('name-1').value,
        chest: document.getElementById('chest-1').value
    };
    const r2 = {
        wing: document.getElementById('new-rank2').value,
        name: document.getElementById('name-2').value,
        chest: document.getElementById('chest-2').value
    };
    const r3 = {
        wing: document.getElementById('new-rank3').value,
        name: document.getElementById('name-3').value,
        chest: document.getElementById('chest-3').value
    };

    // 2. Update Local Scores
    if (r1.wing) currentScores[r1.wing] = (currentScores[r1.wing] || 0) + POINTS.first;
    if (r2.wing) currentScores[r2.wing] = (currentScores[r2.wing] || 0) + POINTS.second;
    if (r3.wing) currentScores[r3.wing] = (currentScores[r3.wing] || 0) + POINTS.third;

    // 3. Save to Firebase (Results list)
    push(resultsRef, {
        sectionId, program, category, first: r1, second: r2, third: r3
    });

    // 4. Save to Firebase (Updated Scores)
    set(scoresRef, currentScores);
    
    alert("Result Added & Scores Updated!");
}

function saveNewEvent() {
    const date = document.getElementById('new-date').value;
    const time = document.getElementById('new-time').value;
    const desc = document.getElementById('new-desc').value;

    push(eventsRef, { date, time, desc });
}

// --- 8. UI HELPERS ---

window.openTab = function(tabName) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(tabName).classList.add('active');
    event.currentTarget.classList.add('active');
};

window.openModal = function(type) {
    currentMode = type;
    document.getElementById('addModal').style.display = 'flex';
    document.getElementById('modal-title').innerText = type === 'result' ? 'ADD RESULT' : 'ADD EVENT';
    
    if (type === 'result') {
        document.getElementById('result-inputs').style.display = 'flex';
        document.getElementById('event-inputs').style.display = 'none';
    } else {
        document.getElementById('result-inputs').style.display = 'none';
        document.getElementById('event-inputs').style.display = 'flex';
    }
};

window.closeModal = function() {
    document.getElementById('addModal').style.display = 'none';
};

// Admin Password Protection
window.toggleAdminMode = function() {
    const pass = prompt("Enter Admin Password:");
    if (pass === "1234") { // Change "1234" to whatever password you want
        document.querySelector('.admin-controls').classList.add('unlocked');
        alert("Admin Mode Unlocked");
    } else {
        alert("Wrong Password");
    }
};

// Push to Firebase (Manual Sync button - optional now since we push automatically)
window.pushToFirebase = function() {
    alert("Data is already live!");
};

window.resetData = function() {
    if(confirm("Are you sure you want to delete ALL data? This cannot be undone.")) {
        set(scoresRef, { Nexara: 0, Ignara: 0, Zonara: 0, Lunara: 0 });
        set(resultsRef, null);
        set(eventsRef, null);
        alert("Reset Complete");
    }
};
