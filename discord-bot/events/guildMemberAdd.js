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
                welcomeChannel.send(`Welcome ${member.user.username}! You've been given the New User role.`);
            }
        } catch (error) {
            console.error('Error handling new member:', error);
        }
    }
}
