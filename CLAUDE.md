# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Mermaid Live Editor is a fully client-side web application for creating and editing Mermaid diagrams in real-time. The application runs entirely in the browser with no backend required, using IndexedDB for persistent local storage.

## Architecture

### Frontend-Only Application
- **index.html**: Complete single-page application with embedded CSS and JavaScript
- **No build process**: Runs directly in any modern browser
- **No backend**: All functionality implemented client-side
- **CodeMirror**: Syntax-highlighted editor with YAML mode for Mermaid syntax
- **Mermaid.js v10.6.1**: Renders diagrams from CDN
- **IndexedDB**: Browser-native persistent storage for diagram files

### Data Storage (IndexedDB)

The application uses IndexedDB with the following structure:
- **Database name**: `MermaidEditorDB`
- **Version**: 1
- **Object store**: `diagrams` (keyPath: `id`)
- **Indexes**:
  - `name` (non-unique)
  - `created` (non-unique)

### File Structure
```json
{
  "id": "file_timestamp",
  "name": "diagram_name",
  "content": "mermaid_code",
  "created": "ISO_8601_timestamp"
}
```

## Development Commands

### Running Locally

**Option 1: Direct file access**
```bash
# Simply open index.html in a browser
open index.html  # macOS
xdg-open index.html  # Linux
start index.html  # Windows
```

**Option 2: Python HTTP server**
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

**Option 3: VS Code Live Server**
Install "Live Server" extension, then right-click `index.html` → "Open with Live Server"

### Deployment

This is a static site that can be deployed to:
- GitHub Pages
- Netlify
- Vercel
- Cloudflare Pages
- Any static file hosting service

No build step required - just upload `index.html` and the `images/` directory.

## Key Implementation Details

### IndexedDB Wrapper Functions

The application includes Promise-based wrapper functions for IndexedDB operations (index.html:429-528):
- `initDB()` - Opens/creates database and object store
- `saveToIndexedDB(fileData)` - Saves/updates file
- `loadFromIndexedDB(fileId)` - Retrieves specific file
- `getAllFilesFromIndexedDB()` - Returns all files
- `deleteFromIndexedDB(fileId)` - Deletes file

### File ID Generation

New files use timestamp-based IDs: `file_${Date.now()}` (index.html:740)

### File Management Flow

**Save operation** (index.html:738-755):
- If `currentFileId` is null, generates new ID
- Preserves original `created` timestamp for existing files
- Updates `created` timestamp only for new files

**Load operation** (index.html:716-736):
- Sets `currentFileId` to track active file
- Updates CodeMirror editor with file content
- 100ms delay before preview update to ensure CodeMirror processes content

**File list** (index.html:692-714):
- Sorted by creation date (newest first)
- Active file highlighted with `.active` class

### Preview Rendering

- Uses mermaid.render() API with diagram ID: "mermaid-diagram"
- Old diagram elements removed before re-rendering (index.html:672-675)
- Error handling displays errors in preview pane
- Real-time updates on editor changes

### UI Components

**Resizable panels** (index.html:566-590):
- Editor width constrained between 15% and 85% of container
- Percentage-based widths for responsive behavior
- Mouse drag interaction with visual feedback

**Zoom/Pan controls** (index.html:594-659):
- Zoom range: 0.1 to 5x
- Mouse wheel zoom support
- Click-and-drag panning
- Transform origin at (0, 0)

**Sidebar** (index.html:793-804):
- Initializes collapsed on page load (index.html:809)
- CSS transition for smooth animation
- Overlay for mobile-like UX

### Application Initialization

On DOMContentLoaded (index.html:807-820):
1. Collapse sidebar
2. Initialize IndexedDB connection
3. Load file list from IndexedDB
4. Render initial preview

Error handling for browsers without IndexedDB support included.

## Browser Compatibility

Requires IndexedDB support:
- Chrome/Edge 24+
- Firefox 16+
- Safari 10+
- Opera 15+

## Data Privacy

All data stored locally in browser's IndexedDB. No server communication. Each browser/device has independent storage.

## Common Development Patterns

### Adding New Features

All code lives in a single `index.html` file with three sections:
- **Lines 11-358**: CSS styles in `<style>` tag
- **Lines 360-419**: HTML structure in `<body>`
- **Lines 421-821**: JavaScript in `<script>` tag

### Testing IndexedDB Operations

Use browser DevTools:
- Chrome/Edge: Application tab → Storage → IndexedDB → MermaidEditorDB
- Firefox: Storage Inspector → IndexedDB → MermaidEditorDB

### Debugging Preview Issues

Common issues:
- Check mermaid syntax errors in browser console
- Verify diagram ID cleanup (old elements removed)
- Check 100ms timeout after CodeMirror setValue()

### Modifying Storage Schema

To change IndexedDB schema:
1. Increment `DB_VERSION` constant (index.html:424)
2. Add migration logic in `onupgradeneeded` handler (index.html:444-454)
