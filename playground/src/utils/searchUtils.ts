import fuzzysort from "fuzzysort";

// Recursive function to retrieve ALL folders and notes in a flat structure
const flattenData = (folders: any[], notes: any[]) => {
    let allFolders: any[] = [];
    let allNotes: any[] = [...notes]; // We start with the base notes

    const traverse = (currentFolders: any[]) => {
        for (const folder of currentFolders) {
            // 1. Add the current folder
            allFolders.push(folder);

           // 2. We add his/her grades
            if (folder.notes && folder.notes.length > 0) {
                allNotes = [...allNotes, ...folder.notes];
            }

            // 3. We go down into the subfolders (recursion)
            if (folder.subFolders && folder.subFolders.length > 0) {
                traverse(folder.subFolders);
            }
        }
    };

    if (folders) traverse(folders);

    return { allFolders, allNotes };
};

export function searchGrimoire(query: string, rootData: any) {
    if (!query || !query.trim()) return null;

    
    const { allFolders, allNotes } = flattenData(rootData.folders || [], rootData.notes || []);

    // 2. Fuzzysort Configuration
    const options = {
        threshold: -10000, // Tolerance threshold
        limit: 20,         // Result limit
    };

    // 3. Search in folders (by name)
    const folderResults = fuzzysort.go(query, allFolders, {
        ...options,
        key: 'name',
    });

    // 4. Search in notes (by title)
    const noteResults = fuzzysort.go(query, allNotes, {
        ...options,
        key: 'title', 
    });

    return {
        folders: folderResults.map(res => res.obj),
        notes: noteResults.map(res => res.obj)
    };
}