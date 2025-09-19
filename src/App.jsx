import { useState, useRef, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import ChatPanel from './components/ChatPanel'
import TemplatePanel from './components/TemplatePanel'
import { generateTemplate } from './services/api'

function App() {
  const [conversations, setConversations] = useState([])
  const [activeConversation, setActiveConversation] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [currentTemplate, setCurrentTemplate] = useState(null)

  const createNewConversation = () => {
    const newConversation = {
      id: Date.now(),
      title: '새 대화',
      messages: [],
      template: null
    }
    setConversations(prev => [newConversation, ...prev])
    setActiveConversation(newConversation)
    setCurrentTemplate(null)
  }

  const updateConversationTitle = (conversationId, title) => {
    setConversations(prev =>
      prev.map(conv =>
        conv.id === conversationId
          ? { ...conv, title: title.slice(0, 30) + (title.length > 30 ? '...' : '') }
          : conv
      )
    )
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

    setActiveConversation(updatedConversation)
    setConversations(prev =>
      prev.map(conv => conv.id === activeConversation.id ? updatedConversation : conv)
    )

    // Update title if first message
    if (activeConversation.messages.length === 0) {
      updateConversationTitle(activeConversation.id, message)
    }

    setIsLoading(true)

    try {
      const template = await generateTemplate({
        userId: 123,
        requestContent: message,
        conversationContext: activeConversation.messages.length > 0
          ? activeConversation.messages.map(m => m.content).join('\n')
          : 'hi'
      })

      const assistantMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: `템플릿을 생성했습니다. 오른쪽 패널에서 확인하세요.`,
        timestamp: new Date()
      }

      const finalConversation = {
        ...updatedConversation,
        messages: [...updatedConversation.messages, assistantMessage],
        template: template
      }

      setActiveConversation(finalConversation)
      setConversations(prev =>
        prev.map(conv => conv.id === activeConversation.id ? finalConversation : conv)
      )
      setCurrentTemplate(template)

    } catch (error) {
      console.error('Template generation failed:', error)

      const errorMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: '죄송합니다. 템플릿 생성 중 오류가 발생했습니다. 다시 시도해주세요.',
        timestamp: new Date()
      }

      const errorConversation = {
        ...updatedConversation,
        messages: [...updatedConversation.messages, errorMessage]
      }

      setActiveConversation(errorConversation)
      setConversations(prev =>
        prev.map(conv => conv.id === activeConversation.id ? errorConversation : conv)
      )
    } finally {
      setIsLoading(false)
    }
  }

  const selectConversation = (conversation) => {
    setActiveConversation(conversation)
    setCurrentTemplate(conversation.template)
  }

  // Initialize with first conversation
  useEffect(() => {
    if (conversations.length === 0) {
      createNewConversation()
    }
  }, [])

  return (
    <div className="app">
      <Sidebar
        conversations={conversations}
        activeConversation={activeConversation}
        onSelectConversation={selectConversation}
        onNewConversation={createNewConversation}
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