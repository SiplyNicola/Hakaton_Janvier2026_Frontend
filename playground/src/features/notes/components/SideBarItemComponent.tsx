
import { useState } from "react";

interface SidebarItemProps {
    item: any;
    onSelect: (item: any) => void;
    level?: number;
}

export function SidebarItem({ item, onSelect, level = 0 }: SidebarItemProps) {
    const [open, setOpen] = useState(false);

    const isFolder = item.type === "folder";

    return <div style={{ marginLeft: level * 12 }}>
        <div
            className="sidebar-item"
            onClick={() => {
                if (isFolder) setOpen(!open);
                else onSelect(item);
            }}
        >
            {isFolder ? (open ? "📂" : "📁") : "📄"} {item.name}
        </div>

        {isFolder && open && (
            <div>
                {item.children.map(child => (
                    <SidebarItem
                        key={child.name}
                        item={child}
                        onSelect={onSelect}
                        level={level + 1}
                    />
                ))}
            </div>
        )}
    </div>;
}
