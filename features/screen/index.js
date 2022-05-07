const useLocalStorage = require('../../lib/useLocalStorage')

App.registerFeature('screen', {
  template: html`
    <div id="screen-capture" class="p-1">
      <div class="flex space-x-1">
        <div>
          display<br />
          <input class="bg-black" size="5" v-model="display" />
        </div>
        <div>
          scale<br />
          <input class="bg-black" size="5" v-model="scaleFactor" />
        </div>
        <div>
          bounds<br />
          <input class="bg-black" size="20" v-model="bounds" />
        </div>
        <div>
          <button @click="grabBounds">[grab]</button>
        </div>
      </div>
      <div class="mt-1">
        recording command:<br />
        <input class="bg-black" size="36" readonly :value="command" />
        <button @click="copy(command)">[copy]</button>
      </div>
    </div>
  `,
  setup() {
    const display = useLocalStorage('screen:display', '')
    const bounds = useLocalStorage('screen:bounds', '')
    const scaleFactor = useLocalStorage('screen:scaleFactor', '1')
    const grabBounds = () => {
      const { screen, BrowserWindow } = require('@electron/remote')
      const activeDisplay = screen.getDisplayNearestPoint(
        screen.getCursorScreenPoint(),
      )
      // Via https://github.com/wulkano/Kap/blob/1156945e266ef010ee450c6c156306f24b291586/main/cropper.js#L36
      const {
        bounds: { x, y, width, height },
      } = activeDisplay
      display.value = String(
        screen
          .getAllDisplays()
          .map((d) => d.id)
          .indexOf(activeDisplay.id) + 1,
      )
      scaleFactor.value = String(activeDisplay.scaleFactor)
      const w = new BrowserWindow({
        x,
        y,
        width,
        height,
        hasShadow: false,
        enableLargerThanScreen: true,
        resizable: false,
        moveable: false,
        frame: false,
        transparent: true,
        webPreferences: {
          nodeIntegration: true,
        },
      })
      w.setAlwaysOnTop(true, 'screen-saver', 1)
      w.loadFile(require.resolve('./measure.html'), {
        hash: '#' + bounds.value,
      })
      w.webContents.on('ipc-message', (event, channel, value) => {
        bounds.value = value
      })
    }
    const command = Vue.computed(() => {
      const bounds = bounds.value
        .split(':')
        .map((x) => x * scaleFactor.value)
        .join(':')
      return `rec-gif ${display.value} ${bounds}`
    })
    const copy = () => {
      const { clipboard } = require('electron').remote
      clipboard.writeText(command.value)
    }
    return { grabBounds, display, bounds, scaleFactor, command, copy }
  },
  css: css`
    #screen-capture {
    }
  `,
})
