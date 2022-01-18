// <reference types="node" />

declare module "node-vad" {
  class VAD {
   
    constructor(mode: any)

    processAudio(buffer: Buffer, rate: any): any
    processAudioFloat(buffer: Buffer, rate: any): any
  }

  VAD.Mode = Object.freeze({
    NORMAL: number,
    LOW_BITRATE: 1,
    AGGRESSIVE: 2,
    VERY_AGGRESSIVE: 3
  })


  export default VAD;
}


declare module 'vosk' {
  class Model {
      constructor(path: string)
      free(): void
  }

  class Recognizer {
    constructor({model, sampleRate}: {model: Model, sampleRate: number})
    acceptWaveform(waveform: Buffer): any
    result(): any
    partialResult(): any
    finalResult(): any
    free(): void
  }
}