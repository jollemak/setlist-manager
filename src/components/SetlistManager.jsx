import { useState } from 'react'

const SetlistManager = ({ songs, setlists, onCreateSetlist, onUpdateSetlist, onDeleteSetlist, onViewSetlist }) => {
  const [isCreating, setIsCreating] = useState(false)
  const [newSetlistName, setNewSetlistName] = useState('')
  const [editingSetlist, setEditingSetlist] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  const handleCreateSetlist = () => {
    if (!newSetlistName.trim()) {
      alert('Please enter a setlist name')
      return
    }

    const newSetlist = {
      id: Date.now(),
      name: newSetlistName.trim(),
      songs: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    onCreateSetlist(newSetlist)
    setNewSetlistName('')
    setIsCreating(false)
    setEditingSetlist(newSetlist)
  }

  const handleCancelCreate = () => {
    setIsCreating(false)
    setNewSetlistName('')
  }

  const handleDeleteSetlist = (setlistId) => {
    const setlist = setlists.find(s => s.id === setlistId)
    if (window.confirm(`Are you sure you want to delete "${setlist.name}"?`)) {
      onDeleteSetlist(setlistId)
      if (editingSetlist && editingSetlist.id === setlistId) {
        setEditingSetlist(null)
      }
    }
  }

  const handleAddSongToSetlist = (song) => {
    if (!editingSetlist) return

    // Check if song is already in setlist
    if (editingSetlist.songs.find(s => s.id === song.id)) {
      alert('This song is already in the setlist')
      return
    }

    const updatedSetlist = {
      ...editingSetlist,
      songs: [...editingSetlist.songs, song],
      updatedAt: new Date().toISOString()
    }

    onUpdateSetlist(updatedSetlist)
    setEditingSetlist(updatedSetlist)
  }

  const handleRemoveSongFromSetlist = (songId) => {
    if (!editingSetlist) return

    const updatedSetlist = {
      ...editingSetlist,
      songs: editingSetlist.songs.filter(s => s.id !== songId),
      updatedAt: new Date().toISOString()
    }

    onUpdateSetlist(updatedSetlist)
    setEditingSetlist(updatedSetlist)
  }

  const handleMoveSong = (fromIndex, toIndex) => {
    if (!editingSetlist) return

    const newSongs = [...editingSetlist.songs]
    const [movedSong] = newSongs.splice(fromIndex, 1)
    newSongs.splice(toIndex, 0, movedSong)

    const updatedSetlist = {
      ...editingSetlist,
      songs: newSongs,
      updatedAt: new Date().toISOString()
    }

    onUpdateSetlist(updatedSetlist)
    setEditingSetlist(updatedSetlist)
  }

  const handleEditSetlist = (setlist) => {
    setEditingSetlist(setlist)
  }

  const handleCancelEdit = () => {
    setEditingSetlist(null)
  }

  const filteredSongs = songs.filter(song =>
    song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    song.lyrics.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="setlist-manager">
      <div className="setlist-header">
        <h2>🎵 Setlists ({setlists.length})</h2>
        {!isCreating && (
          <button
            className="btn btn-primary"
            onClick={() => setIsCreating(true)}
          >
            + New Setlist
          </button>
        )}
      </div>

      {isCreating && (
        <div className="setlist-creator">
          <div className="form-group">
            <label htmlFor="setlist-name">Setlist Name</label>
            <input
              id="setlist-name"
              type="text"
              value={newSetlistName}
              onChange={(e) => setNewSetlistName(e.target.value)}
              placeholder="Enter setlist name..."
              className="input-field"
              autoFocus
            />
          </div>
          <div className="setlist-creator-actions">
            <button
              className="btn btn-primary"
              onClick={handleCreateSetlist}
              disabled={!newSetlistName.trim()}
            >
              Create Setlist
            </button>
            <button
              className="btn btn-secondary"
              onClick={handleCancelCreate}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="setlist-content">
        {/* Setlist List */}
        <div className="setlist-list">
          <h3>Your Setlists</h3>
          {setlists.length === 0 ? (
            <div className="empty-state">
              <p>📝 No setlists yet!</p>
              <p>Create your first setlist to get started.</p>
            </div>
          ) : (
            <div className="setlists-grid">
              {setlists.map(setlist => (
                <div
                  key={setlist.id}
                  className="setlist-card"
                  onClick={() => onViewSetlist(setlist)}
                >
                  <div className="setlist-card-header">
                    <h4 className="setlist-name">{setlist.name}</h4>
                    <div className="setlist-actions">
                      <button
                        className="btn btn-small btn-secondary"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEditSetlist(setlist)
                        }}
                        title="Edit setlist"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn btn-small btn-danger"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteSetlist(setlist.id)
                        }}
                        title="Delete setlist"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  <div className="setlist-meta">
                    <span>{setlist.songs.length} songs</span>
                    <span>Created: {new Date(setlist.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Setlist Editor */}
        {editingSetlist && (
          <div className="setlist-editor">
            <div className="setlist-editor-header">
              <h3>📋 Editing: {editingSetlist.name}</h3>
              <div className="editor-actions">
                <span className="song-count">{editingSetlist.songs.length} songs</span>
                <button
                  className="btn btn-secondary"
                  onClick={handleCancelEdit}
                >
                  Done Editing
                </button>
              </div>
            </div>

            <div className="setlist-songs">
              {editingSetlist.songs.length === 0 ? (
                <div className="empty-state">
                  <p>🎵 No songs in this setlist</p>
                  <p>Add songs from your collection below.</p>
                </div>
              ) : (
                <div className="setlist-songs-list">
                  {editingSetlist.songs.map((song, index) => (
                    <div key={song.id} className="setlist-song-item">
                      <div className="song-number">{index + 1}</div>
                      <div className="song-info">
                        <div className="song-title">{song.title}</div>
                      </div>
                      <div className="song-actions">
                        <button
                          className="btn btn-small btn-secondary"
                          onClick={() => handleMoveSong(index, Math.max(0, index - 1))}
                          disabled={index === 0}
                          title="Move up"
                        >
                          ↑
                        </button>
                        <button
                          className="btn btn-small btn-secondary"
                          onClick={() => handleMoveSong(index, Math.min(editingSetlist.songs.length - 1, index + 1))}
                          disabled={index === editingSetlist.songs.length - 1}
                          title="Move down"
                        >
                          ↓
                        </button>
                        <button
                          className="btn btn-small btn-danger"
                          onClick={() => handleRemoveSongFromSetlist(song.id)}
                          title="Remove from setlist"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
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
                      const isInSetlist = editingSetlist.songs.find(s => s.id === song.id)
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
        )}
      </div>
    </div>
  )
}

export default SetlistManager
