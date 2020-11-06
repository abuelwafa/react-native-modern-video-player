import * as React from 'react';
import { Text, SafeAreaView, ScrollView, useWindowDimensions, View } from 'react-native';
import { VideoPlayer, VideoPlayerProvider } from 'react-native-modern-video-player';

export default function App() {
    const { width } = useWindowDimensions();
    return (
        <SafeAreaView>
            <ScrollView>
                <VideoPlayerProvider>
                    <Text>
                        Elit ex ad commodi voluptate eum Quia voluptatem sit architecto cumque
                        facere, quidem earum pariatur. Animi quas molestias consectetur eius rerum!
                        Quae animi ullam odit dolorum assumenda sapiente? Quos beatae.
                    </Text>
                    <View style={{ marginVertical: 12, width, height: (width * 9) / 16 }}>
                        <VideoPlayer
                            src="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"
                            poster="https://loremflickr.com/440/360"
                        />
                    </View>
                    <Text>
                        Elit ex ad commodi voluptate eum Quia voluptatem sit architecto cumque
                        facere, quidem earum pariatur. Animi quas molestias consectetur eius rerum!
                        Quae animi ullam odit dolorum assumenda sapiente? Quos beatae.
                    </Text>
                    <View style={{ marginVertical: 12, width, height: (width * 9) / 16 }}>
                        <VideoPlayer
                            src="http://clips.vorwaerts-gmbh.de/big_buck_bunny.mp4"
                            poster="https://loremflickr.com/440/360"
                        />
                    </View>
                    <Text>
                        Elit ex ad commodi voluptate eum Quia voluptatem sit architecto cumque
                        facere, quidem earum pariatur. Animi quas molestias consectetur eius rerum!
                        Quae animi ullam odit dolorum assumenda sapiente? Quos beatae.
                    </Text>
                </VideoPlayerProvider>
            </ScrollView>
        </SafeAreaView>
    );
}
