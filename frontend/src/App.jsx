import { useState, useEffect } from 'react'
import { AuthProvider } from './contexts/AuthContext'
import { useAppData } from './hooks/useAppData'
import LyricsEditor from './components/LyricsEditor'
import SongList from './components/SongList'
import LyricsModal from './components/LyricsModal'
import SetlistManager from './components/SetlistManager'
import SetlistViewer from './components/SetlistViewer'
import AuthenticatedApp from './components/AuthenticatedApp'
import './App.css'

function MainApp() {
  const {
    songs,
    setlists,
    loading: dataLoading,
    error: dataError,
    saveSong,
    deleteSong,
    saveSetlist,
    deleteSetlist,
    addSongToSetlist,
    removeSongFromSetlist,
    reorderSetlistSongs,
    clearError
  } = useAppData();

  const [currentSong, setCurrentSong] = useState({ id: null, title: '', lyrics: '' })
  const [isEditing, setIsEditing] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalSong, setModalSong] = useState(null)
  const [modalSongList, setModalSongList] = useState([]) // Track which songs to navigate through
  const [startInEditMode, setStartInEditMode] = useState(false)
  const [activeTab, setActiveTab] = useState('songs') // 'songs' or 'setlists'
  const [viewingSetlist, setViewingSetlist] = useState(null) // For viewing setlist songs

  // Sync viewingSetlist with global setlists state when setlists change
  useEffect(() => {
    if (viewingSetlist && viewingSetlist.id) {
      const updatedSetlist = setlists.find(s => s.id === viewingSetlist.id);
      if (updatedSetlist && JSON.stringify(updatedSetlist) !== JSON.stringify(viewingSetlist)) {
        setViewingSetlist(updatedSetlist);
      }
    }
  }, [setlists, viewingSetlist]);

  // Show loading spinner while data is loading
  if (dataLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>🎵 Loading your songs and setlists...</p>
        </div>
      </div>
    );
  }

  // Show error message if there's a data error
  if (dataError) {
    return (
      <div className="error-container">
        <div className="error-message">
          <h3>⚠️ Something went wrong</h3>
          <p>{dataError}</p>
          <button onClick={clearError} className="btn btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const handleSaveSong = async (songData) => {
    try {
      const savedSong = await saveSong(songData);
      
      // If we're updating the song that's currently displayed in the modal, update modalSong too
      if (modalSong && modalSong.id === songData.id) {
        setModalSong(savedSong);
      }
      
      setIsEditing(false);
      
      // Clear the editor only if we're saving from the main editor
      if (isEditing) {
        setCurrentSong({ id: null, title: '', lyrics: '' });
      }
      
      return savedSong;
    } catch (error) {
      // Error is already handled in the hook
      console.error('Failed to save song:', error);
    }
  };

  const handleDeleteSong = async (songId) => {
    try {
      await deleteSong(songId);
      
      // If we're editing the deleted song, clear the editor
      if (currentSong.id === songId) {
        setCurrentSong({ id: null, title: '', lyrics: '' });
        setIsEditing(false);
      }
      
      // Close modal if the deleted song is currently open
      if (modalSong && modalSong.id === songId) {
        closeModal();
      }
    } catch (error) {
      // Error is already handled in the hook
      console.error('Failed to delete song:', error);
    }
  };

  const handleSaveSetlist = async (setlistData) => {
    try {
      const savedSetlist = await saveSetlist(setlistData);
      
      // Update viewingSetlist if it's the same setlist being updated
      if (viewingSetlist && viewingSetlist.id === savedSetlist.id) {
        setViewingSetlist(savedSetlist);
      }
      
      return savedSetlist;
    } catch (error) {
      // Error is already handled in the hook
      console.error('Failed to save setlist:', error);
    }
  };

  const handleDeleteSetlist = async (setlistId) => {
    try {
      await deleteSetlist(setlistId);
      
      // Close setlist viewer if we're viewing the deleted setlist
      if (viewingSetlist && viewingSetlist.id === setlistId) {
        setViewingSetlist(null);
        setActiveTab('setlists');
      }
    } catch (error) {
      // Error is already handled in the hook
      console.error('Failed to delete setlist:', error);
    }
  };

  const handleUpdateSetlist = async (updatedSetlist) => {
    console.log('🔄 handleUpdateSetlist called with setlist:', updatedSetlist.name)
    console.log('📝 Updated setlist songs:', updatedSetlist.songs?.map(s => s.title) || [])
    
    try {
      // This function handles intelligent routing of setlist updates
      // It determines what type of update is needed and calls the appropriate API
      
      const currentSetlist = setlists.find(s => s.id === updatedSetlist.id);
      if (!currentSetlist) {
        console.error('❌ Cannot update setlist: original setlist not found');
        return;
      }

      const currentSongs = currentSetlist.songs || [];
      const newSongs = updatedSetlist.songs || [];
      
      console.log('📋 Current setlist songs:', currentSongs.map(s => s.title))
      console.log('🆕 New setlist songs:', newSongs.map(s => s.title))

      // Check if this is just a reorder operation (same songs, different order)
      if (currentSongs.length === newSongs.length && 
          currentSongs.every(song => newSongs.find(ns => ns.id === song.id))) {
        console.log('🔄 Detected reorder operation')
        // This is a reorder operation
        await reorderSetlistSongs(updatedSetlist.id, newSongs);
        return;
      }

      // Check for added songs
      const addedSongs = newSongs.filter(newSong => 
        !currentSongs.find(currentSong => currentSong.id === newSong.id)
      );
      
      // Check for removed songs
      const removedSongs = currentSongs.filter(currentSong => 
        !newSongs.find(newSong => newSong.id === currentSong.id)
      );

      console.log('➕ Songs to add:', addedSongs.map(s => s.title))
      console.log('➖ Songs to remove:', removedSongs.map(s => s.title))

      // Process removals first
      for (const removedSong of removedSongs) {
        console.log('🗑️ Removing song:', removedSong.title)
        await removeSongFromSetlist(updatedSetlist.id, removedSong.id);
      }

      // Process additions - add them at the correct position
      for (const addedSong of addedSongs) {
        const orderIndex = newSongs.findIndex(s => s.id === addedSong.id);
        console.log('➕ Adding song:', addedSong.title, 'at position:', orderIndex + 1)
        await addSongToSetlist(updatedSetlist.id, addedSong, orderIndex + 1);
      }

      console.log('✅ handleUpdateSetlist completed successfully')
      // viewingSetlist will be updated automatically by the useEffect

    } catch (error) {
      console.error('❌ Failed to update setlist:', error);
    }
  };

  const editSong = (song) => {
    // Edit song in the main editor
    setCurrentSong(song);
    setIsEditing(true);
  };

  const editSongInModal = (song, songList = songs) => {
    // Open modal in edit mode
    setModalSong(song);
    setModalSongList(songList);
    setModalOpen(true);
    setStartInEditMode(true);

    // Use setTimeout to ensure the modal is open before setting edit mode
    setTimeout(() => {
      setStartInEditMode(true);
    }, 10);
  };

  const openModal = (song, songList = songs) => {
    setModalSong(song);
    setModalSongList(songList);
    setModalOpen(true);
    setStartInEditMode(false);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalSong(null);
    setModalSongList([]);
    setStartInEditMode(false);
  };

  const navigateModal = (song) => {
    setModalSong(song);
    setStartInEditMode(false); // Reset edit mode when navigating
  };

  // Open modal from setlist viewer with setlist songs
  const openModalFromSetlist = (song) => {
    if (viewingSetlist) {
      openModal(song, viewingSetlist.songs);
    } else {
      openModal(song);
    }
  };

  const resetEditMode = () => {
    setStartInEditMode(false);
  };

  const newSong = () => {
    setCurrentSong({ id: null, title: '', lyrics: '' });
    setIsEditing(true);
  };

  const backToSetlists = () => {
    setViewingSetlist(null);
    setActiveTab('setlists');
  };

  const viewSetlist = (setlist) => {
    setViewingSetlist(setlist);
  };

  return (
    <div className="app">
      {/* <header className="app-header">
        <h1>🎵 Lyrics & Setlist Manager</h1>
        <p>Create, edit, and manage your song lyrics and setlists</p>
      </header> */}

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
                onSave={handleSaveSong}
                isEditing={isEditing}
                onNew={newSong}
              />
            </div>

            <div className="songs-section">
              <SongList 
                songs={songs}
                onEdit={editSongInModal}
                onDelete={handleDeleteSong}
                onView={openModal}
              />
            </div>
          </>
        ) : (
          <div className="setlists-section">
            {viewingSetlist ? (
              <SetlistViewer
                setlist={viewingSetlist}
                songs={songs}
                onBack={backToSetlists}
                onViewSong={openModalFromSetlist}
                onUpdateSetlist={handleUpdateSetlist}
              />
            ) : (
              <SetlistManager
                songs={songs}
                setlists={setlists}
                onCreateSetlist={handleSaveSetlist}
                onUpdateSetlist={handleUpdateSetlist}
                onDeleteSetlist={handleDeleteSetlist}
                onViewSetlist={viewSetlist}
                onAddSongToSetlist={addSongToSetlist}
                onRemoveSongFromSetlist={removeSongFromSetlist}
              />
            )}
          </div>
        )}
      </main>

      {/* Lyrics Modal */}
      <LyricsModal
        song={modalSong}
        songs={modalSongList}
        isOpen={modalOpen}
        onClose={closeModal}
        onEdit={editSong}
        onDelete={handleDeleteSong}
        onNavigate={navigateModal}
        onSave={handleSaveSong}
        startInEditMode={startInEditMode}
        onResetEditMode={resetEditMode}
      />
    </div>
  )
}

export default App

function App() {
  return (
    <AuthProvider>
      <AuthenticatedApp>
        <MainApp />
      </AuthenticatedApp>
    </AuthProvider>
  );
}
