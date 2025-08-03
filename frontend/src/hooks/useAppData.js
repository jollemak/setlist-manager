import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import songsService from '../services/songs';
import setlistsService from '../services/setlists';

export const useAppData = () => {
  const [songs, setSongs] = useState([]);
  const [setlists, setSetlists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Load user's songs and setlists when component mounts or user changes
  useEffect(() => {
    if (user) {
      loadUserData();
    } else {
      // Clear data if user logs out
      setSongs([]);
      setSetlists([]);
      setLoading(false);
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Load songs and setlists in parallel
      const [songsResponse, setlistsResponse] = await Promise.all([
        songsService.getSongs(),
        setlistsService.getSetlists()
      ]);

      // Handle songs response
      if (songsResponse.success && songsResponse.data) {
        setSongs(songsResponse.data.songs || songsResponse.data);
      } else {
        console.error('Failed to load songs:', songsResponse);
        setSongs([]);
      }

      // Handle setlists response
      if (setlistsResponse.success && setlistsResponse.data) {
        const setlistsData = setlistsResponse.data.setlists || setlistsResponse.data;
        console.log('📥 Raw setlists data from backend:', setlistsData);
        // Ensure each setlist has a songs array
        const normalizedSetlists = Array.isArray(setlistsData) ? setlistsData.map(setlist => ({
          ...setlist,
          songs: setlist.songs || []
        })) : [];
        console.log('📋 Normalized setlists before setting state:', normalizedSetlists.map(s => ({ id: s.id, name: s.name, songs: s.songs.map(song => song.title) })));
        setSetlists(normalizedSetlists);
        console.log('✅ setSetlists called with normalized data');
      } else {
        console.error('Failed to load setlists:', setlistsResponse);
        setSetlists([]);
      }
    } catch (err) {
      console.error('Error loading user data:', err);
      setError('Failed to load your data. Please try refreshing the page.');
    } finally {
      setLoading(false);
    }
  };

  const saveSong = async (songData) => {
    try {
      let response;
      
      if (songData.id && songs.find(song => song.id === songData.id)) {
        // Update existing song
        response = await songsService.updateSong(songData.id, songData);
        if (response.success) {
          const updatedSong = response.data.song || response.data;
          setSongs(prevSongs => 
            prevSongs.map(song => song.id === songData.id ? updatedSong : song)
          );
          return updatedSong;
        }
      } else {
        // Create new song
        const newSongData = { ...songData };
        delete newSongData.id; // Remove ID for new songs
        
        response = await songsService.createSong(newSongData);
        if (response.success) {
          const newSong = response.data.song || response.data;
          setSongs(prevSongs => [...prevSongs, newSong]);
          return newSong;
        }
      }
      
      if (!response.success) {
        throw new Error(response.error || response.message || 'Failed to save song');
      }
    } catch (err) {
      console.error('Error saving song:', err);
      setError('Failed to save song. Please try again.');
      throw err;
    }
  };

  const deleteSong = async (songId) => {
    try {
      const response = await songsService.deleteSong(songId);
      if (response.success) {
        setSongs(prevSongs => prevSongs.filter(song => song.id !== songId));
        
        // Also update setlists to remove this song
        setSetlists(prevSetlists => 
          prevSetlists.map(setlist => ({
            ...setlist,
            songs: setlist.songs.filter(song => song.id !== songId)
          }))
        );
      } else {
        throw new Error(response.error || response.message || 'Failed to delete song');
      }
    } catch (err) {
      console.error('Error deleting song:', err);
      setError('Failed to delete song. Please try again.');
      throw err;
    }
  };

  const saveSetlist = async (setlistData) => {
    try {
      let response;
      
      if (setlistData.id && setlists.find(setlist => setlist.id === setlistData.id)) {
        // For existing setlists, only update metadata (name, etc.), not songs
        // Songs should be updated via separate addSongToSetlist/removeSongFromSetlist functions
        const metadataOnly = { name: setlistData.name };
        response = await setlistsService.updateSetlist(setlistData.id, metadataOnly);
        if (response.success) {
          const updatedSetlist = response.data.setlist || response.data;
          
          // Get the current setlist to preserve songs array
          const currentSetlist = setlists.find(s => s.id === setlistData.id);
          updatedSetlist.songs = currentSetlist?.songs || [];
          
          setSetlists(prevSetlists => 
            prevSetlists.map(setlist => setlist.id === setlistData.id ? updatedSetlist : setlist)
          );
          return updatedSetlist;
        }
      } else {
        // Create new setlist
        const newSetlistData = { ...setlistData };
        delete newSetlistData.id; // Remove ID for new setlists
        delete newSetlistData.songs; // Remove songs for creation
        
        response = await setlistsService.createSetlist(newSetlistData);
        if (response.success) {
          const newSetlist = response.data.setlist || response.data;
          // Ensure songs array exists
          if (!newSetlist.songs) {
            newSetlist.songs = [];
          }
          setSetlists(prevSetlists => [...prevSetlists, newSetlist]);
          return newSetlist;
        }
      }
      
      if (!response.success) {
        throw new Error(response.error || response.message || 'Failed to save setlist');
      }
    } catch (err) {
      console.error('Error saving setlist:', err);
      setError('Failed to save setlist. Please try again.');
      throw err;
    }
  };

  const addSongToSetlist = async (setlistId, song, order = null) => {
    console.log('🎵 addSongToSetlist called:', { setlistId, songTitle: song.title, order })
    try {
      const payload = { songId: song.id };
      if (order !== null) {
        payload.order = order;
      }
      
      console.log('📡 Calling backend API with payload:', payload)
      const response = await setlistsService.addSongToSetlist(setlistId, payload);
      console.log('📨 Backend response:', response)
      
      if (response.success) {
        console.log('✅ Song added to setlist successfully')
        
        // Optimistically update the setlist state
        setSetlists(prevSetlists => 
          prevSetlists.map(setlist => {
            if (setlist.id === setlistId) {
              const updatedSongs = [...(setlist.songs || [])];
              // Add the song if it's not already there
              if (!updatedSongs.find(s => s.id === song.id)) {
                updatedSongs.push(song);
              }
              return { ...setlist, songs: updatedSongs };
            }
            return setlist;
          })
        );
        
        console.log('✅ addSongToSetlist completed successfully')
        return true;
      } else {
        throw new Error(response.error || response.message || 'Failed to add song to setlist');
      }
    } catch (err) {
      console.error('❌ Error adding song to setlist:', err);
      setError('Failed to add song to setlist. Please try again.');
      throw err;
    }
  };

  const removeSongFromSetlist = async (setlistId, songId) => {
    try {
      const response = await setlistsService.removeSongFromSetlist(setlistId, songId);
      if (response.success) {
        console.log('✅ Song removed from setlist successfully')
        
        // Optimistically update the setlist state
        setSetlists(prevSetlists => 
          prevSetlists.map(setlist => {
            if (setlist.id === setlistId) {
              const updatedSongs = (setlist.songs || []).filter(s => s.id !== songId);
              return { ...setlist, songs: updatedSongs };
            }
            return setlist;
          })
        );
        
        return true;
      } else {
        throw new Error(response.error || response.message || 'Failed to remove song from setlist');
      }
    } catch (err) {
      console.error('Error removing song from setlist:', err);
      setError('Failed to remove song from setlist. Please try again.');
      throw err;
    }
  };

  const reorderSetlistSongs = async (setlistId, newSongsOrder) => {
    try {
      // Use the efficient bulk reorder endpoint
      const songOrders = newSongsOrder.map((song, index) => ({
        songId: song.id,
        order: index + 1
      }));

      await setlistsService.reorderSongs(setlistId, songOrders);

      // Update state optimistically instead of reloading all data
      setSetlists(prevSetlists => 
        prevSetlists.map(setlist => 
          setlist.id === setlistId 
            ? { ...setlist, songs: [...newSongsOrder] }
            : setlist
        )
      );
      
      return true;
    } catch (err) {
      console.error('Error reordering songs:', err);
      setError('Failed to reorder songs. Please try again.');
      throw err;
    }
  };

  const deleteSetlist = async (setlistId) => {
    try {
      const response = await setlistsService.deleteSetlist(setlistId);
      if (response.success) {
        setSetlists(prevSetlists => prevSetlists.filter(setlist => setlist.id !== setlistId));
      } else {
        throw new Error(response.error || response.message || 'Failed to delete setlist');
      }
    } catch (err) {
      console.error('Error deleting setlist:', err);
      setError('Failed to delete setlist. Please try again.');
      throw err;
    }
  };

  const refreshData = () => {
    loadUserData();
  };

  const clearError = () => {
    setError(null);
  };

  return {
    songs,
    setlists,
    loading,
    error,
    saveSong,
    deleteSong,
    saveSetlist,
    deleteSetlist,
    addSongToSetlist,
    removeSongFromSetlist,
    reorderSetlistSongs,
    refreshData,
    clearError
  };
};
