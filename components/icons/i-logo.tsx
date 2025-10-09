import { CustomSvgProps } from "@/lib/types/svgType";
import React from "react";
import Svg, { Path } from "react-native-svg";

const Logo: React.FC<CustomSvgProps> = (props) => {
	return (
		<Svg
			width={props.width ?? props.size ?? "53"}
			height={props.height ?? props.size ?? "47"}
			viewBox="0 0 53 47"
			fill="none"
		>
			<Path
				d="M28.833 25.5389V3.47368C28.833 1.55579 27.2772 0 25.3593 0H23.4137C21.4959 0 19.9401 1.55579 19.9401 3.47368V25.5493L1.52002 38.084C-0.0652237 39.1634 -0.477561 41.3238 0.601792 42.9091L1.69674 44.5168C2.77609 46.1021 4.93653 46.5144 6.52178 45.4351L23.9335 33.5864L47.506 38.5951C49.3823 38.9936 51.2275 37.7964 51.6259 35.9201L52.0296 34.0178C52.4281 32.1415 51.2309 30.2964 49.3546 29.8979L28.833 25.5389ZM21.7003 24.3539L21.7661 24.0386L22.0676 24.1027L21.6986 24.3539H21.7003Z"
				fill="#266DD3"
			/>
			<Path
				d="M33.2791 8.61401V21.3965L47.7975 24.314L33.2791 8.61401Z"
				fill="#F59E0B"
			/>
		</Svg>
	);
};

export default Logo;
