// src/app/api/ably-token/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Ably from 'ably';

export async function GET(request: NextRequest) {
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

    return new Promise((resolve, reject) => {
      const tokenParams: Ably.TokenParams = {
        clientId,
        capability: {
          '*': ['*']
        }
      };

      // Use the promisified version of createTokenRequest
      client.auth.createTokenRequest(tokenParams)
        .then(tokenRequest => {
          resolve(NextResponse.json(tokenRequest));
        })
        .catch(err => {
          reject(err);
        });
    });
  } catch (error) {
    console.error('Error creating Ably token request:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}