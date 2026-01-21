import { useEffect, useState } from "react";
import { noteService } from "../../../services/note-service";

export default function TrashItem({ onTrashStatus, user }: any) {
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
                    onRefresh={onRefresh}
                    user={user}
                />
            ))}
            {trashData?.notes?.map((note: any) => (
                <TreeItem 
                    key={`n-${note.id}`} 
                    item={note} 
                    type="note" 
                    onSelectNote={onSelectNote}
                    onRefresh={onRefresh}
                />
            ))}
        </div>
    );
}