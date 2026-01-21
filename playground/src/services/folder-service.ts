const API_URL = import.meta.env.VITE_API_URL;

export const folderService = {
    getAllByOwner: async (ownerId: number) => {
        const response = await fetch(`${API_URL}/api/folders?ownerId=${ownerId}`);
        return await response.json();
    },
    create: async (name: string, ownerId: number, parentId?: number) => {
        const response = await fetch(`${API_URL}/api/folders`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, ownerId, parentId })
        });
        return await response.json();
    },

    update: async (id: number, name: string, parentId?: number) => {
        const response = await fetch(`${API_URL}/api/folders/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, name, parentId })
        });
        return await response.json();
    },

    delete: async (id: number) => {
        const response = await fetch(`${API_URL}/api/folders/${id}`, {
            method: "DELETE"
        });
        if (!response.ok) throw new Error("Échec de la suppression du dossier");
        return await response.json();
    },

    trash: async (id: number) => {
        const response = await fetch(`${API_URL}/api/folders/trash/${id}`, { method: "PUT" });
        if (!response.ok) throw new Error("Échec de la mise à la corbeille du dossier");
        return await response.json();
    },

    restore: async (id: number) => {
        const response = await fetch(`${API_URL}/api/folders/restore/${id}`, { method: "PUT" });
        if (!response.ok) throw new Error("Échec de la restauration du dossier");
        return await response.json();
    }
};