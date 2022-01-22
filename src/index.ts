import { SpotifyPlugin } from "@distube/spotify";
import { Player, RepeatMode } from "discord-music-player";
import {
  Client,
  GuildChannelResolvable,
  Message,
  MessageEmbed,
  User
} from "discord.js";
import { DisTube, DisTubeVoiceManager } from "distube";
import { config } from "dotenv";
import { Readable } from "stream";
import { Utils } from "./utils";

async function convert_audio(input: Buffer) {
  try {
    // stereo to mono channel
    const data = new Int16Array(input);
    const ndata = data.filter((_, idx) => idx % 2);
    return Buffer.from(ndata);
  } catch (e) {
    console.log(e);
    console.log("convert_audio: " + e);
    throw e;
  }
}

const roles = {
  admin: "Moderator",
  bot: "Bot",
  dj: "DJ",
  vip: "V.I.P.",
  muted: "Muted",
};

const checkRole = (message: Message) => {
  if (
    message.member?.roles.cache.find((r) => r.name === roles.admin) ||
    message.member?.roles.cache.find((r) => r.name === roles.dj) ||
    message.member?.roles.cache.find((r) => r.name === roles.vip)
  ) {
    return true;
  } else {
    return false;
  }
};

const checkMuted = (message: Message) => {
  if (message.member?.roles.cache.find((r) => r.name === roles.muted)) {
    return true;
  } else {
    return false;
  }
};

config();

export interface Client2 extends Client {
  player: Player;
  distube: DisTube;
}

const client = new Client() as Client2;

const settings = {
  prefix: "!",
  token: process.env.TOKEN,
  dev_token: process.env.DEV_TOKEN,
  troll_id: process.env.TROLL_TOKEN,
  witai_token: process.env.WITAI_TOKEN,
  spotify_clientId: process.env.CLIENTID,
  spotify_clientSecret: process.env.CLIENTSECRET
};

client.distube = new DisTube(client, {
  leaveOnFinish: false,
  leaveOnEmpty: true,
  emptyCooldown: 0,
  searchCooldown: 0,
  savePreviousSongs: false,
  ytdlOptions: {
    quality: "highestaudio",
  },
  plugins: [
    new SpotifyPlugin({
      parallel: true,
      emitEventsAfterFetching: true,
      api: {
        clientId: settings.spotify_clientId ? settings.spotify_clientId : '' ,
        clientSecret: settings.spotify_clientSecret ? settings.spotify_clientSecret : '',
      },
    }),
  ],
});

const voiceManager = new DisTubeVoiceManager(client.distube);

const player = new Player(client, {
  leaveOnEmpty: false,
  leaveOnStop: false,
  leaveOnEnd: true,
  timeout: 10,
});

client.player = player;

const utils = new Utils()

utils.token(settings.witai_token)


client.on("ready", () => {
  console.log("I am ready to Play with DMP 🎶 client: " + client.user?.tag);
});

client.on("message", async (message): Promise<void> => {
  // voice.setSelfDeaf(false)
  // voice.setSelfMute(false)
  try {
    if (message.author.id === settings.troll_id) {
      const attachment = new MessageEmbed()
        .setImage(
          "https://cdn.discordapp.com/attachments/538466109985390612/889241499932434503/CI29.png"
        )
        .setTitle("🤡");
      message.channel.send({ embed: attachment });
    }

    if (checkMuted(message)) {
      message.channel.send("You have no rights✊🏿");
    }

    if(!message.content.startsWith('!')) {
      return
    }

    const args = message.content
      .slice(settings.prefix.length)
      .trim()
      .split(/ +/g);
    const name = message.content.split(" ")[1];
    const command = args.shift();
    if (command === "p" && name === "") {
      message.channel.send("Fuck off");
    }
    let guildQueue = client.player.getQueue(
      message?.guild?.id as unknown as string
    );

    if (command === "p" || command === "P") {
      // console.log("p");

      const name = args.join(" ");
      try {
        await client.distube.play(message.member?.voice.channel, name, {
          textChannel: message.channel,
        });

        client.distube.setVolume(message, 100);

        const song = await client.distube.queues.handler.searchSong(
          message,
          name
        );

        if (!song || song === undefined || song === null) {
          message.reply("I can't find that song");
          return;
        }
        
        const embeded = new MessageEmbed()
          .setColor("#000000")
          .setTitle(typeof song?.name === "string" ? song?.name : "Fuck of")
          .setURL(song?.url as string)
          .setAuthor(
            "Added to queue",
            message?.author?.avatarURL({ size: 32 }) as string,
            "https://github.com/axelburling/music-bot"
          )
          .setThumbnail(song?.thumbnail as string)
          .addFields(
            {
              name: "Song Duration",
              value: song?.formattedDuration,
              inline: true,
            },
            {
              name: "Estimated time until playing",
              value:
                utils.sek2m(client.distube.queues.collection
                  .array()[0]
                  .songs.reduce((acc, curr) => {
                    return acc + curr.duration;
                  }, 0) - (song.duration ? song.duration : 0)),
              inline: true,
            }
          )
          .addField(
            "Place in queue",
            client.distube.queues.collection.array()[0].songs.length - 1 + 1
          );
        // .addField("Position in queue", client.distube.queues.);

        message.channel.send({ embed: embeded });
      } catch (error) {
        console.log(error);
      }
    }

    if (command === "summon") {
      // let queue = client.player.createQueue(message?.guild?.id as string, {
      //   data: [],
      // });
      if (!message?.member?.voice?.channel) {
        message.channel.send("You must join a channel");
        return;
      }
      // await queue.join(
      //   message?.member?.voice?.channel as GuildChannelResolvable
      // );

      await voiceManager.join(
        message.member?.voice.channel as GuildChannelResolvable
      );
    }

    if (command === "s") {
      if (process.env.NODE_ENV !== "prod") {
        await client.distube.skip(message);
        message.channel.send("Song skipped");
      } else {
        if (checkRole(message)) {
          await client.distube.skip(message);
          message.channel.send("Song skipped");
        } else {
          message.channel.send("No rights");
        }
      }
    }

    if (command === "playlist") {
      let queue = client.player.createQueue(message?.guild?.id as string);
      if (!message?.member?.voice?.channel) {
        message.channel.send("You must join a channel");
        return;
      }
      await queue.join(
        message?.member?.voice?.channel as GuildChannelResolvable
      );
      await queue.playlist(args.join(" ")).catch((_) => {
        if (!guildQueue) queue.stop();
      });
    }

    if (command === "stop") {
      if (client.distube.queues.collection.array().length === 0) {
        message.channel.send("Queue is Empty");
      } else {
        client.distube?.stop(message);
        message.channel.send("Stopped ⏹");
      }
    }

    if (command === "removeLoop") {
      guildQueue?.setRepeatMode(RepeatMode.DISABLED); // or 0 instead of RepeatMode.DISABLED
    }

    if (command === "toggleLoop") {
      guildQueue?.setRepeatMode(RepeatMode.SONG); // or 1 instead of RepeatMode.SONG
    }
    if (command === "toggleQueueLoop") {
      guildQueue?.setRepeatMode(RepeatMode.QUEUE); // or 2 instead of RepeatMode.QUEUE
    }
    if (command === "setVolume") {
      client.distube.setVolume(message, parseInt(args[0]));
    }

    if (command === "seek") {
      if (client.distube.queues.collection.array().length === 0) {
        message.channel.send("Queue is Empty");
      } else {
        client.distube?.seek(message, parseInt(args[0]));
        message.channel.send("Moving 🚚");
      }
    }

    if (command === "clear") {
      if (client.distube.queues.collection.array().length === 0) {
        message.channel.send("Queue is Empty");
      } else {
        client.distube?.queues.collection.array()[0].songs.splice(1, client.distube.queues.collection.array()[0].songs.length);
        message.channel.send("Cleared ⏸");
      }
    }

    if (command === "shuffle") {
      guildQueue?.shuffle();
    }

    if (command === "q") {
      if (client.distube.queues.collection.array().length === 0) {
        message.channel.send("Queue is Empty");
      } else {
        let embeded: MessageEmbed;
        const songs = client.distube.queues.collection.array()[0].songs;
        const nowPlaying = client.distube.queues.collection.array()[0].songs[0];

        embeded = new MessageEmbed()
          .setColor("#000000")
          .setTitle(`Queue for ${message?.guild}`)
          .setURL("https://github.com/axelburling/music-bot")
          .setAuthor(
            "Added to queue",
            message?.author?.avatarURL({ size: 32 }) as string,
            "https://github.com/axelburling"
          )
          .addFields(
            {
              name: "Now Playing:",
              value: `[${nowPlaying.name}](${nowPlaying?.url}) | ${nowPlaying?.formattedDuration} `,
            },
            { name: "Up Next:", value: "\u200B" }
          );

        if (songs) {
          songs.map((song, idx): any => {
            if (idx === 0) {
              return false;
            } else {
              embeded.addField(
                "\u200B",
                `${idx}: [${song.name}](${song.url}) | ${song.formattedDuration} `
              );
            }
          });
        }

        message.channel.send({ embed: embeded });
      }
    }

    if (command === "nowPlaying") {
      if (client.distube.queues.collection.array().length === 0) {
        message.channel.send("No music is playing");
        return;
      }
      const currSong = client.distube.queues.collection.array()[0].songs[0];
      const curr = client.distube.queues.collection.array()[0].currentTime;
      const pro = curr / currSong.duration;
      const bar = utils.progressBar(pro);

      const embeded = new MessageEmbed()
        .setColor("#000000")
        .setTitle("Playing now")
        .addFields(
          {
            name: "Song: ",
            value: `[${currSong.name}](${currSong?.url}) | ${currSong?.formattedDuration} `,
          },
          {
            name: "Time: ",
            value: `${bar}[${
              client.distube.queues.collection.array()[0].formattedCurrentTime
            }/${currSong.formattedDuration}]`,
          }
        );

      message.channel.send({ embed: embeded });
    }

    if (command === "pause") {
      if (client.distube.queues.collection.array().length === 0) {
        message.channel.send("Queue is Empty");
      } else {
        client.distube?.pause(message);
        message.channel.send("Paused ⏸");
      }
    }

    if (command === "resume") {
      if (client.distube.queues.collection.array().length === 0) {
        message.channel.send("Queue is Empty");
      } else {
        client.distube?.resume(message);
        message.channel.send("Resumed ▶");
      }
    }

    if (command === "remove") {
      if (client.distube.queues.collection.array().length === 0) {
        message.channel.send("Queue is Empty");
      } else {
        client.distube?.queues.collection.array()[0].songs.splice(parseInt(args[0]), 1)
        message.channel.send("Removed ▶");
      }
    }

    if (command === "listen") {
      console.log("listening");
      const SILENCE_FRAME = Buffer.from([0xf8, 0xff, 0xfe]);

      class Silence extends Readable {
        _read() {
          this.push(SILENCE_FRAME);
          this.destroy();
        }
      }

      try {
        let voice_Channel = await client.channels.cache.get(
          message.member?.voice.channelID as string
        );
        if (!voice_Channel)
          message.reply("Error: The voice channel does not exist!");
        let text_Channel = await client.channels.fetch(message.channel.id);
        if (!text_Channel)
          message.reply("Error: The text channel does not exist!");
        // @ts-ignore
        let voice_Connection = await voice_Channel.join();

        voice_Connection.play(new Silence(), { type: "opus" });

        voice_Connection.on("disconnect", (e: any) => {
          if (e) console.log(e);
        });
        message.reply("connected!");

        voice_Connection.on("speaking", (user: User, speaking: any) => {
          message.reply(`${user.username} is speaking`);
          if (speaking.bitfield === 0 || user.bot) {
            return;
          }
          console.log(user.username + " is speaking");
          const audioStream = voice_Connection.receiver.createStream(user, {
            mode: "pcm",
          });
          // console.log(audioStream);
          audioStream.on("error", (e: any) => {
            console.log("streamerror", e);
          });
          let buffer: Uint8Array[] = [];

          audioStream.on("data", (chunk: any) => {
            // console.log(chunk);
            buffer.push(chunk);
          });

          audioStream.on("end", async () => {
            const idk_buffer = Buffer.concat(buffer as unknown as Uint8Array[]);
            const duration = idk_buffer.length / 48000 / 4;
            console.log("duration: " + duration);
            if (duration < 1.0 || duration > 19) {
              // 20 seconds max dur
              console.log("TOO SHORT / TOO LONG; SKPPING");
              return;
            }

            try {
              let new_buffer = await convert_audio(idk_buffer);
              let out = await utils.transcribe(new_buffer);
              utils.commands(out);
              message.reply(out);
              console.log(out);
            } catch (error) {
              console.log("tmpraw rename: " + error);
            }
          });
        });
      } catch (e) {
        console.log("connect: " + e);
        message.reply("Error: unable to join your voice channel.");
        throw e;
      }

      // const connection = joinVoiceChannel({
      //   channelId: message?.member?.voice?.channel?.id as string,
      //   guildId: message?.guild?.id as string,
      //   adapterCreator: message.guild?.voiceAdapterCreator as DiscordGatewayAdapterCreator,
      //   selfMute: true,
      //   selfDeaf: false,
      // });

      // let stream
      // let buffer: Uint8Array[] = []
      // connection?.receiver.speaking.on('start', (userId) => {
      //   message.reply(`${userId} started speaking`);
      //   stream = connection.receiver.subscribe(userId, {

      //     read(size) {
      //       return this.read(size);
      //     }
      //   })
      //   stream.on('data', (chunk) => {
      //     buffer.push(chunk)
      //   })

      //   stream.on('end', async () => {
      //     console.log(buffer);

      //   })

      // })

      // connection.receiver.speaking.on('end', async () => {
      //   const new_buffer1 = Buffer.concat(buffer as Uint8Array[])
      //   const duration = new_buffer1.length / 2000 / 4;
      // console.log("duration: " + duration);

      // if (duration < 1.0 || duration > 19) {
      //   // 20 seconds max dur
      //   console.log("TOO SHORT / TOO LONG; SKPPING");
      //   return;
      // }

      // try {
      //   let con_buffer = await convert_audio(new_buffer1)
      //   const out = await transcribe(con_buffer)

      //   console.log(out);
      //   } catch (error) {

      //   }

      // })
    }

    // if(command === 'deploy') {
    //   if(message.guild) {
    //     await message.guild.commands.set([
    //       {
    //         name: 'join',
    //         description: 'Joins the voice channel that you are in',
    //       },
    //       {
    //         name: 'record',
    //         description: 'Enables recording for a user',
    //         options: [
    //           {
    //             name: 'speaker',
    //             type: 'USER' as const,
    //             description: 'The user to record',
    //             required: true,
    //           },
    //         ],
    //       },
    //       {
    //         name: 'leave',
    //         description: 'Leave the voice channel',
    //       },
    //       {
    //         name: 'ping',
    //         description: 'Pong!',
    //       }
    //     ]);
    //   }
    // }
  } catch (err) {
    console.log(err);
    message.channel.send("Stop being a dick");
  }
});

if (process.env.NODE_ENV !== "prod") {
  client.login(settings.dev_token);
} else {
  client.login(settings.token);
}
