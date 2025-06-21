import { EmbedBuilder } from 'discord.js';

export default {
    name: 'interactionCreate',
    async execute(interaction, bot) {
        // Handle button interactions
        if (interaction.isButton()) {
            if (interaction.customId === 'help_verification') {
                const helpEmbed = new EmbedBuilder()
                    .setColor('#5865F2')
                    .setTitle('🤝 Verification Help Center')
                    .setDescription('Need assistance with the verification process? Here\'s everything you need to know!')
                    .addFields(
                        {
                            name: '🔐 What is ZK Verification?',
                            value: 'Zero-Knowledge verification allows you to prove you\'re human without revealing personal information. It\'s completely secure and private!',
                            inline: false
                        },
                        {
                            name: '📱 How to Verify',
                            value: '1. Click the **🔐 Verify Identity** button\n2. Follow the secure verification process\n3. Complete the human verification\n4. Get instant access to all channels!',
                            inline: false
                        },
                        {
                            name: '⚠️ Having Issues?',
                            value: 'Try refreshing the page or contact a moderator if you\'re stuck. Our verification is powered by cutting-edge Noir technology for maximum security.',
                            inline: false
                        },
                        {
                            name: '🛡️ Your Privacy',
                            value: 'We use **ZKPassport** technology to ensure your personal information stays private while proving you\'re not a bot.',
                            inline: false
                        }
                    )
                    .setFooter({ 
                        text: 'ZeroBot Security System • Still need help? Contact our moderators',
                        iconURL: bot.user.displayAvatarURL()
                    })
                    .setTimestamp();

                // Send as ephemeral (only visible to the user who clicked)
                await interaction.reply({ 
                    embeds: [helpEmbed], 
                    ephemeral: true 
                });
            }
        }
    }
} 