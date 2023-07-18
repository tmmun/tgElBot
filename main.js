const { app, BrowserWindow, ipcMain } = require('electron');

function createWindow() {
    const win = new BrowserWindow({
        width: 990,
        height: 600,
        title: "Okkhor52 Tools",
        resizable: false,
        frame: false,
        webPreferences: {
            devTools: false,
            nodeIntegration: true,
            enableRemoteModule: true,
            contextIsolation: false
        }
    })
    win.loadFile('index.html')
    win.webContents.openDevTools()

    ipcMain.on('minimize', () => {
        win.minimize()
        // or depending you could do: win.hide()
    })

    ipcMain.on('close', () => {
        win.close()
        // or depending you could do: win.hide()
    })
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})


