/* -------------------- FIREBASE IMPORTS -------------------- */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

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

/* -------------------- INITIALIZE FIREBASE -------------------- */
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

/* -------------------- ADMIN SETTINGS -------------------- */
const ADMIN_PASSWORD = "yakun123igasa"; // CHANGE THIS PASSWORD!
let isAdmin = false;

/* -------------------- 1. LISTEN LIVE FOR DATABASE CHANGES -------------------- */
onValue(ref(db), (snapshot) => {
    const data = snapshot.val();
    if (data && !isAdmin) { 
        if(data.scores) document.getElementById('scoreboard-container').innerHTML = data.scores;
        if(data.results) document.getElementById('results-main-container').innerHTML = data.results;
        if(data.events) document.getElementById('events-list').innerHTML = data.events;
    }
});

/* -------------------- 2. PUSH DATA TO FIREBASE -------------------- */
window.pushToFirebase = function() {
    if (!isAdmin) return;

    set(ref(db), {
        scores: document.getElementById('scoreboard-container').innerHTML,
        results: document.getElementById('results-main-container').innerHTML,
        events: document.getElementById('events-list').innerHTML
    })
    .then(() => alert("DATA PUBLISHED LIVE!"))
    .catch((err) => alert("Error: " + err));
};

/* -------------------- ADMIN LOGIN / LOGOUT -------------------- */
window.toggleAdminMode = function() {
    if (!isAdmin) {
        let pass = prompt("Enter Admin Password:");
        if (pass === ADMIN_PASSWORD) {
            isAdmin = true;
            document.getElementById('admin-lock-btn').innerText = "🔓 LOGOUT";
            document.getElementById('save-btn').style.display = "block";
            document.getElementById('add-res-btn').style.display = "block";
            document.getElementById('add-evt-btn').style.display = "block";
            document.getElementById('reset-btn').style.display = "block";
            enableEditing(true);
            alert("Admin Mode Active.");
        } else { alert("Wrong Password!"); }
    } else {
        isAdmin = false;
        document.getElementById('admin-lock-btn').innerText = "🔒 ADMIN";
        document.getElementById('save-btn').style.display = "none";
        document.getElementById('add-res-btn').style.display = "none";
        document.getElementById('add-evt-btn').style.display = "none";
        document.getElementById('reset-btn').style.display = "none";
        enableEditing(false);
        location.reload();
    }
};

function enableEditing(enable) {
    const selectors = '.wing-score, .comp-title, .comp-cat, .w-house, .w-name, .w-chest, .event-date, .event-time, .event-desc';
    const editables = document.querySelectorAll(selectors);

    editables.forEach(el => {
        el.contentEditable = enable;
        if (enable) el.classList.add('editable-active');
        else el.classList.remove('editable-active');
    });
}

/* -------------------- RESET DATABASE -------------------- */
window.resetData = function() {
    if (confirm("Reset database?")) {
        set(ref(db), null);
        location.reload();
    }
};

/* -------------------- UI: TABS -------------------- */
window.openTab = function(tabName) {
    var i, x = document.getElementsByClassName("tab-content"), buttons = document.getElementsByClassName("tab-btn");

    for (i = 0; i < x.length; i++) { 
        x[i].style.display = "none"; 
        x[i].classList.remove("active"); 
    }

    for (i = 0; i < buttons.length; i++) { 
        buttons[i].classList.remove("active"); 
    }

    document.getElementById(tabName).style.display = "block";
    const clickedBtn = Array.from(buttons).find(b => b.textContent.toLowerCase().includes(tabName.substring(0,3)));
    if(clickedBtn) clickedBtn.classList.add("active");
};

/* -------------------- MODAL: ADD RESULT / EVENT -------------------- */
let currentMode = '';

window.openModal = function(mode) { 
    currentMode = mode;
    document.getElementById('addModal').style.display = "flex";

    if (mode === 'result') {
        document.getElementById('modal-title').innerText = "ADD RESULT";
        document.getElementById('result-inputs').style.display = "flex";
        document.getElementById('event-inputs').style.display = "none";
    } else {
        document.getElementById('modal-title').innerText = "ADD EVENT";
        document.getElementById('result-inputs').style.display = "none";
        document.getElementById('event-inputs').style.display = "flex";
    }
};

window.closeModal = function() {
    document.getElementById('addModal').style.display = "none";
};

window.confirmAdd = function() { 
    if (currentMode === 'result') addNewResult(); 
    else addNewEvent(); 
};

/* -------------------- ADD NEW RESULT -------------------- */
function addNewResult() {
    const sectionId = document.getElementById('new-section').value;
    const t = document.getElementById('new-title').value;
    const c = document.getElementById('new-cat').value;

    const h1 = document.getElementById('new-rank1').value;
    const n1 = document.getElementById('name-1').value || "Name";
    const ch1 = document.getElementById('chest-1').value ? `(C:${document.getElementById('chest-1').value})` : "";

    const h2 = document.getElementById('new-rank2').value;
    const n2 = document.getElementById('name-2').value || "Name";
    const ch2 = document.getElementById('chest-2').value ? `(C:${document.getElementById('chest-2').value})` : "";

    const h3 = document.getElementById('new-rank3').value;
    const n3 = document.getElementById('name-3').value || "Name";
    const ch3 = document.getElementById('chest-3').value ? `(C:${document.getElementById('chest-3').value})` : "";

    if(!t) return alert("Enter Name");

    const newRow = `
    <div class="comp-row">
        <div class="comp-info">
            <div class="comp-title" contenteditable="true">${t}</div>
            <div class="comp-cat" contenteditable="true">${c}</div>
        </div>
        <div class="comp-winners">
            <div class="winner-line rank-1"><span class="w-rank">1st:</span> <span class="w-house" contenteditable="true">${h1}</span> - <span class="w-name" contenteditable="true">${n1}</span> <span class="w-chest" contenteditable="true">${ch1}</span></div>
            <div class="winner-line rank-2"><span class="w-rank">2nd:</span> <span class="w-house" contenteditable="true">${h2}</span> - <span class="w-name" contenteditable="true">${n2}</span> <span class="w-chest" contenteditable="true">${ch2}</span></div>
            <div class="winner-line rank-3"><span class="w-rank">3rd:</span> <span class="w-house" contenteditable="true">${h3}</span> - <span class="w-name" contenteditable="true">${n3}</span> <span class="w-chest" contenteditable="true">${ch3}</span></div>
        </div>
    </div>`;

    document.getElementById(sectionId).insertAdjacentHTML('afterbegin', newRow);
    window.openTab('results');
    finalizeAdd(sectionId);
}

/* -------------------- ADD EVENT -------------------- */
function addNewEvent() {
    const date = document.getElementById('new-date').value;
    const time = document.getElementById('new-time').value;
    const desc = document.getElementById('new-desc').value;

    if(!desc) return alert("Enter Event Description");

    const newRow = `
        <div class="event-item">
            <div class="event-date" contenteditable="true">${date}</div>
            <div class="event-time" contenteditable="true">${time}</div>
            <div class="event-desc" contenteditable="true">${desc}</div>
        </div>`;

    document.getElementById('events-list').insertAdjacentHTML('beforeend', newRow);
    window.openTab('events');
    finalizeAdd('events-list');
}

/* -------------------- AFTER ADDING NEW ITEM -------------------- */
function finalizeAdd(listId) {
    const list = document.getElementById(listId);
    const newEl = (listId.includes('list-') && listId !== 'events-list')
        ? list.firstElementChild
        : list.lastElementChild;

    newEl.querySelectorAll('[contenteditable]').forEach(e => e.classList.add('editable-active'));
    closeModal();

    const inputs = document.getElementsByClassName('modal-input');
    for(let i=0; i<inputs.length; i++) inputs[i].value = '';
}

/* -------------------- BACKGROUND BUBBLE ANIMATION -------------------- */
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
let width, height, particles;

function resize() { 
    width = canvas.width = window.innerWidth; 
    height = canvas.height = window.innerHeight; 
}

class Particle {
    constructor() { this.reset(); this.y = Math.random() * height; }
    reset() {
        this.x = Math.random() * width;
        this.y = height + Math.random() * 100;
        this.speedY = Math.random() * 1 + 0.5;
        this.size = Math.random() * 33 + 2;
        this.swing = Math.random() * 2;
        this.swingStep = 0;
    }
    update() {
        this.y -= this.speedY;
        this.swingStep += 0.02;
        this.x += Math.sin(this.swingStep) * this.swing * 0.1;

        if (this.y + this.size < 0) this.reset();
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.strokeStyle = 'rgba(255, 50, 50, 0.2)';
        ctx.lineWidth = 2;
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(this.x - this.size*0.3, this.y - this.size*0.3, this.size*0.2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fill();
    }
}

function initParticles() {
    particles = [];
    const count = window.innerWidth < 768 ? 30 : 60;
    for (let i = 0; i < count; i++) particles.push(new Particle());
}

function animate() {
    ctx.clearRect(0, 0, width, height);
    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
    }
    requestAnimationFrame(animate);
}

window.addEventListener('resize', () => { 
    resize(); 
    initParticles(); 
});

resize(); 
initParticles(); 
animate();
