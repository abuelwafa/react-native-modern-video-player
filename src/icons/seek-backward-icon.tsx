import * as React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

function SeekBackwardIcon(props: SvgProps) {
    return (
        <Svg viewBox="0 0 24 24" width={18} height={18} {...props}>
            <Path d="M0 0h24v24H0z" fill="none" />
            <Path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z" />
        </Svg>
    );
}
export { SeekBackwardIcon };
