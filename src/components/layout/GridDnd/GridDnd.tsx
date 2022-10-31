import { useState } from "react";
import {
	DndContext,
	DragOverlay,
	DragEndEvent,
	UniqueIdentifier,
	closestCenter,
	MouseSensor,
	TouchSensor,
	useSensors,
	useSensor,
	MouseSensorOptions,
	PointerSensorOptions
} from "@dnd-kit/core";
import {
	arrayMove,
	SortableContext,
	rectSortingStrategy
} from "@dnd-kit/sortable";

import GridDndItem from "./GridDndItem";
import { Grid, GridProps } from "components/layout";

interface Data {
	id: string;
	[key: string]: any;
}

export type GridDndrops = GridProps & {
	data: Data[];
	mouseSensorOptions?: MouseSensorOptions;
	pointerSensorOptions?: PointerSensorOptions;
	renderWith: (props: any) => JSX.Element;
	getProps?: (data: Data, index?: number) => Record<string, unknown>;
	setData: React.Dispatch<React.SetStateAction<any[]>>;
	// Custom drag events
	onDragStart?: (event: DragEndEvent) => void;
	onDragEnd?: (event: DragEndEvent) => void;
	onDragCancel?: () => void;
};

/**
 * Grid with drag and drop functionality.
 *
 * Data must have a unique `id` property.
 */
export const GridDnd = ({
	renderWith,
	data,
	setData,
	onDragStart,
	onDragEnd,
	onDragCancel,
	getProps = (data) => data,
	mouseSensorOptions = {
		// Require the mouse to move by 10 pixels before activating
		activationConstraint: {
			distance: 5
		}
	},
	pointerSensorOptions = {
		// Press delay of 80ms, with tolerance of 4px of movement
		activationConstraint: {
			delay: 80,
			tolerance: 4
		}
	},
	...gridProps
}: GridDndrops) => {
	const RenderWith = renderWith;
	const [activeId, setActiveId] = useState<null | UniqueIdentifier>(-1);

	const sensors = useSensors(
		useSensor(MouseSensor, mouseSensorOptions),
		useSensor(TouchSensor, pointerSensorOptions)
	);

	return (
		<DndContext
			collisionDetection={closestCenter}
			onDragCancel={handleDragCancel}
			onDragEnd={handleDragEnd}
			onDragStart={handleDragStart}
			sensors={sensors}
		>
			<SortableContext
				items={data.map(({ id }) => String(id))}
				strategy={rectSortingStrategy}
			>
				<Grid {...gridProps}>
					{data.map((dataItem, index) => (
						<GridDndItem
							key={dataItem.id}
							id={dataItem.id}
							dataItem={getProps(dataItem, index)}
							renderIndex={index}
							renderWith={renderWith}
						/>
					))}
				</Grid>
			</SortableContext>

			<DragOverlay adjustScale={false}>
				{activeId ? (
					<RenderWith
						{...getProps(
							data?.[data?.findIndex((x) => x.id === activeId)]
						)}
					/>
				) : null}
			</DragOverlay>
		</DndContext>
	);

	function handleDragStart(event: DragEndEvent) {
		if (onDragStart) onDragStart(event);
		setActiveId(event.active.id);
	}

	function handleDragEnd(event: DragEndEvent) {
		if (onDragEnd) onDragEnd(event);

		const { active, over } = event;

		if (active?.id !== over?.id) {
			setData((items) => {
				const oldIndex = items.findIndex((x) => x.id === active?.id);
				const newIndex = items.findIndex((x) => x.id === over?.id);

				return arrayMove(items, oldIndex, newIndex);
			});
		}

		setActiveId(null);
	}

	function handleDragCancel() {
		if (onDragCancel) onDragCancel();
		setActiveId(null);
	}
};
