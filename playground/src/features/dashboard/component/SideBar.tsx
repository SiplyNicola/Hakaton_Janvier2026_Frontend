import { folderService } from '../../../services/folder-service';
import { noteService } from '../../../services/note-service';
import TreeItem from './TreeItem';
import "./SideBar.css";


export function Sidebar({ data, onSelectNote, onTrashStatus, trashStatus, onRefresh, user, onLogout }: any) {

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

    const buttonView = {
        living: {caption:"View the Living", emote: "📚"},
        dead: {caption:"View the Dead", emote: "⚰️"}
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <h3>🎃 {user.username}'s Scriptorium</h3>
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
                {data?.folders?.map((folder: any) => (
                    <TreeItem 
                        key={`f-${folder.id}`} 
                        item={folder} 
                        type="folder" 
                        onSelectNote={onSelectNote}
                        onRefresh={onRefresh}
                        user={user}
                        fromTrash={false}
                    />
                ))}
                {data?.notes?.map((note: any) => (
                    <TreeItem 
                        key={`n-${note.id}`} 
                        item={note} 
                        type="note" 
                        onSelectNote={onSelectNote}
                        onRefresh={onRefresh}
                        user={user}
                        fromTrash={false}
                    />
                ))}
            </nav>

            <button className="logout-btn" onClick={onLogout}>Log out </button>
        </aside>
    );
}