
import { SidebarItem } from "./SideBarItemComponent.tsx";

interface SidebarProps {
    tree: any[];
    onSelect: (item: any) => void;
}

export function Sidebar({ tree, onSelect }: SidebarProps) {
    return <aside className="sidebar">
        <h3>User</h3>
        {/*<button className="user-button">👤 John Doe</button>*/}
        <button style={{color: "#bfc3cf"}}>Register</button><button style={{color: "#bfc3cf"}}>Login</button>
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
