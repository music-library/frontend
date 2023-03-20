import React from "react";
import cx from "classnames";
import { useSelector } from "react-redux";
import Skeleton from "react-loading-skeleton";

function Tag({ tag, className, handleOnClick }) {
    const selectedTags = useSelector((state) => state.music.filter.tags);
    let isSelected = false;
    let isActive = false;

    // If tag is active
    // -> exists within filtered array
    if (selectedTags.includes(tag)) isSelected = true;

    // Activate "reset tags" button
    if (selectedTags.length > 1) {
        isActive = true;
    }

    // Return Skeleton tag if value is falsy
    if (!tag) {
        return (
            <Skeleton width="70px" height="28px" style={{ margin: "4px" }} />
        );
    }

    return (
        <div
            className={cx(
                `tag`,
                className,
                {
                    selected: isSelected
                },
                {
                    active: isActive
                }
            )}
            onClick={() => handleOnClick(tag)}
        >
            {tag}
        </div>
    );
}

export default Tag;
