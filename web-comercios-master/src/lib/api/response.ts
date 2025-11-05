import { NextResponse } from 'next/server';

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status }
  );
}

export function errorResponse(message: string, status = 500, details?: unknown) {
  const error: { message: string; details?: unknown } = { message };
  if (details) {
    error.details = details;
  }

  return NextResponse.json(
    {
      success: false,
      error,
    },
    { status }
  );
}

export function validationErrorResponse(errors: Record<string, string[]>) {
  return NextResponse.json(
    {
      success: false,
      error: {
        message: 'Validation failed',
        validation_errors: errors,
      },
    },
    { status: 400 }
  );
}

export function unauthorizedResponse(message = 'Unauthorized') {
  return errorResponse(message, 401);
}

export function forbiddenResponse(message = 'Forbidden') {
  return errorResponse(message, 403);
}

export function notFoundResponse(message = 'Not found') {
  return errorResponse(message, 404);
}
