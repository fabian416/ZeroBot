import routes from './routes/routes.js';

Bun.serve({
  port: Bun.env.PORT,
  ...routes, 
  fetch(req) {
    return new Response("404, ZK Not found", { status: 404 }); 
  },
});