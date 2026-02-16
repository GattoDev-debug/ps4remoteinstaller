let queue = [];

function addToQueue() {
    const select = document.getElementById("pkg-url");
    const selected = Array.from(select.selectedOptions);
    if(selected.length === 0) return;

    selected.forEach(opt => {
        queue.push({pkg: opt.value, status: "Queued"});
        opt.selected = false; // clear selection after adding
    });

    renderQueue();
}


function renderQueue() {
    const tbody = document.querySelector("#queue-table tbody");
    tbody.innerHTML = "";
    queue.forEach((item, i) => {
        const row = document.createElement("tr");
        row.innerHTML = `<td>${item.pkg}</td><td>${item.status}</td>`;
        tbody.appendChild(row);
    });
}

function clearQueue() {
    queue = [];
    renderQueue();
}

async function installQueue() {
    const ip = document.getElementById("ps4-ip").value;
    if(!ip) { alert("Enter PS4 IP"); return; }
    if(queue.length === 0) { alert("Queue is empty"); return; }
    const pkgs = queue.map(item => item.pkg);
    
        // Show alert about opening RPI
        
    alert("You have 10 seconds to open RPI.\nPress 'Close [Internet Browser]' and open Remote Package Installer.");
    const res = await fetch("/install_queue", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ip: ip, pkgs: pkgs})
    });
    // Send request to backend
    const data = await res.json();
    
    data.results.forEach((r, i) => {
        queue[i].status = (r.status === 200) ? "Installed" : "Failed";
        appendTask(`${r.pkg} -> ${JSON.stringify(r.response)}`);
    });
    renderQueue();
    queue = []; // clear queue after install
}

function appendTask(text) {
    const box = document.getElementById("tasks-box");
    box.textContent += text + "\n";
    box.scrollTop = box.scrollHeight;
}

async function refreshTasks() {
    const ip = document.getElementById("ps4-ip").value;
    if(!ip) { alert("Enter PS4 IP"); return; }

    const res = await fetch("/tasks", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ip: ip})
    });
    const data = await res.json();
    document.getElementById("tasks-box").textContent = JSON.stringify(data, null, 2);
}
