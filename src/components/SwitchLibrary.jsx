import cx from "classnames";
import { css } from "@linaria/core";
import { useLocation } from "react-router-dom";

import { switchLibrary } from "store/actions";
import { useDispatch, useSelector } from "hooks";

function SwitchLibrary() {
    const dispatch = useDispatch();
    const location = useLocation();
    const library = useSelector((state) => state.music.library);

    debug(location);

    return (
        <>
            {library.options?.length > 1 && location.pathname === "/" && (
                <div className={cx(libraryOptions, "tags")}>
                    {library.options.map((option) => (
                        <div
                            key={option.id}
                            className={cx(`tag`, {
                                selected: library.selected === option.id
                            })}
                            onClick={() => dispatch(switchLibrary(option.id))}
                        >
                            {option.name}
                        </div>
                    ))}
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
