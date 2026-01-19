import type { NoteCreateCommand } from "./commands/note-create-cmd.ts";
import type { Notes } from "../../types/notes.ts";
import type { NoteUpdateCommand } from "./commands/note-update-cmd.ts";

const NOTE_API_URL = import.meta.env.VITE_API_URL + "/notes";

export const postNote: (note: NoteCreateCommand) => Promise<Notes> = async (note: NoteCreateCommand) => {
    const response = await fetch(NOTE_API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(note)
    });
    return await response.json();
}

export const fetchNotes: () => Promise<Notes[]> = async () => {
    const response = await fetch(NOTE_API_URL);
    return response.json();
}

export const deleteNote: (noteId: number) => Promise<Response> = async (id: number) => {
    return await fetch(`${NOTE_API_URL}/${id}`, { method: "DELETE" });
}

export const updateNote: (note: NoteUpdateCommand) => Promise<Response> = async (note: NoteUpdateCommand) => {
    const response = await fetch(`${NOTE_API_URL}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(note)
    });
    return response.json();
}