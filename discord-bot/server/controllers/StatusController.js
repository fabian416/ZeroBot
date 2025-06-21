export class StatusController {
    static async update(req) {
        try {
            const body = await req.json();
            // Here you would typically update the status in your database or service
            console.log('Status updated:', body);
            return Response.json({ success: true, ...body });
        } catch (error) {
            console.error('Error updating status:', error);
            return Response.json({ success: false, error: 'Failed to update status' }, { status: 500 });
        }
    }

    static async get(req) {
        try { 
            return Response.json({ status: "active", status: 'Service is running' });
        } catch (error) {
            console.error('Error fetching status:', error);
            return Response.json({ success: false, error: 'Failed to fetch status' }, { status: 500 });
        }
    }
}