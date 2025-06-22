import { StatusController } from '../controllers/StatusController.js';
import { StatusService } from '../services/StatusService.js';
import { StatusRepository } from '../repositories/StatusRepository.js';
// import NoirController from '../controllers/NoirService.js';

// Dependency injection setup
const statusRepository = new StatusRepository();
const statusService = new StatusService(statusRepository);
const statusController = new StatusController(statusService);


export default {
    routes: {
        '/api/status': {
            POST: async (req, res) => { return statusController.update(req, res); },
            GET: async (req, res) => { return statusController.get(req, res); },
        },
    },
    /**
    '/api/noir': {
        POST: async (req, res) => { return noirController.deployZeroBot(req, res); },
        GET: async (req, res) => { return noirController.deployIdentity(req, res); },
    },
    */
}