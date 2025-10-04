import React from 'react'

const SearchModalFooter: React.FC = () => {
  const keyStyle: React.CSSProperties = {
    display: 'inline-block',
    padding: '2px 6px',
    backgroundColor: '#eaeaea',
    borderRadius: '3px',
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#555',
    border: '1px solid #ccc',
  }
  return (
    <div className="flex items-center gap-4">
      <span className="flex items-center gap-1">
        <kbd style={keyStyle}>↵</kbd>
        <span>选择</span>
      </span>
      <span className="flex items-center gap-1">
        <span>
          <kbd style={keyStyle}>↓</kbd> <kbd style={keyStyle}>↑</kbd>
        </span>
        <span>切换</span>
      </span>
      <span className="flex items-center gap-1">
        <kbd style={keyStyle}>esc</kbd>
        <span>关闭</span>
      </span>
    </div>
  )
}

export default SearchModalFooter
