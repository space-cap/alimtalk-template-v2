import { useState } from 'react'

const Sidebar = ({
  conversations,
  activeConversation,
  onSelectConversation,
  onNewConversation
}) => {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <span className="sidebar-title">알림톡 템플릿 생성기</span>
        <button
          className="new-chat-btn"
          onClick={onNewConversation}
          title="새 대화"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2Z"/>
          </svg>
        </button>
      </div>

      <div className="conversation-list">
        {conversations.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">💬</div>
            <div className="empty-state-title">대화가 없습니다</div>
            <div className="empty-state-description">
              새 대화를 시작해보세요
            </div>
          </div>
        ) : (
          conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`conversation-item ${
                activeConversation?.id === conversation.id ? 'active' : ''
              }`}
              onClick={() => onSelectConversation(conversation)}
            >
              {conversation.title}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Sidebar