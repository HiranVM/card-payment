import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { transactionId } = body;

    // Simulate network latency (2 seconds)
    // For 15% of requests, simulate an 8-second delay to test timeout
    const rand = Math.random();
    let delay = 2000;
    
    if (rand < 0.15) {
      delay = 8000; // Timeout trigger
    }
    
    await new Promise(resolve => setTimeout(resolve, delay));

    // After delay, evaluate success/failure
    // 60% success, 25% failure (reasons), 15% was already delayed above
    
    if (rand < 0.15) {
      // It was an 8s delay, but if the client waited, return a generic error
      return NextResponse.json(
        { success: false, reason: 'Gateway Timeout', transactionId },
        { status: 504 }
      );
    } else if (rand < 0.40) {
      // 25% Failure
      const failureReasons = [
        'Insufficient funds',
        'Bank declined transaction',
        'Card expired',
        'Invalid CVV'
      ];
      const reason = failureReasons[Math.floor(Math.random() * failureReasons.length)];
      return NextResponse.json(
        { success: false, reason, transactionId },
        { status: 400 }
      );
    }

    // 60% Success
    return NextResponse.json({
      success: true,
      transactionId,
      message: 'Payment processed successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, reason: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
