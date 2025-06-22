import bot from '../app.js';

async function removeNewUserRole(userId, guildId, shouldRemove) {
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

        // Find the "New User" role or create it if it doesn't exist
        let validatedUserRole = member.guild.roles.cache.find(role => role.name === "Validated User");
        if (!validatedUserRole) {
            validatedUserRole = await member.guild.roles.create({
                name: 'Validated User',
                color: '#ff0000', // red color
                reason: 'Role for validated server members'
            });
        }

        // Add the role to the new member
        await member.roles.add(validatedUserRole);
        console.log(`Removed New User role from ${member.user.tag} and added Validated User role`);
        
        return { 
            success: true, 
            message: `Successfully removed New User role from ${member.user.tag}` 
        };
    } catch (error) {
        console.error('Error removing role:', error);
        return { success: false, message: 'Error removing role: ' + error.message };
    }
}

export default removeNewUserRole;