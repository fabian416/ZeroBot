export class StatusController {

    constructor(statusService) {
        this.statusService = statusService;
    }

    async update(req, res) {
        try {
            const body = await req.json();
            const { status, message } = this.statusService.createStatus(body);
            return Response.json({ body }, { status: 200 });

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