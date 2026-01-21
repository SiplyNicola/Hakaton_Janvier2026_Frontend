// src/utils/searchUtils.ts
import fuzzysort from "fuzzysort";

// Fonction récursive pour récupérer TOUS les dossiers et notes à plat
const flattenData = (folders: any[], notes: any[]) => {
    let allFolders: any[] = [];
    let allNotes: any[] = [...notes]; // On commence avec les notes racine

    const traverse = (currentFolders: any[]) => {
        for (const folder of currentFolders) {
            // 1. On ajoute le dossier actuel
            allFolders.push(folder);

            // 2. On ajoute ses notes
            if (folder.notes && folder.notes.length > 0) {
                allNotes = [...allNotes, ...folder.notes];
            }

            // 3. On descend dans les sous-dossiers (récursion)
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

    // 1. On met tout à plat
    const { allFolders, allNotes } = flattenData(rootData.folders || [], rootData.notes || []);

    // 2. Configuration Fuzzysort
    const options = {
        threshold: -10000, // Seuil de tolérance
        limit: 20,         // Limite de résultats
    };

    // 3. Recherche dans les dossiers (par nom)
    const folderResults = fuzzysort.go(query, allFolders, {
        ...options,
        key: 'name',
    });

    // 4. Recherche dans les notes (par titre)
    // Note: Tu peux ajouter content_markdown dans les keys si tu veux chercher dans le contenu aussi
    const noteResults = fuzzysort.go(query, allNotes, {
        ...options,
        key: 'title', 
    });

    return {
        folders: folderResults.map(res => res.obj),
        notes: noteResults.map(res => res.obj)
    };
}