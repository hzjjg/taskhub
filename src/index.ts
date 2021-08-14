import { app, BrowserWindow, ipcMain, session } from 'electron';
import connectTasksServer from './main/connect_tasks_server'
import CpRequest from './main/cp_request';
// This allows TypeScript to pick up the magic constant that's auto-generated by Forge's Webpack
// plugin that tells the Electron app where to look for the Webpack-bundled app code (depending on
// whether you're running in development or production).
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

connectTasksServer().then(() => {
  //响应渲染进程的请求
  ipcMain.on('request', async (e, { reqId, url, params }) => {
    console.log(reqId, url, params);

    if (url.startsWith('task://')) {
      try {
        const resp = await CpRequest.getInstance().send(url.slice(7), params)
        console.log(resp);
        //如果是task://开头的请求，代理到子进程
        e.reply('response', {
          respId: reqId,
          data: resp
        })
      } catch (error) {
        console.error(error)
      }
    } else {
      console.log('not a task request');
    }
  })

})

const createWindow = (): void => {
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [`
          default-src 'self'  'unsafe-inline' 'unsafe-eval' data: https://static2.sharepointonline.com https://spoprod-a.akamaihd.net
        `]
      }
    })
  })

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    height: 600,
    width: 800,
    minHeight: 300,
    minWidth: 400,
    titleBarStyle: 'hidden',
    frame: process.platform === 'darwin',
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    }
  });

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
