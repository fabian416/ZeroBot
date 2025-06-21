import { StatusController } from '../controllers/StatusController.js';
import { StatusService } from '../services/StatusService.js';
import { StatusRepository } from '../repositories/StatusRepository.js';

// Dependency injection setup
const statusRepository = new StatusRepository();
const statusService = new StatusService(statusRepository);
const statusController = new StatusController(statusService);

export default {
    routes: {
        '/api/status': {
            POST: async req => { statusController.update(req); },
            GET: async req => { statusController.get(req); },
        },
    },
}