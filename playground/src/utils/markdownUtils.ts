
const MARKDOWN_STYLES: Record<string, string> = {
    'STRONG': '**', 
    'B': '**',      
    'EM': '*',      
    'I': '*',      
    'S': '~~',      
    'STRIKE': '~~'  
};

//double click 
export const applyReverseMarkdown = (editor: any) => {
    //get cursor selection
    let range = editor.getSelection();
    if (!range) return;

    //find exact element click
    let leafResult = editor.getLeaf(range.index);
    if (!leafResult || !leafResult[0]) return;
    
    let leaf = leafResult[0];  //text itself     
    let parent = leaf.parent;       
    let tagName = parent.domNode.tagName; 

    //check if tag in styles
    let symbol = MARKDOWN_STYLES[tagName]; 

    if (symbol) {
        let index = editor.getIndex(parent);   
        let length = parent.length();          
        //remove formatting
        editor.formatText(index, length, parent.statics.blotName, false);
        //insert markdown symbols
        editor.insertText(index + length, symbol); 
        editor.insertText(index, symbol);   
        //reset cursor position       
        setTimeout(() => editor.setSelection(index + symbol.length, length), 0);
        return; 
    }

    if (tagName === 'H1' || tagName === 'H2') {
        let lineIndex = editor.getIndex(parent); 
    
        let prefix = ''; 
        if (tagName === 'H1') {
            prefix = '# ';
        } else {
            prefix = '## ';
        }

        if (parent.domNode.innerText.startsWith(prefix)) return;

        editor.formatLine(lineIndex, 1, 'header', false);
        editor.insertText(lineIndex, prefix);
        return;
    }

};

export const checkLiveMarkdown = (editor: any) => {
    let range = editor.getSelection();
    if (!range) return;
    // get the current line text up to the cursor
    let [line, offset] = editor.getLine(range.index);
    let textUntilCursor = line.domNode.textContent.substring(0, offset);

    // Check for markdown patterns
    if (textUntilCursor === '# ') {
        editor.formatLine(range.index, 1, 'header', 1);
        editor.deleteText(range.index - 2, 2);
    } 
    else if (textUntilCursor === '## ') {
        editor.formatLine(range.index, 1, 'header', 2);
        editor.deleteText(range.index - 3, 3);
    }
};