export class StatusRepository {
    statuses = new Map();

    async save(metadata) {
        const id = metadata?.id || Date.now().toString();

        if (this.statuses.has(id)) {
            this.statuses.set(id, metadata, new Date().toISOString());
            return this.statuses.get(id);
        }

        const status = {
            id,
            metadata,
            createdAt: new Date().toISOString()
        };
        
        this.statuses.set(id, status);
        return status;
    }
}