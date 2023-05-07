import * as React from 'react';
import { Text, SafeAreaView, ScrollView, View, StyleSheet, Dimensions } from 'react-native';
import { VideoPlayer, VideoPlayerProvider } from 'react-native-modern-video-player';

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
    videoWrapper: { marginVertical: 12, width, height: (width * 9) / 16 },
});

export default function App() {
    return (
        <SafeAreaView>
            <ScrollView>
                <VideoPlayerProvider>
                    <Text>Remote video</Text>
                    <View style={styles.videoWrapper}>
                        <VideoPlayer
                            src="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4"
                            poster="https://loremflickr.com/440/360?v=2"
                        />
                    </View>

                    <Text>Remote video</Text>
                    <View style={styles.videoWrapper}>
                        <VideoPlayer
                            src="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"
                            poster="https://loremflickr.com/440/360?v=3"
                        />
                    </View>

                    <Text>Remote video</Text>
                    <View style={styles.videoWrapper}>
                        <VideoPlayer
                            src="http://clips.vorwaerts-gmbh.de/big_buck_bunny.mp4"
                            poster="https://loremflickr.com/440/360?v=4"
                        />
                    </View>
                </VideoPlayerProvider>
            </ScrollView>
        </SafeAreaView>
    );
}
