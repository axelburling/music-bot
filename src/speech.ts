import { Model } from 'deepspeech';
import * as fs from 'fs';
// import VAD from 'webrtcvad';


// let DEEPSPEECH_MODEL = '/models/deep'; // path to deepspeech model directory
// // if (process.env.DEEPSPEECH_MODEL) {
// // 	DEEPSPEECH_MODEL = process.env.DEEPSPEECH_MODEL;
// // }

// let SILENCE_THRESHOLD = 200;

// const vad = new VAD(16000, SILENCE_THRESHOLD);

const createModel = (): Model => {

	if(fs.existsSync('/models/deep')) {
		let modelPath = '/models/deep/model.pbmm';
		let scorerPath = '/models/deep/model.scorer';
		const model = new Model(modelPath);
		model.enableExternalScorer(scorerPath);
		return model;
	} else if(fs.existsSync('/models/swedish/models')) {
		let modelPath =  '/models/swedish/models/output_graph.pbmm';
		let scorerPath = modelPath + '.scorer';
		const model = new Model(modelPath);
		model.enableExternalScorer(scorerPath);
		model
		return model;
	} else {
		throw new Error('No model found');
	}

}



// let modelStream: Stream | null;
// let recordedChunks = 0;
// let silenceStart: any = null;
// let recordedAudioLength = 0;
// let endTimeout: any = null;
// let silenceBuffers: any[] = [];


// function processAudioStream(data: Buffer, callback: (...args: any[]) => void) {
//  		const isVoice= vad.process(data)
// 		if (isVoice) {
// 			processVoice(data) 
// 		} else {
// 			processSilence(data, (result) => {
// 				if (result) {
// 					callback(result);
// 				}
// 			})
// 		}
// 	clearTimeout(endTimeout);
// 	endTimeout = setTimeout(function() {
// 		console.log('timeout');
// 		resetAudioStream();
// 	},SILENCE_THRESHOLD*3);
// }




// function resetAudioStream() {
// 	clearTimeout(endTimeout);
// 	console.log('[reset]');
// 	intermediateDecode(); // ignore results
// 	recordedChunks = 0;
// 	silenceStart = null;
// }



// function processSilence(data: Buffer, callback: (...args: any[]) => void) {
// 	if (recordedChunks > 0) { // recording is on
// 		process.stdout.write('-'); // silence detected while recording
		
// 		feedAudioContent(data);
		
// 		if (silenceStart === null) {
// 			silenceStart = new Date().getTime();
// 		}
// 		else {
// 			let now = new Date().getTime();
// 			if (now - silenceStart > SILENCE_THRESHOLD) {
// 				silenceStart = null;
// 				console.log('[end]');
// 				let results = intermediateDecode();
// 				if (results) {
// 					if (callback) {
// 						callback(results);
// 					}
// 				}
// 			}
// 		}
// 	}
// 	else {
// 		process.stdout.write('.'); // silence detected while not recording
// 		bufferSilence(data);
// 	}
// }

// function bufferSilence(data: Buffer) {
// 	// VAD has a tendency to cut the first bit of audio data from the start of a recording
// 	// so keep a buffer of that first bit of audio and in addBufferedSilence() reattach it to the beginning of the recording
// 	silenceBuffers.push(data);
// 	if (silenceBuffers.length >= 3) {
// 		silenceBuffers.shift();
// 	}
// }

// function addBufferedSilence(data: Buffer) {
// 	let audioBuffer;
// 	if (silenceBuffers.length) {
// 		silenceBuffers.push(data);
// 		let length = 0;
// 		silenceBuffers.forEach(function (buf) {
// 			length += buf.length;
// 		});
// 		audioBuffer = Buffer.concat(silenceBuffers, length);
// 		silenceBuffers = [];
// 	}
// 	else audioBuffer = data;
// 	return audioBuffer;
// }


// function processVoice(data: Buffer) {
// 	silenceStart = null;
// 	if (recordedChunks === 0) {
// 		console.log('');
// 		process.stdout.write('[start]'); // recording started
// 	}
// 	else {
// 		process.stdout.write('='); // still recording
// 	}
// 	recordedChunks++;
	
// 	data = addBufferedSilence(data);
// 	feedAudioContent(data);
// }


// function createStream() {
// 	modelStream = model.createStream();
// 	recordedChunks = 0;
// 	recordedAudioLength = 0;
// }

// function finishStream() {
// 	if (modelStream) {
// 		let start = new Date();
// 		let text = modelStream.finishStream();
// 		if (text) {
// 			let recogTime = new Date().getTime() - start.getTime();
// 			return {
// 				text,
// 				recogTime,
// 				audioLength: Math.round(recordedAudioLength)
// 			};
// 		}
// 	}
// 	silenceBuffers = [];
// 	modelStream = null;
// }

// function intermediateDecode() {
// 	let results = finishStream();
// 	createStream();
// 	return results;
// }

// function feedAudioContent(chunk: any) {
// 	recordedAudioLength += (chunk.length / 2) * (1 / 16000) * 1000;
// 	if(modelStream) {
// 		modelStream.feedAudioContent(chunk);
// 	}
// }

// const start = (stream: S) => {
// 	createStream()
// 	stream.on('data', (data) => {
// 		processAudioStream(data, (result) => {
// 			if (result) {
// 				console.log(result);
// 			}
// 		})
// 	})
// }

export { createModel };
