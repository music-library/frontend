import cx from "classnames";
import { css } from "@linaria/core";
import { useLocation } from "react-router-dom";
import { useTrail, animated } from "react-spring";

import { switchLibrary } from "store/actions";
import { useDispatch, useSelector } from "hooks";

function SwitchLibrary() {
    const dispatch = useDispatch();
    const location = useLocation();
    const visible = location?.pathname === "/";
    const library = useSelector((state) => state.music.library);

    const trail = useTrail(library.options?.length, {
        from: { opacity: 0, y: 20 },
        to: { opacity: 1, y: 0 },
        reverse: !visible,
        config: { mass: 5, tension: 2000, friction: 200 }
    });

    return (
        <>
            {library.options?.length > 1 && (
                <div className={cx(libraryOptions, "tags")}>
                    {trail.map((props, index) => {
                        const option = library.options?.[index];
                        if (!option?.id) return null;

                        return (
                            <animated.div
                                key={option.id}
                                className={cx(`tag`, {
                                    selected: library.selected === option.id
                                })}
                                onClick={() => {
                                    if (!visible) return;
                                    dispatch(switchLibrary(option.id));
                                }}
                                style={{
                                    ...props,
                                    cursor: visible ? "pointer" : "default"
                                }}
                            >
                                {option.name}
                            </animated.div>
                        );
                    })}
                </div>
            )}
        </>
    );
}

const libraryOptions = css`
    position: absolute;
    margin-left: -4px !important;
    margin-top: 13.6rem !important;
`;

export default SwitchLibrary;
