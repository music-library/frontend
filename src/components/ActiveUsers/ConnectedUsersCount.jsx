import React from "react";
import { css } from "@linaria/core";
import { useSelector } from "react-redux";
import { useSpring, animated } from "react-spring";

import { usePrevious } from "hooks";

function ConnectedUsersCount() {
    const users = useSelector((state) => state.socket.global.connectedUsers);
    const usersPrevious = usePrevious(users) || 0;
    const hasIncreased = false;
    const countWidth = 10 + `${users}`?.length * 10;

    const [stylePrevious] = useSpring(
        () => ({
            reset: users !== usersPrevious,
            from: { y: 10, opacity: 1 },
            to: { y: hasIncreased ? -12 : 36, opacity: 0 }
        }),
        [users, usersPrevious]
    );

    const [styleNew] = useSpring(
        () => ({
            reset: users !== usersPrevious,
            from: { y: hasIncreased ? 12 : -34, opacity: 0 },
            to: { y: -12, opacity: 1 }
        }),
        [users, usersPrevious]
    );

    return (
        <span className={userCount} style={{ width: `${countWidth}px` }}>
            <animated.span style={stylePrevious}>{usersPrevious}</animated.span>
            <animated.span style={styleNew}>{users}</animated.span>
        </span>
    );
}

const userCount = css`
    position: relative;
    user-select: none;
    vertical-align: middle;
    width: 20px;
    height: 3rem;
    display: inline-flex;
    overflow: hidden;
    align-items: center;
    flex-direction: column;
    justify-content: center;

    span {
        font-size: 1.8rem;
        font-weight: normal;
        font-weight: bold;
        display: inline-block;
    }
`;

export default ConnectedUsersCount;
