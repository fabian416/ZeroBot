import removeNewUserRole from "../../discord-bot/utils/removeRole.js"

export class StatusService {
    constructor(statusRepository) {
        this.statusRepository = statusRepository;
    }

    async createStatus(data) {
        // sweet business logic
        const metadata = {
            ...data,
            status: data.status || 'pending',
            lastUpdated: new Date().toISOString(),
        };

        removeNewUserRole()
    
        return this.statusRepository.save(metadata);
    }
}