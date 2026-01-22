import TreeItem from "./TreeItem";

export default function TrashItem({ user, trashData, onSelectNote, onRefreshSidebar }: any) {
    return (
        <div className="trash-container">
            <div className="trash-header">
                <h2>Graveyard</h2>
            </div>
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