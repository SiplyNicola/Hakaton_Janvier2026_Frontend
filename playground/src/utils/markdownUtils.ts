
// double click logic
export const applyReverseMarkdown = (editor: any) => {
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

    // Helper for Titles (H1, H2)
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

    // Logic Dispatch
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

// --- 2. LIVE MARKDOWN (Typing Logic) ---
export const checkLiveMarkdown = (editor: any) => {
    const selection = editor.getSelection();
    if (!selection) return;
    
    // Safety check if leaf exists
    const leafResult = editor.getLeaf(selection.index - 1);
    if (!leafResult) return;
    const [leaf] = leafResult;
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