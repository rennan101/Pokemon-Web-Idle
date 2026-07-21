import { SECRET_SALT } from './constants.js';

export const StorageManager = {
  encryptData(obj) {
    const str = JSON.stringify(obj);
    let encoded = "";
    for (let i = 0; i < str.length; i++) {
      encoded += String.fromCharCode(str.charCodeAt(i) ^ SECRET_SALT.charCodeAt(i % SECRET_SALT.length));
    }
    return btoa(unescape(encodeURIComponent(encoded)));
  },

  decryptData(b64Str) {
    const decoded = decodeURIComponent(escape(atob(b64Str.trim())));
    let str = "";
    for (let i = 0; i < decoded.length; i++) {
      str += String.fromCharCode(decoded.charCodeAt(i) ^ SECRET_SALT.charCodeAt(i % SECRET_SALT.length));
    }
    return JSON.parse(str);
  },

  updateMemoryStats() {
    if (chrome.storage && chrome.storage.local && chrome.storage.local.getBytesInUse) {
      chrome.storage.local.getBytesInUse(null, (bytes) => {
        let displayStr = "0 kb";
        if (bytes < 1024) displayStr = bytes + " b";
        else if (bytes < 1048576) displayStr = Math.round(bytes / 1024) + " kb";
        else displayStr = Math.round(bytes / 1048576) + " mb";
        if (document.getElementById('cache-usage')) document.getElementById('cache-usage').innerText = displayStr;
      });
    } else { 
        if (document.getElementById('cache-usage')) document.getElementById('cache-usage').innerText = "N/A"; 
    }

    if (performance && performance.memory) {
        let ramBytes = performance.memory.usedJSHeapSize;
        let ramStr = Math.round(ramBytes / 1048576) + " mb";
        if (document.getElementById('ram-usage')) document.getElementById('ram-usage').innerText = ramStr;
    } else { 
        if (document.getElementById('ram-usage')) document.getElementById('ram-usage').innerText = "12 mb"; 
    }
  },

  fpsLoopId: null,
  lastFpsTime: 0,
  frameCount: 0,

  measureFPS(timestamp) {
    if (!StorageManager.lastFpsTime) StorageManager.lastFpsTime = timestamp;
    StorageManager.frameCount++;

    const delta = timestamp - StorageManager.lastFpsTime;
    if (delta >= 1000) { 
      if (document.getElementById('fps-usage')) document.getElementById('fps-usage').innerText = StorageManager.frameCount + " fps";
      StorageManager.frameCount = 0;
      StorageManager.lastFpsTime = timestamp;
    }
    StorageManager.fpsLoopId = requestAnimationFrame(StorageManager.measureFPS);
  },

  startFPSMonitor() {
    this.lastFpsTime = performance.now();
    this.frameCount = 0;
    this.fpsLoopId = requestAnimationFrame(this.measureFPS);
  },

  stopFPSMonitor() {
    if (this.fpsLoopId) {
      cancelAnimationFrame(this.fpsLoopId);
      this.fpsLoopId = null;
    }
  },

  exportSave() {
    chrome.storage.local.get(null, (items) => {
      const encryptedString = this.encryptData(items);
      const finalExport = {
        "_INSTRUCOES_DE_SALVAMENTO": "Aperte CMD + S (Mac) ou CTRL + S (Windows) nesta aba. Salve o arquivo com o nome 'save_data.json'.",
        "_AVISO_": "Nao modifique o codigo hash abaixo. Qualquer alteracao corrompera o save.",
        "hash_data": encryptedString
      };

      const jsonString = JSON.stringify(finalExport, null, 2);
      
      if (chrome.downloads && chrome.downloads.download) {
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        chrome.downloads.download({ url: url, filename: "save_data.json", saveAs: false });
      } else {
        const base64Data = btoa(unescape(encodeURIComponent(jsonString)));
        const htmlContent = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Baixando Save...</title></head><body style="background-color: #222; color: #fff; font-family: Arial, sans-serif; text-align: center; padding-top: 50px;"><h2>Preparando seu arquivo de save...</h2><p>O download do arquivo <b>save_data.json</b> deve iniciar automaticamente.</p><p>Se não iniciar após alguns segundos, clique no link abaixo:</p><br><a id="dl-link" download="save_data.json" style="color: #4CAF50; font-size: 18px; font-weight: bold; text-decoration: underline; cursor: pointer;">👉 Baixar save_data.json Manualmente 👈</a><script>setTimeout(() => { const base64 = "${base64Data}"; const jsonStr = decodeURIComponent(escape(atob(base64))); const blob = new Blob([jsonStr], { type: "application/json" }); const url = URL.createObjectURL(blob); const a = document.getElementById('dl-link'); a.href = url; a.click(); setTimeout(() => window.close(), 3000); }, 500);</script></body></html>`;
        const htmlBase64 = btoa(unescape(encodeURIComponent(htmlContent)));
        const htmlDataUri = "data:text/html;charset=utf-8;base64," + htmlBase64;
        chrome.tabs.create({ url: htmlDataUri });
      }
    });
  },

  importSave(file, successMsg, errorMsg) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const rawJson = JSON.parse(e.target.result);
        let finalDataToSet = rawJson;
        if (rawJson.hash_data) finalDataToSet = this.decryptData(rawJson.hash_data);
        
        chrome.storage.local.set(finalDataToSet, () => {
          alert(successMsg);
          window.location.reload(); 
        });
      } catch (err) {
        alert(errorMsg);
      }
    };
    reader.readAsText(file);
  }
};