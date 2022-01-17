
import { DiscordGatewayAdapterCreator, DiscordGatewayAdapterLibraryMethods } from '@discordjs/voice';
import { Constants, Snowflake, VoiceChannel } from 'discord.js';

const adapters = new Map<Snowflake, DiscordGatewayAdapterLibraryMethods>();



/**
 * Creates an adapter for a Voice Channel.
 * 
 * @param channel - The channel to create the adapter for
 */
export function createDiscordJSAdapter(channel: VoiceChannel): DiscordGatewayAdapterCreator {
	return (methods) => {
		adapters.set(channel.guild.id, methods);
		return {
			sendPayload(data) {
				if (channel.guild.shard.status === Constants.Status.READY) {
					channel.guild.shard.send(data);
					return true;
				}
				return false;
			},
			destroy() {
				return adapters.delete(channel.guild.id);
			},
		};
	};
}