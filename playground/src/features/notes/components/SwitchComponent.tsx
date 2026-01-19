import "../css/SwitchCSS.css";

interface SwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
}

export default function Switch({ checked, onChange }: SwitchProps) {
    return <div className="switch-row">
        <span className="switch-label">{checked ? "Write" : "Read-only"} mode</span>

        <label className="switch">
            <input
                type="checkbox"
                role="switch"
                aria-checked={checked}
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
            />
            <span className="slider" />
        </label>
    </div>;
}
