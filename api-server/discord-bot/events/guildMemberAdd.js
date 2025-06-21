import { ButtonBuilder, ActionRowBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';

export default {
    name: 'guildMemberAdd',
    async execute(member, bot) {
        // Log the newly joined member to console
        console.log('User ' + member.user.tag + ' has joined the server!');

        try {
            // Find the "New User" role or create it if it doesn't exist
            let newUserRole = member.guild.roles.cache.find(role => role.name === "New User");
            if (!newUserRole) {
                newUserRole = await member.guild.roles.create({
                    name: 'New User',
                    color: '#2ecc71', // A nice green color
                    reason: 'Role for new server members'
                });
            }

            console.log("newUserRole", newUserRole)
            // Add the role to the new member
            await member.roles.add(newUserRole);
            console.log(`Added New User role to ${member.user.tag}`);

            // Find a channel named welcome and send a Welcome message
            const welcomeChannel = member.guild.channels.cache.find(c => c.name === "welcome");
            if (welcomeChannel) {
                // Create a beautiful welcome embed
                const welcomeEmbed = new EmbedBuilder()
                    .setColor('#5865F2') // Discord's signature blurple color
                    .setTitle('🎉 Welcome to the Server!')
                    .setAuthor({
                        name: member.user.username,
                        iconURL: member.user.displayAvatarURL({ dynamic: true })
                    })
                    .setDescription(`Hey there, ${member.user}! 👋\n\nWe're excited to have you join our community! To get started and access all channels, you'll need to verify your identity using our secure verification system.`)
                    .addFields(
                        {
                            name: '🛡️ Security First',
                            value: 'Your verification is protected by **Noir** and **ZKPassport** technology',
                            inline: false
                        },
                        {
                            name: '👤 Your Status',
                            value: `✅ **New User** role assigned\n🔒 Verification pending`,
                            inline: true
                        },
                        {
                            name: '📋 Next Steps',
                            value: 'Click the button below to begin verification and unlock full server access',
                            inline: true
                        }
                    )
                    .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
                    .setImage('https://cdn.discordapp.com/attachments/123456789/welcome-banner.gif') // You can replace with your server's welcome banner
                    .setFooter({
                        text: `Member #${member.guild.memberCount} • ${member.guild.name}`,
                        iconURL: member.guild.iconURL({ dynamic: true })
                    })
                    .setTimestamp();

                const FRONT_URL_PARAMS = (process.env.FRONTEND_URL || 'https://google.com' ) + "?userId=" + member.id + "&guildId=" + member.guild.id;
                    
                // Create a styled verification button
                const verifyButton = new ButtonBuilder()
                    .setLabel('🔐 Verify Identity')
                    .setStyle(ButtonStyle.Link)
                    .setURL(FRONT_URL_PARAMS)
                    .setEmoji('✨');

                // Create a secondary informational button
                const helpButton = new ButtonBuilder()
                    .setLabel('❓ Need Help?')
                    .setStyle(ButtonStyle.Secondary)
                    .setCustomId('help_verification')
                    .setEmoji('🤝');

                const buttonRow = new ActionRowBuilder().addComponents(verifyButton, helpButton);

                // Send the styled welcome message
                await welcomeChannel.send({
                    content: `${member.user} just joined! 🎊`,
                    embeds: [welcomeEmbed],
                    components: [buttonRow]
                });

                // Optional: Send a follow-up message with server rules or guidelines
                setTimeout(async () => {
                    const rulesEmbed = new EmbedBuilder()
                        .setColor('#FEE75C') // Warm yellow color
                        .setTitle('📜 Quick Server Guidelines')
                        .setDescription('While you complete verification, here are our key community guidelines:')
                        .addFields(
                            { name: '🤝 Be Respectful', value: 'Treat all members with kindness and respect', inline: true },
                            { name: '🚫 No Spam', value: 'Keep conversations meaningful and on-topic', inline: true },
                            { name: '🔒 Stay Secure', value: 'Never share personal information publicly', inline: true }
                        )
                        .setFooter({ text: 'Complete verification to unlock all channels!' });

                    await welcomeChannel.send({ embeds: [rulesEmbed] });
                }, 5000); // Send rules message 5 seconds after welcome
            }
        } catch (error) {
            console.error('Error handling new member:', error);
        }
    }
}
