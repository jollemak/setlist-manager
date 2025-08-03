import { useState } from 'react'

const SongList = ({ songs = [], onEdit, onDelete, onView }) => {
  const [searchTerm, setSearchTerm] = useState('')

  // Guard against undefined or non-array songs
  const safeSongs = Array.isArray(songs) ? songs : [];

  const filteredSongs = safeSongs.filter(song =>
    song && song.title && song.lyrics &&
    (song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    song.lyrics.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleDelete = (song, e) => {
    e.stopPropagation() // Prevent card click
    if (window.confirm(`Are you sure you want to delete "${song.title}"?`)) {
      onDelete(song.id)
    }
  }

  const handleEdit = (song, e) => {
    e.stopPropagation() // Prevent card click
    onEdit(song)
  }

  const handleCardClick = (song) => {
    onView(song)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString()
  }

  const truncateLyrics = (lyrics, maxLength = 100) => {
    if (lyrics.length <= maxLength) return lyrics
    return lyrics.substring(0, maxLength) + '...'
  }

  return (
    <div className="song-list">
      <div className="list-header">
        <h2>My Songs ({safeSongs.length})</h2>
        
        {safeSongs.length > 0 && (
          <div className="search-box">
            <input
              type="text"
              id="song-search"
              name="songSearch"
              placeholder="Search songs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        )}
      </div>

      <div className="songs-container">
        {filteredSongs.length === 0 ? (
          <div className="empty-state">
            {songs.length === 0 ? (
              <>
                <p>📝 No songs yet!</p>
                <p>Create your first song using the editor above.</p>
              </>
            ) : (
              <>
                <p>🔍 No songs match your search.</p>
                <p>Try different keywords.</p>
              </>
            )}
          </div>
        ) : (
          <div className="songs-grid">
            {filteredSongs.map(song => (
              <div 
                key={song.id} 
                className="song-card clickable"
                onClick={() => handleCardClick(song)}
                title="Click to view full lyrics"
              >
                <div className="song-header">
                  <h3 className="song-title">{song.title}</h3>
                  <div className="song-actions">
                    <button
                      className="btn btn-small btn-secondary"
                      onClick={(e) => onEdit(song, e)}
                      title="Edit song"
                    >
                      ✏️
                    </button>
                    <button
                      className="btn btn-small btn-danger"
                      onClick={(e) => handleDelete(song, e)}
                      title="Delete song"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                
                {/* <div className="song-preview">
                  <pre className="lyrics-preview">
                    {truncateLyrics(song.lyrics)}
                  </pre>
                </div> */}

                {/* <div className="click-hint">
                  Click to view full lyrics
                </div> */}

                {song.createdAt && (
                  <div className="song-meta">
                    <small>Created: {formatDate(song.createdAt)}</small>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default SongList
