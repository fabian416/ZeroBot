import routes from './routes/routes.js';
import { handleCors, getCo } from './middleware/cors.js';

Bun.serve({
  port: Bun.env.PORT || 1337,

  fetch: async (req) => {
    const url = new URL(req.url);
    const path = url.pathname;
    const origin = req.headers.get('Origin');
    
    // Check if route exists
    if (routes.routes[path] && routes.routes[path][req.method]) {
      const res = await routes.routes[path][req.method](req, new Response());
      
      return handleCors(req, res);
    }
    
    // Handle 404
    return new Response("404, ZK Not found", { 
      status: 404,
      headers: getCorsHeaders(origin)
    });
  },
  
  error(error) {
    console.error(error);
    return new Response("500, Internal Server Error", { 
      status: 500,
      headers: getCorsHeaders(null)
    });
  }
});

console.log(` API Server running on port ${Bun.env.PORT || 1337}`);