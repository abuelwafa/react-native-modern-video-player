import * as React from 'react';
import { Text, SafeAreaView, ScrollView, useWindowDimensions, View } from 'react-native';
import { VideoPlayer, VideoPlayerProvider } from 'react-native-modern-video-player';

export default function App() {
    const { width } = useWindowDimensions();
    return (
        <SafeAreaView>
            <ScrollView>
                <VideoPlayerProvider>
                    <Text>Remote video</Text>
                    <View style={{ marginVertical: 12, width, height: (width * 9) / 16 }}>
                        <VideoPlayer
                            source={{
                                uri:
                                    'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
                            }}
                            poster="https://loremflickr.com/440/360?v=1"
                        />
                    </View>

                    <Text>Remote video</Text>
                    <View style={{ marginVertical: 12, width, height: (width * 9) / 16 }}>
                        <VideoPlayer
                            src="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4"
                            poster="https://loremflickr.com/440/360?v=2"
                        />
                    </View>

                    <Text>Remote video</Text>
                    <View style={{ marginVertical: 12, width, height: (width * 9) / 16 }}>
                        <VideoPlayer
                            src="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"
                            poster="https://loremflickr.com/440/360?v=3"
                        />
                    </View>

                    <Text>Remote video</Text>
                    <View style={{ marginVertical: 12, width, height: (width * 9) / 16 }}>
                        <VideoPlayer
                            src="http://clips.vorwaerts-gmbh.de/big_buck_bunny.mp4"
                            poster="https://loremflickr.com/440/360?v=4"
                        />
                    </View>

                    <Text>Local video</Text>
                    <View style={{ marginVertical: 12, width, height: (width * 9) / 16 }}>
                        <VideoPlayer
                            source={require('./test-video-1.mp4')}
                            poster="https://loremflickr.com/440/360?v=5"
                        />
                    </View>

                    <Text>Local video</Text>
                    <View style={{ marginVertical: 12, width, height: (width * 9) / 16 }}>
                        <VideoPlayer
                            source={require('./test-video-2.mp4')}
                            poster="https://loremflickr.com/440/360?v=6"
                        />
                    </View>
                </VideoPlayerProvider>
            </ScrollView>
        </SafeAreaView>
    );
}
