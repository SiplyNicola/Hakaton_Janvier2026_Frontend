import { useEffect, useState } from "react";
import { noteService } from "../../../services/note-service";

export default function TrashItem({ onTrashStatus, user }: any) {
    const [trashData, setTrashData] = useState<any>(null);

    const refreshTrash = async () => {
        const data = await noteService.getTrash(user.id);
        setTrashData(data);
        //onTrashStatus();
    };
    useEffect(() => { refreshTrash(); }, [user.id]);


    return (
        <div>
            Trash Item Component
        </div>
    );
}