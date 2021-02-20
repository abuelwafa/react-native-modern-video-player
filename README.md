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

### `VideoPlayerProvider` props

| prop | type | default value | description |
| ---- | ---- | ------------- | ----------- |
| shouldPlay | Function | (src: string) => true | determines whether the video about to be played should be played or not. this function is called prior to chaning the played video src or its reference is changed. this gives the control to the parent component to control the state of which video to be played. check the guides below for some usecases.|
| autoplay | String or Null | null | value for the `src` or `source` prop values for the video to start playback automatically automatically when the component is mounted.|

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

## Guides

### Stop playing when the VideoPlayer gets out of view when inside a FlatList
We get the currently viewable items from the flatlist, and control video playback using the `shouldPlay` prop on the `VideoPlayerProvider` component.
```js
const { width } = Dimensions.get('window');

// some long list of videos
const videos = [
    { src: 'VIDEO_URL', poster: 'POSTER_IMAGE' },
    // ...etc
];

const styles = StyleSheet.create({
    videoWrapper: { height: (width * 9) / 16 },
    separator: { height: 12 },
});

const App = () => {
    const [viewableItems, setViewableItems] = useState<string[]>([]);

    const handleViewableItemsChange = useMemo(
        () => ({ viewableItems: newViewableItems }) => {
            setViewableItems(newViewableItems.map((i: ViewToken) => i.key));
        },
        [],
    );

    const shouldPlayVideo = useCallback(
        (src: string | null) => {
            return !!src && viewableItems.includes(src);
        },
        [viewableItems],
    );

    return (
        <VideoPlayerProvider shouldPlay={shouldPlayVideo}>
            <FlatList
                data={videos}
                keyExtractor={(item) => item.src}
                renderItem={({ item }) => (
                    <View style={styles.videoWrapper}>
                        <VideoPlayer src={item.src} poster={item.poster} />
                    </View>
                )}
                onViewableItemsChanged={handleViewableItemsChange}
            />
        </VideoPlayerProvider>
    );
};
```

### Usage with [React Navigation](https://reactnavigation.org/)

When using React Navigation, Navigating away from a screen with a playing `VideoPlayer` component, the playback won't stop automatically because the compnent is still rendered in the background and not unmounted.
Since the `VideoPlayerProvider` component will call the provided `shouldPlay` function when its reference change, we can fix this problem by leveraging the [`useIsFocused`](https://reactnavigation.org/docs/use-is-focused) hook from React Navigation, and check whether the screen is currently focused or not to play/stop video playback.
```
    ...
    const isFocused = useIsFocused();
    const shouldPlayVideo = useCallback(() => isFocused, [isFocused]);
    ...
```

If the `VideoPlayer` is in a list as in the previous example, we can combine both checks in the shouldPlayVideo function from the previous example as follows:
```
    const shouldPlayVideo = useCallback(
        (src: string | null) => {
            return isFocused && !!src && viewableItems.includes(src);
        },
        [viewableItems, isFocused],
    );
```

## TODO

- Seek bar functionality
- Simplify code and Write tests.
- Subtitles support.
- Playback rate UI.
- Theming - customizing styling

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

