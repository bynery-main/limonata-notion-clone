import { NextRequest, NextResponse } from 'next/server';
import Ably from 'ably';

export async function GET(request: NextRequest): Promise<Response> {
  if (!process.env.ABLY_API_KEY) {
    return NextResponse.json(
      { error: 'Ably API key not configured' },
      { status: 500 }
    );
  }

  try {
    const client = new Ably.Rest({
      key: process.env.ABLY_API_KEY
    });

    const url = new URL(request.url);
    const clientId = url.searchParams.get('clientId') || 'anonymous';

    const tokenParams: Ably.TokenParams = {
      clientId,
      capability: {
        '*': ['*']
      }
    };

    const tokenRequest = await client.auth.createTokenRequest(tokenParams);
    const response = NextResponse.json(tokenRequest);
    
    response.headers.set('Access-Control-Allow-Origin', 'https://limonata.app');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return response;
    
  } catch (error) {
    console.error('Error creating Ably token request:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
