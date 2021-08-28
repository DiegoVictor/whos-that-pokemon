import React, { useEffect, useState } from "react";
import { Camera } from "expo-camera";
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
        <Text>No access to camera!</Text>
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
