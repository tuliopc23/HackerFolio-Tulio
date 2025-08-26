import type { Context } from 'elysia'
import { z } from 'zod'

// Standard API error response format
export interface ApiErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: unknown
    timestamp: string
  }
}

// Standard API success response format
export interface ApiSuccessResponse<T = unknown> {
  success: true
  data: T
  timestamp: string
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse

// Error codes enum for consistency
export enum ApiErrorCode {
  // Validation errors (400)
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  MISSING_PARAMETER = 'MISSING_PARAMETER',
  INVALID_INPUT = 'INVALID_INPUT',

  // Authentication/Authorization errors (401/403)
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',

  // Not found errors (404)
  NOT_FOUND = 'NOT_FOUND',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',

  // Server errors (500)
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_API_ERROR = 'EXTERNAL_API_ERROR',

  // Business logic errors (422)
  BUSINESS_LOGIC_ERROR = 'BUSINESS_LOGIC_ERROR',
}

// Standard error class
export class ApiError extends Error {
  constructor(
    public code: ApiErrorCode,
    message: string,
    public statusCode = 500,
    public details?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// Common error creators
export const createValidationError = (message: string, details?: unknown) =>
  new ApiError(ApiErrorCode.VALIDATION_ERROR, message, 400, details)

export const createNotFoundError = (resource: string) =>
  new ApiError(ApiErrorCode.NOT_FOUND, `${resource} not found`, 404)

export const createMissingParameterError = (parameter: string) =>
  new ApiError(ApiErrorCode.MISSING_PARAMETER, `Missing required parameter: ${parameter}`, 400)

export const createDatabaseError = (message: string, details?: unknown) =>
  new ApiError(ApiErrorCode.DATABASE_ERROR, message, 500, details)

export const createExternalApiError = (service: string, message: string, details?: unknown) =>
  new ApiError(ApiErrorCode.EXTERNAL_API_ERROR, `${service} error: ${message}`, 502, details)

// Helper function to create success response
export function createSuccessResponse<T>(data: T): ApiSuccessResponse<T> {
  return {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  }
}

// Helper function to create error response
export function createErrorResponse(error: ApiError): ApiErrorResponse {
  return {
    success: false,
    error: {
      code: error.code,
      message: error.message,
      details: error.details,
      timestamp: new Date().toISOString(),
    },
  }
}

// Error handler middleware for Elysia
export function handleApiError(error: unknown): Response {
  console.error('API Error:', error)

  if (error instanceof ApiError) {
    const errorResponse = createErrorResponse(error)
    return new Response(JSON.stringify(errorResponse), {
      status: error.statusCode,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Handle Zod validation errors
  if (error instanceof z.ZodError) {
    const validationError = new ApiError(
      ApiErrorCode.VALIDATION_ERROR,
      'Validation failed',
      400,
      error.issues
    )
    const errorResponse = createErrorResponse(validationError)
    return new Response(JSON.stringify(errorResponse), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Handle generic errors
  const genericError = new ApiError(
    ApiErrorCode.INTERNAL_ERROR,
    error instanceof Error ? error.message : 'An unexpected error occurred',
    500
  )
  const errorResponse = createErrorResponse(genericError)
  return new Response(JSON.stringify(errorResponse), {
    status: 500,
    headers: { 'Content-Type': 'application/json' },
  })
}

// Async error wrapper
export function asyncHandler<T extends unknown[], R>(
  fn: (...args: T) => Promise<R>
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args)
    } catch (error) {
      throw error instanceof ApiError
        ? error
        : new ApiError(
            ApiErrorCode.INTERNAL_ERROR,
            error instanceof Error ? error.message : 'Unknown error',
            500
          )
    }
  }
}

// Enhanced validation helpers that throw standardized errors
export function validateApiQuery<T>(schema: z.ZodType<T>, context: Context): T {
  try {
    return schema.parse(context.query)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createValidationError('Query validation failed', error.issues)
    }
    throw error
  }
}

export function validateApiBody<T>(schema: z.ZodType<T>, context: Context): T {
  try {
    return schema.parse(context.body)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createValidationError('Request body validation failed', error.issues)
    }
    throw error
  }
}

export function validateApiData<T>(schema: z.ZodType<T>, data: unknown, context?: string): T {
  try {
    return schema.parse(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createValidationError(
        context ? `${context} validation failed` : 'Data validation failed',
        error.issues
      )
    }
    throw error
  }
}

// Terminal-specific error response format (for backward compatibility)
export interface TerminalErrorResponse {
  output: string
  error: true
  timestamp?: string
}

export function createTerminalError(message: string): TerminalErrorResponse {
  return {
    output: message,
    error: true,
    timestamp: new Date().toISOString(),
  }
}

export function createTerminalSuccess(output: string): { output: string; error?: false } {
  return {
    output,
    error: false,
  }
}
