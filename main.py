from flask import Flask, render_template, request, jsonify, send_from_directory
import requests
import time
import os
import tkinter as tk
from tkinter import filedialog, scrolledtext
import threading
import socket
import sys

app = Flask(__name__)

FLASK_PORT = 2535
PS4_CONNECTED_IP = None
log_widget = None
status_label = None


# ---------------------------
# Utility: Get real LAN IP
# ---------------------------
def get_lan_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except:
        return "127.0.0.1"


# ---------------------------
# Logging (prints + Tkinter)
# ---------------------------
def log(msg):
    global log_widget
    timestamp = time.strftime("%H:%M:%S")
    entry = f"[{timestamp}] {msg}"
    print(entry)

    if log_widget:
        log_widget.configure(state="normal")
        log_widget.insert(tk.END, entry + "\n")
        log_widget.see(tk.END)
        log_widget.configure(state="disabled")


# ---------------------------
# PS4 API Wrapper
# ---------------------------
class PS4RPI:
    def __init__(self, ps4_ip, port=12800):
        self.base_url = f"http://{ps4_ip}:{port}/api"

    def install_pkg_direct(self, pkg_urls):
        try:
            payload = {"type": "direct", "packages": [str(u) for u in pkg_urls]}
            r = requests.post(f"{self.base_url}/install", json=payload, timeout=10)
            return r.status_code, r.json()
        except Exception as e:
            return None, {"error": str(e)}


# ---------------------------
# Folder Picker
# ---------------------------
def pick_pkg_folder():
    root = tk.Tk()
    root.withdraw()
    folder = filedialog.askdirectory(title="Select PKG Folder")
    if not folder:
        sys.exit()
    return folder


PKG_FOLDER = pick_pkg_folder()


def get_pkg_list():
    return [f for f in os.listdir(PKG_FOLDER) if f.lower().endswith(".pkg")]


# ---------------------------
# Flask Routes
# ---------------------------
@app.route("/")
def index():
    global PS4_CONNECTED_IP, status_label

    PS4_CONNECTED_IP = request.remote_addr
    log(f"PS4 Connected from {PS4_CONNECTED_IP}")

    if status_label:
        status_label.config(text=f"PS4 Connected: {PS4_CONNECTED_IP}", fg="green")

    pkgs = get_pkg_list()
    return render_template(
        "index.html",
        pkgs=pkgs,
        client_ip=PS4_CONNECTED_IP
    )


@app.route("/pkgs/<path:filename>")
def serve_pkg_file(filename):
    return send_from_directory(PKG_FOLDER, filename)


@app.route("/install_queue", methods=["POST"])
def install_queue():
    data = request.json
    ip = data.get("ip")
    selected_pkgs = data.get("pkgs", [])

    if not ip:
        return jsonify({"error": "Missing PS4 IP"}), 400
    if not selected_pkgs:
        return jsonify({"error": "No PKGs selected"}), 400

    host_ip = get_lan_ip()

    pkg_urls = [
        f"http://{host_ip}:{FLASK_PORT}/pkgs/{pkg}"
        for pkg in selected_pkgs
    ]

    log(f"Sending install request to {ip}")
    log(f"Packages: {pkg_urls}")

    log("Waiting 10 seconds for RPI to open...")
    time.sleep(10)

    api = PS4RPI(ip)
    status, resp = api.install_pkg_direct(pkg_urls)

    log(f"PS4 Response Status: {status}")
    log(f"PS4 Response Body: {resp}")

    return jsonify({"status_code": status, "response": resp})


# ---------------------------
# Tkinter UI
# ---------------------------
def start_tk_ui():
    global log_widget, status_label

    root = tk.Tk()
    root.title("PS4 PKG Installer Server")
    root.geometry("600x400")
    root.resizable(False, False)

    host_ip = get_lan_ip()

    tk.Label(root, text="Server Running", font=("Arial", 14)).pack(pady=5)

    tk.Label(
        root,
        text=f"Open http://{host_ip}:{FLASK_PORT} in your PS4 browser",
        font=("Arial", 10)
    ).pack(pady=5)

    status_label = tk.Label(
        root,
        text="PS4 Not Connected",
        fg="red",
        font=("Arial", 11)
    )
    status_label.pack(pady=5)

    log_widget = scrolledtext.ScrolledText(
        root,
        width=70,
        height=15,
        state="disabled"
    )
    log_widget.pack(pady=10)

    def close_app():
        log("Shutting down server...")
        root.destroy()
        os._exit(0)

    tk.Button(
        root,
        text="Close Server",
        command=close_app,
        bg="#cc3333",
        fg="white",
        width=15
    ).pack(pady=0)

    root.mainloop()


# ---------------------------
# Start Flask in Thread
# ---------------------------
def start_flask():
    app.run(host="0.0.0.0", port=FLASK_PORT, debug=False, use_reloader=False)


if __name__ == "__main__":
    threading.Thread(target=start_flask, daemon=True).start()
    start_tk_ui()
