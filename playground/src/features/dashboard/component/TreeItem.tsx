import { useState } from 'react';
import { noteService } from '../../../services/note-service';
import { folderService } from '../../../services/folder-service';
import "./TreeItem.css";


export default function TreeItem({ item, type, onSelectNote, onRefresh, user }: any) {
    const [isOpen, setIsOpen] = useState(false);

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm(`Do you want to delete this ${type === 'note' ? 'parchment' : 'folder'} ?`)) return;
        
        if (type === "note") await noteService.delete(item.id);
        else await folderService.delete(item.id);
        onRefresh();
    };

    const handleRename = async (e: React.MouseEvent) => {
        e.stopPropagation();
        const newName = prompt("New name :", item.title || item.name);
        if (!newName) return;

        if (type === "note") {
            await noteService.update(item.id, { ...item, title: newName });
        } else {
            await folderService.update(item.id, newName, item.parentId);
        }
        onRefresh();
    };

    const handleAddSubItem = async (e: React.MouseEvent, subType: 'note' | 'folder') => {
        e.stopPropagation();
        const name = prompt(`Name of the ${subType === 'note' ? 'parchment' : 'folder'} :`);
        
        if (name !== null) { 
            const titleToUse = name === "" ? "" : name;
            
            if (subType === 'note') {
                await noteService.create({ title: titleToUse, content_markdown: "", owner_id: user.id, folder_id: item.id });
            } else {
                await folderService.create(titleToUse, user.id, item.id);
            }
            setIsOpen(true);
            onRefresh();
        }
    };

    // --- RENDER NOTE ---
    if (type === "note") {
        return (
            <div className="tree-item-row note" onClick={() => onSelectNote(item.id)}>
                {/* 1. On sépare l'icône */}
                <span style={{ marginRight: '5px', backgroundColor: 'transparent' }}>📜</span>
                
                {/* 2. On met le titre dans son propre span avec la classe CSS spéciale */}
                <span className="tree-item-title" title={item.title}>
                    {item.title || "Untitled Note"}
                </span>

                {/* Les boutons sont maintenant en position: absolute grâce au CSS */}
                <div className="item-actions">
                    <button onClick={handleRename}>✏️</button>
                    <button onClick={handleDelete}>🗑️</button>
                </div>
            </div>
        );
    }

    // --- RENDER FOLDER ---
    return (
        <div className="tree-folder">
            <div className="tree-item-row folder" onClick={() => setIsOpen(!isOpen)}>
                {/* 1. On sépare l'icône */}
                <span style={{ marginRight: '5px', backgroundColor: 'transparent' }}>{isOpen ? '📂' : '📁'}</span>
                
                {/* 2. On met le nom dans son propre span avec la classe CSS spéciale */}
                <span className="tree-item-title" title={item.name}>
                    {item.name || "Untitled Folder"}
                </span>

                <div className="item-actions">
                    <button onClick={(e) => handleAddSubItem(e, 'folder')}>📁+</button>
                    <button onClick={(e) => handleAddSubItem(e, 'note')}>📜+</button>
                    <button onClick={handleRename}>✏️</button>
                    <button onClick={handleDelete}>🗑️</button>
                </div>
            </div>
            {isOpen && (
                <div className="folder-content">
                    {item.subFolders?.map((sf: any) => (
                        <TreeItem key={`f-${sf.id}`} item={sf} type="folder" onSelectNote={onSelectNote} onRefresh={onRefresh} user={user} />
                    ))}
                    {item.notes?.map((n: any) => (
                        <TreeItem key={`n-${n.id}`} item={n} type="note" onSelectNote={onSelectNote} onRefresh={onRefresh} />
                    ))}
                </div>
            )}
        </div>
    );
}