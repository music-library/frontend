import React, { useState, useEffect } from "react";

import { useColor } from "hooks";

import AFCBackground from "./AFCBackground";

function AFCBackgroundMulti(props) {
    const color = useColor();

    // Array of AFCBackground components being rendered
    const [afcbackgrounds, setAfcbackgrounds] = useState([
        <AFCBackground key={0} color={color} />
    ]);

    // Wait for global color to change before spawning a new background
    useEffect(() => {
        // Spawn a new AFCBackground to slide-down
        const lastComponent = afcbackgrounds[afcbackgrounds.length - 1];
        const newKey = lastComponent.key + 1;
        setAfcbackgrounds([
            ...afcbackgrounds.slice(-2),
            <AFCBackground key={newKey} color={color} />
        ]);
    }, [colorIndex]);

    return <>{afcbackgrounds}</>;
}

export default AFCBackgroundMulti;
