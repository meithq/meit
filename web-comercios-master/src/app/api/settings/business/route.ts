import { NextRequest, NextResponse } from 'next/server';
import { businessProfileSchema } from '@meit/shared/validators/settings';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validatedData = businessProfileSchema.parse(body);

    // TODO: Get current user from session
    // TODO: Update merchant in Supabase
    // For now, just log and return success

    console.log('Updating business profile:', validatedData);

    // Simulate database operation
    await new Promise((resolve) => setTimeout(resolve, 500));

    return NextResponse.json({
      success: true,
      message: 'Business profile updated successfully',
    });
  } catch (error) {
    console.error('Error updating business profile:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
