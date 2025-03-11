import React, { useState } from "react";
import "../css/SearchBar.css"; // Make sure to create this CSS file
import { FaSearch } from "react-icons/fa";


function SearchBar({ label, type, value, onChange }) {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <div className="searchBar-input">
            <FaSearch />
            
            
            <input className="search-input"
                type={type}
                value={value}
                onChange={onChange}
                placeholder={label} // Display label inside input
            />
        </div>
    );
}

export default SearchBar;