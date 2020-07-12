# toolbox

A kitchen-sink where I make toy around Electron-based utilities.

## iframe

Displays an arbitrary URL inside an Electron iframe without sandboxing.
Can be used to launch other Electron-based utilities without having to install a separate copy of Electron.

## keynote

Saving and recalling viewport position (zooming and panning) in Keynote.

## screen

Simple screen recording utility for macOS that records to GIF files, based on ffmpeg.
Unlike other tools that records a lossy video and converts it to GIF [producing unnecessarily large files due to compression artifact](https://dev.to/dtinth/a-gif-optimization-algorithm-for-screen-recordings-from-5-mb-to-986-kb-143g),
this one records the screen as a rawvideo and piped to another ffmpeg process to be encoded directly into a GIF file.

Using this requires symlinking `features/screen/rec-gif` somewhere in the PATH.
