export const colors = [
	"#d5f1ff",
	"#cdfff5",
	"#cdffda",
	"#fcffcd",
	"#ffeecd",
	"#d5e0ff",
	// New
	"#97b9ed",
	"#a3a2ff",
	"#FFFFFF",
	"#FFE799",
	"#F8B47C",
	"#3FCE65"
];

/**
 * Gets a random color from the colors array
 */
export const getRandomColor = () => {
	return colors?.indexOf(colors[Math.floor(Math.random() * colors.length)]);
};

export interface IColorStore {
	colors: string[];
	current: number;
}

export const colorStore: IColorStore = {
	colors,
	current: getRandomColor()
};

export default colorStore;
