import { useState, useRef, useEffect } from 'react'

const ChatPanel = ({ conversation, onSendMessage, isLoading }) => {
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [conversation?.messages])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue.trim())
      setInputValue('')
      textareaRef.current?.focus()
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const formatMessage = (content) => {
    return content.split('\n').map((line, index) => (
      <span key={index}>
        {line}
        {index < content.split('\n').length - 1 && <br />}
      </span>
    ))
  }

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <h2 className="chat-title">
          {conversation?.title || '카카오 알림톡 템플릿 생성기'}
        </h2>
      </div>

      <div className="chat-messages">
        {!conversation?.messages?.length ? (
          <div className="empty-state">
            <div className="empty-state-icon">🚀</div>
            <div className="empty-state-title">템플릿 생성을 시작해보세요</div>
            <div className="empty-state-description">
              카페에서 주문 완료 알림을 보내고 싶어요. 고객명과 주문내용, 픽업시간을 포함해주세요.
            </div>
          </div>
        ) : (
          <>
            {conversation.messages.map((message) => (
              <div
                key={message.id}
                className={`message ${message.type}`}
              >
                {formatMessage(message.content)}
              </div>
            ))}
            {isLoading && (
              <div className="message assistant">
                <div className="loading">
                  템플릿을 생성하고 있습니다...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <div className="chat-input-container">
        <form onSubmit={handleSubmit} className="chat-input-wrapper">
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="어떤 알림톡 템플릿을 만들고 싶으신가요? (예: 카페 주문 완료 알림, 예약 확인 메시지 등)"
            className="chat-input"
            disabled={isLoading}
            rows={1}
            style={{
              height: 'auto',
              minHeight: '56px',
              resize: 'none'
            }}
            onInput={(e) => {
              e.target.style.height = 'auto'
              e.target.style.height = e.target.scrollHeight + 'px'
            }}
          />
          <button
            type="submit"
            className="send-btn"
            disabled={!inputValue.trim() || isLoading}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2.5 10L17.5 2.5L15 10L17.5 17.5L2.5 10Z"/>
            </svg>
          </button>
        </form>
      </div>
    </div>
  )
}

export default ChatPanel