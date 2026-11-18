import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

async function handleProxy(req: NextRequest) {
  // Extract the path after /api/proxy
  const url = req.nextUrl.clone();
  const pathWithSearch = url.pathname.replace(/^\/api\/proxy/, '') + url.search;
  const targetUrl = `${API_BASE}${pathWithSearch}`;

  const headers = new Headers(req.headers);
  headers.delete('host');

  const requestOptions: RequestInit = {
    method: req.method,
    headers,
    redirect: 'manual',
  };

  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) && req.body) {
    requestOptions.body = req.body;
    // Required by Node.js for streams
    (requestOptions as any).duplex = 'half';
  }

  try {
    const backendResponse = await fetch(targetUrl, requestOptions);
    
    const response = new NextResponse(backendResponse.body, {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
    });

    // Copy all headers except set-cookie
    backendResponse.headers.forEach((value, key) => {
      if (key.toLowerCase() !== 'set-cookie') {
        response.headers.set(key, value);
      }
    });

    // Handle Set-Cookie headers properly without concatenation issues
    const setCookies = backendResponse.headers.getSetCookie();
    for (const cookie of setCookies) {
      response.headers.append('Set-Cookie', cookie);
    }

    return response;
  } catch (error) {
    console.error('Proxy Error:', error);
    return new NextResponse(JSON.stringify({ message: 'Internal Proxy Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export const GET = handleProxy;
export const POST = handleProxy;
export const PUT = handleProxy;
export const PATCH = handleProxy;
export const DELETE = handleProxy;
export const OPTIONS = handleProxy;
