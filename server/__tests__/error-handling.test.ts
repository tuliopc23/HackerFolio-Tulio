// vitest globals are available - no import needed

import {
  ApiError,
  ApiErrorCode,
  createSuccessResponse,
  createErrorResponse,
  createValidationError,
  createNotFoundError,
  createMissingParameterError,
  createDatabaseError,
  createExternalApiError,
  createTerminalError,
  createTerminalSuccess,
  handleApiError,
} from '../lib/error-handling'

describe('Error Handling System', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('ApiError', () => {
    test('creates error with correct properties', () => {
      const error = new ApiError(ApiErrorCode.VALIDATION_ERROR, 'Test error message', 400, {
        field: 'test',
      })

      expect(error.code).toBe(ApiErrorCode.VALIDATION_ERROR)
      expect(error.message).toBe('Test error message')
      expect(error.statusCode).toBe(400)
      expect(error.details).toEqual({ field: 'test' })
      expect(error.name).toBe('ApiError')
    })

    test('defaults to 500 status code', () => {
      const error = new ApiError(ApiErrorCode.INTERNAL_ERROR, 'Test error')
      expect(error.statusCode).toBe(500)
    })
  })

  describe('Success Response Creation', () => {
    test('creates success response with correct format', () => {
      const data = { id: 1, name: 'Test' }
      const response = createSuccessResponse(data)

      expect(response.success).toBe(true)
      expect(response.data).toEqual(data)
      expect(response.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
    })
  })

  describe('Error Response Creation', () => {
    test('creates error response with correct format', () => {
      const error = new ApiError(ApiErrorCode.NOT_FOUND, 'Resource not found', 404, {
        resource: 'user',
      })
      const response = createErrorResponse(error)

      expect(response.success).toBe(false)
      expect(response.error.code).toBe(ApiErrorCode.NOT_FOUND)
      expect(response.error.message).toBe('Resource not found')
      expect(response.error.details).toEqual({ resource: 'user' })
      expect(response.error.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
    })
  })

  describe('Error Creators', () => {
    test('createValidationError creates correct error', () => {
      const error = createValidationError('Invalid input', { field: 'email' })

      expect(error.code).toBe(ApiErrorCode.VALIDATION_ERROR)
      expect(error.message).toBe('Invalid input')
      expect(error.statusCode).toBe(400)
      expect(error.details).toEqual({ field: 'email' })
    })

    test('createNotFoundError creates correct error', () => {
      const error = createNotFoundError('User')

      expect(error.code).toBe(ApiErrorCode.NOT_FOUND)
      expect(error.message).toBe('User not found')
      expect(error.statusCode).toBe(404)
    })

    test('createMissingParameterError creates correct error', () => {
      const error = createMissingParameterError('id')

      expect(error.code).toBe(ApiErrorCode.MISSING_PARAMETER)
      expect(error.message).toBe('Missing required parameter: id')
      expect(error.statusCode).toBe(400)
    })

    test('createDatabaseError creates correct error', () => {
      const error = createDatabaseError('Connection failed', { timeout: true })

      expect(error.code).toBe(ApiErrorCode.DATABASE_ERROR)
      expect(error.message).toBe('Connection failed')
      expect(error.statusCode).toBe(500)
      expect(error.details).toEqual({ timeout: true })
    })

    test('createExternalApiError creates correct error', () => {
      const error = createExternalApiError('GitHub', 'Rate limit exceeded', { limit: 5000 })

      expect(error.code).toBe(ApiErrorCode.EXTERNAL_API_ERROR)
      expect(error.message).toBe('GitHub error: Rate limit exceeded')
      expect(error.statusCode).toBe(502)
      expect(error.details).toEqual({ limit: 5000 })
    })
  })

  describe('Terminal Error Handling', () => {
    test('createTerminalError creates correct format', () => {
      const error = createTerminalError('Command failed')

      expect(error.output).toBe('Command failed')
      expect(error.error).toBe(true)
      expect(error.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
    })

    test('createTerminalSuccess creates correct format', () => {
      const success = createTerminalSuccess('Command executed')

      expect(success.output).toBe('Command executed')
      expect(success.error).toBe(false)
    })
  })

  describe('handleApiError', () => {
    let consoleSpy: any

    beforeEach(() => {
      consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterEach(() => {
      consoleSpy.mockRestore()
    })

    test('handles ApiError correctly', () => {
      const error = new ApiError(ApiErrorCode.VALIDATION_ERROR, 'Invalid data', 400)
      const response = handleApiError(error)

      expect(response.status).toBe(400)
      expect(response.headers.get('Content-Type')).toBe('application/json')
    })

    test('handles generic Error', () => {
      const error = new Error('Something went wrong')
      const response = handleApiError(error)

      expect(response.status).toBe(500)
      expect(response.headers.get('Content-Type')).toBe('application/json')
    })

    test('handles unknown error types', () => {
      const error = 'string error'
      const response = handleApiError(error)

      expect(response.status).toBe(500)
      expect(response.headers.get('Content-Type')).toBe('application/json')
    })

    test('logs errors to console', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const error = new Error('Test error')

      handleApiError(error)

      expect(consoleSpy).toHaveBeenCalledWith('API Error:', error)
      consoleSpy.mockRestore()
    })
  })

  describe('API Error Codes', () => {
    test('contains all expected error codes', () => {
      expect(ApiErrorCode.VALIDATION_ERROR).toBe('VALIDATION_ERROR')
      expect(ApiErrorCode.MISSING_PARAMETER).toBe('MISSING_PARAMETER')
      expect(ApiErrorCode.INVALID_INPUT).toBe('INVALID_INPUT')
      expect(ApiErrorCode.UNAUTHORIZED).toBe('UNAUTHORIZED')
      expect(ApiErrorCode.FORBIDDEN).toBe('FORBIDDEN')
      expect(ApiErrorCode.NOT_FOUND).toBe('NOT_FOUND')
      expect(ApiErrorCode.RESOURCE_NOT_FOUND).toBe('RESOURCE_NOT_FOUND')
      expect(ApiErrorCode.INTERNAL_ERROR).toBe('INTERNAL_ERROR')
      expect(ApiErrorCode.DATABASE_ERROR).toBe('DATABASE_ERROR')
      expect(ApiErrorCode.EXTERNAL_API_ERROR).toBe('EXTERNAL_API_ERROR')
      expect(ApiErrorCode.BUSINESS_LOGIC_ERROR).toBe('BUSINESS_LOGIC_ERROR')
    })
  })

  describe('Response Type Safety', () => {
    test('success response has correct TypeScript types', () => {
      interface TestData {
        id: number
        name: string
      }

      const data: TestData = { id: 1, name: 'Test' }
      const response = createSuccessResponse(data)

      // TypeScript should infer the correct type
      expect(response.data.id).toBe(1)
      expect(response.data.name).toBe('Test')
    })

    test('error response maintains consistent structure', () => {
      const error = createValidationError('Test error')
      const response = createErrorResponse(error)

      // All error responses should have the same structure
      expect(typeof response.success).toBe('boolean')
      expect(typeof response.error.code).toBe('string')
      expect(typeof response.error.message).toBe('string')
      expect(typeof response.error.timestamp).toBe('string')
      expect(response.success).toBe(false)
    })
  })
})
