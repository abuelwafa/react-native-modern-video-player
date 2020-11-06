import * as React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

function SkipNextIcon(props: SvgProps) {
    return (
        <Svg viewBox="0 0 24 24" width={18} height={18} {...props}>
            <Path d="M0 0h24v24H0z" fill="none" />
            <Path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
        </Svg>
    );
}

export { SkipNextIcon };
