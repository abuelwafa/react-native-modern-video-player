/* eslint-disable react-native/no-inline-styles, no-shadow */
import React, { useRef, useState, useContext } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    Platform,
    Image,
    Text,
    TouchableWithoutFeedback,
    ActivityIndicator,
    Modal,
} from 'react-native';
import Video from 'react-native-video';
import type { VideoProperties } from 'react-native-video';
import Orientation from 'react-native-orientation-locker';

import { SoundOnIcon } from './icons/sound-on-icon';
import { SoundMutedIcon } from './icons/sound-muted-icon';
import { EnterFullscreenIcon } from './icons/enter-fullscreen-icon';
import { ExitFullscreenIcon } from './icons/exit-fullscreen-icon';
import { SeekForwardIcon } from './icons/seek-forward-icon';
import { SeekBackwardIcon } from './icons/seek-backward-icon';
import { PlayIcon } from './icons/play-icon';
import { PauseIcon } from './icons/pause-icon';
import { SkipPreviousIcon } from './icons/skip-previous-icon';
import { SkipNextIcon } from './icons/skip-next-icon';

const iconProps = { width: 25, height: 25, fill: '#fff' };

const styles = StyleSheet.create({
    container: { backgroundColor: '#bbb' },
    seekbarContainer: {
        padding: 15,
        backgroundColor: '#dedede',
        justifyContent: 'center',
    },
    seekbar: { height: 3, backgroundColor: '#333' },
    seekHandler: {
        borderRadius: 20,
        width: 20,
        height: 20,
        backgroundColor: 'red',
        position: 'absolute',
        left: 5,
    },
    iconButton: { padding: 6 },
});

const formatSecondsTime = (duration: number): string => {
    const minutes = Math.floor(duration / 60);
    const seconds = Math.round(duration % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const VideoPlayerContext = React.createContext<{
    currentlyPlaying: string | null;
    setCurrentlyPlaying: (src: string | null) => void;
}>({
    currentlyPlaying: null,
    setCurrentlyPlaying: () => {},
});

const VideoPlayerProvider: React.FC = ({ children }) => {
    const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);

    return (
        <VideoPlayerContext.Provider value={{ currentlyPlaying, setCurrentlyPlaying }}>
            {children}
        </VideoPlayerContext.Provider>
    );
};

interface BaseVideoPlayerProps {
    skipInterval?: number;
    showSkipButtons?: boolean;
    showPlaylistControls?: boolean;
    onNextVideo?: () => void;
    onPreviousVideo?: () => void;
    iOSNativeControls?: boolean;
    hideControlsTimeout?: number;
}

interface VideoPlayerPropsWithSrc extends Omit<VideoProperties, 'source'>, BaseVideoPlayerProps {
    src: string;
    source?: undefined;
}

interface VideoPlayerPropsWithoutSrc extends VideoProperties, BaseVideoPlayerProps {
    src?: never;
}

type VideoPlayerProps = VideoPlayerPropsWithSrc | VideoPlayerPropsWithoutSrc;

const VideoPlayer: React.FC<VideoPlayerProps> = ({
    src = undefined,
    source = null,
    showSkipButtons = true,
    skipInterval = 10,
    repeat = false,
    onPreviousVideo,
    onNextVideo,
    iOSNativeControls = false,
    poster,
    onProgress,
    onLoad,
    onEnd,
    hideControlsTimeout = 4000,
    ...rest
}) => {
    const inlineVideoRef = useRef<Video>(null);
    const fullscreenVideoRef = useRef<Video>(null);
    const { currentlyPlaying, setCurrentlyPlaying } = useContext(VideoPlayerContext);

    const [fullscreen, setFullscreen] = useState(false);

    const [duration, setDuration] = useState(0);

    const [inlineVideoPosition, setInlineVideoPosition] = useState(0);
    const [fullscreenVideoPosition, setFullscreenVideoPosition] = useState(0);

    const [playableDuration, setPlayableDuration] = useState(0);
    const [fullscreenPlayableDuration, setFullscreenPlayableDuration] = useState(0);

    const [muted, setMuted] = useState(false);

    const [showControls, setShowControls] = useState(false);
    const [showFullscreenControls, setShowFullscreenControls] = useState(false);

    const [videoLoaded, setVideoLoaded] = useState(false);
    const [fullScreenVideoLoaded, setFullscreenVideoLoaded] = useState(false);

    const [inlineVideoStarted, setInlineVideoStarted] = useState(false);
    const returnFromFullscreen = useRef(false);
    const inlineControlsTimeoutHandle = useRef<ReturnType<typeof setTimeout> | null>(null);
    const fullScreenControlsTimeoutHandle = useRef<ReturnType<typeof setTimeout> | null>(null);

    let isPlaying: boolean = false;
    if (source) {
        isPlaying = currentlyPlaying === JSON.stringify(source);
    }
    if (src) {
        isPlaying = currentlyPlaying === src;
    }

    // ref to hold the updated value of isPlaying to be used in the timeout handler
    const isPlayingWrapperRef = useRef(isPlaying);
    isPlayingWrapperRef.current = isPlaying;

    const isLoading = isPlaying && playableDuration - inlineVideoPosition <= 0;
    const fullscreenIsLoading =
        isPlaying && fullscreenPlayableDuration - fullscreenVideoPosition <= 0;

    const hideInlineControls = () => {
        inlineControlsTimeoutHandle.current = null;
        if (isPlayingWrapperRef.current) {
            setShowControls(false);
        }
    };

    const hideFullScreenControls = () => {
        fullScreenControlsTimeoutHandle.current = null;
        if (isPlayingWrapperRef.current) {
            setShowFullscreenControls(false);
        }
    };

    const displayInlineControls = () => {
        if (inlineControlsTimeoutHandle.current) {
            clearTimeout(inlineControlsTimeoutHandle.current);
        }
        inlineControlsTimeoutHandle.current = setTimeout(hideInlineControls, hideControlsTimeout);
        setShowControls(true);
    };

    const displayFullScreenControls = () => {
        if (fullScreenControlsTimeoutHandle.current) {
            clearTimeout(fullScreenControlsTimeoutHandle.current);
        }
        fullScreenControlsTimeoutHandle.current = setTimeout(
            hideFullScreenControls,
            hideControlsTimeout,
        );
        setShowFullscreenControls(true);
    };

    if (!src && !source) {
        if (__DEV__) {
            console.error(
                'Either one of src or source props must be passed to VideoPlayer component',
            );
        }
        return null;
    }

    if (src && typeof src !== 'string') {
        if (__DEV__) {
            console.error('src attribute on the VideoPlayer component must be a string');
        }
        return null;
    }

    const exitFullScreen = () => {
        returnFromFullscreen.current = true;
        setFullscreen(false);
        setFullscreenVideoLoaded(false);
        setShowFullscreenControls(false);
        Orientation.lockToPortrait();
        displayInlineControls();
    };

    const videoSource: VideoProperties['source'] = source || { uri: src };

    return (
        <View style={{ flex: 1, width: '100%', position: 'relative' }} key={src}>
            {!fullscreen && (
                <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: 'black' }}>
                    {inlineVideoStarted ? (
                        <TouchableWithoutFeedback
                            onPress={() => videoLoaded && displayInlineControls()}>
                            {/* inline video*/}
                            <Video
                                repeat={repeat}
                                paused={!isPlaying}
                                fullscreenAutorotate={true}
                                posterResizeMode="cover"
                                style={StyleSheet.absoluteFillObject}
                                {...rest}
                                source={videoSource}
                                volume={1}
                                muted={muted}
                                resizeMode="contain"
                                ref={inlineVideoRef}
                                onProgress={(...params) => {
                                    const { currentTime, playableDuration } = params[0];
                                    setInlineVideoPosition(currentTime);
                                    setPlayableDuration(playableDuration);
                                    onProgress && onProgress(...params);
                                }}
                                onLoad={(...params) => {
                                    const { duration } = params[0];
                                    setDuration(duration);
                                    setVideoLoaded(true);
                                    if (inlineVideoRef.current && returnFromFullscreen.current) {
                                        inlineVideoRef.current.seek(fullscreenVideoPosition);
                                    }

                                    onLoad && onLoad(...params);
                                }}
                                controls={iOSNativeControls && Platform.OS === 'ios'}
                                onEnd={(...params) => {
                                    setShowControls(true);
                                    if (!repeat) {
                                        setCurrentlyPlaying(null);
                                        fullscreenVideoRef.current?.seek(0);
                                        inlineVideoRef.current?.seek(0);
                                    }
                                    onEnd && onEnd(...params);
                                }}
                            />
                        </TouchableWithoutFeedback>
                    ) : (
                        <View
                            style={[
                                StyleSheet.absoluteFillObject,
                                { flexGrow: 1, alignItems: 'center', justifyContent: 'center' },
                            ]}>
                            <Image style={StyleSheet.absoluteFillObject} source={{ uri: poster }} />
                            <TouchableOpacity
                                onPress={() => {
                                    // extract this to a function called play
                                    setInlineVideoStarted(true);
                                    setCurrentlyPlaying(
                                        source ? JSON.stringify(source) : src ? src : null,
                                    );
                                }}
                                style={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                    borderRadius: 40,
                                    padding: 8,
                                }}>
                                <PlayIcon width={48} height={48} fill="#fff" />
                            </TouchableOpacity>
                        </View>
                    )}

                    {isLoading && !videoLoaded && (
                        <View
                            style={{
                                ...StyleSheet.absoluteFillObject,
                                justifyContent: 'center',
                                alignItems: 'center',
                                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                            }}>
                            <ActivityIndicator color="#fff" size="large" />
                        </View>
                    )}

                    {((Platform.OS === 'android' && videoLoaded && showControls) ||
                        (Platform.OS === 'ios' &&
                            !iOSNativeControls &&
                            videoLoaded &&
                            showControls)) && (
                        <TouchableWithoutFeedback
                            onPress={() => {
                                if (inlineControlsTimeoutHandle.current) {
                                    clearTimeout(inlineControlsTimeoutHandle.current);
                                    inlineControlsTimeoutHandle.current = null;
                                }
                                setShowControls(false);
                            }}>
                            {/* controls container*/}
                            <View
                                style={[
                                    StyleSheet.absoluteFillObject,
                                    {
                                        backgroundColor: 'rgba(0, 0, 0, 0.2)',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    },
                                ]}>
                                {/* center controls container */}
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        width: '80%',
                                    }}>
                                    {/* seek backward button */}
                                    {showSkipButtons && (
                                        <TouchableOpacity
                                            onPress={() => {
                                                inlineVideoRef.current?.seek(
                                                    inlineVideoPosition - skipInterval,
                                                );
                                                displayInlineControls();
                                            }}
                                            style={{ padding: 8 }}>
                                            <SeekBackwardIcon width={42} height={42} fill="#fff" />
                                        </TouchableOpacity>
                                    )}

                                    {/* skip previous button */}
                                    {onPreviousVideo && (
                                        <TouchableOpacity
                                            onPress={() => {
                                                onPreviousVideo();
                                                displayInlineControls();
                                            }}
                                            style={{ padding: 8 }}>
                                            <SkipPreviousIcon width={42} height={42} fill="#fff" />
                                        </TouchableOpacity>
                                    )}

                                    {/* play/pause button */}
                                    <TouchableOpacity
                                        onPress={() => {
                                            if (isPlaying) {
                                                setCurrentlyPlaying(null);
                                            } else {
                                                setInlineVideoStarted(true);
                                                setCurrentlyPlaying(
                                                    source
                                                        ? JSON.stringify(source)
                                                        : src
                                                        ? src
                                                        : null,
                                                );
                                            }
                                            displayInlineControls();
                                        }}
                                        style={{ padding: 8 }}>
                                        {isPlaying ? (
                                            <PauseIcon width={42} height={42} fill="#fff" />
                                        ) : (
                                            <PlayIcon width={42} height={42} fill="#fff" />
                                        )}
                                    </TouchableOpacity>

                                    {/* skip next button */}
                                    {onNextVideo && (
                                        <TouchableOpacity
                                            onPress={() => {
                                                onNextVideo();
                                                displayInlineControls();
                                            }}
                                            style={{ padding: 8 }}>
                                            <SkipNextIcon width={42} height={42} fill="#fff" />
                                        </TouchableOpacity>
                                    )}

                                    {/* seek forward button */}
                                    {showSkipButtons && (
                                        <TouchableOpacity
                                            onPress={() => {
                                                inlineVideoRef.current?.seek(
                                                    inlineVideoPosition + skipInterval,
                                                );
                                                displayInlineControls();
                                            }}
                                            style={{ padding: 8 }}>
                                            <SeekForwardIcon width={42} height={42} fill="#fff" />
                                        </TouchableOpacity>
                                    )}
                                </View>
                                {/* bottom controls container */}
                                <View
                                    style={{
                                        position: 'absolute',
                                        bottom: 4,
                                        left: 0,
                                        right: 0,
                                        height: 40,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                    }}>
                                    <Text style={{ color: '#fff', marginLeft: 8, fontSize: 12 }}>
                                        {formatSecondsTime(inlineVideoPosition)} /{' '}
                                        {formatSecondsTime(duration)}
                                    </Text>

                                    <View style={{ flexDirection: 'row' }}>
                                        {/* toggle mute button */}
                                        {muted ? (
                                            <TouchableOpacity
                                                style={[styles.iconButton]}
                                                onPress={() => {
                                                    setMuted(false);
                                                    displayInlineControls();
                                                }}>
                                                <SoundMutedIcon {...iconProps} />
                                            </TouchableOpacity>
                                        ) : (
                                            <TouchableOpacity
                                                style={[styles.iconButton]}
                                                onPress={() => {
                                                    setMuted(true);
                                                    displayInlineControls();
                                                }}>
                                                <SoundOnIcon {...iconProps} />
                                            </TouchableOpacity>
                                        )}

                                        {/* enter fullscreen button */}
                                        <TouchableOpacity
                                            onPress={() => {
                                                if (
                                                    Platform.OS === 'ios' &&
                                                    inlineVideoRef.current
                                                ) {
                                                    inlineVideoRef.current.presentFullscreenPlayer();
                                                } else {
                                                    setFullscreen(true);
                                                    Orientation.lockToLandscape();
                                                    displayFullScreenControls();
                                                }
                                            }}
                                            style={styles.iconButton}>
                                            <EnterFullscreenIcon {...iconProps} />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* seekbar */}
                                <View
                                    style={{
                                        backgroundColor: 'rgba(150, 150, 150, 0.4)',
                                        height: 3,
                                        position: 'absolute',
                                        bottom: 0,
                                        left: 0,
                                        right: 0,
                                    }}>
                                    <View
                                        style={[
                                            StyleSheet.absoluteFillObject,
                                            {
                                                backgroundColor: 'rgb(150, 150, 150)',
                                                width: `${(playableDuration * 100) / duration}%`,
                                            },
                                        ]}
                                    />
                                    <View
                                        style={[
                                            StyleSheet.absoluteFillObject,
                                            {
                                                backgroundColor: 'red',
                                                width: `${(inlineVideoPosition * 100) / duration}%`,
                                            },
                                        ]}
                                    />
                                    <View
                                        style={{
                                            width: 12,
                                            height: 12,
                                            backgroundColor: 'red',
                                            borderRadius: 50,
                                            position: 'absolute',
                                            top: -5,
                                            left: `${(inlineVideoPosition * 100) / duration}%`,
                                        }}
                                    />
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    )}
                </View>
            )}

            {/* fullscreen modal */}
            {Platform.OS === 'android' && (
                <Modal
                    presentationStyle="fullScreen"
                    visible={fullscreen}
                    supportedOrientations={['landscape']}
                    onRequestClose={exitFullScreen}>
                    <StatusBar hidden={fullscreen} />
                    <TouchableWithoutFeedback
                        onPress={() => fullScreenVideoLoaded && displayFullScreenControls()}>
                        {/* fullscreen video - android only */}
                        <Video
                            repeat={repeat}
                            paused={!isPlaying}
                            fullscreenAutorotate={true}
                            posterResizeMode="cover"
                            style={[StyleSheet.absoluteFillObject, { backgroundColor: 'black' }]}
                            {...rest}
                            source={videoSource}
                            volume={1}
                            muted={muted}
                            resizeMode="cover"
                            ref={fullscreenVideoRef}
                            onLoad={(...params) => {
                                const { duration } = params[0];
                                setDuration(duration);
                                setFullscreenVideoLoaded(true);
                                if (fullscreenVideoRef.current) {
                                    fullscreenVideoRef.current.seek(inlineVideoPosition);
                                }
                                onLoad && onLoad(...params);
                            }}
                            onProgress={(...params) => {
                                const { currentTime, playableDuration } = params[0];
                                setFullscreenVideoPosition(currentTime);
                                setFullscreenPlayableDuration(playableDuration);
                                onProgress && onProgress(...params);
                            }}
                            controls={false}
                            onEnd={(...params) => {
                                setCurrentlyPlaying(null);
                                setShowControls(true);
                                setFullscreenVideoPosition(0);
                                setInlineVideoPosition(0);
                                fullscreenVideoRef.current?.seek(0);
                                inlineVideoRef.current?.seek(0);
                                exitFullScreen();
                                onEnd && onEnd(...params);
                            }}
                        />
                    </TouchableWithoutFeedback>
                    {fullscreenIsLoading && !fullScreenVideoLoaded && (
                        <View
                            style={{
                                ...StyleSheet.absoluteFillObject,
                                justifyContent: 'center',
                                alignItems: 'center',
                                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                            }}>
                            <ActivityIndicator color="#fff" size="large" />
                        </View>
                    )}
                    {fullScreenVideoLoaded && showFullscreenControls && (
                        <TouchableWithoutFeedback
                            onPress={() => {
                                if (fullScreenControlsTimeoutHandle.current) {
                                    clearTimeout(fullScreenControlsTimeoutHandle.current);
                                    fullScreenControlsTimeoutHandle.current = null;
                                }
                                setShowFullscreenControls(false);
                            }}>
                            {/* controls container*/}
                            <View
                                style={[
                                    StyleSheet.absoluteFillObject,
                                    {
                                        backgroundColor: 'rgba(0, 0, 0, 0.2)',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    },
                                ]}>
                                {/* center controls container */}
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        width: '80%',
                                    }}>
                                    {/* seek backward button */}
                                    {showSkipButtons && (
                                        <TouchableOpacity
                                            onPress={() => {
                                                fullscreenVideoRef.current?.seek(
                                                    fullscreenVideoPosition - skipInterval,
                                                );
                                                displayFullScreenControls();
                                            }}
                                            style={{ padding: 8 }}>
                                            <SeekBackwardIcon width={42} height={42} fill="#fff" />
                                        </TouchableOpacity>
                                    )}

                                    {/* skip previous button */}
                                    {onPreviousVideo && (
                                        <TouchableOpacity
                                            onPress={() => {
                                                onPreviousVideo();
                                                displayFullScreenControls();
                                            }}
                                            style={{ padding: 8 }}>
                                            <SkipPreviousIcon width={42} height={42} fill="#fff" />
                                        </TouchableOpacity>
                                    )}

                                    {/* play/pause button */}
                                    <TouchableOpacity
                                        onPress={() => {
                                            if (isPlaying) {
                                                setCurrentlyPlaying(null);
                                            } else {
                                                setInlineVideoStarted(true);
                                                setCurrentlyPlaying(
                                                    source
                                                        ? JSON.stringify(source)
                                                        : src
                                                        ? src
                                                        : null,
                                                );
                                            }
                                            displayFullScreenControls();
                                        }}
                                        style={{ padding: 8 }}>
                                        {isPlaying ? (
                                            <PauseIcon width={42} height={42} fill="#fff" />
                                        ) : (
                                            <PlayIcon width={42} height={42} fill="#fff" />
                                        )}
                                    </TouchableOpacity>

                                    {/* skip next button */}
                                    {onNextVideo && (
                                        <TouchableOpacity
                                            onPress={() => {
                                                onNextVideo();
                                                displayFullScreenControls();
                                            }}
                                            style={{ padding: 8 }}>
                                            <SkipNextIcon width={42} height={42} fill="#fff" />
                                        </TouchableOpacity>
                                    )}

                                    {/* seek forward button */}
                                    {showSkipButtons && (
                                        <TouchableOpacity
                                            onPress={() => {
                                                fullscreenVideoRef.current?.seek(
                                                    fullscreenVideoPosition + skipInterval,
                                                );
                                                displayFullScreenControls();
                                            }}
                                            style={{ padding: 8 }}>
                                            <SeekForwardIcon width={42} height={42} fill="#fff" />
                                        </TouchableOpacity>
                                    )}
                                </View>

                                {/* bottom controls container */}
                                <View
                                    style={{
                                        position: 'absolute',
                                        bottom: 8,
                                        left: 0,
                                        right: 0,
                                        height: 40,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                    }}>
                                    <Text style={{ color: '#fff', marginLeft: 8, fontSize: 12 }}>
                                        {formatSecondsTime(fullscreenVideoPosition)} /{' '}
                                        {formatSecondsTime(duration)}
                                    </Text>

                                    <View style={{ flexDirection: 'row' }}>
                                        {/* toggle mute button */}
                                        {muted ? (
                                            <TouchableOpacity
                                                style={[styles.iconButton]}
                                                onPress={() => {
                                                    setMuted(false);
                                                    displayFullScreenControls();
                                                }}>
                                                <SoundMutedIcon {...iconProps} />
                                            </TouchableOpacity>
                                        ) : (
                                            <TouchableOpacity
                                                style={[styles.iconButton]}
                                                onPress={() => {
                                                    setMuted(true);
                                                    displayFullScreenControls();
                                                }}>
                                                <SoundOnIcon {...iconProps} />
                                            </TouchableOpacity>
                                        )}

                                        {/* exit fullscreen button */}
                                        <TouchableOpacity
                                            onPress={exitFullScreen}
                                            style={styles.iconButton}>
                                            <ExitFullscreenIcon {...iconProps} />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* seekbar */}
                                <View
                                    style={{
                                        backgroundColor: 'rgba(150, 150, 150, 0.4)',
                                        height: 3,
                                        position: 'absolute',
                                        bottom: 8,
                                        left: 0,
                                        right: 0,
                                    }}>
                                    <View
                                        style={[
                                            StyleSheet.absoluteFillObject,
                                            {
                                                backgroundColor: 'rgb(150, 150, 150)',
                                                width: `${
                                                    (fullscreenPlayableDuration * 100) / duration
                                                }%`,
                                            },
                                        ]}
                                    />
                                    <View
                                        style={[
                                            StyleSheet.absoluteFillObject,
                                            {
                                                backgroundColor: 'red',
                                                width: `${
                                                    (fullscreenVideoPosition * 100) / duration
                                                }%`,
                                            },
                                        ]}
                                    />
                                    <View
                                        style={{
                                            width: 12,
                                            height: 12,
                                            backgroundColor: 'red',
                                            borderRadius: 50,
                                            position: 'absolute',
                                            top: -5,
                                            left: `${(fullscreenVideoPosition * 100) / duration}%`,
                                        }}
                                    />
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    )}
                </Modal>
            )}
        </View>
    );
};

export { VideoPlayer, VideoPlayerProvider };
