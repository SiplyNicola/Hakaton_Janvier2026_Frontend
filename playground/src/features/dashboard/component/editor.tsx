import { useState, useEffect } from 'react';
import MDEditor from "@uiw/react-md-editor";
import "./editor.css";

interface Note {
    id: number;
    title: string;
    content_markdown: string;
    is_write_mode?: boolean; 
}

const API_URL = import.meta.env.VITE_API_URL; 

export function Editor({ note, onSave }: { note: Note, onSave: (n: any) => void }) {

    const [mode, setMode] = useState<'write' | 'read'>(note.is_write_mode ? 'write' : 'read');
    const [content, setContent] = useState(note.content_markdown || "");
    const [title, setTitle] = useState(note.title);

    useEffect(() => {
        setContent(note.content_markdown || "");
        setTitle(note.title);
        setMode(note.is_write_mode ? 'write' : 'read');
    }, [note.id, note.is_write_mode, note.title, note.content_markdown]);

    const [meta, setMeta] = useState({ chars: 0, words: 0, lines: 0, size: 0 });

    useEffect(() => {
        const words = content.trim() ? content.trim().split(/\s+/).length : 0;
        const lines = content.split('\n').length;
        const size = new TextEncoder().encode(content).length;
        setMeta({ chars: content.length, words, lines, size });
    }, [content]);


    const handleSwitchMode = async (newMode: 'write' | 'read') => {
        setMode(newMode);

        const isWriteMode = newMode === 'write';

        try {

            const response = await fetch(`${API_URL}/note/${note.id}/mode`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    is_write_mode: isWriteMode
                }),
            });

            if (!response.ok) {
                console.error("Erreur lors de la sauvegarde du mode");
            } else {

                note.is_write_mode = isWriteMode; 
            }
        } catch (error) {
            console.error("Erreur réseau :", error);
        }
    };

    return (
        <div className="editor-container">
            <header className="editor-header">
                <input className="note-title" value={title} onChange={(e) => setTitle(e.target.value)} />
                <div className="mode-toggle">
                    {/* Utilisation de handleSwitchMode au lieu de setMode direct */}
                    <button 
                        onClick={() => handleSwitchMode('write')} 
                        className={mode === 'write' ? 'active' : ''}
                    >
                        Writing
                    </button>
                    <button 
                        onClick={() => handleSwitchMode('read')} 
                        className={mode === 'read' ? 'active' : ''}
                    >
                        Reading
                    </button>
                    
                    <button className="save-btn" onClick={() => onSave({...note, title, content_markdown: content})}>
                        Save Scroll
                    </button>
                </div>
            </header>

            <div className="content-area">
                {mode === 'write' ? (    
                    <div className="md-editor-wrapper">
                        <MDEditor
                            value={content}
                            onChange={(v) => setContent(v ?? "")}
                            height={390}
                            preview="edit"    
                            visibleDragbar={false}
                        />
                    </div>
                ) : (
                    <div className="markdown-render">
                        <MDEditor.Markdown 
                            source={content} 
                        />
                    </div>
                )}
            </div>

            <footer className="metadata-bar">
                <span>Lines: {meta.lines}</span>
                <span>Words: {meta.words}</span>
                <span>Characters: {meta.chars}</span>
                <span>Size: {meta.size} Byte</span>
            </footer>
        </div>
    );
}