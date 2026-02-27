// common.js — общий код

// Firebase Config
// common.js — ИСПРАВЛЕННАЯ ВЕРСИЯ (только этот кусок меняешь)

const firebaseConfig = {
  apiKey: "AIzaSyC8o2F60E8Pi_TfEDA_z6EeokG-gECUXjg",
  authDomain: "oxbridge-listening-practice.firebaseapp.com",
  projectId: "oxbridge-listening-practice",
  storageBucket: "oxbridge-listening-practice.firebasestorage.app",
  messagingSenderId: "32964456597",
  appId: "1:32964456597:web:3a315700117ff92a6a2b9c",
  measurementId: "G-HBCHQ49MWS"
};

let db = null;

if (typeof firebase !== "undefined") {
  try {
    // ←←← ЭТО ГЛАВНОЕ ИСПРАВЛЕНИЕ
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
      console.log("✅ Firebase initialized successfully");
    } else {
      console.log("Firebase already initialized (reuse)");
    }

    db = firebase.firestore();
    window.db = db;        // делаем доступным везде
  } catch (err) {
    console.error("❌ Firebase initialization failed:", err);
  }
} else {
  console.warn("Firebase SDK not loaded");
}

// Нормализация ответа
function normalizeAnswer(str) {
  if (!str) return "";
  return str.toLowerCase().trim()
    .replace(/\s+/g, " ")
    .replace(/[.,!?;:'"()]/g, "")
    .replace(/\b(a|an|the)\b\s*/gi, "");
}

// Сохранение отчёта — НЕ ждёт облако
function saveReport(newReport) {
  // Локальное сохранение — мгновенно
  let reports = JSON.parse(localStorage.getItem("reports")) || [];
  const index = reports.findIndex(r => r.part === newReport.part && r.student === newReport.student);
  if (index >= 0) reports[index] = newReport;
  else reports.push(newReport);
  localStorage.setItem("reports", JSON.stringify(reports));

  // Облако — в фоне, не блокируем
  if (db) {
    db.collection("reports").add({
      ...newReport,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      createdAt: new Date().toISOString()
    }).catch(err => {
      console.error("Cloud save failed (local OK):", err);
    });
  }
}

// Автологин учителя
function autoTeacherLogin() {
  const savedPass = localStorage.getItem("teacherPass");
  if (savedPass && document.getElementById("login") && document.getElementById("password")) {
    document.getElementById("login").value = "Shohruh";
    document.getElementById("password").value = savedPass;
    if (typeof checkLogin === "function") checkLogin();
  }
}