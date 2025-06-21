export class StatusRepository {
    constructor() {
        this.statuses = new Map(); // In-memory storage for demo
    }

    async save(statusData) {
        const id = Date.now().toString();
        const status = {
            id,
            ...statusData,
            createdAt: new Date().toISOString()
        };
        
        this.statuses.set(id, status);
        return status;
    }

    async findById(id) {
        return this.statuses.get(id);
    }

    async findAll() {
        return Array.from(this.statuses.values());
    }
}