import { useState, useEffect } from 'react';
import MDEditor from "@uiw/react-md-editor";
import "./editor.css";

export function Editor({ note, onSave }: { note: any, onSave: (n: any) => void }) {
    const [mode, setMode] = useState<'write' | 'read'>('write');
    const [content, setContent] = useState(note.content_markdown || "");
    const [title, setTitle] = useState(note.title);

    useEffect(() => {
        setContent(note.content_markdown || "");
        setTitle(note.title);
    }, [note.id]);

    const [meta, setMeta] = useState({ chars: 0, words: 0, lines: 0, size: 0 });

    useEffect(() => {
        const words = content.trim() ? content.trim().split(/\s+/).length : 0;
        const lines = content.split('\n').length;
        const size = new TextEncoder().encode(content).length;
        setMeta({ chars: content.length, words, lines, size });
    }, [content]);

    return (
        <div className="editor-container">
            <header className="editor-header">
                <input className="note-title" value={title} onChange={(e) => setTitle(e.target.value)} />
                <div className="mode-toggle">
                    <button onClick={() => setMode('write')} className={mode === 'write' ? 'active' : ''}>Writing</button>
                    <button onClick={() => setMode('read')} className={mode === 'read' ? 'active' : ''}>Reading</button>
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
                <span>Charaters: {meta.chars}</span>
                <span>size: {meta.size} Byte</span>
            </footer>
        </div>
    );
}