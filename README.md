# 🎵 Lyrics & Setlist Manager

A React-based web application for managing song lyrics and setlists. This application allows musicians, performers, and music enthusiasts to create, edit, organize, and view their song lyrics collection with a modern, user-friendly interface.

## 📋 Project Overview

**Repository**: setlist-manager  
**Owner**: jollemak  
**Branch**: main  
**Technology Stack**: React 19.1.0 + Vite 7.0.4  
**Project Type**: Single Page Application (SPA)  
**Data Storage**: Browser localStorage (client-side persistence)

## ✨ Features

### Core Functionality

- **Song Creation**: Create new songs with title and lyrics
- **Song Editing**: Edit existing songs inline or via modal
- **Song Management**: Delete songs with confirmation
- **Setlist Creation**: Create named setlists and organize songs
- **Setlist Management**: Add/remove songs, reorder setlist items
- **Search & Filter**: Real-time search through song titles and lyrics
- **Data Persistence**: Automatic saving to browser localStorage
- **Responsive Design**: Works on desktop and mobile devices

### User Interface

- **Navigation Tabs**: Switch between Songs and Setlists sections
- **Main Editor**: Primary interface for creating new songs
- **Song List**: Grid view of all songs with quick actions
- **Setlist Manager**: Create and manage setlists with drag-and-drop ordering
- **Modal Viewer**: Full-screen lyrics display with navigation
- **Typography Controls**: Font size, alignment, bold, italic, case options
- **Keyboard Navigation**: Arrow keys for song navigation in modal

### Data Management

- **Local Storage**: All songs and setlists persist in browser localStorage
- **Automatic Saving**: Changes saved immediately
- **Import/Export**: Ready for future cloud sync features
- **Unique IDs**: Timestamp-based song and setlist identification
- **Relationship Management**: Setlists reference songs by ID

## 🏗️ Architecture

### Component Structure

```
src/
├── App.jsx                 # Main application component & state management
├── main.jsx               # React app entry point
├── App.css                # Global styles and component styling
├── index.css              # Base HTML/body styles
└── components/
    ├── LyricsEditor.jsx   # Song creation/editing form
    ├── SongList.jsx       # Song collection display with search
    ├── LyricsModal.jsx    # Full-screen lyrics viewer with navigation
    └── SetlistManager.jsx # Setlist creation and management interface
```

### State Management

The application uses React's built-in state management with hooks:

- **App.jsx**: Central state container for all songs and UI state
- **useState**: Local component state for forms and UI interactions
- **useEffect**: Side effects for localStorage sync and modal controls
- **Prop drilling**: Parent-to-child component communication

### Data Flow

1. **Songs Array**: Main data structure stored in App.jsx state
2. **localStorage Sync**: Bidirectional sync on app load and data changes
3. **CRUD Operations**: Create, Read, Update, Delete via state setters
4. **Component Props**: Data and callbacks passed down to child components

## 🔧 Development Setup

### Tech Stack

- **React**: 19.1.0 (latest stable)
- **Vite**: 7.0.4 (build tool and dev server)
- **ESLint**: 9.30.1 (code linting)
- **Node.js**: Required for development

### Available Scripts

```bash
npm run dev      # Start development server (Vite)
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint code analysis
```

### Project Dependencies

**Runtime Dependencies:**

- `react`: ^19.1.0
- `react-dom`: ^19.1.0

**Development Dependencies:**

- `@vitejs/plugin-react`: ^4.6.0
- `eslint` + plugins for React
- `vite`: ^7.0.4

## 📱 User Experience

### Workflows

1. **Creating Songs**: Use main editor → Enter title and lyrics → Save
2. **Creating Setlists**: Switch to Setlists tab → Create new setlist → Add songs
3. **Managing Setlists**: Select setlist → Add/remove songs → Reorder with up/down buttons
4. **Viewing Songs**: Click song card → Modal opens with full lyrics
5. **Editing Songs**: Click edit button → Modal or main editor opens
6. **Finding Songs**: Use search box → Filter by title or lyrics content
7. **Managing Collection**: View all songs/setlists in grid → Quick actions available

### Interface Elements

- **Navigation Tabs**: Switch between Songs and Setlists sections
- **Header**: App title and description
- **Main Editor**: Left side for creating new songs (Songs tab)
- **Song List**: Right side showing all saved songs (Songs tab)
- **Setlist Manager**: Full-width setlist creation and management (Setlists tab)
- **Search Box**: Filter songs in real-time
- **Modal**: Full-screen lyrics viewer with formatting options

## 💾 Data Structure

### Song Object Schema

```javascript
{
  id: Number,           // Timestamp-based unique identifier
  title: String,        // Song title (required)
  lyrics: String,       // Song lyrics content (required)
  createdAt: String     // ISO date string of creation
}
```

### Setlist Object Schema

```javascript
{
  id: Number,           // Timestamp-based unique identifier
  name: String,         // Setlist name (required)
  songs: Array,         // Array of song objects in order
  createdAt: String,    // ISO date string of creation
  updatedAt: String     // ISO date string of last modification
}
```

### Storage Format

- **Songs Location**: `localStorage['songs']`
- **Setlists Location**: `localStorage['setlists']`
- **Format**: JSON arrays of respective objects
- **Persistence**: Automatic save on every change
- **Recovery**: Loaded on app initialization

## 🎯 Use Cases

### Target Users

- **Musicians**: Store and organize their repertoire
- **Performers**: Quick access to lyrics during performances
- **Bands**: Share and manage setlists
- **Music Teachers**: Organize songs for lessons
- **Karaoke Hosts**: Manage song collections

### Typical Scenarios

- Preparing for live performances
- Organizing practice sessions
- Creating themed setlists
- Backing up handwritten lyrics digitally
- Quick reference during performances

## 🔮 Future Enhancement Opportunities

### Potential Features

- Cloud synchronization and backup
- ~~Setlist creation and management~~ ✅ **IMPLEMENTED**
- Chord notation support
- Collaborative editing
- Export to PDF/print formats
- Import from popular formats
- Category/genre tagging
- Performance mode (larger text, auto-scroll)
- Setlist sharing and collaboration
- Drag-and-drop setlist reordering

### Technical Improvements

- TypeScript migration
- Backend API integration
- User authentication
- Offline PWA capabilities
- Advanced search (fuzzy matching)
- Undo/redo functionality

## 🛠️ Development Notes

### Code Patterns

- **Functional Components**: All components use React hooks
- **State Lifting**: Centralized state management in App.jsx
- **Event Handling**: Comprehensive user interaction handling
- **Error Prevention**: Input validation and user confirmations
- **Accessibility**: Semantic HTML and proper labeling

### Styling Approach

- **CSS-in-File**: Traditional CSS with component-scoped classes
- **Responsive Design**: Grid layouts and flexible typography
- **Modern UI**: Clean, minimalist design with subtle shadows
- **Accessibility**: Good contrast ratios and keyboard navigation

This project serves as a solid foundation for a lyrics management system and can be extended with additional features as needed.
