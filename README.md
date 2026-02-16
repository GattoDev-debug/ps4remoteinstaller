# PS4 Remote Installer

## Installation
### Requirements
1. Jailbroken PS4
2. [Remote Package Installer](https://pkg-zone.com/details/FLTZ00003)
3. a PC
> [!IMPORTANT]  
> For the time being, close the app by pressing the "Stop Server" button, closing it by pressing the X will cause the server to run in the background and give you no way to close it.

Go to the [Releases](https://github.com/GattoDev-debug/ps4remoteinstaller/releases/latest) page and get the Windows Executable or the Linux Executable

You need to select a folder where your PKGs reside in.

After that, open the IP the application gives you in your PS4's Web Browser.

Select your PKGs, Add them to the queue and press "Install Queue"
> [!WARNING]  
> You need to quickly open Remote Package Installer after pressing "Install Queue", You have 10 seconds to do this action otherwise you will need to press "Install Queue" again.

Wait a few seconds for the backend to send a request to RPI to start the download, Do not exit the app during this time.

## Compiling from Source

## Requirements
1. requests
2. flask
3. tkinter

Run the `main.py` using Python once you have installed the requirements.
