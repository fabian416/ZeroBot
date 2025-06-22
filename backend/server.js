import routes from './routes/routes.js';
import { getCorsHeaders } from './middleware/cors.js';
import { errorHandler } from './middleware/errorHandler.js';

Bun.serve({
  port: Bun.env.PORT || 1337,

  fetch: async (req) => {
    const url = new URL(req.url);
    const path = url.pathname;

    // Handle CORS preflight requests
    const origin = req.headers.get("Origin");

    if (req.method === "OPTIONS") {
      return new Response("OK", {
        headers: getCorsHeaders(origin)
      });
    }
    
    // Check if route exists
    if (routes.routes[path] && routes.routes[path][req.method]) {
      const response = await routes.routes[path][req.method](req, new Response());
      const corsHeaders = getCorsHeaders(origin);
      Object.entries(corsHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
      return response;
    }
  },
  
  error: errorHandler
});

console.log(` API Server running on port ${Bun.env.PORT || 1337}`);