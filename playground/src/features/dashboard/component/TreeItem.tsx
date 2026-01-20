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
        if (name !== null && name !== "") {
            if (subType === 'note') {
                await noteService.create({ title: name, content_markdown: "", owner_id: user.id, folder_id: item.id });
            } else {
                await folderService.create(name, user.id, item.id);
            }
            setIsOpen(true);
            onRefresh();
        } else {
            if (subType === 'note') {
                await noteService.create({ title: "", content_markdown: "", owner_id: user.id, folder_id: item.id });
            } else {
                await folderService.create("", user.id, item.id);
            }
            setIsOpen(true);
            onRefresh();
        }

    };

    if (type === "note") {
        return (
            <div className="tree-item-row note" onClick={() => onSelectNote(item.id)}>
                <span>📜 {item.title}</span>
                <div className="item-actions">
                    <button onClick={handleRename}>✏️</button>
                    <button onClick={handleDelete}>🗑️</button>
                </div>
            </div>
        );
    }

    return (
        <div className="tree-folder">
            <div className="tree-item-row folder" onClick={() => setIsOpen(!isOpen)}>
                <span>{isOpen ? '📂' : '📁'} {item.name}</span>
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