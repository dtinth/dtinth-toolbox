;(async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
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
