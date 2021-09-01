import React, { useEffect, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Camera, CameraCapturedPicture } from "expo-camera";
import { useCallback } from "react";
import { FontAwesome5 } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
export default function App() {
  const [hasPermission, setHasPermission] = useState(false);
  const [camera, setCamera] = useState<Camera | null>(null);
  const [photo, setPhoto] = useState<CameraCapturedPicture | null>();
  const [loading, setLoading] = useState(false);

  const spinValue = new Animated.Value(0);

  Animated.loop(
    Animated.timing(spinValue, {
      toValue: 1,
      duration: 1500,
      easing: Easing.linear,
      useNativeDriver: true,
    })
  ).start();

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const capture = useCallback(async () => {
    if (camera && !loading) {
      setLoading(true);

      await camera
        .takePictureAsync({
          quality: 1,
          base64: true,
        })
        .then((data) => {
          setPhoto(data);
          setLoading(false);
        });
    }
  }, [camera, loading]);

  const Loading = () => (
    <Animated.View style={{ transform: [{ rotate: spin }] }}>
      <AntDesign name="loading1" size={24} color="black" />
    </Animated.View>
  );

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <MaterialCommunityIcons
          name="camera-off"
          size={60}
          color="rgba(0, 0, 0, 0.7)"
        />
        <Text>No access to camera!</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.frame}>
        {photo ? (
          <Image source={{ uri: photo.uri }} style={styles.image} />
        ) : (
          <Camera
            style={styles.camera}
            type={Camera.Constants.Type.back}
            ratio="1:1"
            ref={async (r) => {
              setCamera(r);
            }}
          />
        )}
      </View>
      <View style={styles.buttons}>
        {photo ? (
          <>
          </>
        ) : (
          <TouchableOpacity onPress={capture} style={styles.button}>
            {loading ? (
              <Loading />
            ) : (
              <FontAwesome5
                name="camera-retro"
                size={24}
                color="rgba(0, 0, 0, 0.7)"
              />
            )}
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.description}>
        <Text style={styles.text}>
          Take a picture, then send to recognition or cancel and try again
        </Text>
      </View>
    </View>
  );
}

const size = Dimensions.get("screen").width - 40;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ecf1ff",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  frame: {
    backgroundColor: "#000",
    borderRadius: 8,
    marginBottom: 15,
    overflow: "hidden",
  },
  camera: {
    height: size,
    width: size,
  },
  image: {
    height: size,
    width: size,
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
  },
  button: {
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.07)",
    borderRadius: 25,
    justifyContent: "center",
    marginHorizontal: 7,
    width: 50,
    height: 50,
  },
  description: {
    alignItems: "center",
    marginTop: 35,
    width: "100%",
  },
  text: {
    textAlign: "center",
    width: 180,
  },
});
