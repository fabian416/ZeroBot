export class StatusController {

    constructor(statusService) {
        this.statusService = statusService;
    }

    async update(req, res) {
        try {
            const {userId, guildId} = await req.json();
            const result = await this.statusService.createStatus(userId, guildId);
            return Response.json(result, { status: 200 });

        } catch (error) {
            console.error('Error updating status:', error);
            return Response.json({ error: 'Failed to update status' }, { status: 500 });
        }
    }

    async get(req) {
        try { 
            return Response.json({ status: "active", message: 'Service is running' });
        } catch (error) {
            console.error('Error fetching status:', error);
            return Response.json({ success: false, error: 'Failed to fetch status' }, { status: 500 });
        }
    }
}