import React, { useState } from 'react'

const SetlistViewer = ({ setlist, onBack, onViewSong, onUpdateSetlist }) => {
  const [draggedIndex, setDraggedIndex] = useState(null)
  const [dragOverIndex, setDragOverIndex] = useState(null)
  const [reorderedSongs, setReorderedSongs] = useState([])

  if (!setlist) return null

  // Get the songs to display - either the reordered preview or original
  const displaySongs = reorderedSongs.length > 0 ? reorderedSongs : setlist.songs

  const handleDragStart = (e, index) => {
    setDraggedIndex(index)
    setReorderedSongs([...setlist.songs]) // Start with current order
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
    const newSongs = [...setlist.songs]
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

  const handleSongClick = (song, e) => {
    // Prevent song view when clicking on drag handle
    if (e.target.closest('.drag-handle')) {
      return
    }
    onViewSong(song)
  }

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
              const originalIndex = setlist.songs.findIndex(s => s.id === song.id)
              const isDragging = draggedIndex === originalIndex
              
              return (
                <div 
                  key={song.id} 
                  className={`song-card setlist-song-card draggable ${
                    isDragging ? 'dragging' : ''
                  } ${dragOverIndex === index ? 'drag-over' : ''}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, originalIndex)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
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
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default SetlistViewer
