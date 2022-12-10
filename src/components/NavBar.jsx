import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import { useColor } from "hooks";

import NavLinks from "./NavLinks";
import SearchBar from "./SearchBar";
import { Icon } from "components/Icon";

function NavBar() {
    const color = useColor();

    const [onScroll, setOnScroll] = useState(false);

    const handleScroll = () => {
        if (window.pageYOffset > 50) {
            setOnScroll(true);
        } else {
            setOnScroll(false);
        }
    };

    useEffect(() => {
        handleScroll();
        window.addEventListener("scroll", handleScroll);

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    return (
        <>
            <div className={`navbar${onScroll ? " --scroll" : ""}`}>
                <div className="navbar-content container">
                    <span className="navbar-logo">
                        <Link to="/">
                            <Icon name="logo" fill={color} />
                        </Link>
                    </span>
                    <div className="navbar-var">
                        <NavLinks />
                    </div>
                </div>
            </div>

            <div style={{ marginTop: "90px" }}></div>

            <div className="navbar-secondary container">
                <h1 className="navbar-title">Music Library</h1>
                <SearchBar />
            </div>
        </>
    );
}

export default NavBar;
