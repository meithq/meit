import { supabase } from './supabase'
import type { ApiResponse } from '@/types/database'

/**
 * Generic API Client for HTTP requests with authentication
 *
 * Features:
 * - Automatic auth token injection from Supabase session
 * - Type-safe responses with generics
 * - Comprehensive error handling
 * - Consistent response format
 */
export class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl
  }

  /**
   * Get authentication headers from current Supabase session
   */
  private async getAuthHeaders(): Promise<HeadersInit> {
    const { data: { session } } = await supabase.auth.getSession()

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`
    }

    return headers
  }

  /**
   * Handle API response and extract data
   */
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const status = response.status

    try {
      // Try to parse JSON response
      const data = await response.json()

      if (!response.ok) {
        return {
          error: data.error || data.message || 'Request failed',
          status,
        }
      }

      return {
        data: data as T,
        status,
      }
    } catch {
      // Handle non-JSON responses or parsing errors
      if (!response.ok) {
        return {
          error: response.statusText || 'Request failed',
          status,
        }
      }

      return {
        error: 'Failed to parse response',
        status,
      }
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, params?: Record<string, string>): Promise<ApiResponse<T>> {
    try {
      const headers = await this.getAuthHeaders()
      const url = new URL(`${this.baseUrl}${endpoint}`, window.location.origin)

      // Add query parameters
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          url.searchParams.append(key, value)
        })
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers,
      })

      return this.handleResponse<T>(response)
    } catch (error) {
      console.error('API GET error:', error)
      return {
        error: error instanceof Error ? error.message : 'Network error',
        status: 0,
      }
    }
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data: unknown): Promise<ApiResponse<T>> {
    try {
      const headers = await this.getAuthHeaders()
      const url = `${this.baseUrl}${endpoint}`

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      })

      return this.handleResponse<T>(response)
    } catch (error) {
      console.error('API POST error:', error)
      return {
        error: error instanceof Error ? error.message : 'Network error',
        status: 0,
      }
    }
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data: unknown): Promise<ApiResponse<T>> {
    try {
      const headers = await this.getAuthHeaders()
      const url = `${this.baseUrl}${endpoint}`

      const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: JSON.stringify(data),
      })

      return this.handleResponse<T>(response)
    } catch (error) {
      console.error('API PUT error:', error)
      return {
        error: error instanceof Error ? error.message : 'Network error',
        status: 0,
      }
    }
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const headers = await this.getAuthHeaders()
      const url = `${this.baseUrl}${endpoint}`

      const response = await fetch(url, {
        method: 'DELETE',
        headers,
      })

      return this.handleResponse<T>(response)
    } catch (error) {
      console.error('API DELETE error:', error)
      return {
        error: error instanceof Error ? error.message : 'Network error',
        status: 0,
      }
    }
  }
}

// Singleton instance for global use
export const apiClient = new ApiClient()
