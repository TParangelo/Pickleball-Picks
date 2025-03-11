import React, { useState } from "react";
import "../css/FloatingInput.css"; // Make sure to create this CSS file

function FloatingInput({ label, type, value, onChange }) {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <div className={`floating-input ${isFocused || value ? "filled" : ""}`}>
            <input
                type={type}
                value={value}
                onChange={onChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                required
            />
            <label>{label}</label>
        </div>
    );
}

export default FloatingInput;