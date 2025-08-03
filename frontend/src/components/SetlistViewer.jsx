import React, { useState, useEffect } from 'react'

const SetlistViewer = ({ setlist, songs, onBack, onViewSong, onUpdateSetlist }) => {
  const [draggedIndex, setDraggedIndex] = useState(null)
  const [dragOverIndex, setDragOverIndex] = useState(null)
  const [reorderedSongs, setReorderedSongs] = useState([])
  const [isEditing, setIsEditing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Editing state
  const [editingDraggedIndex, setEditingDraggedIndex] = useState(null)
  const [editingDragOverIndex, setEditingDragOverIndex] = useState(null)
  const [editingReorderedSongs, setEditingReorderedSongs] = useState([])

  // Touch drag state
  const [touchState, setTouchState] = useState({
    isDragging: false,
    draggedIndex: null,
    pressTimer: null,
    startY: 0,
    currentY: 0,
    dragElement: null,
    placeholder: null,
    showIndicator: false
  })

  // Prevent background scrolling when editing modal is open
  useEffect(() => {
    if (isEditing) {
      // Disable background scroll
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.width = '100%'
    } else {
      // Re-enable background scroll
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.width = ''
    }

    // Cleanup function to restore scroll when component unmounts
    return () => {
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.width = ''
    }
  }, [isEditing])

  if (!setlist) return null

  // Get the songs to display - either the reordered preview or original
  const displaySongs = (reorderedSongs || []).length > 0 ? (reorderedSongs || []) : (setlist.songs || [])

  const handleDragStart = (e, index) => {
    setDraggedIndex(index)
    setReorderedSongs([...(setlist.songs || [])]) // Start with current order
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', e.target)
  }

  const handleDragOver = (e, index) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    
    if (draggedIndex === null || draggedIndex === index) {
      return
    }

    setDragOverIndex(index)

    // Create real-time preview by reordering the songs array
    const newSongs = [...(setlist.songs || [])]
    const draggedSong = newSongs[draggedIndex]
    
    // Remove the dragged song from its original position
    newSongs.splice(draggedIndex, 1)
    
    // Insert the dragged song at the hover position
    newSongs.splice(index, 0, draggedSong)

    setReorderedSongs(newSongs)
  }

  const handleDragLeave = () => {
    setDragOverIndex(null)
  }

  const handleDrop = (e, dropIndex) => {
    e.preventDefault()
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null)
      setDragOverIndex(null)
      setReorderedSongs([])
      return
    }

    // Use the reordered songs from the preview as the final result
    const updatedSetlist = { ...setlist, songs: reorderedSongs }
    onUpdateSetlist(updatedSetlist)

    setDraggedIndex(null)
    setDragOverIndex(null)
    setReorderedSongs([])
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    setDragOverIndex(null)
    setReorderedSongs([])
  }

  // Touch event handlers for mobile drag and drop
  const handleTouchStart = (e, index) => {
    const touch = e.touches[0]
    const element = e.currentTarget
    
    // Start press and hold timer
    const timer = setTimeout(() => {
      startTouchDrag(index, element, touch.clientY)
    }, 600) // 600ms press and hold
    
    // Add press-hold visual feedback
    element.classList.add('press-hold')
    
    setTouchState(prev => ({
      ...prev,
      pressTimer: timer,
      startY: touch.clientY,
      draggedIndex: index
    }))
  }

  const handleTouchMove = (e) => {
    if (!touchState.isDragging) {
      // If we're not dragging yet, cancel the press timer if finger moves too much
      const touch = e.touches[0]
      const deltaY = Math.abs(touch.clientY - touchState.startY)
      
      if (deltaY > 10 && touchState.pressTimer) {
        clearTimeout(touchState.pressTimer)
        setTouchState(prev => ({ ...prev, pressTimer: null }))
        // Remove press-hold class
        document.querySelectorAll('.press-hold').forEach(el => el.classList.remove('press-hold'))
      }
      return
    }

    // Only prevent default if we're actively dragging
    if (e.cancelable) {
      e.preventDefault()
    }
    
    const touch = e.touches[0]

    // Find drop target
    const elements = document.querySelectorAll('.setlist-song-card:not(.touch-dragging)')
    let dropIndex = -1
    
    elements.forEach((el, idx) => {
      const rect = el.getBoundingClientRect()
      if (touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
        dropIndex = idx
      }
    })

    // Update drop index
    updatePlaceholder(dropIndex)
    
    setTouchState(prev => ({
      ...prev,
      currentY: touch.clientY
    }))
  }

  const handleTouchEnd = (e) => {
    // Clean up press timer and visual feedback
    if (touchState.pressTimer) {
      clearTimeout(touchState.pressTimer)
    }
    document.querySelectorAll('.press-hold').forEach(el => el.classList.remove('press-hold'))

    if (!touchState.isDragging) {
      setTouchState(prev => ({ ...prev, pressTimer: null, draggedIndex: null }))
      return
    }

    // Find final drop position
    const touch = e.changedTouches[0]
    const elements = document.querySelectorAll('.setlist-song-card:not(.touch-dragging)')
    let dropIndex = touchState.draggedIndex
    
    elements.forEach((el, idx) => {
      const rect = el.getBoundingClientRect()
      if (touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
        dropIndex = idx
      }
    })

    // Perform the reorder
    if (dropIndex !== touchState.draggedIndex && dropIndex >= 0) {
      const newSongs = [...(setlist.songs || [])]
      const draggedSong = newSongs[touchState.draggedIndex]
      
      newSongs.splice(touchState.draggedIndex, 1)
      newSongs.splice(dropIndex, 0, draggedSong)

      const updatedSetlist = {
        ...setlist,
        songs: newSongs,
        updatedAt: new Date().toISOString()
      }

      onUpdateSetlist(updatedSetlist)
    }

    // Clean up
    cleanupTouchDrag()
  }

  const startTouchDrag = (index, element, startY) => {
    // Just add a simple visual feedback to the original element
    element.classList.add('touch-dragging')
    element.classList.remove('press-hold')

    setTouchState(prev => ({
      ...prev,
      isDragging: true,
      draggedIndex: index,
      pressTimer: null
    }))
  }

  const updatePlaceholder = (dropIndex) => {
    // Simple implementation - just track the drop index
    // Visual feedback will be handled by CSS hover states
    setTouchState(prev => ({
      ...prev,
      dropIndex: dropIndex
    }))
  }

  const cleanupTouchDrag = () => {
    // Remove visual classes
    document.querySelectorAll('.touch-dragging').forEach(el => {
      el.classList.remove('touch-dragging')
    })
    document.querySelectorAll('.press-hold').forEach(el => {
      el.classList.remove('press-hold')
    })

    setTouchState({
      isDragging: false,
      draggedIndex: null,
      pressTimer: null,
      startY: 0,
      currentY: 0,
      dropIndex: null
    })
  }

  const handleSongClick = (song, e) => {
    // Prevent song view when clicking on drag handle or delete button
    if (e.target.closest('.drag-handle') || e.target.closest('.setlist-song-delete')) {
      return
    }
    onViewSong(song)
  }

  const handleDeleteSong = (songId, e) => {
    e.stopPropagation()
    const updatedSetlist = {
      ...setlist,
      songs: (setlist.songs || []).filter(s => s.id !== songId),
      updatedAt: new Date().toISOString()
    }
    onUpdateSetlist(updatedSetlist)
  }

  // Editing functions
  const handleEditSetlist = () => {
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setSearchTerm('')
    // Reset editing drag state
    setEditingDraggedIndex(null)
    setEditingDragOverIndex(null)
    setEditingReorderedSongs([])
  }

  const handleAddSongToSetlist = (song) => {
    // Check if song is already in setlist
    if ((setlist.songs || []).find(s => s.id === song.id)) {
      alert('This song is already in the setlist')
      return
    }

    const updatedSetlist = {
      ...setlist,
      songs: [...(setlist.songs || []), song],
      updatedAt: new Date().toISOString()
    }

    onUpdateSetlist(updatedSetlist)
  }

  const handleRemoveSongFromSetlist = (songId) => {
    const updatedSetlist = {
      ...setlist,
      songs: (setlist.songs || []).filter(s => s.id !== songId),
      updatedAt: new Date().toISOString()
    }

    onUpdateSetlist(updatedSetlist)
  }

  // Editing drag and drop handlers
  const handleEditingDragStart = (e, index) => {
    setEditingDraggedIndex(index)
    setEditingReorderedSongs([...(setlist.songs || [])]) // Start with current order
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', e.target)
  }

  const handleEditingDragOver = (e, index) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    
    if (editingDraggedIndex === null || editingDraggedIndex === index) {
      return
    }

    setEditingDragOverIndex(index)

    // Create real-time preview by reordering the songs array
    const newSongs = [...(setlist.songs || [])]
    const draggedSong = newSongs[editingDraggedIndex]
    
    // Remove the dragged song from its original position
    newSongs.splice(editingDraggedIndex, 1)
    
    // Insert the dragged song at the hover position
    newSongs.splice(index, 0, draggedSong)

    setEditingReorderedSongs(newSongs)
  }

  const handleEditingDragLeave = () => {
    setEditingDragOverIndex(null)
  }

  const handleEditingDrop = (e, dropIndex) => {
    e.preventDefault()
    
    if (editingDraggedIndex === null || editingDraggedIndex === dropIndex) {
      setEditingDraggedIndex(null)
      setEditingDragOverIndex(null)
      setEditingReorderedSongs([])
      return
    }

    // Use the reordered songs from the preview as the final result
    const updatedSetlist = {
      ...setlist,
      songs: editingReorderedSongs,
      updatedAt: new Date().toISOString()
    }

    onUpdateSetlist(updatedSetlist)

    setEditingDraggedIndex(null)
    setEditingDragOverIndex(null)
    setEditingReorderedSongs([])
  }

  const handleEditingDragEnd = () => {
    setEditingDraggedIndex(null)
    setEditingDragOverIndex(null)
    setEditingReorderedSongs([])
  }

  // Filter songs for editing
  const filteredSongs = songs ? songs.filter(song =>
    song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    song.lyrics.toLowerCase().includes(searchTerm.toLowerCase())
  ) : []

  return (
    

    <div className="setlist-viewer">
      
<div className="setlist-viewer-header">
        <button
          className="btn btn-secondary"
          onClick={onBack}
        >
          ← Back to Setlists
        </button>
        <div className="setlist-info">
          <h2>📋 {setlist.name}</h2>
          <span className="song-count">{displaySongs.length} songs</span>
        </div>
        <button
          className="btn btn-primary"
          onClick={handleEditSetlist}
        >
          ✏️ Edit
        </button>
      </div>
      <div className="setlist-songs-display">
        {displaySongs.length === 0 ? (
          <div className="empty-state">
            <p>🎵 No songs in this setlist</p>
            <p>Use the edit button to add songs.</p>
          </div>
        ) : (
          <div className="songs-grid">
            {displaySongs.map((song, index) => {
              // Find the original index of this song to determine if it's being dragged
              const originalIndex = (setlist.songs || []).findIndex(s => s.id === song.id)
              const isDragging = draggedIndex === originalIndex
              
              return (
                <div 
                  key={song.id} 
                  className={`song-card setlist-song-card draggable ${
                    isDragging ? 'dragging' : ''
                  } ${dragOverIndex === index ? 'drag-over' : ''} ${touchState.isDragging && touchState.draggedIndex === originalIndex ? 'touch-active' : ''}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, originalIndex)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  onTouchStart={(e) => handleTouchStart(e, originalIndex)}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  onClick={(e) => handleSongClick(song, e)}
                >
                  <div className="song-number-badge">{index + 1}</div>
                  <div className="drag-handle" title="Drag to reorder">
                    ⋮⋮
                  </div>
                  <div className="song-header">
                    <h3 className="song-title">{song.title}</h3>
                  </div>
                  <div className="song-meta">
                    <small>Click to view lyrics • Drag to reorder</small>
                  </div>
                  <button
                    className="setlist-song-delete"
                    onClick={(e) => handleDeleteSong(song.id, e)}
                    title="Remove from setlist"
                  >
                    ✕
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Setlist Editor Modal */}
      {isEditing && (
        <div className="setlist-editor-modal" onClick={handleCancelEdit}>
          <div className="setlist-editor-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="setlist-editor-modal-header">
              <h3>📋 Editing: {setlist.name}</h3>
              <div className="editor-actions" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span className="song-count">{(setlist.songs || []).length} songs</span>
                <button
                  className="modal-close-btn"
                  onClick={handleCancelEdit}
                  title="Close editor"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="setlist-editor-modal-body">
              <div className="setlist-songs">
                {(setlist.songs || []).length === 0 ? (
                  <div className="empty-state">
                    <p>🎵 No songs in this setlist</p>
                    <p>Add songs from your collection below.</p>
                  </div>
                ) : (
                  <div className="setlist-songs-list">
                    {((editingReorderedSongs || []).length > 0 ? (editingReorderedSongs || []) : (setlist.songs || [])).map((song, index) => {
                      // Find the original index of this song to determine if it's being dragged
                      const originalIndex = (setlist.songs || []).findIndex(s => s.id === song.id)
                      const isDragging = editingDraggedIndex === originalIndex
                      
                      return (
                        <div 
                          key={song.id} 
                          className={`setlist-song-item ${isDragging ? 'dragging' : ''} ${editingDragOverIndex === index ? 'drag-over' : ''}`}
                          draggable
                          onDragStart={(e) => handleEditingDragStart(e, originalIndex)}
                          onDragOver={(e) => handleEditingDragOver(e, index)}
                          onDragLeave={handleEditingDragLeave}
                          onDrop={(e) => handleEditingDrop(e, index)}
                          onDragEnd={handleEditingDragEnd}
                        >
                          <div className="song-number">{index + 1}</div>
                          <div className="drag-handle" title="Drag to reorder">
                            ⋮⋮
                          </div>
                          <div className="song-info">
                            <div className="song-title">{song.title}</div>
                          </div>
                          <div className="song-actions">
                            <button
                              className="btn btn-small btn-danger"
                              onClick={() => handleRemoveSongFromSetlist(song.id)}
                              title="Remove from setlist"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Song Selector */}
              <div className="song-selector">
                <h4>Add Songs to Setlist</h4>
                <div className="search-box">
                  <input
                    type="text"
                    placeholder="Search your songs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                </div>
                <div className="available-songs">
                  {filteredSongs.length === 0 ? (
                    <div className="empty-state">
                      <p>🔍 No songs found</p>
                    </div>
                  ) : (
                    <div className="songs-grid">
                      {filteredSongs.map(song => {
                        const isInSetlist = (setlist.songs || []).find(s => s.id === song.id)
                        return (
                          <div
                            key={song.id}
                            className={`song-card ${isInSetlist ? 'in-setlist' : ''}`}
                          >
                            <div className="song-header">
                              <h5 className="song-title">{song.title}</h5>
                              <button
                                className="btn btn-small btn-primary"
                                onClick={() => handleAddSongToSetlist(song)}
                                disabled={isInSetlist}
                                title={isInSetlist ? "Already in setlist" : "Add to setlist"}
                              >
                                {isInSetlist ? '✓' : '+'}
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SetlistViewer
