import { folderService } from '../../../services/folder-service';
import { noteService } from '../../../services/note-service';
import TreeItem from './TreeItem';
import "./SideBar.css";
import { useMemo, useState } from 'react';
import { searchGrimoire } from '../../../utils/searchUtils';


export function Sidebar({ data, onSelectNote, onTrashStatus, trashStatus, onRefresh, user, onLogout }: any) {

    const [searchQuery, setSearchQuery] = useState("");

    const addRootFolder = async () => {
        const name = prompt("Name of the new grimoir (folder):");
        if (name === null) return; 
    
        const finalName = name.trim() || "New Grimoir";
        
        await folderService.create(finalName, user.id);
        onRefresh();
    };

    const addRootNote = async () => {
        const title = prompt("Title of the new parchment (note) :");
        if (title === null) return; 
        
        // If empty, default to "Untitled Parchment"
        const finalTitle = title.trim() || "Untitled Parchment";

        await noteService.create({
            title: finalTitle,
            content_markdown: "",
            owner_id: user.id,
            folder_id: null
        });
        onRefresh();
    };

    const searchResults = useMemo(() => {
        return searchGrimoire(searchQuery, data || { folders: [], notes: [] });
    }, [searchQuery, data]);

    const buttonView = {
        living: {caption:"View the Living", emote: "🤵‍♂️"},
        dead: {caption:"View the Dead", emote: "🧟‍♂️"}
    };

   return (
    <aside className="sidebar">
        <div className="sidebar-header">
            <h3>🎃 {user.username}'s Scriptorium</h3>
            
            {/* SEARCH BAR */}
            <div className="search-bar-container" style={{marginBottom: '10px', padding: '0 5px'}}>
                <input 
                    type="text" 
                    placeholder="🔍 Search..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                />
            </div>

            <div className="quick-actions">
                <button title="New grimoir" onClick={addRootFolder}>📘+</button>
                <button title="New parchment" onClick={addRootNote}>📜+</button>
                <button 
                    title={buttonView[trashStatus ? "living" : "dead"].caption} 
                    onClick={onTrashStatus}
                >
                    {buttonView[trashStatus ? "living" : "dead"].emote}
                </button>
            </div>
        </div>
        
        <nav className="tree-navigation">
            {/* DISPLAY LOGIC */}
            
            {searchQuery && searchResults ? (
                <div className="search-results">
                    {/* 1. First, we display the folders found (without title) */}
                    {searchResults.folders.map((folder: any) => (
                        <TreeItem 
                            key={`search-f-${folder.id}`} 
                            item={folder} 
                            type="folder" 
                            onSelectNote={onSelectNote}
                            onRefresh={onRefresh}
                            user={user}
                            isRoot={!folder.parentId}
                        />
                    ))}

                    {/* 2. Next, we display the notes found (without title) */}
                    {searchResults.notes.map((note: any) => (
                        <TreeItem 
                            key={`search-n-${note.id}`} 
                            item={note} 
                            type="note" 
                            onSelectNote={onSelectNote}
                            onRefresh={onRefresh}
                            isRoot={false}
                        />
                    ))}

                    {/* 3. Single message if ABSOLUTELY NOTHING is found */}
                    {searchResults.folders.length === 0 && searchResults.notes.length === 0 && (
                        <div className="empty-search">
                            Only cobwebs linger here... 🕸️
                        </div>
                    )}
                </div>
            ) : (
                // --- NORMAL DISPLAY (FULL TREE) ---
                <>
                    {data?.folders?.map((folder: any) => (
                        <TreeItem 
                            key={`f-${folder.id}`} 
                            item={folder} 
                            type="folder" 
                            onSelectNote={onSelectNote}
                            onRefresh={onRefresh}
                            user={user}
                            isRoot={true}
                        />
                    ))}
                    {data?.notes?.map((note: any) => (
                        <TreeItem 
                            key={`n-${note.id}`} 
                            item={note} 
                            type="note" 
                            onSelectNote={onSelectNote}
                            onRefresh={onRefresh}
                            isRoot={false} 
                        />
                    ))}
                </>
            )}
        </nav>

        <button className="logout-btn" onClick={onLogout}>Log out </button>
    </aside>
);
}