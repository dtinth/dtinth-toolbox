App.registerFeature('head', {
  template: html`
    <div id="head" class="flex flex-col h-full">
      <button @click="open">[open / close]</button>
    </div>
  `,
  data() {
    return {
    }
  },
  beforeUnmount() {
    this.cleanup()
  },
  methods: {
    createWindow() {
      /** @type {Electron.Remote} */
      const electron = top.require('electron').remote
      const { BrowserWindow, screen } = electron
      const win = new BrowserWindow({
        frame: false,
        transparent: true,
        titleBarStyle: 'customButtonsOnHover',
        minimizable: false,
        maximizable: false,
        hasShadow: false,
        webPreferences: {
          nodeIntegration: true,
          webSecurity: false,
        },
        width: 128,
        height: 128,
        autoHideMenuBar: true,
      })
      win.setIgnoreMouseEvents(true)
      win.setAlwaysOnTop(true, 'screen-saver')
      win.loadFile(require.resolve('./camera.html'))
      win.webContents.on('devtools-opened', () => {
        win.setIgnoreMouseEvents(false)
      })
      let closed = false
      const frame = () => {
        if (!closed) setTimeout(frame, 16)
        const cursor = screen.getCursorScreenPoint()
        win.setPosition(cursor.x, cursor.y)
      }
      setTimeout(frame, 16)
      return {
        close: () => {
          win.close()
          closed = true
        }
      }
    },
    open() {
      try {
        if (this.win) {
          this.win.close()
          this.win = null
        } else {
          this.win = this.createWindow()
        }
      } catch (e) {
        alert(e)
      }
    },
    cleanup() {
      if (this.win) {
        this.win.close()
        this.win = null
      }
    }
  },
  css: css`
    #head {
    }
  `,
})
