import { css } from "@linaria/core";
import cx from "classnames";

import { switchLibrary } from "store/actions";
import { useDispatch, useSelector } from "hooks";

function SwitchLibrary() {
    const dispatch = useDispatch();
    const library = useSelector((state) => state.music.library);

    return (
        <>
            {library.options?.length > 1 && (
                <div className={cx("libraryOptions", "tags")}>
                    {library.options.map((option) => (
                        <div
                            className={`tag${
                                library.selected === option.name
                                    ? " selected"
                                    : ""
                            }${
                                library.selected === option.name
                                    ? " active"
                                    : " active"
                            }`}
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

export default SwitchLibrary;
