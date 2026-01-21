import { useEffect, useState } from "react";
import { noteService } from "../../../services/note-service";
import TreeItem from "./TreeItem";

<<<<<<< HEAD
export default function TrashItem({ user }: any) {
=======
export default function TrashItem({ onTrashStatus, user, onSelectNote, onRefresh }: any) {
>>>>>>> 0d2fceedb3e690042d7af284a36e5bfc9a1f8c23
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