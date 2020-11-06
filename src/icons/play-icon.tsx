import * as React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

function PlayIcon(props: SvgProps) {
    return (
        <Svg viewBox="0 0 24 24" width={18} height={18} {...props}>
            <Path d="M0 0h24v24H0z" fill="none" />
            <Path d="M8 5v14l11-7z" />
        </Svg>
    );
}

export { PlayIcon };
