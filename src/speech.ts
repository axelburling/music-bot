import { Stream } from "stream";
// @ts-ignore
import { Model, Recognizer } from "vosk";
// import VAD from 'webrtcvad';

const modelPath = "../models/en/model";

const model = new Model(modelPath);

console.log("model", model);

const rec = new Recognizer({ model, sampleRate: 16000 });

const start = (stream: Stream) => {
  stream.on("data", (chunk: Buffer) => {
	console.log(chunk);
    if (rec.acceptWaveform(chunk)) {
      console.log(rec.result());
    } else {
      console.log(rec.partialResult());
    }

    process.on("SIGINT", () => {
      console.log(rec.finalResult());
      console.log("\nDone");
      rec.free();
      model.free();
    });
  });
};

export { start };
