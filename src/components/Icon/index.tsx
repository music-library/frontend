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
	name: IconMappingsType;
	ref?: Ref<SVGSVGElement>;
};

export const Icon = ({ name, ...svgProps }: IconProps) => {
	const IconComponent = IconMappings?.[name];
	return <IconComponent {...svgProps} />;
};
