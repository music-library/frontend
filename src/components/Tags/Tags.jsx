import { useSelector, useDispatch } from "react-redux";

import { useLocalStorage } from "hooks/useLocalStorage";
import { filterToggleTag, filterResetTags } from "store/actions";

import Tag from "./Tag";
import { Icon } from "components/Icon";

function Tags() {
    const dispatch = useDispatch();

    const genres = useSelector((state) => state.music.genres);
    const decades = useSelector((state) => state.music.decades);
    const didError = useSelector((state) => state.music.didError);
    const isFetching = useSelector((state) => state.music.isFetching);
    const isLoading = isFetching || didError;

    // Tags
    const tags = [...decades, ...genres];
    const [areTagsHidden, setAreTagsHidden] = useLocalStorage(
        "areTagsHidden",
        true
    );
    const tagsRendered = areTagsHidden ? 6 : tags.length;

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
