import { useState, useEffect } from 'react'

const TemplatePanel = ({ template }) => {
  const [variableValues, setVariableValues] = useState({})
  const [previewContent, setPreviewContent] = useState('')

  useEffect(() => {
    if (template?.variables) {
      const initialValues = {}
      template.variables.forEach(variable => {
        initialValues[variable.variableKey] = ''
      })
      setVariableValues(initialValues)
    }
  }, [template])

  useEffect(() => {
    if (template?.content) {
      let content = template.content
      Object.entries(variableValues).forEach(([key, value]) => {
        const placeholder = `#{${key}}`
        content = content.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value || placeholder)
      })
      setPreviewContent(content)
    }
  }, [template, variableValues])

  const handleVariableChange = (variableKey, value) => {
    setVariableValues(prev => ({
      ...prev,
      [variableKey]: value
    }))
  }

  const formatContent = (content) => {
    return content.split('\n').map((line, index) => (
      <span key={index}>
        {line}
        {index < content.split('\n').length - 1 && <br />}
      </span>
    ))
  }

  if (!template) {
    return (
      <div className="template-panel">
        <div className="empty-state">
          <div className="empty-state-icon">📱</div>
          <div className="empty-state-title">템플릿 미리보기</div>
          <div className="empty-state-description">
            메시지를 보내면 생성된 템플릿을<br />
            여기서 확인할 수 있습니다.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="template-panel">
      <div className="template-header">
        <h2 className="template-title">{template.title}</h2>
        <div className="template-subtitle">
          템플릿 ID: {template.categoryId}
        </div>
      </div>

      <div className="template-content">
        <div className="template-preview">
          <div className="template-preview-title">📱 미리보기</div>
          <div className="template-preview-content">
            {formatContent(previewContent)}
          </div>

          {template.buttons && template.buttons.length > 0 && (
            <div className="template-buttons">
              {template.buttons.map((button) => (
                <a
                  key={button.id}
                  href={button.linkPc}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="template-button"
                >
                  {button.name}
                </a>
              ))}
            </div>
          )}
        </div>

        {template.variables && template.variables.length > 0 && (
          <div className="template-variables">
            <div className="template-variables-title">🏷️ 변수 설정</div>
            {template.variables.map((variable) => (
              <div key={variable.id} className="variable-item">
                <label className="variable-label">
                  {variable.variableKey}
                </label>
                <input
                  type="text"
                  className="variable-input"
                  placeholder={variable.placeholder}
                  value={variableValues[variable.variableKey] || ''}
                  onChange={(e) => handleVariableChange(variable.variableKey, e.target.value)}
                />
              </div>
            ))}
          </div>
        )}

        {template.industry && template.industry.length > 0 && (
          <div className="template-info">
            <div className="template-info-title">🏢 업종</div>
            <div className="template-info-content">
              {template.industry.map(ind => ind.name).join(', ')}
            </div>
          </div>
        )}

        {template.purpose && template.purpose.length > 0 && (
          <div className="template-info">
            <div className="template-info-title">🎯 용도</div>
            <div className="template-info-content">
              {template.purpose.map(purpose => purpose.name).join(', ')}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TemplatePanel