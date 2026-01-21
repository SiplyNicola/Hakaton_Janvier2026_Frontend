import React, { useState } from 'react';
import { noteService } from '../../../services/note-service';
import { folderService } from '../../../services/folder-service';
import JSZip, { folder } from 'jszip';
import { saveAs } from 'file-saver';
import "./TreeItem.css";


export default function TreeItem({ item, type, onSelectNote, onRefresh, user, fromTrash }: any) {
    const [isOpen, setIsOpen] = useState(false);
    const [isZipping, setIsZipping] = useState(false);

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm(`Do you want to send this ${type === 'note' ? 'parchment' : 'grimoir'} to the grave?`)) return;
        
        /*if (type === "note") await noteService.delete(item.id);
        else await folderService.delete(item.id);*/
        console.log("Trashing item:", item, "of type:", type);
        if (type === "note") await noteService.trash(item.id);
        else await folderService.trash(item.id);
        onRefresh();
    };

    const handleRestore = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if(!confirm(`Do you want to restore this ${type === 'note' ? 'parchement' : 'grimoir'} ?")`)) return;

        if(type === "note") await noteService.restore(item.id);
        else await folderService.restore(item.id);
        onRefresh();
    };

    const handleDeleteDefinitely = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if(!confirm(`Do you want to delete definitely this ${type === 'note' ? 'parchement' : 'grimoir'} ?`)) return;

        if(type === "note") await noteService.delete(item.id);
        else await folderService.delete(item.id);
        onRefresh();
    }

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
        const raw = prompt(`Name of the ${subType === 'note' ? 'parchment' : 'grimoir'} :`);
       
        if (raw === null) return; 

        const name = raw.trim() || (subType === 'note' ? "Untitled Parchment" : "New Grimoir");

        if (subType === 'note') {
            await noteService.create({ title: name, content_markdown: "", owner_id: user.id, folder_id: item.id });
        } else {
            await folderService.create(name, user.id, item.id);
        }
        setIsOpen(true);
        onRefresh();
    };


    const sanitizeName = (name: string) => {
        return (name || "Untitled").replace(/[/\\?%*:|"<>]/g, '-');
    };

    const addFolderToZip = async (folderItem: any, zipFolder: JSZip | null) => {
        if (!zipFolder) return;

        if (folderItem.notes && folderItem.notes.length > 0) {
            for (const notePartial of folderItem.notes) {
                try {
                    const fullNote = await noteService.getById(notePartial.id);
                    const fileName = sanitizeName(fullNote.title) + ".md";
                    const content = fullNote.content_markdown || "";
                    
                    zipFolder.file(fileName, content);
                } catch (err) {
                    console.error(`Impossible de récupérer la note ${notePartial.title}`, err);
                    zipFolder.file(sanitizeName(notePartial.title) + "_ERROR.txt", "Error fetching content");
                }
            }
        }

        if (folderItem.subFolders && folderItem.subFolders.length > 0) {
            for (const subFolder of folderItem.subFolders) {
                const subZipFolder = zipFolder.folder(sanitizeName(subFolder.name));
                await addFolderToZip(subFolder, subZipFolder);
            }
        }
    };

    const handleExportZip = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isZipping) return;

        try {
            setIsZipping(true);
            const zip = new JSZip();
            const rootName = sanitizeName(item.name);
            
            const rootFolder = zip.folder(rootName);
            
            await addFolderToZip(item, rootFolder);

            const content = await zip.generateAsync({ type: "blob" });
            
            saveAs(content, `${rootName}.zip`);
        } catch (error) {
            console.error("Erreur lors de la création du ZIP", error);
            alert("Erreur lors de l'exportation du Grimoire.");
        } finally {
            setIsZipping(false);
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
                    {item.title || "Untitled Parchment"}
                </span>

                {/* Les boutons sont maintenant en position: absolute grâce au CSS */}
                <div className="item-actions">
                    { fromTrash ? 
                        <>
                            <button title='Revive' onClick={handleRestore}>↩️</button>
                            <button title='Bury' onClick={handleDeleteDefinitely}>❌</button>
                        </>
                        :  
                        <>
                            <button title='Rename' onClick={handleRename}>✏️</button>
                            <button title='Trash' onClick={handleDelete}>🗑️</button>
                        </> 
                    }
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
                    {item.name || "Untitled Grimoir"}
                </span>

                <div className="item-actions">
                    { fromTrash ? 
                        <>
                            <button title='Revive' onClick={handleRestore}>↩️</button>
                            <button title='Bury' onClick={handleDeleteDefinitely}>❌</button>
                        </>
                        :  
                        <>
                            <button onClick={handleExportZip} title="Download ZIP Archive">
                                {isZipping ? '⏳' : '📦'}
                            </button>
                            <button onClick={(e) => handleAddSubItem(e, 'folder')}>📁+</button>
                            <button onClick={(e) => handleAddSubItem(e, 'note')}>📜+</button>
                            <button onClick={handleRename}>✏️</button>
                            <button onClick={handleDelete}>🗑️</button>
                        </> 
                    }
                    
                </div>
            </div>
            {isOpen && (
                <div className="folder-content">
                    {item.subFolders?.map((sf: any) => (
                        <TreeItem key={`f-${sf.id}`} item={sf} type="folder" onSelectNote={onSelectNote} onRefresh={onRefresh} user={user} fromTrash={fromTrash} />
                    ))}
                    {item.notes?.map((n: any) => (
                        <TreeItem key={`n-${n.id}`} item={n} type="note" onSelectNote={onSelectNote} onRefresh={onRefresh} fromTrash={fromTrash} />
                    ))}
                </div>
            )}
        </div>
    );
}