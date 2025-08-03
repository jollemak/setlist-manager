import { useState, useEffect } from 'react'

const LyricsEditor = ({ currentSong, setCurrentSong, onSave, isEditing, onNew }) => {
  const [title, setTitle] = useState('')
  const [lyrics, setLyrics] = useState('')

  // Update local state when currentSong changes
  useEffect(() => {
    setTitle(currentSong.title || '')
    setLyrics(currentSong.lyrics || '')
  }, [currentSong])

  const handleSave = () => {
    if (!title.trim()) {
      alert('Please enter a song title')
      return
    }

    if (!lyrics.trim()) {
      alert('Please enter some lyrics')
      return
    }

    const songData = {
      id: currentSong.id,
      title: title.trim(),
      lyrics: lyrics.trim()
    }

    onSave(songData)

    // Clear form after saving
    setTitle('')
    setLyrics('')
  }

  const handleNew = () => {
    setTitle('')
    setLyrics('')
    onNew()
  }

  const handleTitleChange = (e) => {
    const newTitle = e.target.value
    setTitle(newTitle)
    // Don't update currentSong while typing - only on save
  }

  const handleLyricsChange = (e) => {
    const newLyrics = e.target.value
    setLyrics(newLyrics)
    // Don't update currentSong while typing - only on save
  }

  return (
    <div className="lyrics-editor">
      <div className="editor-header">
        <h2>New Song</h2>
        <div className="editor-actions">
          <button 
            className="btn btn-primary" 
            onClick={handleSave}
            disabled={!title.trim() || !lyrics.trim()}
          >
            {isEditing ? 'Update Song' : 'Save Song'}
          </button>
        </div>
      </div>

      <div className="editor-form">
        <div className="form-group">
          <label htmlFor="song-title">Song Title</label>
          <input
            id="song-title"
            type="text"
            value={title}
            onChange={handleTitleChange}
            placeholder="Enter song title..."
            className="input-field"
          />
        </div>

        <div className="form-group">
          <label htmlFor="song-lyrics">Lyrics</label>
          <textarea
            id="song-lyrics"
            value={lyrics}
            onChange={handleLyricsChange}
            placeholder="Paste or type your lyrics here..."
            className="lyrics-textarea"
          />
        </div>
      </div>
    </div>
  )
}

export default LyricsEditor
