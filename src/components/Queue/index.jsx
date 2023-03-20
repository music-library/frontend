import { useDispatch, useSelector } from "react-redux";
import { css } from "@linaria/core";
import { useMemo } from "react";
import cx from "classnames";

import { getNextTrack } from "utils";
import { queueNew } from "store/actions";

import { Grid, GridDnd } from "components/layout";
import TrackBig from "components/Tracks/TrackBig";

function Queue({ className, ...props }) {
    const dispatch = useDispatch();
    const queue = useSelector((state) => state.music.queue);
    const isFetching = useSelector((state) => state.music.isFetching);
    const playingIndex = useSelector((state) => state.session.playing.index);

    const newQueue = queue.map((trackId) => ({
        id: String(trackId)
    }));

    const setNewQueue = (newNewQueue) => {
        dispatch(
            queueNew(newNewQueue(newQueue).map((track) => Number(track.id)))
        );
    };

    // Array of the next five track indexes to play after the final queue track
    const nextQueueItems = useMemo(() => {
        const arr = [];

        for (let i = 0; i < 5; i++) {
            const index = queue?.length
                ? queue?.[queue?.length - 1]
                : playingIndex;

            // If the next track index is larger than the track list (the last track in the redux tracks array),
            // then the next track index is 0. `getNextTrack` will always give `0`, even if it's 2+ over the limit.
            // The following checks and amends the correct track after `0`.
            for (let count = 0; count < i + 1; count++) {
                if (count === 0) {
                    arr.push(getNextTrack(index));
                    continue;
                }
                arr[arr?.length - 1] = getNextTrack(arr[arr?.length - 1]);
            }
        }

        return arr;
    }, [queue, playingIndex, isFetching]);

    return (
        <div className={cx("track-container", className)} {...props}>
            {playingIndex !== -1 && (
                <TrackBig
                    size="big"
                    index={playingIndex}
                    className={queueTrack}
                />
            )}

            <GridDnd
                data={newQueue}
                setData={setNewQueue}
                renderWith={(props) => (
                    <TrackBig
                        index={Number(props?.id)}
                        className={queueTrack}
                        size="big"
                        {...props}
                    />
                )}
                // grid
                className={gridDndWrapper}
                gutter={5}
                minWidth={"100%"}
                maxWidth={"1fr"}
            />

            <hr className={separator} />

            {(playingIndex !== -1 || !!queue?.length) && (
                <Grid gutter={5} minWidth={"100%"} maxWidth={"1fr"}>
                    {nextQueueItems.map((trackIndex, index) => {
                        return (
                            <TrackBig
                                size="big"
                                key={trackIndex + index}
                                index={trackIndex}
                                className={queueTrack}
                                hideIfNonExistent={true}
                            />
                        );
                    })}
                </Grid>
            )}
        </div>
    );
}

const separator = css`
    margin: 8rem;
    border: 1px solid #252525;
`;

const gridDndWrapper = css`
    margin: 5px 0;
`;

const queueTrack = css`
    padding: 0 6px !important;
    height: 63px !important;

    .image {
        margin-left: 2px !important;
        margin-right: 13px !important;
    }
`;

export default Queue;
