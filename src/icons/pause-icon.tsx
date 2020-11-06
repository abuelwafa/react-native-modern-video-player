import * as React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

function PauseIcon(props: SvgProps) {
    return (
        <Svg viewBox="0 0 24 24" width={18} height={18} {...props}>
            <Path d="M0 0h24v24H0z" fill="none" />
            <Path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
        </Svg>
    );
}

export { PauseIcon };
