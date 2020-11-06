import * as React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

function EnterFullscreenIcon(props: SvgProps) {
    return (
        <Svg viewBox="0 0 24 24" width={18} height={18} {...props}>
            <Path d="M0 0h24v24H0z" fill="none" />
            <Path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
        </Svg>
    );
}

export { EnterFullscreenIcon };
