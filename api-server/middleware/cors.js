// Define allowed origins
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001', 
  'http://localhost:3002',
  'http://localhost:3003',
  'http://localhost:3004',
  'http://localhost:3005',
  'https://zero-bot.aichallenge.fun'

];

const getCorsHeaders = (origin) => {
  const headers = {
    'Access-Control-Allow-Methods': 'OPTIONS, POST, GET',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  };
  
  // Set specific origin if it's in our allowed list
  if (ALLOWED_ORIGINS.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
  }

  return headers;
}

const handleCors = async (req, res) => {
    const origin = req.headers.get('Origin');
    const corsHeaders = getCorsHeaders(origin);

    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('OK', { headers: corsHeaders });
    }

    // Add CORS headers to the response
    if(res) {
        Object.entries(corsHeaders).forEach(([key, value]) => {
            res.headers.set(key, value);
        });
    }

    return res;
}

export { handleCors, getCorsHeaders, ALLOWED_ORIGINS };