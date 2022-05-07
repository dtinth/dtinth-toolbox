;(async () => {
  try {
    const deviceId = new URLSearchParams(window.location.search).get('deviceId')
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        deviceId: deviceId || undefined,
        frameRate: { ideal: 60 },
      },
      audio: false,
    })
    videoEl.autoplay = true
    videoEl.srcObject = stream
    videoEl.play()
    msgEl.hidden = true
  } catch (e) {
    msgEl.hidden = false
    msgEl.textContent = `${e}`
  }
})()
