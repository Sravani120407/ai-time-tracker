/* --- Firebase Initialization (firebaseConfig is loaded from firebase-config.js) --- */
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

/* --- Helper functions --- */
const $ = (q) => document.querySelector(q);

function todayISO() {
  const d = new Date();
  return d.toISOString().split("T")[0];
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}

/* --- State --- */
let currentUser = null;
let selectedDate = todayISO();
let activities = [];

/* --- DOM Elements --- */
const datePicker = $("#date-picker");
const activitiesContainer = $("#activities-container");
const remainingEl = $("#remaining");
const dayTotalEl = $("#day-total");
const analyseBtn = $("#analyse-btn");
const validationMsg = $("#validation-msg");

/* ========================
   AUTHENTICATION
======================== */
$("#sign-in-google").onclick = async () => {
  try {
    await auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
  } catch (e) {
    alert(e.message);
  }
};

$("#show-signup").onclick = () => {
  $("#email-modal").classList.add("open");
};

$("#email-close").onclick = () => {
  $("#email-modal").classList.remove("open");
};

$("#email-signup").onclick = async () => {
  let email = $("#email-input").value;
  let pass = $("#pass-input").value;
  try {
    await auth.createUserWithEmailAndPassword(email, pass);
    $("#email-modal").classList.remove("open");
  } catch (e) {
    alert(e.message);
  }
};

$("#email-login").onclick = async () => {
  let email = $("#email-input").value;
  let pass = $("#pass-input").value;
  try {
    await auth.signInWithEmailAndPassword(email, pass);
    $("#email-modal").classList.remove("open");
  } catch (e) {
    alert(e.message);
  }
};

auth.onAuthStateChanged((user) => {
  currentUser = user;
  if (user) {
    loadDate(selectedDate);
    $("#auth-controls").innerHTML = `
      <div>
        <div>${user.email}</div>
        <button id="logout" class="auth-btn">Logout</button>
      </div>
    `;
    $("#logout").onclick = () => auth.signOut();
  }
});

/* ========================
   DATE LOADING
======================== */
datePicker.value = selectedDate;

datePicker.onchange = () => {
  selectedDate = datePicker.value;
  loadDate(selectedDate);
};

async function loadDate(date) {
  if (!currentUser) return;

  let snap = await db
    .collection("users")
    .doc(currentUser.uid)
    .collection("days")
    .doc(date)
    .collection("activities")
    .orderBy("createdAt")
    .get();

  activities = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  renderActivities();
}

/* ========================
   RENDER ACTIVITIES
======================== */
function renderActivities() {
  activitiesContainer.innerHTML = "";

  if (activities.length === 0) {
    activitiesContainer.innerHTML = `<div class="muted">No activities yet</div>`;
    $("#no-data-view").style.display = "";
    $("#mini-timeline").style.display = "none";
  } else {
    $("#no-data-view").style.display = "none";
    $("#mini-timeline").style.display = "";

    activities.forEach((a) => {
      let item = document.createElement("div");
      item.className = "activity-item";
      item.innerHTML = `
        <div>
          <div><strong>${escapeHtml(a.title)}</strong></div>
          <div class="muted tiny">${escapeHtml(a.category)}</div>
        </div>
        <div>
          <span class="muted">${a.minutes} min</span>
          <button class="btn-ghost" data-id="${a.id}" onclick="deleteActivity('${a.id}')">🗑️</button>
        </div>
      `;
      activitiesContainer.appendChild(item);
    });
  }

  updateStats();
}

/* ========================
   ADD ACTIVITY
======================== */
$("#add-activity").onclick = async () => {
  if (!currentUser) return alert("Please login first.");

  const title = $("#activity-title").value.trim();
  const mins = parseInt($("#activity-minutes").value);
  const category = $("#activity-category").value;

  if (!title) return (validationMsg.textContent = "Enter a title");
  if (!mins || mins <= 0)
    return (validationMsg.textContent = "Minutes must be positive");

  const total = activities.reduce((s, a) => s + a.minutes, 0);
  if (total + mins > 1440)
    return (validationMsg.textContent =
      "You cannot exceed 1440 minutes per day");

  try {
    await db
      .collection("users")
      .doc(currentUser.uid)
      .collection("days")
      .doc(selectedDate)
      .collection("activities")
      .add({
        title,
        category,
        minutes: mins,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });

    $("#activity-title").value = "";
    $("#activity-minutes").value = "";

    loadDate(selectedDate);
  } catch (e) {
    alert(e.message);
  }
};

/* ========================
   DELETE ACTIVITY
======================== */
async function deleteActivity(id) {
  try {
    await db
      .collection("users")
      .doc(currentUser.uid)
      .collection("days")
      .doc(selectedDate)
      .collection("activities")
      .doc(id)
      .delete();

    loadDate(selectedDate);
  } catch (e) {
    alert(e.message);
  }
}

window.deleteActivity = deleteActivity;

/* ========================
   STATS + ANALYSE
======================== */
function updateStats() {
  const total = activities.reduce((s, a) => s + a.minutes, 0);
  const remaining = 1440 - total;

  remainingEl.textContent = remaining;
  dayTotalEl.textContent = `Total: ${total} min`;
  $("#stat-total").textContent = `${total} min`;
  $("#stat-count").textContent = activities.length;

  analyseBtn.classList.toggle("disabled", total === 0 || total > 1440);
}

/* ========================
   ANALYZE MODAL
======================== */
analyseBtn.onclick = () => {
  if (analyseBtn.classList.contains("disabled")) return;
  $("#dashboard-modal").classList.add("open");
  buildDashboard();
};

$("#close-modal").onclick = () => {
  $("#dashboard-modal").classList.remove("open");
};

function buildDashboard() {
  if (activities.length === 0) {
    $("#dash-empty").style.display = "";
    $("#dash-body").style.display = "none";
    return;
  }

  $("#dash-empty").style.display = "none";
  $("#dash-body").style.display = "";

  // stats
  const total = activities.reduce((s, a) => s + a.minutes, 0);
  $("#dash-total").textContent = `${total} min`;
  $("#dash-count").textContent = activities.length;
  $("#dash-catcount").textContent = [...new Set(activities.map(a => a.category))].length;

  // PIE chart data
  const catMap = {};
  activities.forEach(a => {
    catMap[a.category] = (catMap[a.category] || 0) + a.minutes;
  });

  new Chart($("#pie-chart"), {
    type: "pie",
    data: {
      labels: Object.keys(catMap),
      datasets: [{ data: Object.values(catMap) }],
    },
  });

  // BAR chart data
  const sorted = [...activities].sort((a,b)=>b.minutes - a.minutes);
  new Chart($("#bar-chart"), {
    type: "bar",
    data: {
      labels: sorted.map(a=>a.title),
      datasets: [{ data: sorted.map(a=>a.minutes) }],
    },
    options: { plugins:{legend:{display:false}} }
  });

  // Timeline
  $("#dash-timeline").innerHTML = sorted
    .map(a => `<div>${a.title} — ${a.minutes} min</div>`)
    .join("");
}
