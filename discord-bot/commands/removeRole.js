export default {
    config: {
        name: 'removeRole',
        description: 'Remove the New User role from a user',
        usage: `!removeRole <user>`,
    },
    async run (bot, message, args) {
        console.log("removeRole", args)
        const user = message.mentions.users.first();
        if (!user) {
            message.channel.send("Please mention a user to remove the role from");
            return;
        }

        // Remove the role from the user
        const result = await removeNewUserRole(user.id, message.guild.id, true, bot);
        if (result.success) {
            message.channel.send(result.message);
        } else {
            message.channel.send(result.message);
        }
    }
}


// Function to remove "New User" role
async function removeNewUserRole(userId, guildId, shouldRemove, bot) {
    try {
        if (!shouldRemove) {
            return { success: false, message: 'Role removal not requested' };
        }

        const guild = bot.guilds.cache.get(guildId);
        if (!guild) {
            return { success: false, message: 'Guild not found' };
        }

        const member = await guild.members.fetch(userId);
        if (!member) {
            return { success: false, message: 'Member not found' };
        }

        const newUserRole = guild.roles.cache.find(role => role.name === "New User");
        if (!newUserRole) {
            return { success: false, message: 'New User role not found' };
        }

        if (!member.roles.cache.has(newUserRole.id)) {
            return { success: false, message: 'Member does not have New User role' };
        }

        await member.roles.remove(newUserRole);
        console.log(`Removed New User role from ${member.user.tag}`);
        
        return { 
            success: true, 
            message: `Successfully removed New User role from ${member.user.tag}` 
        };
    } catch (error) {
        console.error('Error removing role:', error);
        return { success: false, message: 'Error removing role: ' + error.message };
    }
}
