import { folderService } from '../../../services/folder-service';
import { noteService } from '../../../services/note-service';
import TreeItem from './TreeItem';


export function Sidebar({ data, onSelectNote, onRefresh, user, onLogout }: any) {
    
    const addRootFolder = async () => {
        const name = prompt("Nom du nouveau grimoire (dossier) :");
        if (name) {
            await folderService.create(name, user.id);
            onRefresh();
        } else { 
            await folderService.create("", user.id);
            onRefresh();
        }
    };

    const addRootNote = async () => {
        const title = prompt("Titre du nouveau parchemin (note) :");
        if (title) {
            await noteService.create({
                title,
                content_markdown: "",
                owner_id: user.id,
                folder_id: null
            });
            onRefresh();
        }
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <h3>Grimoire de {user.username}</h3>
                <div className="quick-actions">
                    <button title="Nouveau dossier" onClick={addRootFolder}>📁+</button>
                    <button title="Nouveau parchemin" onClick={addRootNote}>📜+</button>
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

            <button className="logout-btn" onClick={onLogout}>S'enfuir</button>
        </aside>
    );
}