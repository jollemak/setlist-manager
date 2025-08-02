import { useState, useEffect } from 'react'

const LyricsModal = ({ song, songs, isOpen, onClose, onEdit, onDelete, onNavigate, onSave, startInEditMode }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isEditing, setIsEditing] = useState(false)
  const [editedTitle, setEditedTitle] = useState('')
  const [editedLyrics, setEditedLyrics] = useState('')
  const [fontSize, setFontSize] = useState(16)
  const [textAlign, setTextAlign] = useState('left')
  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)
  const [textCase, setTextCase] = useState('normal') // 'normal', 'uppercase', 'lowercase', 'title'

  // Find current song index when modal opens or song changes
  useEffect(() => {
    if (song && songs.length > 0) {
      const index = songs.findIndex(s => s.id === song.id)
      setCurrentIndex(index >= 0 ? index : 0)
      // Only update the edited fields if we're not currently editing
      // This prevents overwriting user changes during editing
      if (!isEditing) {
        setEditedTitle(song.title || '')
        setEditedLyrics(song.lyrics || '')
      }
    }
  }, [song, songs, isEditing])

  // Handle startInEditMode prop separately - only when explicitly set
  useEffect(() => {
    if (startInEditMode && song && !isEditing) {
      setIsEditing(true)
      setEditedTitle(song.title || '')
      setEditedLyrics(song.lyrics || '')
      // Reset the startInEditMode after using it (this should be handled by parent)
    }
  }, [startInEditMode, song, isEditing])

  // Reset edit mode when modal closes or when navigating without startInEditMode
  useEffect(() => {
    if (!isOpen) {
      setIsEditing(false)
    }
  }, [isOpen])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!isOpen) return

      // Don't handle navigation when editing and focus is on input fields
      if (isEditing && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) {
        // Only handle Escape to cancel editing
        if (e.key === 'Escape') {
          e.preventDefault()
          cancelEdit()
        }
        return
      }

      switch (e.key) {
        case 'Escape':
          if (isEditing) {
            cancelEdit()
          } else {
            onClose()
          }
          break
        case 'ArrowLeft':
        case 'ArrowUp':
          if (!isEditing) {
            e.preventDefault()
            navigateToPrevious()
          }
          break
        case 'ArrowRight':
        case 'ArrowDown':
          if (!isEditing) {
            e.preventDefault()
            navigateToNext()
          }
        case 'e':
        case 'E':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            toggleEdit()
          }
          break
        case 's':
        case 'S':
          if ((e.ctrlKey || e.metaKey) && isEditing) {
            e.preventDefault()
            saveEdit()
          }
          break
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyPress)
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyPress)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, currentIndex, songs.length])

  const navigateToNext = () => {
    if (songs.length === 0) return
    setIsEditing(false) // Exit edit mode when navigating
    const nextIndex = (currentIndex + 1) % songs.length
    setCurrentIndex(nextIndex)
    onNavigate(songs[nextIndex])
  }

  const navigateToPrevious = () => {
    if (songs.length === 0) return
    setIsEditing(false) // Exit edit mode when navigating
    const prevIndex = currentIndex === 0 ? songs.length - 1 : currentIndex - 1
    setCurrentIndex(prevIndex)
    onNavigate(songs[prevIndex])
  }

  const handleEdit = () => {
    onEdit(song)
    onClose()
  }

  const toggleEdit = () => {
    setIsEditing(!isEditing)
    if (!isEditing) {
      // Entering edit mode - reset the edit fields
      setEditedTitle(song.title || '')
      setEditedLyrics(song.lyrics || '')
    }
  }

  const saveEdit = () => {
    if (!editedTitle.trim()) {
      alert('Please enter a song title')
      return
    }

    const updatedSong = {
      ...song,
      title: editedTitle.trim(),
      lyrics: editedLyrics.trim(),
      updatedAt: new Date().toISOString()
    }

    if (onSave) {
      onSave(updatedSong)
    }
    setIsEditing(false)
  }

  const cancelEdit = () => {
    setIsEditing(false)
    setEditedTitle(song.title || '')
    setEditedLyrics(song.lyrics || '')
  }

  const insertText = (textToInsert) => {
    const textarea = document.querySelector('.modal-lyrics-editor')
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const beforeText = editedLyrics.substring(0, start)
      const afterText = editedLyrics.substring(end)
      const newText = beforeText + textToInsert + afterText
      setEditedLyrics(newText)
      
      // Set cursor position after inserted text without scrolling
      setTimeout(() => {
        const scrollTop = textarea.scrollTop
        textarea.focus({ preventScroll: true })
        textarea.setSelectionRange(start + textToInsert.length, start + textToInsert.length)
        textarea.scrollTop = scrollTop
      }, 0)
    }
  }

  const formatText = (type) => {
    switch (type) {
      case 'bold':
        setIsBold(!isBold)
        break
      case 'italic':
        setIsItalic(!isItalic)
        break
      case 'uppercase':
        setTextCase(textCase === 'uppercase' ? 'normal' : 'uppercase')
        break
      case 'lowercase':
        setTextCase(textCase === 'lowercase' ? 'normal' : 'lowercase')
        break
      case 'title':
        setTextCase(textCase === 'title' ? 'normal' : 'title')
        break
    }
  }

  const getTextTransform = () => {
    switch (textCase) {
      case 'uppercase': return 'uppercase'
      case 'lowercase': return 'lowercase'
      case 'title': return 'capitalize'
      default: return 'none'
    }
  }

  const insertStructure = (type) => {
    let textToInsert
    switch (type) {
      case 'verse':
        textToInsert = '[Verse]'
        break
      case 'chorus':
        textToInsert = '[Chorus]'
        break
      case 'bridge':
        textToInsert = '[Bridge]'
        break
      case 'outro':
        textToInsert = '[Outro]'
        break
      case 'intro':
        textToInsert = '[Intro]'
        break
      default:
        textToInsert = ''
    }
    insertText(textToInsert)
  }

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${song.title}"?`)) {
      onDelete(song.id)
      // Navigate to next song or close modal if no songs left
      if (songs.length > 1) {
        const nextIndex = currentIndex >= songs.length - 1 ? 0 : currentIndex
        onNavigate(songs[nextIndex])
      } else {
        onClose()
      }
    }
  }

  if (!isOpen || !song) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title">
            {isEditing ? (
              <input
                type="text"
                id="modal-song-title"
                name="songTitle"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="modal-title-input"
                placeholder="Song title..."
                autoFocus
              />
            ) : (
              <h2>{song.title}</h2>
            )}
            <span className="song-counter">
              {currentIndex + 1} of {songs.length}
            </span>
          </div>
          
          <div className="modal-actions">
            {isEditing ? (
              <>
                <button 
                  className="btn btn-primary btn-sm" 
                  onClick={saveEdit}
                  title="Save changes (Ctrl+S)"
                >
                  Save
                </button>
                <button 
                  className="btn btn-secondary btn-sm" 
                  onClick={cancelEdit}
                  title="Cancel editing (Esc)"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button 
                  className="btn btn-secondary btn-sm" 
                  onClick={toggleEdit}
                  title="Edit in modal (Ctrl+E)"
                >
                  Edit
                </button>
                {/* <button 
                  className="btn btn-secondary btn-sm" 
                  onClick={handleEdit}
                  title="Edit in main editor"
                >
                  Edit Main
                </button> */}
              </>
            )}
            <button 
              className="btn btn-danger btn-sm" 
              onClick={handleDelete}
              title="Delete song"
            >
              Delete
            </button>
            <button 
              className="btn btn-close" 
              onClick={onClose}
              title="Close (Esc)"
            >
              ×
            </button>
          </div>
        </div>

        {/* Navigation Controls */}
        {songs.length > 1 && (
          <div className="modal-navigation">
            <button 
              className="nav-btn nav-prev" 
              onClick={navigateToPrevious}
              title="Previous song (← or ↑)"
            >
              ‹ Previous
            </button>
            <button 
              className="nav-btn nav-next" 
              onClick={navigateToNext}
              title="Next song (→ or ↓)"
            >
              Next ›
            </button>
          </div>
        )}

        {/* Lyrics Content */}
        <div className="modal-body">
          {isEditing && (
            <div className="formatting-toolbar">
              <div className="toolbar-section">
                <label className="toolbar-label">Font Size:</label>
                <div className="font-size-controls">
                  <button 
                    className="btn btn-sm btn-secondary"
                    onClick={() => setFontSize(Math.max(12, fontSize - 2))}
                    title="Decrease font size"
                  >
                    A-
                  </button>
                  <span className="font-size-display">{fontSize}px</span>
                  <button 
                    className="btn btn-sm btn-secondary"
                    onClick={() => setFontSize(Math.min(24, fontSize + 2))}
                    title="Increase font size"
                  >
                    A+
                  </button>
                </div>
              </div>

              <div className="toolbar-section">
                <label className="toolbar-label">Text Align:</label>
                <div className="align-controls">
                  <button 
                    className={`btn btn-sm ${textAlign === 'left' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setTextAlign('left')}
                    title="Align left"
                  >
                    ⬅
                  </button>
                  <button 
                    className={`btn btn-sm ${textAlign === 'center' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setTextAlign('center')}
                    title="Align center"
                  >
                    ↔
                  </button>
                  <button 
                    className={`btn btn-sm ${textAlign === 'right' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setTextAlign('right')}
                    title="Align right"
                  >
                    ➡
                  </button>
                </div>
              </div>

              <div className="toolbar-section">
                <label className="toolbar-label">Text Format:</label>
                <div className="format-controls">
                  <button 
                    className={`btn btn-sm ${isBold ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => formatText('bold')}
                    title="Toggle bold text"
                  >
                    <strong>B</strong>
                  </button>
                  <button 
                    className={`btn btn-sm ${isItalic ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => formatText('italic')}
                    title="Toggle italic text"
                  >
                    <em>I</em>
                  </button>
                  <button 
                    className={`btn btn-sm ${textCase === 'uppercase' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => formatText('uppercase')}
                    title="Toggle UPPERCASE text"
                  >
                    ABC
                  </button>
                  <button 
                    className={`btn btn-sm ${textCase === 'lowercase' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => formatText('lowercase')}
                    title="Toggle lowercase text"
                  >
                    abc
                  </button>
                  <button 
                    className={`btn btn-sm ${textCase === 'title' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => formatText('title')}
                    title="Toggle Title Case text"
                  >
                    Abc
                  </button>
                </div>
              </div>

              <div className="toolbar-section">
                <label className="toolbar-label">Song Structure:</label>
                <div className="structure-controls">
                  <button 
                    className="btn btn-sm btn-secondary"
                    onClick={() => insertStructure('intro')}
                    title="Insert [Intro] section"
                  >
                    Intro
                  </button>
                  <button 
                    className="btn btn-sm btn-secondary"
                    onClick={() => insertStructure('verse')}
                    title="Insert [Verse] section"
                  >
                    Verse
                  </button>
                  <button 
                    className="btn btn-sm btn-secondary"
                    onClick={() => insertStructure('chorus')}
                    title="Insert [Chorus] section"
                  >
                    Chorus
                  </button>
                  <button 
                    className="btn btn-sm btn-secondary"
                    onClick={() => insertStructure('bridge')}
                    title="Insert [Bridge] section"
                  >
                    Bridge
                  </button>
                  <button 
                    className="btn btn-sm btn-secondary"
                    onClick={() => insertStructure('outro')}
                    title="Insert [Outro] section"
                  >
                    Outro
                  </button>
                </div>
              </div>
            </div>
          )}
          
          <div className="lyrics-display">
            {isEditing ? (
              <textarea
                id="modal-song-lyrics"
                name="songLyrics"
                value={editedLyrics}
                onChange={(e) => setEditedLyrics(e.target.value)}
                className="modal-lyrics-editor"
                placeholder="Enter song lyrics..."
                rows={20}
                style={{
                  fontSize: `${fontSize}px`,
                  textAlign: textAlign,
                  fontWeight: isBold ? 'bold' : 'normal',
                  fontStyle: isItalic ? 'italic' : 'normal',
                  textTransform: getTextTransform()
                }}
              />
            ) : (
              <pre 
                style={{ 
                  fontSize: `${fontSize}px`, 
                  textAlign: textAlign,
                  fontWeight: isBold ? 'bold' : 'normal',
                  fontStyle: isItalic ? 'italic' : 'normal',
                  textTransform: getTextTransform()
                }}
              >
                {song.lyrics}
              </pre>
            )}
          </div>
        </div>

        {/* Keyboard Shortcuts Help */}
        <div className="modal-footer">
          <div className="keyboard-shortcuts">
            <span>Keyboard: </span>
            {isEditing ? (
              <>
                <kbd>Ctrl+S</kbd> Save • 
                <kbd>Esc</kbd> Cancel
              </>
            ) : (
              <>
                <kbd>←→</kbd> Navigate • 
                <kbd>Ctrl+E</kbd> Edit • 
                <kbd>Esc</kbd> Close
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default LyricsModal
