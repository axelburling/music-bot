import { Player, RepeatMode, StreamConnection } from 'discord-music-player'
import { Client, GuildChannelResolvable, Intents, Message, MessageAttachment } from 'discord.js'
import { config } from 'dotenv'

const roles = {
    admin: 'Moderator',
    bot: 'Bot',
    dj: 'DJ',
    vip: 'V.I.P.',
    muted: 'Muted'
} 

StreamConnection.errorMonitor.description

const checkRole = (message: Message) => {
    if(message.member?.roles.cache.find(r => r.name === roles.admin) || message.member?.roles.cache.find(r => r.name === roles.dj) || message.member?.roles.cache.find(r => r.name === roles.vip)) {
        return true
    } else {
        return false
    }
}

const checkMuted = (message: Message) => {
    if(message.member?.roles.cache.find(r => r.name === roles.muted) ) {
        return true
    } else {
        return false
    }
}

config()

export interface Client2 extends Client {
    player: Player
}

const client = new Client({intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES]}) as Client2

const settings = {
    prefix: '!',
    token: process.env.TOKEN
}

const player = new Player(client, {leaveOnEmpty: false})

client.player = player

client.on('ready', () => {
    console.log("I am ready to Play with DMP 🎶")
})

client.on('messageCreate', async (message) => {
    
    if(message.author.id === '660140769637564436') {
        const attachment = new MessageAttachment('../assets/vidapic.png', 'help.png');

        message.channel.send({
          embed: {
            files: [
              attachment
            ],
            image: {
              url: 'attachment://help.png'
            }
          }
        } as {});
    }

    if(checkMuted(message)) {
        message.channel.send('You have no rights✊🏿')
    }

    const args = message.content.slice(settings.prefix.length).trim().split(/ +/g);
    const name = message.content.split(' ')[1]
    const command = args.shift()
    if(command === 'p' && name === '') {
        message.channel.send('Fuck off')
    } 
    let guildQueue = client.player.getQueue( message?.guild?.id as unknown as string)

    if(command === 'p' || command === 'P') {
        let queue = client.player.createQueue(message?.guild?.id as string);
        await queue.join(message?.member?.voice?.channel as GuildChannelResolvable);
        let song = await queue.play(args.join(' ')).catch(_ => {
            if(!guildQueue)
                queue.stop();
        }).catch(err => console.log(err));
        song
    }

    if(command === 's') {

        if(checkRole(message) ) {
            guildQueue?.skip();
            message.channel.send('Song skipped')
        } else {
            message.channel.send('No rights')
        }
        }

        if(command === 'playlist') {
                let queue = client.player.createQueue(message?.guild?.id as string);
                await queue.join(message?.member?.voice?.channel as GuildChannelResolvable);
                let song = await queue.playlist(args.join(' ')).catch(_ => {
                    if(!guildQueue)
                        queue.stop();
                });
                song
            }
                
        
            if(command === 'stop') {
                    guildQueue?.stop();
                }
                
            if(command === 'removeLoop') {
                guildQueue?.setRepeatMode(RepeatMode.DISABLED); // or 0 instead of RepeatMode.DISABLED
            }

            if(command === 'toggleLoop') {
                guildQueue?.setRepeatMode(RepeatMode.SONG); // or 1 instead of RepeatMode.SONG
            }
            if(command === 'toggleQueueLoop') {
                guildQueue?.setRepeatMode(RepeatMode.QUEUE); // or 2 instead of RepeatMode.QUEUE
            }
            if(command === 'setVolume') {
                guildQueue?.setVolume(parseInt(args[0]));
            }
            if(command === 'seek') {
                guildQueue?.seek(parseInt(args[0]) * 1000);
            }
        
            if(command === 'clearQueue') {
                guildQueue?.clearQueue();
            }
        
            if(command === 'shuffle') {
                guildQueue?.shuffle();
            }
        
            if(command === 'q') {
               
                if(guildQueue === undefined) {
                    message.channel.send("Queue is Empty")
                } else {
                    const songs = guildQueue?.songs.filter(song => song.name && song.duration)
                    message.channel.send(songs.toString())
                }

            }
        
            if(command === 'getVolume') {
                console.log(guildQueue?.volume)
            }
            if(command === 'nowPlaying') {
                console.log(`Now playing: ${guildQueue?.nowPlaying}`);
                if(guildQueue?.nowPlaying === undefined) {
                    message.channel.send("Nothing playing at the moment")
                } else {
                    message.channel.send(guildQueue as unknown as string)
                }
            }
        
            if(command === 'pause') {
                if(guildQueue?.songs?.length === 0) {
                    message.channel.send("Queue is Empty")
                } else {
                    guildQueue?.setPaused(true);
                    message.channel.send(guildQueue as unknown as string)
                }

            }
        
            if(command === 'resume') {
                guildQueue?.setPaused(false);
            }
        
            if(command === 'remove') {
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

})

client.login(settings.token)