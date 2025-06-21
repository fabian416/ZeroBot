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


        // Log successful startup with timestamp
        console.log(`🕐 Bot started at: ${new Date().toLocaleString()}`);
    }
}
