export class StatusController {

    constructor(statusService) {
        this.statusService = statusService;
    }

    async update(req) {
        try {
            const body = await req.json();
            const { status, message } = this.statusService.createStatus(body);
            return Response.json({ success: status, ...message });

        } catch (error) {
            console.error('Error updating status:', error);
            return Response.json({ success: false, error: 'Failed to update status' }, { status: 500 });
        }
    }

    async get(req) {
        try { 
            return Response.json({ status: "active", status: 'Service is running' });
        } catch (error) {
            console.error('Error fetching status:', error);
            return Response.json({ success: false, error: 'Failed to fetch status' }, { status: 500 });
        }
    }
}