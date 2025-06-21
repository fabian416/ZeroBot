import routes from './routes/routes.js';

// Define allowed origins
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001', 
  'http://localhost:3002',
  'http://localhost:3003',
  'http://localhost:3004',
  'http://localhost:3005'
];

const getCorsHeaders = (origin) => {
  const headers = {
    'Access-Control-Allow-Methods': 'OPTIONS, POST, GET',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  };
  
  // Set specific origin if it's in our allowed list, otherwise don't set it
  if (ALLOWED_ORIGINS.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
  }
  
  return headers;
};

Bun.serve({
  port: Bun.env.PORT || 1337,

  fetch: async (req) => {
    const url = new URL(req.url);
    const path = url.pathname;
    const origin = req.headers.get('Origin');
    
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response('OK', { 
        headers: getCorsHeaders(origin)
      });
    }
    
    // Check if route exists
    if (routes.routes[path] && routes.routes[path][req.method]) {
      const response = await routes.routes[path][req.method](req, new Response());
      
      // Add CORS headers to the response
      const corsHeaders = getCorsHeaders(origin);
      Object.entries(corsHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
      
      return response;
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