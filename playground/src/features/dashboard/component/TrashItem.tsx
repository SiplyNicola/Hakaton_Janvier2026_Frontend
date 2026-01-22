import TreeItem from "./TreeItem";

export default function TrashItem({ user, trashData, onSelectNote, onRefreshSidebar }: any) {
    return (
        <div className="trash-container">
            <div className="trash-header">
                <h2 className="graveyard-title">Graveyard</h2>
            </div>
            <div className="trash-separator">
            {
                trashData?.folders.length === 0 && trashData?.notes.length === 0 && (
                    <div className="empty-trash">
                        Silent Night...
                    </div>
                )
            }
            {trashData?.folders?.map((folder: any) => (
                <TreeItem 
                    key={`f-${folder.id}`} 
                    item={folder} 
                    type="folder" 
                    onSelectNote={onSelectNote}
                    onRefresh={onRefreshSidebar}
                    user={user}
                    fromTrash={true}
                    isRoot={!folder.parentId}
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
                    isRoot={false}
                />
            ))}
            </div>
        </div>
    );
}