# react-native-modern-video-player

simple video player for react native based on react-native-video

## Installation

Install the required peer dependencies. follow their install instructions

-   [react-native-video](https://github.com/react-native-video/react-native-video)
-   [react-native-svg](https://github.com/react-native-svg/react-native-svg)
-   [react-native-orientation-locker](https://www.npmjs.com/package/react-native-orientation-locker)

```sh
npm install react-native-modern-video-player
```

## Usage

```js
import { VideoPlayer, VideoPlayerProvider } from 'react-native-modern-video-player';

const url = 'YOUR_VIDEO_URL';

const App = () => {
    return (
        <VideoPlayerProvider>
            <View style={{ marginVertical: 6, width, height: (width * 9) / 16 }}>
                <VideoPlayer src={url} />
            </View>
        </VideoPlayerProvider>
    );
};
```

You can wrap one or more `VideoPlayer` components inside a `VideoPlayerProvider` to control the state of which video is currently playing. it makes sure only one video is playing in a list of videos (inside a timeline feed for example).

## TODO:

-   Complete documentation.
-   Write tests.
-   Autohide controls after a confgurable time period.
-   Subtitles support.

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT
