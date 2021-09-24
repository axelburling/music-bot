import {
  Player,
  RepeatMode,
  Song,
  StreamConnection
} from "discord-music-player";
import {
  Client,
  GuildChannelResolvable,
  Intents,
  Message,

  MessageEmbed
} from "discord.js";
import { config } from "dotenv";

const roles = {
  admin: "Moderator",
  bot: "Bot",
  dj: "DJ",
  vip: "V.I.P.",
  muted: "Muted",
};

StreamConnection.errorMonitor.description;

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
}

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_VOICE_STATES,
  ],
}) as Client2;

const settings = {
  prefix: "!",
  token: process.env.TOKEN,
  dev_token: process.env.DEV_TOKEN,
  troll_id: process.env.TROLL_TOKEN
};

const player = new Player(client, { leaveOnEmpty: false, leaveOnStop: false });

client.player = player;

client.on("ready", () => {
  console.log("I am ready to Play with DMP 🎶 client: " + client.user?.tag);
});

client.on("messageCreate", async (message) => {
  if (message.author.id === settings.troll_id) {
    const attachment = new MessageEmbed().setImage('https://cdn.discordapp.com/attachments/538466109985390612/889241499932434503/CI29.png').setTitle('🤡')
    message.channel.send({embeds: [attachment]});
  }

  if (checkMuted(message)) {
    message.channel.send("You have no rights✊🏿");
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
    let queue = client.player.createQueue(message?.guild?.id as string, {
      data: [],
    });
    if(!message?.member?.voice?.channel) {
      message.channel.send('You must join a channel');
      return
    }
    await queue.join(message?.member?.voice?.channel as GuildChannelResolvable);

    const song = (await queue
      .play(args.join(" "), { sortBy: "relevance" })
      .catch((_) => {
        if (!guildQueue) queue.stop();
      })
      .catch((err) => console.log(err))) as Song;


    // const embeded = new MessageEmbed().setColor('RANDOM').setDescription(`Now playing ${song?.name} - ${song.url}`).setURL(song.url as string)
    const time = new Promise<number>((resolve, _) => {
      const tot = song?.queue?.songs.reduce((pre, curr): any => {
        return Number(curr.duration.replace(":", ".")) + pre;
      }, 0);

      const real = tot - Number(song?.duration.replace(":", "."));
      resolve(real);
    });


    const embeded = new MessageEmbed()
      .setColor("#000000")
      .setTitle(song?.name)
      .setURL(song?.url)
      .setAuthor(
        "Added to queue",
        message?.author?.avatarURL({ size: 32 }) as string,
        "https://github.com/axelburling/music-bot"
      )
      .setThumbnail(song?.thumbnail)
      .addFields(
        { name: "Song Duration", value: song?.duration, inline: true },
        {
          name: "Estimated time until playing",
          value: song?.isFirst
            ? "0"
            : (await time).toString().replace(".", ":"),
          inline: true,
        }
      )
      .addField("Position in queue", song?.queue?.songs.length.toString());

    message.channel.send({ embeds: [embeded] });
  }

  if(command === 'summon') {
    let queue = client.player.createQueue(message?.guild?.id as string, {
        data: [],
      });
      if(!message?.member?.voice?.channel) {
        message.channel.send('You must join a channel');
        return
      }
      await queue.join(message?.member?.voice?.channel as GuildChannelResolvable)
  }

  if (command === "s") {
    if (process.env.NODE_ENV !== "prod") {
      guildQueue?.skip();
      message.channel.send("Song skipped");
    } else {
      if (checkRole(message)) {
        guildQueue?.skip();
        message.channel.send("Song skipped");
      } else {
        message.channel.send("No rights");
      }
    }
  }

  if (command === "playlist") {
    let queue = client.player.createQueue(message?.guild?.id as string);
    if(!message?.member?.voice?.channel) {
      message.channel.send('You must join a channel');
      return
    }
    await queue.join(message?.member?.voice?.channel as GuildChannelResolvable);
    await queue.playlist(args.join(" ")).catch((_) => {
      if (!guildQueue) queue.stop();
    });
  }

  if (command === "stop") {
    guildQueue?.stop();
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
    guildQueue?.setVolume(parseInt(args[0]));
  }
  if (command === "seek") {
    guildQueue?.seek(parseInt(args[0]) * 1000);
  }

  if (command === "clear") {
    guildQueue?.clearQueue();
  }

  if (command === "shuffle") {
    guildQueue?.shuffle();
  }

  if (command === "q") {
    if (guildQueue === undefined) {
      message.channel.send("Queue is Empty");
    } else {
      // const songs = guildQueue?.songs?.reduce((pre: string[], curr: Song, idx): any => {
      //     if(curr?.isFirst) {
      //       return;
      //     }
      //     pre.push(`${idx}: [${curr.name}](${curr.url}) | ${curr?.duration} Requested by: ${curr?.requestedBy}`)
      // }, [])
      const songs = guildQueue?.songs
      const embeded = new MessageEmbed()
      .setColor('#000000')
      .setTitle(`Queue for ${message?.guild}`)
      .setURL("https://github.com/axelburling/music-bot")
      .setAuthor('Added to queue', message?.author?.avatarURL({size: 32}) as string, 'https://github.com/axelburling')
      
      .addFields(
          {name: 'Now Playing:', value: `[${guildQueue?.nowPlaying?.name}](${guildQueue?.nowPlaying?.url}) | ${guildQueue?.nowPlaying?.duration} `, },
          (songs && guildQueue?.songs?.length >= 2) ? {name: 'Up Next:', value: '\u200B'} : {name: '', value: ''}   
          // { name: 'Estimated time until playing', value: (time / 1000).toString().replaceAll('.', ':'),  inline: true},
      )

      if(songs) {
        songs.map((song, idx): any => {
          if(song.isFirst || song.isLive || song.queue.songs.length === 1) {
            return false;
            
          } else {
            embeded.addField('\u200B', `${idx - 1}: [${song.name}](${song.url}) | ${song.duration} `)
          }
        })
      } 

      message.channel.send({embeds: [embeded]})
    }
  }

  if (command === "nowPlaying") {
    console.log(`Now playing: ${guildQueue?.nowPlaying}`);
    const ProgressBar = guildQueue?.createProgressBar();
    if (guildQueue?.nowPlaying === undefined) {
      message.channel.send("Nothing playing at the moment");
    } else {
      message.channel.send(ProgressBar?.prettier as string);
    }
  }

  if (command === "pause") {
    if (guildQueue?.songs?.length === 0) {
      message.channel.send("Queue is Empty");
    } else {
      guildQueue?.setPaused(true);
      message.channel.send('Paused ⏸');
    }
  }

  if (command === "resume") {
    guildQueue?.setPaused(false);
  }

  if (command === "remove") {
    guildQueue?.remove(parseInt(args[0]));
  }
  // if(message) {

  //     const args = message.content.slice(settings.prefix.length).trim().split(/ +/g);
  //     const command = args.shift();
  //     let guildQueue = client.player.getQueue(message.guild.id);

  //     if(guildQueue) {

  //

  // if(command === 'createProgressBar') {
  //     const ProgressBar = guildQueue.createProgressBar();

  //     // [======>              ][00:35/2:20]
  //     console.log(ProgressBar.prettier);
  // }
  // }
  // } else {
  //     console.log("serouis problem")
  // }
});

if (process.env.NODE_ENV !== "prod") {
  client.login(settings.dev_token);
} else {
  client.login(settings.token);
}
