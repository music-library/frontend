import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
// import { useSpring, animated } from "react-spring";

import { useLocalStorage } from "../../hooks/useLocalStorage";
import { filterToggleTag } from "../../store/actionCreators";

import Icon from "../Icon";
import Tag from "./Tag";

function Tags() {
    const dispatch = useDispatch();

    const tracks = useSelector((state) => state.music.tracks.data);
    const isFetching = useSelector((state) => state.music.tracks.isFetching);
    const didError = useSelector((state) => state.music.tracks.didError);
    const isLoading = isFetching || didError;

    // Tags
    const [tags, setTags] = useState([]);
    const [areTagsHidden, setAreTagsHidden] = useLocalStorage("areTagsHidden", true);
    const tagsRendered = areTagsHidden ? 6 : tags.length;

    // Populate genre tags
    useEffect(() => {
        setTags(
            tracks.reduce(function(filtered, track, key) {
                const genre = track.metadata.genre.toLowerCase();

                // Only add unique genre tags
                if (!filtered.includes(genre)) {
                    filtered.push(genre);
                }

                return filtered;
            }, []).sort()
        );
    }, [tracks]);

    // Toggle tag in filter array
    const handleToggleTag = (tag) => dispatch(filterToggleTag(tag));
    const handleToggleTagsRendered = () => setAreTagsHidden(!areTagsHidden);

    return (
        <div className="tags">
            {isLoading &&
                [...Array(7)].map((x, key) =>
                    <Tag tag={null} key={key} />
                )
            }

            {
                tags.slice(0, tagsRendered).map((tag, key) => {
                    return (
                        <Tag
                            tag={tag}
                            handleOnClick={handleToggleTag}
                            key={key}
                        />
                    )
                })
            }

            {
                tags.length > 6 &&
                <Tag
                    tag={
                        tagsRendered === tags.length ?
                        <>
                            <Icon name="minus" />
                            Hide <strong>{Math.abs(6 - tagsRendered)}</strong> Tags...
                        </> :
                        <>
                            <Icon name="plus" />
                            Show <strong>{tags.length - tagsRendered}</strong> More Tags...
                        </>
                    }
                    handleOnClick={handleToggleTagsRendered}
                />
            }
        </div>
    );
}

export default Tags;
