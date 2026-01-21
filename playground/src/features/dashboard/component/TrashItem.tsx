import { useEffect, useState } from "react";
import { noteService } from "../../../services/note-service";
import TreeItem from "./TreeItem";

export default function TrashItem({ user, onSelectNote, onRefreshTrash, onRefreshSidebar }: any) {
    const [trashData, setTrashData] = useState<any>(null);

    const refreshTrash = async () => {
        const data = await noteService.getTrash(user.id);
        setTrashData(data);
        console.log("Trash data:", data);
    };
    useEffect(() => { refreshTrash(); }, [user.id]);


    return (
        <div>
            {trashData?.folders?.map((folder: any) => (
                <TreeItem 
                    key={`f-${folder.id}`} 
                    item={folder} 
                    type="folder" 
                    onSelectNote={onSelectNote}
                    onRefresh={onRefreshSidebar}
                    user={user}
                    fromTrash={true}
                />
            ))}
            {trashData?.notes?.map((note: any) => (
                <TreeItem 
                    key={`n-${note.id}`} 
                    item={note} 
                    type="note" 
                    onSelectNote={onSelectNote}
                    onRefresh={onRefreshSidebar}
                    fromTrash={true}
                />
            ))}
        </div>
    );
}