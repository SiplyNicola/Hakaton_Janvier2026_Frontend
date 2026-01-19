
import { useState } from "react";

export default function App() {
  const [text, setText] = useState("");
  const [activeLink, setActiveLink] = useState("Notes");

  const links = ["Notes", "Ideas", "Drafts", "Archive"];

  return (
    <div className="app">
      {/* Sidebar */}
      <aside className="sidebar">
        <h3>Sections</h3>
        <ul>
          {links.map(link => (
            <li
              key={link}
              className={link === activeLink ? "active" : ""}
              onClick={() => setActiveLink(link)}
            >
              {link}
            </li>
          ))}
        </ul>
      </aside>

      {/* Main content */}
      <main className="content">
        <h2>{activeLink}</h2>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Write here..."
        />
      </main>
    </div>
  );
}
