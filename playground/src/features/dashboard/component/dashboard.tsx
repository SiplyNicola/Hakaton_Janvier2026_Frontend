import { useEffect, useState } from "react";
import { noteService } from "../../../services/note-service";
import { Sidebar } from "./SideBar";
import { Editor } from "./editor";
import "./dashboard.css";

export function Dashboard({ user, onLogout }: any) {
    const [sidebarData, setSidebarData] = useState<any>(null);
    const [selectedNote, setSelectedNote] = useState<any>(null);

    const refreshSidebar = async () => {
        const data = await noteService.getSidebar(user.id);
        setSidebarData(data);
    };

    useEffect(() => { refreshSidebar(); }, [user.id]);

    const handleSelectNote = async (id: number) => {
        try {
            const newPath = `/note/${id}`;
            if (window.location.pathname !== newPath) window.history.pushState({}, '', newPath);
        } catch (e) {
   
        }
        const note = await noteService.getById(id);
        setSelectedNote(note);
    };

    // On mount: if URL contains /note/:id, open that note
    useEffect(() => {
        const match = window.location.pathname.match(/\/note\/(\d+)/);
        if (match) {
            const id = Number(match[1]);
            if (!isNaN(id)) handleSelectNote(id);
        }
    }, []);

    const handleSaveNote = async (updatedNote: any) => {
        const savedNote = await noteService.update(updatedNote.id, updatedNote);
        await refreshSidebar();
        setSelectedNote(savedNote); 
    };

    return (
        <main className="dashboard-container">
            <Sidebar 
                data={sidebarData} 
                onSelectNote={handleSelectNote} 
                onRefresh={refreshSidebar}
                user={user}
                onLogout={onLogout}
            />

            <section className="editor-section">
                {selectedNote ? (
                    <Editor 
                        key={selectedNote.id} 
                        note={selectedNote} 
                        onSave={handleSaveNote} 
                        onOpenNoteById={handleSelectNote}
                    />
                ) : (
                    <div className="empty-state">
                        <div className="empty-bg" />
                        <h2 className="flicker">SELECT A PARCHMENT...</h2>
                    </div>
                )}
            </section>
        </main>
    );
}