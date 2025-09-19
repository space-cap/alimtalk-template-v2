import axios from 'axios'

const API_BASE_URL = 'http://3.34.43.149:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
})

export const generateTemplate = async (requestData) => {
  try {
    const response = await api.post('/ai/templates', requestData)
    return response.data
  } catch (error) {
    console.error('API Error:', error)
    throw new Error(error.response?.data?.message || '템플릿 생성에 실패했습니다.')
  }
}

export default api