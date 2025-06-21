import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';

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

            const FRONT_URL_PARAMS = (process.env.FRONTEND_URL || 'https://google.com' ) + "?userId=" + message.author.id + "&guildId=" + message.guildId;
                    
            // Create a styled verification button
            const verifyButton = new ButtonBuilder()
                .setLabel('🔐 Verify Identity')
                .setStyle(ButtonStyle.Link)
                .setURL(FRONT_URL_PARAMS)
                .setEmoji('✨');

        const actionRow = new ActionRowBuilder().addComponents(verifyButton);
        // Get the ping of the bot and send a styled embed message
        message.channel.send({
            embeds: [pingEmbed],
            components: [actionRow]
        });
    }
}
