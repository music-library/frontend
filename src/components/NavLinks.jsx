import { Link, useLocation } from "react-router-dom";
import { useTrail, animated } from "react-spring";
import { useSelector, useColor } from "hooks";
import { useState, useEffect } from "react";
import { css } from "@linaria/core";

function NavLinks() {
    const color = useColor();
    const location = useLocation();
    const queue = useSelector((state) => state.music.tracks.queue);

    const [activeLink, setActiveLink] = useState("home");

    const links = ["home", "albums", "tracks", "queue"];

    if (window.innerWidth < 600) {
        links.length = 0;
        links.push("home", "albums", "queue");
    }

    useEffect(() => {
        if (location.pathname === "/") return setActiveLink("home");
        setActiveLink(location.pathname.substring(1).split("/")[0]);
    }, [location]);

    // Animation
    const config = { mass: 5, tension: 2000, friction: 200 };
    const trail = useTrail(links.length, {
        config,
        opacity: 1,
        x: 0,
        from: { opacity: 0, x: 20 }
    });

    return (
        <div className={`navlinks`}>
            <div className="navlinks-content">
                {trail.map(({ x, ...rest }, index) => {
                    let link = links[index];
                    let isActive = false;
                    let linkPath = link;

                    if (link === "home") linkPath = "";
                    if (link === activeLink) isActive = true;

                    return (
                        <animated.div
                            className={`navlinks-link${
                                isActive ? " active" : ""
                            }`}
                            key={links[index]}
                            style={{
                                ...rest,
                                transform: x.interpolate(
                                    (x) => `translate3d(0,${x}px,0)`
                                )
                            }}
                        >
                            <Link to={`/${linkPath}`}>
                                <span>{link}</span>
                            </Link>
                            {link === "queue" && !!queue?.length && (
                                <div
                                    className={queueCount}
                                    style={{ background: color }}
                                >
                                    {queue?.length}
                                </div>
                            )}
                        </animated.div>
                    );
                })}
            </div>
        </div>
    );
}

const queueCount = css`
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    content: "";
    bottom: 15px;
    width: 17px;
    height: 17px;
    right: 0.5rem;
    color: #000000;
    background: gray;
    border-radius: 100%;
`;

export default NavLinks;
