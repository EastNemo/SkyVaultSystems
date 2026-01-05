/* ============================
   VAULT DEMO (Client-side only)
   - Select / drop files
   - Encrypt files using USER KEY (XOR-based)
   - Display stored files
   - Download encrypted .svlt file
============================ */

const fileInput = document.getElementById("file-input");
const dropZone = document.getElementById("drop-zone");
const fileList = document.getElementById("file-list");
const encryptBtn = document.getElementById("encrypt-btn");
const userKeyInput = document.getElementById("user-key");

// Files currently selected (pending encryption)
let pendingFiles = [];

// Encrypted files "stored in vault" (in-memory only)
const vaultFiles = []; // { originalName, size, encryptedBlob, status }

/* ============================
   UI HELPERS
============================ */
function formatKB(bytes) {
    return `${(bytes / 1024).toFixed(1)} KB`;
}

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

function renderTable() {
    fileList.innerHTML = "";

    const totalRows = vaultFiles.length + pendingFiles.length;

    if (totalRows === 0) {
        fileList.innerHTML = `<tr><td colspan="4">No files selected</td></tr>`;
        return;
    }

    // Pending files
    pendingFiles.forEach((file, idx) => {
        const row = document.createElement("tr");
        row.dataset.kind = "pending";
        row.dataset.index = String(idx);

        row.innerHTML = `
            <td>${escapeHtml(file.name)}</td>
            <td>${formatKB(file.size)}</td>
            <td>Pending</td>
            <td>—</td>
        `;
        fileList.appendChild(row);
    });

    // Encrypted vault files
    vaultFiles.forEach((f, idx) => {
        const row = document.createElement("tr");
        row.dataset.kind = "vault";
        row.dataset.index = String(idx);

        row.innerHTML = `
            <td>${escapeHtml(f.originalName)}.svlt</td>
            <td>${formatKB(f.size)}</td>
            <td>${f.status}</td>
            <td>
                <button class="download-btn" data-index="${idx}">
                    Download
                </button>
            </td>
        `;
        fileList.appendChild(row);
    });
}

function setPendingRowStatus(index, text) {
    const rows = fileList.querySelectorAll('tr[data-kind="pending"]');
    if (!rows[index]) return;
    rows[index].children[2].textContent = text;
}

/* ============================
   FILE SELECTION
============================ */
dropZone.addEventListener("click", () => fileInput.click());

fileInput.addEventListener("change", (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    pendingFiles = pendingFiles.concat(files);
    fileInput.value = "";
    renderTable();
});

// Drag & drop
dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.style.opacity = "0.8";
});

dropZone.addEventListener("dragleave", () => {
    dropZone.style.opacity = "1";
});

dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.style.opacity = "1";

    const files = Array.from(e.dataTransfer.files || []);
    if (!files.length) return;

    pendingFiles = pendingFiles.concat(files);
    renderTable();
});

/* ============================
   USER-KEY ENCRYPTION
============================ */
function deriveKeyBytes(keyString) {
    return new TextEncoder().encode(keyString);
}

async function encryptWithUserKey(file, userKey) {
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    const keyBytes = deriveKeyBytes(userKey);

    for (let i = 0; i < bytes.length; i++) {
        bytes[i] = bytes[i] ^ keyBytes[i % keyBytes.length];
    }

    const header = new TextEncoder().encode("SKYVAULT1|");
    const encrypted = new Uint8Array(header.length + bytes.length);

    encrypted.set(header, 0);
    encrypted.set(bytes, header.length);

    return new Blob([encrypted], { type: "application/octet-stream" });
}

/* ============================
   ENCRYPT & STORE
============================ */
encryptBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    if (!pendingFiles.length) {
        alert("No files selected.");
        return;
    }

    let userKey = userKeyInput.value.trim();
    const noKeyMode = !userKey;   // true when user left key empty

    encryptBtn.style.pointerEvents = "none";
    encryptBtn.style.opacity = "0.8";

    for (let i = 0; i < pendingFiles.length; i++) {
        const file = pendingFiles[i];
        setPendingRowStatus(i, noKeyMode ? "Saving…" : "Encrypting…");

        await new Promise(r => setTimeout(r, 250));

        try {
            let blob;

            if (noKeyMode) {
                // Save file as-is (no encryption)
                blob = file;
            } else {
                // Encrypt normally
                blob = await encryptWithUserKey(file, userKey);
            }

            vaultFiles.unshift({
                originalName: file.name,
                size: blob.size,
                encryptedBlob: blob,
                status: noKeyMode ? "Stored (raw)" : "Stored",
            });

            setPendingRowStatus(i, noKeyMode ? "Stored (raw)" : "Stored");
        } catch (err) {
            console.error(err);
            setPendingRowStatus(i, "Error");
        }
    }

    pendingFiles = [];
    renderTable();

    encryptBtn.style.pointerEvents = "auto";
    encryptBtn.style.opacity = "1";
});

/* ============================
   DOWNLOAD ENCRYPTED FILE
============================ */
document.addEventListener("click", (e) => {
    const btn = e.target.closest(".download-btn");
    if (!btn) return;

    const index = Number(btn.dataset.index);
    const entry = vaultFiles[index];
    if (!entry) return;

    const url = URL.createObjectURL(entry.encryptedBlob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${entry.originalName}.svlt`;
    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(url);
});

// Initial render
renderTable();
