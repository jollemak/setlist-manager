import { useState, useEffect } from 'react'
import LyricsEditor from './components/LyricsEditor'
import SongList from './components/SongList'
import LyricsModal from './components/LyricsModal'
import SetlistManager from './components/SetlistManager'
import SetlistViewer from './components/SetlistViewer'
import './App.css'

function App() {
  const [songs, setSongs] = useState([])
  const [setlists, setSetlists] = useState([])
  const [currentSong, setCurrentSong] = useState({ id: null, title: '', lyrics: '' })
  const [isEditing, setIsEditing] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalSong, setModalSong] = useState(null)
  const [startInEditMode, setStartInEditMode] = useState(false)
  const [activeTab, setActiveTab] = useState('songs') // 'songs' or 'setlists'
  const [viewingSetlist, setViewingSetlist] = useState(null) // For viewing setlist songs

  // Load songs and setlists from localStorage on app start
  useEffect(() => {
    const savedSongs = localStorage.getItem('songs')
    if (savedSongs) {
      setSongs(JSON.parse(savedSongs))
    }

    const savedSetlists = localStorage.getItem('setlists')
    if (savedSetlists) {
      setSetlists(JSON.parse(savedSetlists))
    }
  }, [])

  // Save songs to localStorage whenever songs array changes
  useEffect(() => {
    localStorage.setItem('songs', JSON.stringify(songs))
  }, [songs])

  // Save setlists to localStorage whenever setlists array changes
  useEffect(() => {
    localStorage.setItem('setlists', JSON.stringify(setlists))
  }, [setlists])

  const saveSong = (songData) => {
    if (songData.id && songs.find(song => song.id === songData.id)) {
      // Update existing song (has an ID and exists in the songs array)
      const updatedSongs = songs.map(song => 
        song.id === songData.id ? songData : song
      )
      setSongs(updatedSongs)
      
      // If we're updating the song that's currently displayed in the modal, update modalSong too
      if (modalSong && modalSong.id === songData.id) {
        setModalSong(songData)
      }
      
      setIsEditing(false)
    } else {
      // Add new song
      const newSong = {
        ...songData,
        id: Date.now(), // Simple ID generation
        createdAt: new Date().toISOString()
      }
      setSongs([...songs, newSong])
      
      // If creating a new song from modal, update modalSong to show the new song
      if (modalOpen && !songData.id) {
        setModalSong(newSong)
      }
    }
    
    // Clear the editor only if we're saving from the main editor
    if (isEditing) {
      setCurrentSong({ id: null, title: '', lyrics: '' })
    }
  }

  const editSong = (song) => {
    // Edit song in the main editor
    setCurrentSong(song)
    setIsEditing(true)
  }

  const editSongInModal = (song) => {
    // Open modal in edit mode
    setModalSong(song)
    setModalOpen(true)
    setStartInEditMode(false) // Reset first
    // Use setTimeout to ensure the modal is open before setting edit mode
    setTimeout(() => {
      setStartInEditMode(true)
    }, 0)
  }

  const deleteSong = (songId) => {
    setSongs(songs.filter(song => song.id !== songId))
    // If we're editing the deleted song, clear the editor
    if (currentSong.id === songId) {
      setCurrentSong({ id: null, title: '', lyrics: '' })
      setIsEditing(false)
    }
  }

  const openModal = (song) => {
    setModalSong(song)
    setModalOpen(true)
    setStartInEditMode(false)
  }

  const closeModal = () => {
    setModalOpen(false)
    setModalSong(null)
    setStartInEditMode(false)
  }

  const navigateModal = (song) => {
    setModalSong(song)
    setStartInEditMode(false) // Reset edit mode when navigating
  }

  const resetEditMode = () => {
    setStartInEditMode(false)
  }

  // Setlist management functions
  const createSetlist = (newSetlist) => {
    setSetlists([...setlists, newSetlist])
  }

  const updateSetlist = (updatedSetlist) => {
    setSetlists(setlists.map(setlist => 
      setlist.id === updatedSetlist.id ? updatedSetlist : setlist
    ))
  }

  const deleteSetlist = (setlistId) => {
    setSetlists(setlists.filter(setlist => setlist.id !== setlistId))
  }

  const viewSetlist = (setlist) => {
    setViewingSetlist(setlist)
  }

  const backToSetlists = () => {
    setViewingSetlist(null)
  }

  const newSong = () => {
    setCurrentSong({ id: null, title: '', lyrics: '' })
    setIsEditing(false)
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>🎵 Lyrics & Setlist Manager</h1>
        <p>Create, edit, and manage your song lyrics and setlists</p>
      </header>

      {/* Navigation Tabs */}
      <nav className="app-nav">
        <button
          className={`nav-tab ${activeTab === 'songs' ? 'active' : ''}`}
          onClick={() => setActiveTab('songs')}
        >
          🎵 Songs ({songs.length})
        </button>
        <button
          className={`nav-tab ${activeTab === 'setlists' ? 'active' : ''}`}
          onClick={() => setActiveTab('setlists')}
        >
          📋 Setlists ({setlists.length})
        </button>
      </nav>

      <main className={`app-main ${activeTab === 'songs' ? 'songs-view' : ''}`}>
        {activeTab === 'songs' ? (
          <>
            <div className="editor-section">
              <LyricsEditor 
                currentSong={currentSong}
                setCurrentSong={setCurrentSong}
                onSave={saveSong}
                isEditing={isEditing}
                onNew={newSong}
              />
            </div>

            <div className="songs-section">
              <SongList 
                songs={songs}
                onEdit={editSongInModal}
                onDelete={deleteSong}
                onView={openModal}
              />
            </div>
          </>
        ) : (
          <div className="setlists-section">
            {viewingSetlist ? (
              <SetlistViewer
                setlist={viewingSetlist}
                onBack={backToSetlists}
                onViewSong={openModal}
              />
            ) : (
              <SetlistManager
                songs={songs}
                setlists={setlists}
                onCreateSetlist={createSetlist}
                onUpdateSetlist={updateSetlist}
                onDeleteSetlist={deleteSetlist}
                onViewSetlist={viewSetlist}
              />
            )}
          </div>
        )}
      </main>

      {/* Lyrics Modal */}
      <LyricsModal
        song={modalSong}
        songs={songs}
        isOpen={modalOpen}
        onClose={closeModal}
        onEdit={editSong}
        onDelete={deleteSong}
        onNavigate={navigateModal}
        onSave={saveSong}
        startInEditMode={startInEditMode}
        onResetEditMode={resetEditMode}
      />
    </div>
  )
}

export default App
