'use strict';

const {
  app,
  BrowserWindow,
  globalShortcut,
// eslint-disable-next-line import/no-extraneous-dependencies
} = require('electron');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
const windows = new Set();

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
const readyPromise = new Promise(resolve => app.on('ready', resolve));

let createWindowCalled = false;

function createWindow(url = 'https://meet.tokbox.com/') {
  createWindowCalled = true;

  readyPromise.then(() => {
    // Create the browser window.
    const win = new BrowserWindow({
      width: 800,
      height: 600,
      show: false,
    });

    windows.add(win);

    win.once('ready-to-show', () => win.show());

    // and load the index.html of the app.
    win.loadURL(url);

    // Emitted when the window is closed.
    win.on('closed', () => {
      // Dereference the window object, usually you would store windows
      // in an array if your app supports multi windows, this is the time
      // when you should delete the corresponding element.
      windows.delete(win);
    });
  });
}

readyPromise.then(() => {
  globalShortcut.register('CommandOrControl+N', () => createWindow());
});

readyPromise.then(() => {
  if (!createWindowCalled) {
    createWindow();
  }
});

app.on('open-url', (ev, urlParam) => {
  let url = urlParam;

  if (url.indexOf('meet://home') === 0) {
    url = url.replace('meet://home', 'https://meet.tokbox.com');
  } else {
    url = url.replace('meet://', 'https://');
  }

  createWindow(url);
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (windows.size === 0) {
    createWindow();
  }
});
