import { css, cx } from "@linaria/core";
import { MouseEvent, TouchEvent, useCallback, useRef } from "react";
import { isMobile } from "react-device-detect";

export type RippleProps = JSX.IntrinsicElements["div"] & {
	hoverBg?: boolean;
	centered?: boolean;
	disabled?: boolean;
};

/**
 * Animated ripple effect on-click (inspired by material-ui).
 *
 * @Note Ported from `react-native-paper`'s `<TouchableRipple />`
 */
export const Ripple = ({
	children,
	hoverBg,
	centered,
	onMouseDown,
	onMouseUp,
	onTouchStart,
	onTouchEnd,
	...props
}: RippleProps) => {
	// Keep track of each ripple
	const count = useRef(0);

	// Calculate touch/mouse position (relative to container)
	const getTouchPosition = (e: MouseEvent | TouchEvent, targetRect: DOMRect) => {
		let x, y, clientX, clientY;
		x = y = clientX = clientY = 0;

		if (e.type === "mousedown") {
			const native = e.nativeEvent as MouseEvent["nativeEvent"];
			clientX = native?.clientX;
			clientY = native?.clientY;
		} else if (e.type === "touchstart") {
			const native = e.nativeEvent as TouchEvent["nativeEvent"];
			const touch = native?.touches?.[0] ?? native?.changedTouches?.[0];
			clientX = touch?.clientX;
			clientY = touch?.clientY;
		}

		x = Math.round(clientX - targetRect?.x) || 0;
		y = Math.round(clientY - targetRect?.y) || 0;

		return { x, y };
	};

	const handleRemoveRipple = (container: Element) => {
		const ripple = container.firstChild as HTMLSpanElement;

		Object.assign(ripple.style, {
			transitionDuration: "250ms",
			opacity: 0
		});

		// Finally remove the span after the transition
		setTimeout(() => {
			const { parentNode } = container;

			if (parentNode) {
				parentNode.removeChild(container);
			}
		}, 500);
	};

	const handleStart = useCallback(
		(e: any) => {
			if (isMobile) onTouchStart?.(e);
			else onMouseDown?.(e);

			const rippleId = count.current++;
			const button = e.currentTarget;
			const style = window.getComputedStyle(button);
			const dimensions = button.getBoundingClientRect();

			let { x: touchX, y: touchY } = getTouchPosition(e, dimensions);

			if (centered || !touchX || !touchY) {
				touchX = dimensions.width / 2;
				touchY = dimensions.height / 2;
			}

			// Get the size of the button to determine how big the ripple should be
			const size = Math.max(dimensions.width, dimensions.height) * 2.5;

			// Create a container for our ripple effect so we don't need to change the parent's style
			const container = document.createElement("span");

			container.setAttribute("data-ripple", "");
			container.setAttribute(`data-ripple-${rippleId}`, "");

			Object.assign(container.style, {
				position: "absolute",
				pointerEvents: "none",
				top: "0",
				left: "0",
				right: "0",
				bottom: "0",
				borderTopLeftRadius: style.borderTopLeftRadius,
				borderTopRightRadius: style.borderTopRightRadius,
				borderBottomRightRadius: style.borderBottomRightRadius,
				borderBottomLeftRadius: style.borderBottomLeftRadius
			});

			// Create span to show the ripple effect
			const ripple = document.createElement("span");

			// Calculate the distance to the center as a percentage (center is 0%)
			const mouseX = e.clientX - dimensions.left;
			const center = button.clientWidth / 2;
			const distanceToCenter = Math.abs(((mouseX - center) / center) * 100);

			// Scale animation duration based on distance to center.
			// Corner clicks appear slower, since you are only seeing a cross-section of the circle expanding.
			const durationScaler = centered ? 1 : distanceToCenter * 0.4;
			const duration = 280 - (280 * durationScaler) / 100;

			Object.assign(ripple.style, {
				position: "absolute",
				pointerEvents: "none",
				backgroundColor: "rgba(0, 0, 0, 0.1)", // @TODO: theme me
				borderRadius: "50%",
				zIndex: "10",

				/* Transition configuration */
				transitionProperty: "transform opacity",
				transitionDuration: `${duration}ms`,
				transitionTimingFunction: "linear",
				transformOrigin: "center",

				/* We'll animate these properties */
				transform: "translate3d(-50%, -50%, 0) scale3d(0.15, 0.15, 0.1)",
				opacity: "0.5",

				// Position the ripple where cursor was
				left: `${touchX}px`,
				top: `${touchY}px`,
				width: `${size}px`,
				height: `${size}px`
			});

			// Finally, append it to DOM
			container.appendChild(ripple);
			button.appendChild(container);

			// rAF runs in the same frame as the event handler
			// Use double rAF to ensure the transition class is added in next frame
			// This will make sure that the transition animation is triggered
			requestAnimationFrame(() => {
				requestAnimationFrame(() => {
					Object.assign(ripple.style, {
						transform: "translate3d(-50%, -50%, 0) scale3d(1, 1, 1)",
						opacity: "1"
					});
				});
			});

			const reset = setTimeout(() => {
				requestAnimationFrame(() => {
					const remainingRipple = button.querySelector(
						`[data-ripple-${rippleId}]`
					);
					if (remainingRipple) handleRemoveRipple(remainingRipple);
				});
			}, duration + 400);

			return () => clearTimeout(reset);
		},
		[centered, onTouchStart]
	);

	const handleEnd = useCallback(
		(e: any) => {
			if (isMobile) onTouchEnd?.(e);
			else onMouseUp?.(e);

			const containers = e?.currentTarget?.querySelectorAll(
				"[data-ripple]"
			) as HTMLElement[];

			requestAnimationFrame(() => {
				requestAnimationFrame(() => {
					containers?.forEach((container) => {
						handleRemoveRipple(container);
					});
				});
			});
		},
		[onTouchEnd]
	);

	return (
		<div
			{...props}
			className={cx(ripple, hoverBg && "hoverBg", props.className)}
			onMouseDown={(e) => !isMobile && handleStart?.(e)}
			onMouseUp={(e) => !isMobile && handleEnd?.(e)}
			onTouchStart={(e) => isMobile && handleStart?.(e)}
			onTouchEnd={(e) => isMobile && handleEnd?.(e)}
		>
			{children}
		</div>
	);
};

const ripple = css`
	position: relative;
	cursor: pointer;
	overflow: hidden;
	will-change: background-color;
	transition: 200ms background-color;

	&.hoverBg:hover {
		background-color: #f5f5f5; // @TODO: theme me
	}
`;
