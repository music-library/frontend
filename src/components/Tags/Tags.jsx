import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
// import { useSpring, animated } from "react-spring";

import { useLocalStorage } from "hooks/useLocalStorage";
import { filterToggleTag, filterResetTags } from "store/actions";

import Tag from "./Tag.jsx";

import { Icon } from "components/Icon";

function Tags() {
    const dispatch = useDispatch();

    const tracks = useSelector((state) => state.music.tracks);
    const isFetching = useSelector((state) => state.music.isFetching);
    const didError = useSelector((state) => state.music.didError);
    const isLoading = isFetching || didError;

    // Tags
    const [tags, setTags] = useState([]);
    const [areTagsHidden, setAreTagsHidden] = useLocalStorage(
        "areTagsHidden",
        true
    );
    const tagsRendered = areTagsHidden ? 6 : tags.length;

    // Populate genre tags
    useEffect(() => {
        setTags(
            tracks
                .reduce(function (filtered, track, key) {
                    const genre = track?.metadata?.genre.toLowerCase();
                    const year = track?.metadata?.year;
                    const decade = Math.floor(year / 10) * 10;

                    // Only add unique genre tags
                    if (genre && !filtered.includes(genre)) {
                        filtered.push(genre);
                    }

                    // Only add unique decade tags
                    if (
                        decade &&
                        decade.toString().length === 4 &&
                        !filtered.includes(decade)
                    ) {
                        filtered.push(decade);
                    }

                    return filtered;
                }, [])
                .sort()
        );
    }, [tracks]);

    // Toggle tag in filter array
    const handleToggleTag = (tag) => dispatch(filterToggleTag(tag));
    const handleResetSelectedTags = () => dispatch(filterResetTags());
    const handleToggleTagsRendered = () => setAreTagsHidden(!areTagsHidden);

    return (
        <div className="tags">
            {isLoading &&
                [...Array(7)].map((x, key) => <Tag tag={null} key={key} />)}

            {tags.slice(0, tagsRendered).map((tag, key) => {
                return (
                    <Tag tag={tag} handleOnClick={handleToggleTag} key={key} />
                );
            })}

            {tags.length > 2 && (
                <Tag
                    tag={
                        <>
                            <Icon name="close" />
                            Reset tags
                        </>
                    }
                    className="tag-reset"
                    handleOnClick={handleResetSelectedTags}
                />
            )}

            {tags.length > 6 && (
                <Tag
                    tag={
                        tagsRendered === tags.length ? (
                            <>
                                <Icon name="minus" />
                                Hide{" "}
                                <strong>
                                    {Math.abs(6 - tagsRendered)}
                                </strong>{" "}
                                Tags...
                            </>
                        ) : (
                            <>
                                <Icon name="plus" />
                                Show{" "}
                                <strong>
                                    {tags.length - tagsRendered}
                                </strong>{" "}
                                More Tags...
                            </>
                        )
                    }
                    className={`${
                        tagsRendered === tags.length ? "greyed-out" : ""
                    }`}
                    handleOnClick={handleToggleTagsRendered}
                />
            )}
        </div>
    );
}

export default Tags;
