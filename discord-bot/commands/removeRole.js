const { removeNewUserRole } = require('../utils/removeRole.js');

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
        const result = await removeNewUserRole(user.id, message.guild.id, true);
        if (result.success) {
            message.channel.send(result.message);
        } else {
            message.channel.send(result.message);
        }
    }
}

