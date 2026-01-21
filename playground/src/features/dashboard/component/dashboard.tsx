import { useEffect, useState } from "react";
import { noteService } from "../../../services/note-service";
import { Sidebar } from "./SideBar";
import { Editor } from "./editor";
import "./dashboard.css";
import TrashItem from "./TrashItem";

export function Dashboard({ user, onLogout }: any) {
    const [sidebarData, setSidebarData] = useState<any>(null);
    const [selectedNote, setSelectedNote] = useState<any>(null);
    const [isTrashSection, setTrashSection] = useState(false);

    const refreshSidebar = async () => {
        const data = await noteService.getSidebar(user.id);
        setSidebarData(data);
    };

    useEffect(() => { refreshSidebar(); }, [user.id]);

    const handleSelectNote = async (id: number) => {
        const note = await noteService.getById(id);
        setSelectedNote(note);
        setTrashSection(false);
    };

    const handleSaveNote = async (updatedNote: any) => {
        const savedNote = await noteService.update(updatedNote.id, updatedNote);
        await refreshSidebar();
        setSelectedNote(savedNote); 
        setTrashSection(false);
    };

    const changeTrashStatus = () => {
        setSelectedNote(null);
        setTrashSection(true);
        return true;
    }

    return (
        <main className="dashboard-container">
            <Sidebar 
                data={sidebarData} 
                onSelectNote={handleSelectNote} 
                onRefresh={refreshSidebar}
                onTrashStatus={changeTrashStatus}
                trashStatus={isTrashSection}
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
                ) :
                isTrashSection ? (
                    <TrashItem user={user} onTrashStatus={changeTrashStatus} />
                )
                : (
                    <div className="empty-state">
                        <div className="empty-bg" />
                        <h2 className="flicker">SELECT A PARCHMENT...</h2>
                    </div>
                )}
            </section>
        </main>
    );
}