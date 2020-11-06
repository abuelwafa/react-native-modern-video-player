import * as React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

function SeekForwardIcon(props: SvgProps) {
    return (
        <Svg viewBox="0 0 24 24" width={18} height={18} {...props}>
            <Path d="M0 0h24v24H0z" fill="none" />
            <Path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z" />
        </Svg>
    );
}

export { SeekForwardIcon };
