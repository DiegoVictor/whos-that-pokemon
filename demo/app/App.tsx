import React, { useEffect, useState } from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  View,
import { MaterialCommunityIcons } from "@expo/vector-icons";
export default function App() {
  const [hasPermission, setHasPermission] = useState(false);
  const [camera, setCamera] = useState<Camera | null>(null);
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);


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
          <Camera
            style={styles.camera}
            type={Camera.Constants.Type.back}
            ratio="1:1"
            ref={async (r) => {
              setCamera(r);
            }}
          />
      </View>
      <View style={styles.buttons}>
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
  buttons: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
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
