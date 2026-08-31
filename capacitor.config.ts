import { CapacitorConfig } from "@capacitor/cli";

const capacitorConfig: CapacitorConfig = {
  appId: "com.bhavyam.ai",
  appName: "Bhavyam AI",
  webDir: "out",
  server: {
    // Optional: set to your hosted frontend URL for live reload during dev.
    // Leave empty/null for production so the app loads the bundled out/ files.
    url: "",
    cleartext: true,
  },
  ios: {
    contentInset: "always",
  },
  android: {
    captureInput: true,
    allowMixedContent: true,
  },
};

export default capacitorConfig;
