import { folderService } from '../../../services/folder-service';
import { noteService } from '../../../services/note-service';
import TreeItem from './TreeItem';
import "./SideBar.css";



export function Sidebar({ data, onSelectNote, onTrashStatus, trashStatus, onRefresh, user, onLogout }: any) {
    const addRootFolder = async () => {
        const name = prompt("Name of the new grimoir (folder):");
        if (name === null) return; // cancelled
        const trimmed = name.trim();
        if (!trimmed) return; // empty
        await folderService.create(trimmed, user.id);
        onRefresh();
    };

    const addRootNote = async () => {
        const title = prompt("Title of the new parchment (note) :");
        if (title === null) return; // cancelled
        const trimmed = title.trim();
        if (!trimmed) return; // empty
        await noteService.create({
            title: trimmed,
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
            </nav>

            <button className="logout-btn" onClick={onLogout}>Log out </button>
        </aside>
    );
}