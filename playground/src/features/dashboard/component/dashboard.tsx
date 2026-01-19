import { useEffect, useState } from "react";
import { noteService } from "../../../services/note-service";
import { Sidebar } from "./SideBar";
import { Editor } from "./editor";
import "./dashboard.css";
import batImage from "../../../assets/bat.png"; // Ton image perso

export function Dashboard({ user, onLogout }: any) {
    const [sidebarData, setSidebarData] = useState<any>(null);
    const [selectedNote, setSelectedNote] = useState<any>(null);

    const refreshSidebar = async () => {
        const data = await noteService.getSidebar(user.id);
        setSidebarData(data);
    };

    useEffect(() => { refreshSidebar(); }, [user.id]);

    const handleSelectNote = async (id: number) => {
        const note = await noteService.getById(id);
        setSelectedNote(note);
    };

    const handleSaveNote = async (updatedNote: any) => {
        const savedNote = await noteService.update(updatedNote.id, updatedNote);
        await refreshSidebar();
        setSelectedNote(savedNote); 
    };

    return (
        <main className="dashboard-container">
            {/* Les chauves-souris volent en arrière-plan (z-index: 10) */}
            <img src={batImage} className="bat-animated" alt="" />
            <img src={batImage} className="bat-animated bat-delay-1" alt="" />
            <img src={batImage} className="bat-animated bat-delay-2" alt="" />

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
                    />
                ) : (
                    <div className="empty-state" style={{margin: 'auto', textAlign: 'center'}}>
                        <h2 className="flicker" style={{fontFamily: 'Creepster', color: 'var(--accent-orange)', fontSize: '3rem'}}>
                            SÉLECTIONNEZ UN PARCHEMIN...
                        </h2>
                    </div>
                )}
            </section>
        </main>
    );
}