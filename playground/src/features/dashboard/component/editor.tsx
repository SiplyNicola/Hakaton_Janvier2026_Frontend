import { useState, useEffect, useRef } from 'react';
import ReactQuill, { Quill } from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

import Showdown from 'showdown';
import TurndownService from 'turndown';
import "./editor.css";
import { noteService } from '../../../services/note-service';

// @ts-ignore
import MarkdownShortcuts from 'quill-markdown-shortcuts';
// Recording the Markdown module (Logic of the 2nd file)
Quill.register('modules/markdownShortcuts', MarkdownShortcuts);

// --- 1. EXTENSION: INTERNAL LINKS  ---
const internalLinkExtension = function () {
    return [{
        type: 'lang',
        regex: /\[\[([^\]\|]+)(?:\|([^\]]+))?\]\]/g,
        replace: function (match: string, idPart: string, titlePart?: string) {
            let id = idPart;
            if (id.startsWith('note:')) id = id.split(':')[1];
            
            const display = titlePart || id;
            
            // UTILISATION DE SPAN : Sécurité contre le rechargement de page
            return `<span class="internal-note-link" data-note-id="${id}" style="color: #ff8906; text-decoration: underline; cursor: pointer;">${display}</span>`;
        }
    }];
};

// --- 2. CONFIGURATION OF CONVERTERS ("Bis" Logic) ---

// For READING (Transforms [[...]] into a clickable <span>)
const readConverter = new Showdown.Converter({
    strikethrough: true,    
    simpleLineBreaks: true, 
    openLinksInNewWindow: false,
    extensions: [internalLinkExtension] 
});

// For WRITING (Displays the raw code [[...]] for editing)
const writeConverter = new Showdown.Converter({
    strikethrough: true,    
    simpleLineBreaks: true, 
    openLinksInNewWindow: false,
    extensions: [] 
});

// --- 3. TURNDOWN (HTML -> Markdown) ---
const htmlToMdConverter = new TurndownService({
    headingStyle: 'atx', 
    codeBlockStyle: 'fenced', 
    emDelimiter: '*'
});

// Backup rule: transforms SPAN into [[...]]
htmlToMdConverter.addRule('internalLink', {
    filter: (node: any) => node.nodeName === 'SPAN' && node.classList.contains('internal-note-link'),
    replacement: (content, node: any) => {
        const id = node.getAttribute('data-note-id');
        return `[[${id}|${content}]]`;
    }
});

htmlToMdConverter.addRule('strikethrough', {
    filter: ['del', 's', 'strike' as any], 
    replacement: (content) => '~~' + content + '~~'
});

htmlToMdConverter.addRule('underline', {
    filter: ['u'],
    replacement: (content) => '<u>' + content + '</u>'
});

// --- TYPES & CONSTANTS ---
interface Note {
    id: number;
    title: string;
    content_markdown: string;
    is_write_mode?: boolean;
}

const API_URL = import.meta.env.VITE_API_URL;

// --- MAIN COMPONENT ---
export function Editor({ note, onSave, onOpenNoteById }: { note: Note, onSave: (n: any) => void, onOpenNoteById?: (id: number) => void }) {
    
    // --- STATES ---
    const [htmlContent, setHtmlContent] = useState("");
    const [markdownContent, setMarkdownContent] = useState(note.content_markdown || "");
    const [title, setTitle] = useState(note.title);
    const [mode, setMode] = useState<'write' | 'read'>(note.is_write_mode ? 'write' : 'read');
    
    const [meta, setMeta] = useState({ chars: 0, words: 0, lines: 0, size: 0 });
    const readViewRef = useRef<HTMLDivElement | null>(null);
    const quillRef = useRef<ReactQuill>(null);

    useEffect(() => {
        setTitle(note.title);
        const md = note.content_markdown || "";
        setMarkdownContent(md);
        
        if (note.is_write_mode) {
            setHtmlContent(writeConverter.makeHtml(md));
        } else {
            setHtmlContent(readConverter.makeHtml(md));
        }
    }, [note.id, note.title, note.content_markdown]);

    // Sync Mode
    useEffect(() => {
        setMode(note.is_write_mode ? 'write' : 'read');
    }, [note.id]); 

    // Stats
    useEffect(() => {
        const words = markdownContent.trim() ? markdownContent.trim().split(/\s+/).length : 0;
        
        const lines = markdownContent.split('\n').length;
        const size = new TextEncoder().encode(markdownContent).length;
        setMeta({ chars: markdownContent.length, words, lines, size });
    }, [markdownContent]);

    // Meta size calculation
    const displaySize = (size: number) => {
        if (size < 1E3) return `${size} B`;
        else if (size < 1E6) return `${Number((size / 1E3).toFixed(2))} kB`;
        else return `${Number((size / 1E6).toFixed(2))} MB`;
    };

    // --- CLICK MANAGEMENT (Read Mode) ---
    const handleReadModeClick = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        const link = target.closest('.internal-note-link');

        if (link) {
            e.preventDefault(); 
            e.stopPropagation();
            
            const id = link.getAttribute('data-note-id');
            if (id && onOpenNoteById) {
                console.log("Navigation vers ID:", id);
                onOpenNoteById(Number(id)); 
            }
        }
    };

    // --- EDITOR FEATURES ---

    // 1. REVERSE MARKDOWN (Double Click)
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

        // Helper for Inline (Bold, etc.)
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

        // Helper for Titles (H1, H2) - Retrieved from File 1 for completeness
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

    // LIVE MARKDOWN (Frappe)
    const checkLiveMarkdown = (editor: any) => {
        const selection = editor.getSelection();
        if (!selection) return;
        const [leaf] = editor.getLeaf(selection.index - 1);
        if (!leaf || !leaf.text) return;
        const [line, offset] = editor.getLine(selection.index);
        const textUntilCursor = line.domNode.innerText.substring(0, offset);

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
    };

    // --- HANDLERS ---

    const handleEditorChange = (contentHtml: string, _delta: any, source: string, editor: any) => {
        setHtmlContent(contentHtml);
        
        let generatedMarkdown = htmlToMdConverter.turndown(contentHtml);
        
        htmlToMdConverter.addRule('paragraph', {
            filter: 'p',
            replacement: (content) => content + '\n'
        });

        
        // Harsh cleaning
        // Essential for wikilinks to be valid
        generatedMarkdown = generatedMarkdown
            .replace(/\\\[/g, '[')
            .replace(/\\\]/g, ']')
            .replace(/\\\|/g, '|');
            
        setMarkdownContent(generatedMarkdown);

        if (source === 'user' && quillRef.current) {
            checkLiveMarkdown(quillRef.current.getEditor());
        }
    };

    const handleSwitchMode = async (newMode: 'write' | 'read') => {
        setMode(newMode);
        const isWriteMode = newMode === 'write';
        note.is_write_mode = isWriteMode; 


        //Switches and recalculates the HTML with the correct converter
        if (newMode === 'read') {
            setHtmlContent(readConverter.makeHtml(markdownContent));
        } else {
            setHtmlContent(writeConverter.makeHtml(markdownContent));
        }

        noteService.switchMode(note.id, isWriteMode)

    };

    const handleExportPDF = () => {
        const pdfUrl = `${import.meta.env.VITE_API_URL}/api/exports/note/${note.id}/pdf`;
        window.open(pdfUrl, '_blank');
    };
    
// Helper: builds the URL to a note according to the router mode
const toNoteUrl = (id: string | number | null) => {
  const mode = import.meta.env.VITE_ROUTER_MODE ?? 'browser'; // 'browser' | 'hash'
  const base = import.meta.env.VITE_PUBLIC_BASE ?? window.location.origin; // ex: http://localhost:5173
  if (!id && id !== 0) return base;

  return mode === 'hash'
    ? `${base}/#/note/${id}`
    : `${base}/note/${id}`;
}

    // Configuration Toolbar
    const modules = {
        toolbar: [ 
            [{ 'header': [false, 1, 2] }], 
            ['bold', 'italic', 'underline', 'strike'], 
            [{'list': 'ordered'}, {'list': 'bullet'}], 
            ['link'], 
            ['clean'] 
        ],
        markdownShortcuts: {} 
    };

    return (
        <div className="editor-container">
            <header className="editor-header">
                <input 
                    className="note-title" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    placeholder="Note Title..." 
                />
                <div className="mode-toggle">
                    <button onClick={() => handleSwitchMode('write')} className={mode === 'write' ? 'active' : ''}>Unleashed</button>
                    <button onClick={() => handleSwitchMode('read')} className={mode === 'read' ? 'active' : ''}>Sealed</button>
                    <button className="save-btn" onClick={() => onSave({...note, title, content_markdown: markdownContent})}>Commit to Ink</button>
                    <button 
                        onClick={handleExportPDF} 
                        title="Export to PDF"
                        style={{ fontSize: '1.2rem', padding: '5px 10px', marginLeft: '10px' }}
                    >
                        Export to PDF
                    </button>
                </div>
            </header>

            <div className="content-area">
                {mode === 'write' ? (
                    <div className="rich-text-wrapper" onDoubleClick={handleDoubleClick}>
                        <ReactQuill 
                            ref={quillRef} 
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
                            className="ql-editor read-mode"
                            ref={readViewRef}
                            onClick={handleReadModeClick} 
                            style={{ border: 'none', padding: '15px', height: '100%', overflowY: 'auto' }} 
                            dangerouslySetInnerHTML={{ __html: htmlContent }} 
                        />
                    </div>
                )}
            </div>

            <footer className="metadata-bar">
                <span>Lines: {meta.lines}</span>
                <span>Words: {meta.words}</span>
                <span>Chars: {meta.chars}</span>
                <span>Size: {displaySize(meta.size)}</span>
            </footer>
        </div>
    );
}