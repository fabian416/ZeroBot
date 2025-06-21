import { ActivityType } from 'discord.js';

export default {
    name: 'ready',
    once: true,
    execute(bot) {
        // Enhanced console logging with styling
        console.log('\n🤖 ═══════════════════════════════════════');
        console.log(`✅ ${bot.user.username} is now ONLINE!`);
        console.log(`🌐 Connected to ${bot.guilds.cache.size} server(s)`);
        console.log(`👥 Serving ${bot.users.cache.size} users`);
        console.log('🛡️  ZeroBot - Secure Discord Verification');
        console.log('═══════════════════════════════════════\n');

        // Array of different activities to cycle through
        const activities = [
            { name: 'over server security 🛡️', type: ActivityType.Watching },
            { name: 'ZK proofs for verification 🔐', type: ActivityType.Listening },
            { name: 'with Noir technology ⚡', type: ActivityType.Playing },
            { name: '/verify for new members 👥', type: ActivityType.Watching },
            { name: 'zero-knowledge magic ✨', type: ActivityType.Playing },
        ];

        let currentActivityIndex = 0;

        // Function to update bot presence
        const updatePresence = () => {
            const activity = activities[currentActivityIndex];
            bot.user.setPresence({
                activities: [{
                    name: activity.name,
                    type: activity.type
                }],
                status: 'online' // online, idle, dnd, invisible
            });

            currentActivityIndex = (currentActivityIndex + 1) % activities.length;
        };

        // Set initial presence
        updatePresence();

        // Rotate activities every 30 seconds
        setInterval(updatePresence, 30000);

        // Log successful startup with timestamp
        console.log(`🕐 Bot started at: ${new Date().toLocaleString()}`);
    }
}
