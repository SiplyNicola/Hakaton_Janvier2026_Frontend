import { useState } from "react";
import Switch from "./SwitchComponent";
import "../css/NoteFolderManagerComponent.css";
import { Sidebar } from "./SideBarComponent";

export default function NoteFolderManagerComponent() {
    const [text, setText] = useState("");
    const [activeFile, setActiveFile] = useState(null);
    const [isOn, setIsOn] = useState(true);

    
    const tree = [
        {
            type: "folder",
            name: "Notes",
            children: [
                { type: "file", name: "Daily.txt" },
                { type: "file", name: "Ideas.txt" }
            ]
        },
        {
            type: "folder",
            name: "Projects",
            children: [
                {
                    type: "folder",
                    name: "React App",
                    children: [
                        { type: "file", name: "README.md" },
                        { type: "file", name: "Todos.md" }
                    ]
                }
            ]
        },
        {
            type: "file",
            name: "Archive.txt"
        }
    ];

    return <div className="app">
        {/* Sidebar */}
        <Sidebar
            tree={tree}
            onSelect={file => {
                setActiveFile(file.name);
                setText(""); // load file contents later
            }}
        />


        {/* Main content */}
        <main className="content">
            <div className="content-header">
                <div style={{color: "#bfc3cf"}}>
                    <h2>{activeFile ?? "Select a file"}</h2>
                    {activeFile 
                        ? `Character Count: ${text.length}, Word Count: ${text.trim() === "" ? 0 : text.trim().split(/\s+/).length}` 
                        : "No file has been selected!"
                    }
                </div>
                <div>
                    <Switch checked={isOn} onChange={setIsOn} />
                    <button disabled={!activeFile || !isOn} style={{color: "#bfc3cf"}} >Save</button>
                </div>
            </div>
            <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Write here..."
                disabled={!activeFile || !isOn}
            />
        </main>
    </div>;
}