import { useDispatch, useSelector } from "react-redux";

import { useCatalogRefreshState, useCatalogTags } from "catalog";
import { useLocalStorage } from "lib/hooks";
import { filterResetTags, filterToggleTag } from "state/actions";

import { Icon } from "view/components";

import Tag from "./Tag";

export function Tags() {
	const dispatch = useDispatch();

	const libraryId = useSelector((state) => state.music.library.selected);
	const { genres, decades, data, isLoading } = useCatalogTags(libraryId);
	const refresh = useCatalogRefreshState(libraryId);
	const showLoading = (isLoading || refresh.isRefreshing || refresh.didError) && data.length === 0;

	// Tags
	const tags = [...decades, ...genres];
	const [areTagsHidden, setAreTagsHidden] = useLocalStorage("areTagsHidden", true);
	const tagsRendered = areTagsHidden ? 6 : tags.length;

	// Toggle tag in filter array
	const handleToggleTag = (tag) => dispatch(filterToggleTag(tag));
	const handleResetSelectedTags = () => dispatch(filterResetTags());
	const handleToggleTagsRendered = () => setAreTagsHidden(!areTagsHidden);

	return (
		<div className="tags">
			{showLoading && [...Array(7)].map((x, key) => <Tag tag={null} key={key} />)}

			{tags.slice(0, tagsRendered).map((tag, key) => {
				return <Tag tag={tag} handleOnClick={handleToggleTag} key={key} />;
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
								Hide <strong>{Math.abs(6 - tagsRendered)}</strong> Tags...
							</>
						) : (
							<>
								<Icon name="plus" />
								Show <strong>{tags.length - tagsRendered}</strong> More
								Tags...
							</>
						)
					}
					className={`${tagsRendered === tags.length ? "greyed-out" : ""}`}
					handleOnClick={handleToggleTagsRendered}
				/>
			)}
		</div>
	);
}

export default Tags;
