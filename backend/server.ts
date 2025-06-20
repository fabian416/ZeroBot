Bun.serve({
  port: 1337,
  routes: {
    '/api/status': {
      POST: async req => {
        const body = await req.json();
        return Response.json({created: true, ...body });
      },
    }
  }, 
  fetch(req) {
    return new Response("ZK Not found", { status: 404 }); 
  },
});