import { useState, useEffect, useRef } from 'react'

const themes = [
  { id: 'default', name: '기본', icon: 'default' },
  { id: 'light', name: '라이트', icon: 'light' },
  { id: 'dark', name: '다크', icon: 'dark' }
]

const ThemeSelector = () => {
  const [currentTheme, setCurrentTheme] = useState('default')
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  // 로컬스토리지에서 테마 로드
  useEffect(() => {
    const savedTheme = localStorage.getItem('app-theme') || 'default'
    setCurrentTheme(savedTheme)
    applyTheme(savedTheme)
  }, [])

  // 테마 적용
  const applyTheme = (theme) => {
    if (theme === 'default') {
      document.documentElement.removeAttribute('data-theme')
    } else {
      document.documentElement.setAttribute('data-theme', theme)
    }
  }

  // 테마 변경
  const handleThemeChange = (themeId) => {
    setCurrentTheme(themeId)
    localStorage.setItem('app-theme', themeId)
    applyTheme(themeId)
    setIsOpen(false)
  }

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const currentThemeData = themes.find(theme => theme.id === currentTheme) || themes[0]

  const handleButtonClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    console.log('테마 버튼 클릭됨, 현재 isOpen:', isOpen)
    setIsOpen(!isOpen)
  }

  console.log('ThemeSelector 렌더링됨, currentTheme:', currentTheme, 'isOpen:', isOpen)

  return (
    <div className="theme-selector" ref={dropdownRef}>
      {isOpen && (
        <div className="theme-dropdown">
          {console.log('드롭다운 렌더링됨')}
          {themes.map((theme) => (
            <button
              key={theme.id}
              className={`theme-option ${currentTheme === theme.id ? 'active' : ''}`}
              onClick={() => handleThemeChange(theme.id)}
            >
              <div className={`theme-icon ${theme.icon}`}></div>
              <span>{theme.name}</span>
            </button>
          ))}
        </div>
      )}

      <button
        className="theme-button"
        onClick={handleButtonClick}
        type="button"
      >
        <div className="theme-button-content">
          <div className={`theme-icon ${currentThemeData.icon}`}></div>
          <span>{currentThemeData.name}</span>
        </div>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="currentColor"
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease'
          }}
        >
          <path d="M8 11.5L3 6.5H13L8 11.5Z"/>
        </svg>
      </button>
    </div>
  )
}

export default ThemeSelector