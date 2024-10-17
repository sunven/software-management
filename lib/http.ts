import { toastError } from './utils'

// 定义接口和类型
interface Config {
  baseURL: string
  headers: Record<string, string>
  timeout: number
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

interface RequestConfig extends Partial<Config> {
  method?: HttpMethod
  body?: string
  signal?: AbortSignal
}

// 定义默认配置
const defaultConfig: Config = {
  baseURL: '',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60 * 1000,
}

class HttpClient {
  private config: Config

  constructor(config: Partial<Config> = {}) {
    this.config = { ...defaultConfig, ...config }
  }

  private async request<T>(
    method: HttpMethod,
    url: string,
    data: unknown = null,
    customConfig: Partial<RequestConfig> = {}
  ): Promise<T> {
    console.log('request')
    const fullUrl = this.config.baseURL + url
    const config: RequestConfig = {
      ...this.config,
      ...customConfig,
      method,
      headers: { ...this.config.headers, ...customConfig.headers },
    }

    if (data) {
      debugger
      if (method === 'GET' || method === 'DELETE') {
        console.log('abc', url, config)
        url += '?' + new URLSearchParams(data as Record<string, string>).toString()
      } else {
        config.body = JSON.stringify(data)
      }
    }
    console.log('abc1', url, config)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), config.timeout)

    try {
      const response = await fetch(fullUrl, {
        ...config,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const msg = `HTTP error! status: ${response.status}`
        toastError(msg)
        throw new Error(msg)
      }

      return await response.json()
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          const msg = 'Request timed out'
          toastError(msg)
          throw new Error('Request timed out')
        }
      }
      toastError((error as Error).message)
      throw error
    }
  }

  // get<T>(url: string, params?: Record<string, string | number>, config?: Partial<RequestConfig>): Promise<T> {
  //   return this.request<T>(url, 'GET', params, config)
  // }

  get<T>(url: string, params?: Record<string, string | number>, config?: Partial<RequestConfig>): Promise<T>
  get<T>(args: [string, Record<string, string | number>?, Partial<RequestConfig>?]): Promise<T>
  get<T>(
    urlOrArgs: string | [string, Record<string, string | number>?, Partial<RequestConfig>?],
    params?: Record<string, string | number>,
    config?: Partial<RequestConfig>
  ): Promise<T> {
    console.log('urlOrArgs', urlOrArgs)
    if (Array.isArray(urlOrArgs)) {
      return this.request<T>('GET', ...urlOrArgs)
    }
    return this.request<T>('GET', urlOrArgs, params, config)
  }

  post<T>(url: string, data?: unknown, config?: Partial<RequestConfig>): Promise<T>
  post<T>(args: [string, unknown?, Partial<RequestConfig>?]): Promise<T>
  post<T>(
    urlOrArgs: string | [string, unknown?, Partial<RequestConfig>?],
    data?: unknown,
    config?: Partial<RequestConfig>
  ): Promise<T> {
    if (Array.isArray(urlOrArgs)) {
      return this.request<T>('POST', ...urlOrArgs)
    }
    return this.request<T>('POST', urlOrArgs, data, config)
  }

  put<T>(url: string, data?: unknown, config?: Partial<RequestConfig>): Promise<T>
  put<T>(args: [string, unknown?, Partial<RequestConfig>?]): Promise<T>
  put<T>(
    urlOrArgs: string | [string, unknown?, Partial<RequestConfig>?],
    data?: unknown,
    config?: Partial<RequestConfig>
  ): Promise<T> {
    if (Array.isArray(urlOrArgs)) {
      return this.request<T>('PUT', ...urlOrArgs)
    }
    return this.request<T>('PUT', urlOrArgs, data, config)
  }

  delete<T>(url: string, params?: Record<string, string | number>, config?: Partial<RequestConfig>): Promise<T>
  delete<T>(args: [string, Record<string, string | number>?, Partial<RequestConfig>?]): Promise<T>
  delete<T>(
    urlOrArgs: string | [string, Record<string, string | number>?, Partial<RequestConfig>?],
    params?: Record<string, string | number>,
    config?: Partial<RequestConfig>
  ): Promise<T> {
    if (Array.isArray(urlOrArgs)) {
      return this.request<T>('DELETE', ...urlOrArgs)
    }
    return this.request<T>('DELETE', urlOrArgs, params, config)
  }
}

// 创建实例
export const http = new HttpClient({})
