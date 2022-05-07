App.registerFeature('head', {
  template: html`
    <div id="head" class="flex flex-col h-full">
      <select class="bg-black text-white" v-model="deviceId">
        <option v-for="device of devices" :value="device.deviceId">
          {{device.kind}}: {{device.label}}
        </option>
      </select>
      <button @click="open">[open / close]</button>
    </div>
  `,
  data() {
    return {
      devices: [],
      deviceId: '',
    }
  },
  mounted() {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      this.devices = devices.filter((d) => d.kind === 'videoinput')
    })
  },
  beforeUnmount() {
    this.cleanup()
  },
  methods: {
    createWindow() {
      /** @type {typeof import('@electron/remote')} */
      const electron = top.require('@electron/remote')
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
        width: 192,
        height: 192,
        autoHideMenuBar: true,
      })
      win.setIgnoreMouseEvents(true)
      win.setAlwaysOnTop(true, 'screen-saver')
      win.loadFile(require.resolve('./camera.html'), {
        query: {
          deviceId: this.deviceId,
        },
      })
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
        },
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
    },
  },
  css: css`
    #head {
    }
  `,
})
