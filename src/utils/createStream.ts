import { VoiceReceiver } from "@discordjs/voice";
// import { Model } from 'deepspeech';
import { User } from "discord.js";
import { start } from "../speech";

// function getDisplayName(userId: string, user?: User) {
// 	return user ? `${user.username}_${user.discriminator}` : userId;
// }

export function createListeningStream(
  receiver: VoiceReceiver,
  userId: string,
  _: any,
  __?: User
) {
  const opusStream = receiver.subscribe(userId, {});

  // const oggStream = new opus.OggLogicalBitstream({
  // 	opusHead: new opus.OpusHead({
  // 		channelCount: 2,
  // 		sampleRate: 48000,
  // 	}),
  // 	pageSizeControl: {
  // 		maxPackets: 10,
  // 	},
  // });

  // const oggStream = new opus.OggLogicalBitstream({
  // 	opusHead: new opus.OpusHead({
  // 		channelCount: 2,
  // 		sampleRate: 48000,
  // 	}),
  // 	pageSizeControl: {
  // 		maxPackets: 10,
  // 	},
  // })

  // const encoder = new OpusEncoder(48000, 2)
  opusStream.on("data", (data: Buffer) => {
    console.log(data);
  });

  start(opusStream);

  opusStream.on("end", () => {
    console.log("opusStream ended");
  });
  // console.log('oggStream', oggStream);

  // const filename = `./recordings/${Date.now()}-${getDisplayName(userId, user)}.ogg`;

  // const out = createWriteStream(filename);

  // console.log(`👂 Started recording ${filename}`);

  // pipeline(opusStream, oggStream, out, (err) => {
  // 	if (err) {
  // 		console.warn(`❌ Error recording file ${filename} - ${err.message}`);
  // 	} else {
  // 		console.log(`✅ Recorded ${filename}`);
  // 	}
  // });
}
