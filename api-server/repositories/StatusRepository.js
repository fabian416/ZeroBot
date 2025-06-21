export class StatusRepository {
    constructor() {
        this.statuses = new Map();
    }

    async save(metadata) {
            const id = metadata.id || Date.now().toString();
            this.statuses.set(id, metadata);
            const status = {
            id,
            ...statusData,
            createdAt: new Date().toISOString()
        };
        
        this.statuses.set(id, status);
        return status;
    }
}