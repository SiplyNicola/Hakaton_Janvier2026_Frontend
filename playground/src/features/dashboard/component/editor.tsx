import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

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
                    <textarea 
                        className="markdown-input" 
                        value={content} 
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Inscrivez vos horreurs..."
                    />
                ) : (
                    <div className="markdown-render">
                        <ReactMarkdown>{content}</ReactMarkdown>
                    </div>
                )}
            </div>

            <footer className="metadata-bar">
                <span>Lignes: {meta.lines}</span>
                <span>Mots: {meta.words}</span>
                <span>Caractères: {meta.chars}</span>
                <span>Taille: {meta.size} octets</span>
            </footer>
        </div>
    );
}