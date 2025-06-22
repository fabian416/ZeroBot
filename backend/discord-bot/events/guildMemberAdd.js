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

            // Add the role to the new member
            await member.roles.add(newUserRole);
            console.log(`Added New User role to ${member.user.tag}`);

            // Find a channel named welcome and send a Welcome message
            const welcomeChannel = member.guild.channels.cache.find(c => c.name === "welcome");
            if (welcomeChannel) {
                // Create a simple welcome embed
                const welcomeEmbed = new EmbedBuilder()
                    .setColor('#5865F2')
                    .setTitle('Welcome to the Server!')
                    .setDescription(`Hey ${member.user}! 👋\n\nPlease verify your identity to access all channels.`)
                    .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
                    .setFooter({
                        text: `Member #${member.guild.memberCount}`,
                        iconURL: member.guild.iconURL({ dynamic: true })
                    })
                    .setTimestamp();

                const FRONT_URL_PARAMS = (process.env.FRONTEND_URL || 'https://google.com' ) + "?userId=" + member.id + "&guildId=" + member.guild.id;
                    
                // Create verification button
                const verifyButton = new ButtonBuilder()
                    .setLabel('Verify Identity')
                    .setStyle(ButtonStyle.Link)
                    .setURL(FRONT_URL_PARAMS);

                const buttonRow = new ActionRowBuilder().addComponents(verifyButton);

                // Send the welcome message
                await welcomeChannel.send({
                    embeds: [welcomeEmbed],
                    components: [buttonRow]
                });
            }
        } catch (error) {
            console.error('Error handling new member:', error);
        }
    }
}
