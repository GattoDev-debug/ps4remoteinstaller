let queue = [];
function aio() { // this function sucks so bad, but it works and i dont care enough to rewrite it
    addToQueue();
    installQueue();
    clearQueue();
}
function addToQueue() {
    const select = document.getElementById("pkg-url");
    const selected = Array.from(select.selectedOptions);
    if(selected.length === 0) return;

    selected.forEach(opt => {
        queue.push({pkg: opt.value, status: "Queued"});
        opt.selected = false; // clear selection after adding
    });

    //renderQueue();
}
// just to make sure you dont do this on a non play the station device, since it wont work and i dont want to answer "why isnt it working" questions 100 times a day
document.addEventListener("DOMContentLoaded", () => {
    const ua = navigator.userAgent;

    const isPS4 = /PlayStation 4\/.*/i.test(ua);

    if (!isPS4) {
        const buttons = document.querySelectorAll(".action-btn");

        buttons.forEach(button => {
            button.disabled = true;
            button.textContent = "You're not on a PlayStation!";
            button.style.opacity = "0.6";
            button.style.cursor = "not-allowed";

            button.onclick = (e) => e.preventDefault();
        });
    }
    if (!isPS4) {
        window.aio = function () {
            alert("Sneaky. won't work though.");
        };
    }
});


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
        
    alert("Process OK, Added to Download Request.\nPlease Open Remote Package Installer on your PS4 and wait for the download to finish.\n");
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
