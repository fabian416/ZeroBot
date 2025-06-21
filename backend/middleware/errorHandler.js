import { getCorsHeaders } from "./cors.js";

export function errorHandler(error) {
  console.error("Server error:", error);

  let status = 500;
  let message = "Internal Server Error";

  // Handle different types of errors
  if (error.name === "ValidationError") {
    status = 400;
  } else if (error.name === "NotFoundError") {
    status = 404;
  } else if (error.name === "AuthorizationError") {
    status = 401;
  } else if (error.name === "InternalServerError") {
    status = 500;
  }

  message = error.message || "An unexpected error occurred";

  return new Response(
    JSON.stringify({ 
      success: false,
      error: message,
    }),
    {
      status,
      headers: {
        "Content-Type": "application/json",
        ...getCorsHeaders(null),
      },
    }
  );
}
