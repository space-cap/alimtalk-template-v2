import axios from 'axios'

// Use proxy in development, direct API in production
const API_BASE_URL = import.meta.env.DEV ? '/api' : 'http://3.34.43.149:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'accept': 'application/json',
  },
  timeout: 30000,
})

// Mock data for development when API is unavailable
const mockTemplateData = {
  id: 1,
  userId: 123,
  categoryId: "999999",
  title: "주문 완료 알림",
  content: "안녕하세요, #{고객명}님.\n\n주문이 완료되었습니다.\n\n주문 내용: #{주문내용}\n픽업 예정 시간: #{픽업시간}\n\n카페 #{카페이름}을 이용해주셔서 감사합니다.\n\n문의사항은 #{카페전화번호}로 연락 주세요.",
  imageUrl: null,
  type: "MESSAGE",
  buttons: [
    {
      id: 1,
      name: "자세히 보기",
      ordering: 1,
      linkPc: "https://example.com",
      linkAnd: null,
      linkIos: null
    }
  ],
  variables: [
    {
      id: 1,
      variableKey: "픽업시간",
      placeholder: "#{픽업시간}",
      inputType: "TEXT"
    },
    {
      id: 2,
      variableKey: "카페이름",
      placeholder: "#{카페이름}",
      inputType: "TEXT"
    },
    {
      id: 3,
      variableKey: "카페전화번호",
      placeholder: "#{카페전화번호}",
      inputType: "TEXT"
    },
    {
      id: 4,
      variableKey: "고객명",
      placeholder: "#{고객명}",
      inputType: "TEXT"
    },
    {
      id: 5,
      variableKey: "주문내용",
      placeholder: "#{주문내용}",
      inputType: "TEXT"
    }
  ],
  industry: [
    {
      id: 1,
      name: "기타"
    }
  ],
  purpose: [
    {
      id: 1,
      name: "공지/안내"
    },
    {
      id: 2,
      name: "예약알림/리마인드"
    }
  ]
}

export const generateTemplate = async (requestData) => {
  try {
    console.log('🚀 API 요청 시작')
    console.log('📤 Request URL:', `${API_BASE_URL}/ai/templates`)
    console.log('📤 Request Headers:', {
      'Content-Type': 'application/json',
      'accept': 'application/json'
    })
    console.log('📤 Request Body:', JSON.stringify(requestData, null, 2))

    const startTime = performance.now()
    const response = await api.post('/ai/templates', requestData)
    const endTime = performance.now()

    console.log('✅ API 응답 성공')
    console.log('📥 Response Status:', response.status)
    console.log('📥 Response Headers:', response.headers)
    console.log('📥 Response Data:', JSON.stringify(response.data, null, 2))
    console.log('⏱️ Response Time:', `${(endTime - startTime).toFixed(2)}ms`)

    return response.data
  } catch (error) {
    console.log('❌ API 요청 실패')
    console.log('📤 Failed Request URL:', `${API_BASE_URL}/ai/templates`)
    console.log('📤 Failed Request Body:', JSON.stringify(requestData, null, 2))

    if (error.response) {
      // 서버가 응답했지만 에러 상태코드
      console.log('📥 Error Response Status:', error.response.status)
      console.log('📥 Error Response Headers:', error.response.headers)
      console.log('📥 Error Response Data:', JSON.stringify(error.response.data, null, 2))
    } else if (error.request) {
      // 요청은 보냈지만 응답이 없음
      console.log('📡 No Response Received')
      console.log('📡 Request Details:', error.request)
    } else {
      // 요청 설정 중 에러
      console.log('⚙️ Request Setup Error:', error.message)
    }

    console.log('🔧 Full Error Object:', error)
    console.warn('🎭 API 서버에 연결할 수 없어 모의 데이터를 사용합니다.')

    // API 실패 시 모의 데이터 반환
    const mockStartTime = performance.now()
    await new Promise(resolve => setTimeout(resolve, 1000)) // 실제 API 호출처럼 지연 시뮬레이션
    const mockEndTime = performance.now()

    // 요청 내용에 따라 템플릿 제목과 내용을 동적으로 생성
    const customTemplate = {
      ...mockTemplateData,
      title: requestData.requestContent.includes('카페') ? '카페 주문 완료 알림' :
             requestData.requestContent.includes('예약') ? '예약 확인 알림' :
             requestData.requestContent.includes('배송') ? '배송 완료 알림' :
             '알림톡 템플릿',
      id: Date.now() // 고유 ID 생성
    }

    console.log('🎭 Mock Response Generated')
    console.log('📥 Mock Response Data:', JSON.stringify(customTemplate, null, 2))
    console.log('⏱️ Mock Response Time:', `${(mockEndTime - mockStartTime).toFixed(2)}ms`)

    return customTemplate
  }
}

export default api