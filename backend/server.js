import routes from './routes/routes.js';
import { handleCors, getCorsHeaders } from './middleware/cors.js';
import { errorHandler } from './middleware/errorHandler.js';

Bun.serve({
  port: Bun.env.PORT || 1337,

  fetch: async (req) => {
    const url = new URL(req.url);
    const path = url.pathname;
    
    // Check if route exists
    if (routes.routes[path] && routes.routes[path][req.method]) {
      try {
        const res = await routes.routes[path][req.method](req);
        return handleCors(req, res);
      } catch (error) {
        errorHandler(error, req);
      }
    }
    
    const notFoundError = new Error("Route not found");
    notFoundError.name = "NotFoundError";
    return errorHandler(notFoundError);
  },
  
  error: errorHandler
});

console.log(` API Server running on port ${Bun.env.PORT || 1337}`);