import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportwebvitals';
import 'bootstrap/dist/css/bootstrap.min.css';
import Login from './components/auth/login';

/*
//  ─── 1. Disable right-click ─────────────────────────────────────────────────────
document.addEventListener('contextmenu', e => e.preventDefault());

// ─── 2. Block DevTools shortcuts ────────────────────────────────────────────────
document.addEventListener('keydown', (e) => {
  if (
    e.key === 'F12' ||
    (e.ctrlKey && e.shiftKey && ['I','C','J'].includes(e.key.toUpperCase())) ||
    (e.ctrlKey && e.key.toUpperCase() === 'U')
  ) {
    e.preventDefault();
  }
});

// ─── 3. Detect open DevTools (optional) ─────────────────────────────────────────
(function detectDevTools() {
  const threshold = 160;
  setInterval(() => {
    const widthDiff = window.outerWidth - window.innerWidth;
    const heightDiff = window.outerHeight - window.innerHeight;
    if (widthDiff > threshold || heightDiff > threshold) {
      alert('DevTools is not allowed!');
      window.location.href = '/';
    }
  }, 1000);
})();

// ─── your existing init logic ──────────────────────────────────────────────────
// Clear storage and cookies AFTER imports
localStorage.clear();
sessionStorage.clear();
document.cookie.split(";").forEach((cookie) => {
  const eqPos = cookie.indexOf("=");
  const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
});

// ✅ Clear storage and cookies AFTER imports
localStorage.clear();
sessionStorage.clear();
document.cookie.split(";").forEach((cookie) => {
  const eqPos = cookie.indexOf("=");
  const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
});

// ✅ Detect refresh and redirect to "/"
if (window.performance) {
  if (performance.navigation.type === 1 || performance.getEntriesByType("navigation")[0]?.type === 'reload') {
    if (window.location.pathname !== "/") {
      window.location.replace("/"); // hard redirect to home
    }
  }
}
(function preventScreenshotOverlay() {
  const overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.top = 0;
  overlay.style.left = 0;
  overlay.style.width = "100vw";
  overlay.style.height = "100vh";
  overlay.style.backgroundColor = "black";
  overlay.style.zIndex = "99999";
  overlay.style.display = "none";
  overlay.style.pointerEvents = "none";
  overlay.id = "black-screen-overlay";
  document.body.appendChild(overlay);

  const showBlackScreenWithAlert = () => {
    overlay.style.display = "block";

    // Delay alert until after black screen is rendered
    requestAnimationFrame(() => {
      setTimeout(() => {
        alert("Don't take screenshot");
        overlay.style.display = "none";
      }, 50); // short delay to allow rendering
    });
  };

 // window.addEventListener("keydown", (e) => {
   // if (e.code === "ControlLeft" || e.code === "ControlRight") {
    //  showBlackScreenWithAlert();
   // }
//  });

  window.addEventListener("keyup", (e) => {
    if (e.code === "PrintScreen") {
      showBlackScreenWithAlert();
    }
  });
})();

*/
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Login />
  </React.StrictMode>
);
reportWebVitals();
