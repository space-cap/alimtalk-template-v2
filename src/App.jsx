import { useState, useRef, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import ChatPanel from './components/ChatPanel'
import TemplatePanel from './components/TemplatePanel'
import { generateTemplate } from './services/api'

const STORAGE_KEY = 'alimtalk_conversations'
const MAX_CONVERSATIONS = 10

function App() {
  const [conversations, setConversations] = useState([])
  const [activeConversation, setActiveConversation] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [currentTemplate, setCurrentTemplate] = useState(null)

  // 로컬스토리지에서 대화 히스토리 불러오기
  const loadConversations = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        // Date 객체 복원 및 데이터 검증
        const restored = parsed.map(conv => ({
          ...conv,
          messages: (conv.messages || []).map(msg => ({
            ...msg,
            timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date()
          })),
          createdAt: conv.createdAt ? new Date(conv.createdAt) : new Date()
        }))
        return restored
      }
    } catch (error) {
      console.error('대화 히스토리 로드 실패:', error)
    }
    return []
  }

  // 로컬스토리지에 대화 히스토리 저장
  const saveConversations = (convs) => {
    try {
      // 최대 개수 제한
      const limited = convs.slice(0, MAX_CONVERSATIONS)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(limited))
    } catch (error) {
      console.error('대화 히스토리 저장 실패:', error)
    }
  }

  const createNewConversation = () => {
    const newConversation = {
      id: Date.now(),
      title: '새 대화',
      messages: [],
      template: null,
      createdAt: new Date()
    }
    setConversations(prev => {
      const updated = [newConversation, ...prev].slice(0, MAX_CONVERSATIONS)
      saveConversations(updated)
      return updated
    })
    setActiveConversation(newConversation)
    setCurrentTemplate(null)
  }

  const deleteConversation = (conversationId) => {
    setConversations(prev => {
      const updated = prev.filter(conv => conv.id !== conversationId)
      saveConversations(updated)
      return updated
    })

    // 삭제된 대화가 현재 활성 대화인 경우 처리
    if (activeConversation?.id === conversationId) {
      setActiveConversation(null)
      setCurrentTemplate(null)
    }
  }

  const updateConversationTitle = (conversationId, title) => {
    const newTitle = title.slice(0, 30) + (title.length > 30 ? '...' : '')

    setConversations(prev => {
      const updated = prev.map(conv =>
        conv.id === conversationId
          ? { ...conv, title: newTitle }
          : conv
      )
      saveConversations(updated)
      return updated
    })

    // 활성 대화의 제목도 업데이트
    if (activeConversation?.id === conversationId) {
      setActiveConversation(prev => ({
        ...prev,
        title: newTitle
      }))
    }
  }

  const sendMessage = async (message) => {
    if (!activeConversation || !message.trim()) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: message,
      timestamp: new Date()
    }

    // Update conversation with user message
    const updatedConversation = {
      ...activeConversation,
      messages: [...activeConversation.messages, userMessage]
    }

    // Update title if first message
    let conversationWithTitle = updatedConversation
    if (activeConversation.messages.length === 0) {
      console.log('첫 메시지로 제목 업데이트:', message)
      const newTitle = message.slice(0, 30) + (message.length > 30 ? '...' : '')
      conversationWithTitle = {
        ...updatedConversation,
        title: newTitle
      }
    }

    setActiveConversation(conversationWithTitle)
    setConversations(prev => {
      const updated = prev.map(conv => conv.id === activeConversation.id ? conversationWithTitle : conv)
      saveConversations(updated)
      return updated
    })

    console.log('⏳ 로딩 상태 시작')
    setIsLoading(true)

    try {
      const requestPayload = {
        userId: 123,
        requestContent: message,
        conversationContext: activeConversation.messages.length > 0
          ? activeConversation.messages.map(m => m.content).join('\n')
          : 'hi'
      }

      console.log('🎯 템플릿 생성 요청 시작')
      console.log('👤 사용자 메시지:', message)
      console.log('📋 대화 컨텍스트:', requestPayload.conversationContext)
      console.log('📦 전체 요청 데이터:', requestPayload)

      const template = await generateTemplate(requestPayload)

      console.log('🎉 템플릿 생성 성공!')
      console.log('📋 생성된 템플릿 ID:', template.id)
      console.log('📝 템플릿 제목:', template.title)
      console.log('📄 템플릿 내용 미리보기:', template.content.substring(0, 50) + '...')
      console.log('🏷️ 변수 개수:', template.variables?.length || 0)
      console.log('🔘 버튼 개수:', template.buttons?.length || 0)

      const assistantMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: `템플릿을 생성했습니다. 오른쪽 패널에서 확인하세요.`,
        timestamp: new Date()
      }

      const finalConversation = {
        ...conversationWithTitle,
        messages: [...conversationWithTitle.messages, assistantMessage],
        template: template
      }

      console.log('💾 대화 상태 업데이트 중...')
      setActiveConversation(finalConversation)
      setConversations(prev => {
        const updated = prev.map(conv => conv.id === activeConversation.id ? finalConversation : conv)
        saveConversations(updated)
        return updated
      })
      setCurrentTemplate(template)
      console.log('✅ 모든 상태 업데이트 완료')

    } catch (error) {
      console.log('💥 템플릿 생성 실패!')
      console.error('❌ Error Details:', error)
      console.log('📤 실패한 요청:', message)

      const errorMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: '죄송합니다. 템플릿 생성 중 오류가 발생했습니다. 다시 시도해주세요.',
        timestamp: new Date()
      }

      const errorConversation = {
        ...conversationWithTitle,
        messages: [...conversationWithTitle.messages, errorMessage]
      }

      console.log('🔄 에러 상태로 대화 업데이트 중...')
      setActiveConversation(errorConversation)
      setConversations(prev => {
        const updated = prev.map(conv => conv.id === activeConversation.id ? errorConversation : conv)
        saveConversations(updated)
        return updated
      })
      console.log('❌ 에러 상태 업데이트 완료')
    } finally {
      console.log('⏹️ 로딩 상태 종료')
      setIsLoading(false)
    }
  }

  const selectConversation = (conversation) => {
    setActiveConversation(conversation)
    setCurrentTemplate(conversation.template)
  }

  // 초기화: 로컬스토리지에서 대화 히스토리 로드
  useEffect(() => {
    const savedConversations = loadConversations()
    if (savedConversations.length > 0) {
      setConversations(savedConversations)
      // 가장 최근 대화를 활성 대화로 설정
      setActiveConversation(savedConversations[0])
      setCurrentTemplate(savedConversations[0].template)
    } else {
      // 저장된 대화가 없으면 새 대화 생성
      const newConversation = {
        id: Date.now(),
        title: '새 대화',
        messages: [],
        template: null,
        createdAt: new Date()
      }
      setConversations([newConversation])
      setActiveConversation(newConversation)
      setCurrentTemplate(null)
      saveConversations([newConversation])
    }
  }, [])

  return (
    <div className="app">
      <Sidebar
        conversations={conversations}
        activeConversation={activeConversation}
        onSelectConversation={selectConversation}
        onNewConversation={createNewConversation}
        onDeleteConversation={deleteConversation}
      />
      <div className="main-content">
        <ChatPanel
          conversation={activeConversation}
          onSendMessage={sendMessage}
          isLoading={isLoading}
        />
        <TemplatePanel
          template={currentTemplate}
        />
      </div>
    </div>
  )
}

export default App