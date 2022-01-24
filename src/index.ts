import { SpotifyPlugin } from "@distube/spotify";
import {
  Client,
  GuildChannelResolvable,
  Message,
  MessageEmbed,
} from "discord.js";
import { DisTube, DisTubeVoiceManager } from "distube";
import { config } from "dotenv";
import { Utils } from "./utils";

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
  spotify_clientSecret: process.env.CLIENTSECRET,
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
        clientId: settings.spotify_clientId ? settings.spotify_clientId : "",
        clientSecret: settings.spotify_clientSecret
          ? settings.spotify_clientSecret
          : "",
      },
    }),
  ],
});

const voiceManager = new DisTubeVoiceManager(client.distube);

const utils = new Utils();

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

    if (!message.content.startsWith("!")) {
      return;
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
              value: utils.sek2m(
                client.distube.queues.collection
                  .array()[0]
                  .songs.reduce((acc, curr) => {
                    return acc + curr.duration;
                  }, 0) - (song.duration ? song.duration : 0)
              ),
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
      if (!message?.member?.voice?.channel) {
        message.channel.send("You must join a channel");
        return;
      }
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

    if (command === "stop") {
      if (client.distube.queues.collection.array().length === 0) {
        message.channel.send("Queue is Empty");
      } else {
        client.distube?.stop(message);
        message.channel.send("Stopped ⏹");
      }
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
        client.distube?.queues.collection
          .array()[0]
          .songs.splice(
            1,
            client.distube.queues.collection.array()[0].songs.length
          );
        message.channel.send("Cleared ⏸");
      }
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
        client.distube?.queues.collection
          .array()[0]
          .songs.splice(parseInt(args[0]), 1);
        message.channel.send("Removed ▶");
      }
    }
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
