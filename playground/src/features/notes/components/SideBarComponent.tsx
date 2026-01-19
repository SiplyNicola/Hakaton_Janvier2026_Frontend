
import { SidebarItem } from "./SideBarItemComponent.tsx";

interface SidebarProps {
    tree: any[];
    onSelect: (item: any) => void;
}

export function Sidebar({ tree, onSelect }: SidebarProps) {
    return <aside className="sidebar">
        <h3>Files</h3>
        {tree.map(item => (
            <SidebarItem
            key={item.name}
            item={item}
            onSelect={onSelect}
            />
        ))}
    </aside>;
}
