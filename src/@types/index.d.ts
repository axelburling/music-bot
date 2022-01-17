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
