# react-native-modern-video-player

Currently a Simple video player for react native based on react-native-video. Aiming to become a full featured video player with a clean and customizable UI, on top of a simple and extensible API.

## Installation

Install the required peer dependencies. follow their install instructions

- [react-native-video](https://github.com/react-native-video/react-native-video)
- [react-native-svg](https://github.com/react-native-svg/react-native-svg)
- [react-native-orientation-locker](https://www.npmjs.com/package/react-native-orientation-locker)

```sh
npm install react-native-modern-video-player
```

## Usage

The main 2 exports are the `VideoPlayer` component which is an uncontrolled component which wraps the `Video` component from react-native-video. the other is the `VideoPlayerProvider`.

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

The `src` prop is a convinent shorthand which accepts the video URL as string. which should be sufficient in most cases. You can still pass the `source` prop for the video component from `react-native-video` directly to have more control. If both props were passed, the `source` prop will override `src`.

You can wrap one or more `VideoPlayer` components inside a `VideoPlayerProvider` to control the state of which video is currently playing. it makes sure only one video is playing in a list of videos (inside a timeline feed for example). take a look at the example app to see how this works.

## API

### `VideoPlayer` props

The `VideoPlayer` components accepts all of the props passed to the [Video](https://github.com/react-native-video/react-native-video#configurable-props) component from react-native-video, in addition to the following props:

| prop | type | default value | description |
| ---- | ---- | ------------- | ----------- |
|src|String Required|default value|video url as a string. this is a shortcut convinent prop for simple cases of having one video url. you can still use the `source` prop from react-native-video as documented their. but either one of `src` or `source` prop from react-native-video must be used. `source` will override `src` if both are provided. if none of them are provided or `src` is provided with a value other than a primitive string, the VideoPlayer component will render nothing and throws an error in development |
|onNextVideo|Function Optional|undefined|call back function which is triggered on pressing the next button|
|onPreviousVideo|Function Optional|undefined|call back function which is triggered on pressing the previous button|
|iOSNativeControls|boolean|false|whether to use iOS native controls or VideoPlayer custom controls. setting this prop with true makes the video player component uncontrolled|
|showSkipButtons|boolean optional|true|whether to display the skip buttons or not|
|skipInterval|number optional|10|number of seconds to seek forward or backwards upon pressing the skip buttons|
|hideControlsTimeout|number optional|4000|time in ms before hiding the controls. Controls will not hide if the video is paused.|

## TODO

- Seek functionality
- Complete documentation.
- Write tests.
- Subtitles support.
- Playback rate.
- Callback hooks
- Theming - customizing styling

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

