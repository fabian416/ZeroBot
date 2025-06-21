
Bun.serve({
  port: Bun.env.PORT,
  routes: {
    '/api/status': {
      POST: async req => {
        const body = await req.json();
        return Response.json({created: true, ...body });
      },
    }
  }, 
  fetch(req) {
    return new Response("404, ZK Not found", { status: 404 }); 
  },
});