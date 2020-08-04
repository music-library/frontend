import React from "react";
import Skeleton from "react-loading-skeleton";
import { useSelector, useDispatch } from "react-redux";
import { filterToggleTag } from "../../store/actionCreators";

function Tag({ tag }) {
    const dispatch = useDispatch();

    // Get selected tags from store
    const selectedTags = useSelector((state) => state.music.tracks.filter.tags);
    let isSelected = false;

    // If tag is active
    // -> exists within filtered array
    if (selectedTags.includes(tag))
        isSelected = true;

    // Toggle tag in filter array
    const handleToggleTag = (e) => dispatch(filterToggleTag(tag));

    // Return Skeleton tag if value is falsy
    if (!tag) {
        return <Skeleton width="70px" height="28px" style={{margin: "4px"}} />;
    }

    return (
        <div
            className={`tag${isSelected ? " selected" : ""}`}
            onClick={handleToggleTag}
        >
            {tag}
        </div>
    );
}

export default Tag;
