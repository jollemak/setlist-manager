import React from 'react'

const SetlistViewer = ({ setlist, onBack, onViewSong }) => {
  if (!setlist) return null

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
          <span className="song-count">{setlist.songs.length} songs</span>
        </div>
      </div>

      <div className="setlist-songs-display">
        {setlist.songs.length === 0 ? (
          <div className="empty-state">
            <p>🎵 No songs in this setlist</p>
            <p>Use the edit button to add songs.</p>
          </div>
        ) : (
          <div className="songs-grid">
            {setlist.songs.map((song, index) => (
              <div 
                key={song.id} 
                className="song-card setlist-song-card"
                onClick={() => onViewSong(song)}
              >
                <div className="song-number-badge">{index + 1}</div>
                <div className="song-header">
                  <h3 className="song-title">{song.title}</h3>
                </div>
                <div className="song-meta">
                  <small>Click to view lyrics</small>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default SetlistViewer
