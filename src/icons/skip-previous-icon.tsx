import * as React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

function SkipPreviousIcon(props: SvgProps) {
    return (
        <Svg viewBox="0 0 24 24" width={18} height={18} {...props}>
            <Path d="M0 0h24v24H0z" fill="none" />
            <Path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
        </Svg>
    );
}

export { SkipPreviousIcon };
