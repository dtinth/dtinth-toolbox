App.registerFeature('iframe', {
  template: html`
    <div id="iframe" class="flex flex-col h-full">
      <form class="p-1 flex-none" @submit="$event.preventDefault(); setUrl()">
        <input class="bg-black" v-model="proposedUrl" list="urllist" />
        <button>set url</button>
        <datalist id="urllist">
          <option :value="url" v-for="url of urls"></option>
        </datalist>
      </form>
      <div class="relative flex-auto">
        <iframe
          v-if="url"
          :src="url"
          :key="clickCount"
          class="absolute inset-0 w-full h-full"
        ></iframe>
      </div>
    </div>
  `,
  data() {
    return {
      proposedUrl: '',
      url: '',
      clickCount: 0,
      urls: [],
    }
  },
  mounted() {
    try {
      const data = JSON.parse(
        require('fs').readFileSync(
          '/Users/dtinth/Projects/toolbox/private/urls.json',
          'utf8',
        ),
      )
      this.urls = data.urls
    } catch (e) {}
  },
  methods: {
    setUrl() {
      const url = this.proposedUrl
      this.url = url || ''
      this.clickCount++
    },
  },
  css: css`
    #iframe {
    }
  `,
})
