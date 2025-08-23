let deferredPrompt;
const currentTimeElement = document.getElementById('currentTime');
const globalBrowserUrlInput = document.getElementById('globalBrowserUrlInput');
const globalBrowserGoBtn = document.getElementById('globalBrowserGoBtn');
const desktopAppsGrid = document.getElementById('desktopAppsGrid');

function updateTime() {
  const now = new Date();
  currentTimeElement.textContent = 
    `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
}
setInterval(updateTime, 1000);
updateTime();

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  document.getElementById("installBtn").style.display = "block";
});

document.getElementById("installBtn").addEventListener("click", async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  if (outcome === "accepted") {
    document.getElementById("installBtn").style.display = "none";
    deferredPrompt = null;
  }
});

globalBrowserGoBtn.addEventListener('click', () => {
  let query = globalBrowserUrlInput.value.trim();
  let url = query;
  if (!(url.startsWith('http://') || url.startsWith('https://')) && query.includes('.')) {
    url = 'https://' + query;
  } else if (!query.includes('.')) {
    url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
  }
  window.open(url, '_blank');
});

function onSignIn(response) {
  document.getElementById("login").style.display = "none";
  document.getElementById("dock").style.display = "flex";
  document.getElementById("logoutBtn").style.display = "block";
  currentTimeElement.style.display = "block";
  document.getElementById("globalBrowserBar").style.display = "flex";
  desktopAppsGrid.style.display = "grid";
}
window.onSignIn = onSignIn;

function signOut() {
  document.getElementById("dock").style.display = "none";
  document.getElementById("logoutBtn").style.display = "none";
  currentTimeElement.style.display = "none";
  document.getElementById("globalBrowserBar").style.display = "none";
  desktopAppsGrid.style.display = "none";
  document.getElementById("login").style.display = "flex";
}
document.getElementById("logoutBtn").addEventListener("click", signOut);

async function openFile() {
  try {
    const [fileHandle] = await window.showOpenFilePicker();
    const file = await fileHandle.getFile();
    const text = await file.text();
    document.getElementById("fileList").innerText = `Contenu de "${file.name}" :\n\n${text}`;
  } catch (err) {
    console.error("Erreur ouverture fichier", err);
  }
}
window.openFile = openFile;

async function saveFile() {
  try {
    const fileHandle = await window.showSaveFilePicker({ types: [{ description: 'Texte', accept: { 'text/plain': ['.txt'] } }] });
    const writable = await fileHandle.createWritable();
    await writable.write("Exemple de contenu sauvegardé via Web OS");
    await writable.close();
  } catch (err) {
    console.error("Erreur sauvegarde fichier", err);
  }
}
window.saveFile = saveFile;

function openExplorer() {
  document.getElementById("explorer").style.display = "flex";
  document.getElementById("fileList").innerText = "Aucun fichier ouvert";
}
window.openExplorer = openExplorer;

function closeExplorer() {
  document.getElementById("explorer").style.display = "none";
}
window.closeExplorer = closeExplorer;


if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js')
    .then(() => console.log("Service Worker enregistré"))
    .catch(err => console.error("Erreur SW", err));
}
