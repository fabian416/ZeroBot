import removeNewUserRole from "../../discord-bot/utils/removeRole.js"

export class StatusService {
    constructor(statusRepository) {
        this.statusRepository = statusRepository;
    }

    async createStatus(userId, guildId) {
        // sweet business logic
        const metadata = {
            userId,
            guildId,
            status: 'pending',
            lastUpdated: new Date().toISOString(),
        };

        removeNewUserRole(userId, guildId, true)
    
        return this.statusRepository.save(metadata);
    }
}