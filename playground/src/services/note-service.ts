const API_URL = import.meta.env.VITE_API_URL;

export const noteService = {
    getSidebar: async (userId: number) => {
        const response = await fetch(`${API_URL}/note/sidebar/${userId}`);
        return await response.json();
    },
    getTrash: async (userId: number) => {
        const response = await fetch(`${API_URL}/note/getTrash/${userId}`);
        return await response.json();
    },
    getById: async (id: number) => {
        const response = await fetch(`${API_URL}/note/${id}`);
        return await response.json();
    },
    update: async (id: number, note: any) => {
        const response = await fetch(`${API_URL}/note/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(note)
        });
        return await response.json();
    },
    create: async (note: any) => {
        const response = await fetch(`${API_URL}/note`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(note)
        });
        return await response.json();
    },
    delete: async (id: number) => {
        const response = await fetch(`${API_URL}/note/${id}`, {
            method: "DELETE"
        });
        if (!response.ok) throw new Error("Échec de la suppression de la note");
        
        return true;
    },
    trash: async (id: number) => {
        const response = await fetch(`${API_URL}/note/trash/${id}`, { method: "PUT" });
        if (!response.ok) throw new Error("Échec de la mise à la corbeille de la note");
        return await response.json();
    },
    restore: async (id: number) => {
        const response = await fetch(`${API_URL}/note/restore/${id}`, { method: "PUT" });
        if (!response.ok) throw new Error("Échec de la restauration de la note");
        return await response.json();
    }
};