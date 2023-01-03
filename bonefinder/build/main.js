"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.app.on("ready", () => {
    const win = new electron_1.BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: __dirname + "/../preload.js",
            nodeIntegration: true,
            contextIsolation: false,
        }
    });
    win.loadFile("../index.html");
});
