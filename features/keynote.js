const osa = require('../lib/osa')

const validZooms = [
  '25%',
  '50%',
  '75%',
  '100%',
  '125%',
  '150%',
  '200%',
  '300%',
  '400%',
]

App.registerFeature('keynote', {
  template: html`
    <div id="keynote">
      <div class="flex h-6 mb-1">
        <button
          :key="index"
          v-for="(item, index) of history"
          class="rounded-full w-6 h-6 mr-1"
          style="border: 1px solid #fff4; background: #0006; color: #fff8"
          @mouseenter="hover = { ...hover, [item.stateKey]: true }"
          @mouseleave="hover = { ...hover, [item.stateKey]: false }"
          @click="activate(item)"
        >
          {{index + 1}}
        </button>
      </div>
      <div class="relative mb-1" style="padding-top: 64.8%; background: #0006">
        <button
          :key="index"
          v-for="(item, index) of history"
          class="absolute"
          :style="historyStyle(item)"
          @mouseenter="hover = { ...hover, [item.key]: true }"
          @mouseleave="hover = { ...hover, [item.key]: false }"
          @click="activate(item)"
        >
          {{index + 1}}
        </button>
      </div>
      {{status}}
    </div>
  `,
  data() {
    return {
      status: 'Initializing',
      history: [],
      hover: {},
      proposed: null,
      unmounted: false,
    }
  },
  methods: {
    historyStyle(item) {
      const zoom = parseInt(item.state.zoom, 10)
      const scale = 100 / zoom
      const size = (scale * 100).toFixed(2) + '%'
      const left = (item.state.scrollX * (1 - scale) * 100).toFixed(2) + '%'
      const top = (item.state.scrollY * (1 - scale) * 100).toFixed(2) + '%'
      return {
        top: top,
        left: left,
        width: size,
        height: size,
        ...(this.hover[item.key]
          ? {
              border: '1px solid #d7fc70',
              color: '#d7fc70',
              background: '#000',
            }
          : { border: '1px solid #fff4', color: '#fff4' }),
      }
    },
    async activate(item) {
      try {
        setKeynoteState(item.state)
      } catch (e) {
        this.status = e
      }
    },
  },
  async mounted() {
    const processLoop = async () => {
      const state = await getKeynoteState()
      if (!validZooms.includes(state.zoom)) {
        this.status = 'Bad zoom!'
        return
      }
      if (parseInt(state.zoom, 10) <= 100) {
        this.status = 'Not zoomed in.'
        return
      }
      const stateKey = JSON.stringify(state)
      if (!this.proposed || this.proposed.key !== stateKey) {
        this.proposed = { key: stateKey, state, count: 0 }
      }
      this.proposed.count++
      if (this.proposed.count >= 3) {
        this.history = [
          this.proposed,
          ...this.history.filter(h => h.key !== stateKey),
        ].slice(0, 5)
        this.status = 'Zoomed in'
      } else {
        this.status = 'Waiting for viewport to stabilize'
      }
    }
    while (!this.unmounted) {
      try {
        await processLoop()
      } catch (e) {
        this.status = String(e)
      }
      await new Promise(r => setTimeout(r, 1000))
    }
  },
  unmounted() {
    this.unmounted = true
  },
  css: css`
    #keynote {
      padding: 4px;
    }
  `,
})

async function getKeynoteState() {
  return await osa(() => {
    const se = Application('System Events')
    const its = se.processes.byName('Keynote')
    const frontWindow = its.windows[0]
    const zoomButton = frontWindow.toolbars[0].groups[1].menuButtons[0]
    const mainArea = frontWindow.scrollAreas[1]
    const hScrollBar = mainArea.attributes['AXHorizontalScrollBar'].value()
    const vScrollBar = mainArea.attributes['AXVerticalScrollBar'].value()
    const hScroll =
      (hScrollBar && hScrollBar.attributes['AXValue'].value()) || 0
    const vScroll =
      (vScrollBar && vScrollBar.attributes['AXValue'].value()) || 0
    return {
      zoom: zoomButton.title(),
      scrollX: hScroll,
      scrollY: vScroll,
    }
  })
}

async function setKeynoteState({ scrollX, scrollY, zoom }) {
  return await osa(
    (scrollX, scrollY, zoom) => {
      Application('Keynote').activate()
      const se = Application('System Events')
      const its = se.processes.byName('Keynote')
      const frontWindow = its.windows[0]
      const zoomButton = frontWindow.toolbars[0].groups[1].menuButtons[0]
      if (zoomButton.title() !== zoom) {
        zoomButton.click().menus[0].menuItems[zoom].click()
      }
      const mainArea = frontWindow.scrollAreas[1]
      const hScrollBar = mainArea.attributes['AXHorizontalScrollBar'].value()
      const vScrollBar = mainArea.attributes['AXVerticalScrollBar'].value()
      if (hScrollBar) {
        hScrollBar.attributes['AXValue'].value = scrollX
      }
      if (vScrollBar) {
        vScrollBar.attributes['AXValue'].value = scrollY
      }
    },
    scrollX,
    scrollY,
    zoom,
  )
}
