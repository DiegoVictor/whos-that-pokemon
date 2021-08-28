import React, { useEffect, useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
export default function App() {
  const [hasPermission, setHasPermission] = useState(false);
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ecf1ff",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
});
