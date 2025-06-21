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
    
        return this.statusRepository.save(metadata);
    }
}