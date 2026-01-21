import { useState, useEffect, useRef } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

import Showdown from 'showdown';
import TurndownService from 'turndown';
import "./editor.css";
import html2pdf from 'html2pdf.js';

// --- EXTENSION : LIENS INTERNES (WIKILINKS)
// Supporte : [[123]] ou [[123|Titre]] ou [[note:123|Titre]]
const internalLinkExtension = {
    type: 'lang',
    regex: /\[\[([^\]\|]+)(?:\|([^\]]+))?\]\]/g,
    replace: function (match: string, idPart: string, title?: string) {
        let id = idPart;
        if (idPart.startsWith('note:')) id = idPart.split(':')[1];
        const display = title || id;
        return `<a class="internal-note-link" href="/note/${id}" data-note-id="${id}">${display} style="cursor: pointer";</a>`;
    }
};

// --- CONFIGURATION DES CONVERTISSEURS ---

// 1. Showdown (Lecture : Markdown -> HTML)
const mdToHtmlConverter = new Showdown.Converter({
    strikethrough: true,    
    simpleLineBreaks: true, // "Enter" crée un saut de ligne <br>
    openLinksInNewWindow: false,
    extensions: [internalLinkExtension]
});

// 2. Turndown (Ecriture : HTML -> Markdown)
const htmlToMdConverter = new TurndownService({
    headingStyle: 'atx',      //  ### pour les titres
    codeBlockStyle: 'fenced', //  ``` pour le code
    emDelimiter: '*'          //  * pour l'italique
});



// BARRÉ (Strikethrough)
// Convertit <s>, <del>, <strike> en ~~texte~~
htmlToMdConverter.addRule('strikethrough', {
    filter: ['del', 's', 'strike' as any], 
    replacement: function (content) {
        return '~~' + content + '~~';
    }
});

// SOULIGNÉ (Underline)
// Force l'utilisation de la balise HTML <u> car le MD standard ne le gère pas
htmlToMdConverter.addRule('underline', {
    filter: ['u'],
    replacement: function (content) {
        return '<u>' + content + '</u>';
    }
});

htmlToMdConverter.addRule('internalLink', {
    filter: (node: any) => node.nodeName === 'A' && node.classList.contains('internal-note-link'),
    replacement: (content, node: any) => {
        const id = node.getAttribute('data-note-id');
        return `[[${id}|${content}]]`;
    }
});

// --- TYPES & CONSTANTES ---
interface Note {
    id: number;
    title: string;
    content_markdown: string;
    is_write_mode?: boolean;
}

const API_URL = import.meta.env.VITE_API_URL;


// --- COMPOSANT PRINCIPAL ---
export function Editor({ note, onSave,onOpenNoteById}: { note: Note, onSave: (n: any) => void, onOpenNoteById?: (id: number) => void }) {
    
    // --- ÉTATS ---
    const [htmlContent, setHtmlContent] = useState("");
    const [markdownContent, setMarkdownContent] = useState(note.content_markdown || "");
    const [title, setTitle] = useState(note.title);
    const [mode, setMode] = useState<'write' | 'read'>(note.is_write_mode ? 'write' : 'read');
    
    const [meta, setMeta] = useState({ chars: 0, words: 0, lines: 0, size: 0 });
    const readViewRef = useRef<HTMLDivElement | null>(null);


    // 1. Initialisation du CONTENU (Titre, Markdown, HTML)
    useEffect(() => {
        setTitle(note.title);
        const md = note.content_markdown || "";
        
        setMarkdownContent(md);
        setHtmlContent(mdToHtmlConverter.makeHtml(md));
    }, [note.id, note.title, note.content_markdown]);

    // 2. Initialisation du MODE (Lecture/Écriture)
    useEffect(() => {
        setMode(note.is_write_mode ? 'write' : 'read');
    }, [note.id]); 

    useEffect(() => {
        const words = markdownContent.trim() ? markdownContent.trim().split(/\s+/).length : 0;
        const lines = markdownContent.split('\n').length;
        const size = new TextEncoder().encode(markdownContent).length;
        setMeta({ chars: markdownContent.length, words, lines, size });
    }, [markdownContent]);

    useEffect(() => {
        const handleInternalClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const link = target.closest('.internal-note-link');

            if (link) {
                e.preventDefault();
                const id = link.getAttribute('data-note-id');
                if (id && onOpenNoteById) {
                    onOpenNoteById(Number(id)); 
                }
            }
        };
        const container = readViewRef.current;
        if (mode === 'read' && container) {
            container.addEventListener('click', handleInternalClick);
        }
        return () => container?.removeEventListener('click', handleInternalClick);
    }, [mode, htmlContent, onOpenNoteById]);


    // --- HANDLERS ---

    // Quand l'utilisateur tape dans l'éditeur Rich Text
    const handleEditorChange = (contentHtml: string) => {
        setHtmlContent(contentHtml);
        // Conversion temps réel HTML -> MD pour la sauvegarde
        const generatedMarkdown = htmlToMdConverter.turndown(contentHtml);
        setMarkdownContent(generatedMarkdown);
    };

    const handleSwitchMode = async (newMode: 'write' | 'read') => {
        setMode(newMode);
        const isWriteMode = newMode === 'write';
        
        note.is_write_mode = isWriteMode; 

        try {
            const response = await fetch(`${API_URL}/note/${note.id}/mode`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_write_mode: isWriteMode }),
            });

            if (!response.ok) {
                console.error("Erreur API lors du changement de mode");
                setMode(!isWriteMode ? 'write' : 'read');
                note.is_write_mode = !isWriteMode;
            }
        } catch (error) {
            console.error("Erreur réseau :", error);
            setMode(!isWriteMode ? 'write' : 'read');
            note.is_write_mode = !isWriteMode;
        }
    };


    // 2. EXPORT PDF
    const handleExportPDF = () => {
        const opt: any = {
            margin:       15,
            filename:     `${title || 'document'}.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true }, 
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        const element = document.createElement('div');
        
        element.innerHTML = `
            <style>
                .pdf-container {
                    font-family: Arial, sans-serif;
                    color: black !important;
                    background: white !important;
                    padding: 20px;
                    font-size: 12pt;
                    line-height: 1.5;
                }
                
                .pdf-content, .pdf-content * {
                    background-color: transparent !important; 
                    color: black !important;                  
                    text-shadow: none !important;             
                }

                .pdf-content strong { font-weight: bold; }
                .pdf-content em { font-style: italic; }
                
                .pdf-content a {
                    color: blue !important;
                    text-decoration: underline !important;
                }

                h1.pdf-title {
                    background-color: transparent !important;
                    color: black !important;
                    text-shadow: none !important;
                    text-align: center; 
                    margin-bottom: 30px; 
                    font-size: 24pt; 
                    border-bottom: 1px solid #ccc; 
                    padding-bottom: 10px;
                }
            </style>

            <div class="pdf-container">
                <h1 class="pdf-title">${title}</h1>
                <div class="pdf-content">
                    ${htmlContent}
                </div>
            </div>
        `;

        html2pdf().set(opt).from(element).save();
    };



    // Configuration Toolbar Quill
    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'], 
            [{'list': 'ordered'}, {'list': 'bullet'}],
            ['link'],
            ['clean']
        ],
    };

    // --- RENDU ---
    return (
        <div className="editor-container">
            <header className="editor-header">
                <input 
                    className="note-title" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    placeholder="Titre de la note..."
                />
                <div className="mode-toggle">
                    <button 
                        onClick={() => handleSwitchMode('write')} 
                        className={mode === 'write' ? 'active' : ''}
                    >
                        Unleashed
                    </button>
                    <button 
                        onClick={() => handleSwitchMode('read')} 
                        className={mode === 'read' ? 'active' : ''}
                    >
                        Sealed
                    </button>

                    <button 
                        onClick={handleExportPDF} 
                        title="Export as PDF"
                        style={{ fontSize: '1.2rem', padding: '5px 10px' }}
                    >
                        🖨️
                    </button>
                    
                    <button 
                        className="save-btn" 
                        onClick={() => onSave({...note, title, content_markdown: markdownContent})}
                    >
                        Commit to Ink
                    </button>
                </div>
            </header>

            <div className="content-area">
                {mode === 'write' ? (
                    <div className="rich-text-wrapper">
                        <ReactQuill 
                            theme="snow"
                            value={htmlContent}
                            onChange={handleEditorChange}
                            modules={modules}
                            style={{ height: '100%', display: 'flex', flexDirection: 'column' }} 
                        />
                    </div>
                ) : (
                    <div className="ql-snow">
                        <div 
                            className="ql-editor"
                            ref={readViewRef}
                            style={{ 
                                border: 'none', 
                                padding: '15px',
                                height: '100%', 
                                overflowY: 'auto',
                                overflowWrap: 'break-word',
                                wordBreak: 'break-word',
                                whiteSpace: 'pre-wrap'
                            }} 
                            dangerouslySetInnerHTML={{ __html: htmlContent }} 
                        />
                    </div>
                )}
            </div>

            <footer className="metadata-bar">
                <span>Lines: {meta.lines}</span>
                <span>Words: {meta.words}</span>
                <span>Characters: {meta.chars}</span>
                <span>Size: {meta.size} Byte{meta.size == 1 ? "" : "s"}</span>
            </footer>
        </div>
    );
}