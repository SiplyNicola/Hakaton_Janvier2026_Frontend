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
        
        // Si vide, on met "Untitled Parchment" par défaut
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
            
            {/* BARRE DE RECHERCHE */}
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
                <button title="New grimoir" onClick={addRootFolder}>📁+</button>
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
            {/* LOGIQUE D'AFFICHAGE */}
            
            {searchQuery && searchResults ? (
                <div className="search-results">
                    {/* 1. On affiche d'abord les dossiers trouvés (sans titre) */}
                    {searchResults.folders.map((folder: any) => (
                        <TreeItem 
                            key={`search-f-${folder.id}`} 
                            item={folder} 
                            type="folder" 
                            onSelectNote={onSelectNote}
                            onRefresh={onRefresh}
                            user={user}
                        />
                    ))}

                    {/* 2. On affiche ensuite les notes trouvées (sans titre) */}
                    {searchResults.notes.map((note: any) => (
                        <TreeItem 
                            key={`search-n-${note.id}`} 
                            item={note} 
                            type="note" 
                            onSelectNote={onSelectNote}
                            onRefresh={onRefresh}
                        />
                    ))}

                    {/* 3. Message unique si ABSOLUMENT RIEN n'est trouvé */}
                    {searchResults.folders.length === 0 && searchResults.notes.length === 0 && (
                        <div className="empty-search">
                            Only cobwebs linger here... 🕸️
                        </div>
                    )}
                </div>
            ) : (
                // --- AFFICHAGE NORMAL (ARBRE COMPLET) ---
                <>
                    {data?.folders?.map((folder: any) => (
                        <TreeItem 
                            key={`f-${folder.id}`} 
                            item={folder} 
                            type="folder" 
                            onSelectNote={onSelectNote}
                            onRefresh={onRefresh}
                            user={user}
                        />
                    ))}
                    {data?.notes?.map((note: any) => (
                        <TreeItem 
                            key={`n-${note.id}`} 
                            item={note} 
                            type="note" 
                            onSelectNote={onSelectNote}
                            onRefresh={onRefresh}
                        />
                    ))}
                </>
            )}
        </nav>

        <button className="logout-btn" onClick={onLogout}>Log out </button>
    </aside>
);
}