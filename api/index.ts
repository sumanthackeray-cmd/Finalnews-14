// @ts-ignore
import app from '../dist/server/index.js';



export default async function handler(request: Request) {
  try {
    return await app.fetch(request, process.env, {
      waitUntil: () => {},
      passThroughOnException: () => {}
    });
  } catch (error: any) {
    console.error("[Vogats SSR Error]:", error);
    return new Response(`Server Error: ${error.message}`, { status: 500 });
  }
}
