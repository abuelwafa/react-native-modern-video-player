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

interface VideoPlayerProps extends Omit<VideoProperties, 'source'> {
    src: string;
    skipInterval?: number;
    showSkipButtons?: boolean;
    showPlaylistControls?: boolean;
    onNextVideo?: () => void;
    onPreviousVideo?: () => void;
    iOSNativeControls?: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
    src,
    showSkipButtons = true,
    skipInterval = 10,
    repeat = false,
    onPreviousVideo,
    onNextVideo,
    iOSNativeControls = true,
    poster,
    onProgress,
    onLoad,
    onEnd,
    ...rest
}) => {
    const inlineVideoRef = useRef<Video>(null);
    const fullscreenVideoRef = useRef<Video>(null);

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

    const { currentlyPlaying, setCurrentlyPlaying } = useContext(VideoPlayerContext);
    const isPlaying = currentlyPlaying === src;

    const isLoading = isPlaying && playableDuration - inlineVideoPosition <= 0;
    const fullscreenIsLoading =
        isPlaying && fullscreenPlayableDuration - fullscreenVideoPosition <= 0;

    const exitFullScreen = () => {
        returnFromFullscreen.current = true;
        setFullscreen(false);
        setFullscreenVideoLoaded(false);
        setShowFullscreenControls(false);
        Orientation.lockToPortrait();
    };

    return (
        <View style={{ flex: 1, width: '100%', position: 'relative' }} key={src}>
            {!fullscreen && (
                <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: 'black' }}>
                    {inlineVideoStarted ? (
                        <TouchableWithoutFeedback
                            onPress={() => videoLoaded && setShowControls(true)}>
                            {/* inline video*/}
                            <Video
                                repeat={repeat}
                                paused={!isPlaying}
                                fullscreenAutorotate={true}
                                fullscreenOrientation="landscape"
                                posterResizeMode="cover"
                                style={StyleSheet.absoluteFillObject}
                                {...rest}
                                source={{ uri: src }}
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
                                    setCurrentlyPlaying(null);
                                    setShowControls(true);
                                    fullscreenVideoRef.current?.seek(0);
                                    inlineVideoRef.current?.seek(0);
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
                                    setCurrentlyPlaying(src);
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
                        <TouchableWithoutFeedback onPress={() => setShowControls(false)}>
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
                                                if (fullscreen) {
                                                    fullscreenVideoRef.current?.seek(
                                                        fullscreenVideoPosition - skipInterval,
                                                    );
                                                } else {
                                                    inlineVideoRef.current?.seek(
                                                        inlineVideoPosition - skipInterval,
                                                    );
                                                }
                                            }}
                                            style={{ padding: 8 }}>
                                            <SeekBackwardIcon width={42} height={42} fill="#fff" />
                                        </TouchableOpacity>
                                    )}

                                    {/* skip previous button */}
                                    {onPreviousVideo && (
                                        <TouchableOpacity
                                            onPress={onPreviousVideo}
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
                                                setCurrentlyPlaying(src);
                                            }
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
                                            onPress={onNextVideo}
                                            style={{ padding: 8 }}>
                                            <SkipNextIcon width={42} height={42} fill="#fff" />
                                        </TouchableOpacity>
                                    )}

                                    {/* seek forward button */}
                                    {showSkipButtons && (
                                        <TouchableOpacity
                                            onPress={() => {
                                                if (fullscreen) {
                                                    fullscreenVideoRef.current?.seek(
                                                        fullscreenVideoPosition + skipInterval,
                                                    );
                                                } else {
                                                    inlineVideoRef.current?.seek(
                                                        inlineVideoPosition + skipInterval,
                                                    );
                                                }
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
                                                }}>
                                                <SoundMutedIcon {...iconProps} />
                                            </TouchableOpacity>
                                        ) : (
                                            <TouchableOpacity
                                                style={[styles.iconButton]}
                                                onPress={() => {
                                                    setMuted(true);
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

            {Platform.OS === 'android' && (
                <Modal
                    presentationStyle="fullScreen"
                    visible={fullscreen}
                    supportedOrientations={['landscape']}
                    onRequestClose={exitFullScreen}>
                    <StatusBar hidden={fullscreen} />
                    <TouchableWithoutFeedback
                        onPress={() => fullScreenVideoLoaded && setShowFullscreenControls(true)}>
                        {/* fullscreen video - android only */}
                        <Video
                            repeat={repeat}
                            paused={!isPlaying}
                            fullscreenAutorotate={true}
                            fullscreenOrientation="landscape"
                            posterResizeMode="cover"
                            style={[StyleSheet.absoluteFillObject, { backgroundColor: 'black' }]}
                            {...rest}
                            source={{ uri: src }}
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
                        <TouchableWithoutFeedback onPress={() => setShowFullscreenControls(false)}>
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
                                                if (fullscreen) {
                                                    fullscreenVideoRef.current?.seek(
                                                        fullscreenVideoPosition - skipInterval,
                                                    );
                                                } else {
                                                    inlineVideoRef.current?.seek(
                                                        inlineVideoPosition - skipInterval,
                                                    );
                                                }
                                            }}
                                            style={{ padding: 8 }}>
                                            <SeekBackwardIcon width={42} height={42} fill="#fff" />
                                        </TouchableOpacity>
                                    )}

                                    {/* skip previous button */}
                                    {onPreviousVideo && (
                                        <TouchableOpacity
                                            onPress={onPreviousVideo}
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
                                                setCurrentlyPlaying(src);
                                            }
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
                                            onPress={onNextVideo}
                                            style={{ padding: 8 }}>
                                            <SkipNextIcon width={42} height={42} fill="#fff" />
                                        </TouchableOpacity>
                                    )}

                                    {/* seek forward button */}
                                    {showSkipButtons && (
                                        <TouchableOpacity
                                            onPress={() => {
                                                if (fullscreen) {
                                                    fullscreenVideoRef.current?.seek(
                                                        fullscreenVideoPosition + skipInterval,
                                                    );
                                                } else {
                                                    inlineVideoRef.current?.seek(
                                                        inlineVideoPosition + skipInterval,
                                                    );
                                                }
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
                                                }}>
                                                <SoundMutedIcon {...iconProps} />
                                            </TouchableOpacity>
                                        ) : (
                                            <TouchableOpacity
                                                style={[styles.iconButton]}
                                                onPress={() => {
                                                    setMuted(true);
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
