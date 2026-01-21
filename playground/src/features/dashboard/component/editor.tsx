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
    replace: function (idPart: string, title?: string) {
        let id = idPart;
        if (idPart.startsWith('note:')) id = idPart.split(':')[1];
        const display = title || id;
        return `<a class="internal-note-link" href="#" data-note-id="${id} ">${display} style="cursor: pointer";</a>`;
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
export function Editor({ note, onSave, onOpenNoteById }: { note: Note, onSave: (n: any) => void, onOpenNoteById?: (id: number) => void }) {
    
    // --- ÉTATS ---
    const [htmlContent, setHtmlContent] = useState("");
    const [markdownContent, setMarkdownContent] = useState(note.content_markdown || "");
    const [title, setTitle] = useState(note.title);
    const [mode, setMode] = useState<'write' | 'read'>(note.is_write_mode ? 'write' : 'read');
    
    const [meta, setMeta] = useState({ chars: 0, words: 0, lines: 0, size: 0 });
    const readViewRef = useRef<HTMLDivElement | null>(null);
    
    // --- AJOUT REF (Nécessaire pour les fonctions Markdown) ---
    const quillRef = useRef<ReactQuill>(null);


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
                e.stopPropagation();
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


    // --- AJOUT FONCTIONNALITÉS MARKDOWN ---

    // 1. REVERSE MARKDOWN (Double Clic)
    const handleDoubleClick = () => {
        if (mode !== 'write' || !quillRef.current) return;

        const editor = quillRef.current.getEditor();
        const range = editor.getSelection();
        if (!range) return;

        const leafResult = editor.getLeaf(range.index);
        if (!leafResult) return;
        const [leaf] = leafResult;
        
        if (!leaf || !leaf.parent) return;

        const parentBlot = leaf.parent;
        const parentTag = parentBlot.domNode.tagName; 

        // Helper pour Inline (Gras, etc.)
        const transformInlineToMd = (tag: string, formatName: string) => {
            const blotIndex = editor.getIndex(parentBlot);
            const blotLength = parentBlot.length();
            const text = parentBlot.domNode.innerText || parentBlot.domNode.textContent;

            if (text.startsWith(tag) && text.endsWith(tag)) return;

            editor.formatText(blotIndex, blotLength, formatName, false);
            editor.insertText(blotIndex + blotLength, tag);
            editor.insertText(blotIndex, tag);
            setTimeout(() => editor.setSelection(blotIndex + tag.length, blotLength), 0);
        };

        // Helper pour Titres (H1, H2)
        const transformHeaderToMd = (level: number) => {
            const lineResult = editor.getLine(range.index);
            if (!lineResult) return;
            const [line] = lineResult;
            if (!line) return;

            const lineIndex = editor.getIndex(line);
            const prefix = level === 1 ? '# ' : '## ';
            const text = line.domNode.innerText;

            if (text.startsWith(prefix)) return;

            editor.formatLine(lineIndex, 1, 'header', false);
            editor.insertText(lineIndex, prefix);
            setTimeout(() => editor.setSelection(range.index + prefix.length), 0);
        };

        if (parentTag === 'STRONG' || parentTag === 'B') transformInlineToMd("**", "bold");
        else if (parentTag === 'EM' || parentTag === 'I') transformInlineToMd("*", "italic");
        else if (parentTag === 'S' || parentTag === 'STRIKE') transformInlineToMd("~~", "strike");
        else if (parentTag === 'U') {
            const blotIndex = editor.getIndex(parentBlot);
            const blotLength = parentBlot.length();
            const text = parentBlot.domNode.innerText;
            if (text.startsWith('<u>')) return;
            editor.formatText(blotIndex, blotLength, 'underline', false);
            editor.insertText(blotIndex + blotLength, '</u>');
            editor.insertText(blotIndex, '<u>');
            setTimeout(() => editor.setSelection(blotIndex + 3, blotLength), 0);
        }
        else if (parentTag === 'H1') transformHeaderToMd(1);
        else if (parentTag === 'H2') transformHeaderToMd(2);
    };

    // 2. LIVE MARKDOWN (Frappe)
    const checkLiveMarkdown = (editor: any) => {
        const selection = editor.getSelection();
        if (!selection) return;

        const leafResult = editor.getLeaf(selection.index - 1);
        if (!leafResult) return;
        const [leaf] = leafResult;
        if (!leaf || !leaf.text) return;

        const lineResult = editor.getLine(selection.index);
        if (!lineResult) return;
        const [line, offset] = lineResult;
        if (!line) return;

        const lineText = line.domNode.innerText;
        const textUntilCursor = lineText.substring(0, offset);

        if (textUntilCursor === '# ') {
            editor.formatLine(selection.index, 1, 'header', 1);
            editor.deleteText(selection.index - 2, 2);
            return;
        }
        if (textUntilCursor === '## ') {
            editor.formatLine(selection.index, 1, 'header', 2);
            editor.deleteText(selection.index - 3, 3);
            return;
        }

        const patterns = [
            { regex: /\*\*([^*\n]+)\*\* $/, format: 'bold' },
            { regex: /\*([^*\n]+)\* $/, format: 'italic' },
            { regex: /~~([^~\n]+)~~ $/, format: 'strike' },
            { regex: /<u>([^<\n]+)<\/u> $/, format: 'underline' }
        ];

        const leafText = leaf.text; 
        for (let p of patterns) {
            const match = leafText.match(p.regex);
            if (match) {
                const fullMatch = match[0];
                const content = match[1];
                const leafIndex = editor.getIndex(leaf);
                const startIndex = leafIndex + (match.index || 0);

                editor.deleteText(startIndex, fullMatch.length);
                editor.insertText(startIndex, content, { [p.format]: true });
                editor.insertText(startIndex + content.length, ' ', { [p.format]: false });
                return;
            }
        }
    };


    // --- HANDLERS ---

    // Note : Ajout des arguments delta/source/editor pour le Live Markdown
    const handleEditorChange = (contentHtml: string, _delta: any, source: string, editor: any) => {
        setHtmlContent(contentHtml);
        const generatedMarkdown = htmlToMdConverter.turndown(contentHtml);
        setMarkdownContent(generatedMarkdown);

        if (source === 'user' && quillRef.current) {
            checkLiveMarkdown(quillRef.current.getEditor());
        }
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
                <div class="pdf-content">${htmlContent}</div>
            </div>
        `;

        html2pdf().set(opt).from(element).save();
    };

    // Configuration Toolbar Quill
    const modules = {
        toolbar: [
            [{ 'header': [false, 1, 2] }], // Normal, H1, H2
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
                    <button onClick={() => handleSwitchMode('write')} className={mode === 'write' ? 'active' : ''}>Unleashed</button>
                    <button onClick={() => handleSwitchMode('read')} className={mode === 'read' ? 'active' : ''}>Sealed</button>
                    <button onClick={handleExportPDF} title="Export as PDF" style={{ fontSize: '1.2rem', padding: '5px 10px' }}>🖨️</button>
                    <button className="save-btn" onClick={() => onSave({...note, title, content_markdown: markdownContent})}>Commit to Ink</button>
                </div>
            </header>

            <div className="content-area">
                {mode === 'write' ? (
                    <div 
                        className="rich-text-wrapper"
                        onDoubleClick={handleDoubleClick} // AJOUT
                    >
                        <ReactQuill 
                            ref={quillRef} // AJOUT
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