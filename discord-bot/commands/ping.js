import { EmbedBuilder } from 'discord.js';

export default {
    config: {
        name: 'ping',
        description: 'Get ping of the bot',
        usage: `!ping`,
    },
    async run (bot,message,args) {
        // Create a stylized embed for the ping response
        const pingEmbed = new EmbedBuilder()
            .setColor('#00ff00') // Green color
            .setTitle('🏓 Pong!')
            .setDescription('Here\'s my current latency information')
            .addFields(
                { 
                    name: '📡 Bot Latency', 
                    value: `\`${bot.ws.ping}ms\``, 
                    inline: true 
                },
                { 
                    name: '🌐 Status', 
                    value: bot.ws.ping < 100 ? '🟢 Excellent' : bot.ws.ping < 200 ? '🟡 Good' : '🔴 Poor', 
                    inline: true 
                }
            )
            .setFooter({ 
                text: `Requested by ${message.author.username}`, 
                iconURL: message.author.displayAvatarURL() 
            })
            .setTimestamp();
        
        // Get the ping of the bot and send a styled embed message
        message.channel.send({
            embeds: [pingEmbed],
            components: [buttonRow]
        });
    }
}
