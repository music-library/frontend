import { Ref, SVGProps } from "react";
import * as Icons from "./subComponents";

const IconMappings = {
	album: Icons.Album,
	close: Icons.Close,
	"logo-discogs-vinyl": Icons.LogoDiscogsVinyl,
	"logo-google": Icons.LogoGoogle,
	"logo-youtube": Icons.LogoYoutube,
	logo: Icons.Logo,
	minus: Icons.Minus,
	pause: Icons.Pause,
	placeholder: Icons.Placeholder,
	play: Icons.Play,
	plus: Icons.Plus,
	"plus-box-multiple": Icons.PlusBoxMultiple,
	"queue-music": Icons.QueueMusic,
	replay: Icons.Replay,
	shuffle: Icons.Shuffle,
	"skip-next": Icons.SkipNext,
	"skip-previous": Icons.SkipPrevious,
	"volume-high": Icons.VolumeHigh,
	"volume-medium": Icons.VolumeMedium,
	"volume-mute": Icons.VolumeMute,
	refresh: Icons.Refresh,
	spinner: Icons.Spinner
};

// Infer the type of IconMappings, then extract the keys from the type it infers
export type IconMappingsType = keyof typeof IconMappings;

type IconProps = SVGProps<SVGSVGElement> & {
	animate?: string;
	name: IconMappingsType;
	ref?: Ref<SVGSVGElement>;
};

export const Icon = ({ name, animate, style = {}, ...svgProps }: IconProps) => {
	const styles = animate ? { animation: animate, ...style } : style;
	const IconComponent = IconMappings?.[name];
	return <IconComponent {...svgProps} style={styles} />;
};
