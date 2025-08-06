// lib/loadEncleso.ts

declare global {
  interface Window {
    Encleso?: any;
  }
}

export const loadEnclesoScript = (): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject("This code must run in the browser.");
      return;
    }

    // Prevent duplicate loading
    if (document.getElementById("encleso-script")) {
      if (window.Encleso) {
        resolve(true);
      } else {
        reject("Encleso script already present but not initialized.");
      }
      return;
    }

    const script = document.createElement("script");
    script.src = "https://encleso.com/Assets/scripts/encleso.min.js";
    script.id = "encleso-script";
    script.async = true;

    script.onload = () => {
      if (window.Encleso) {
        resolve(true);
      } else {
        reject("Encleso did not initialize after script load.");
      }
    };

    script.onerror = () => {
      reject("Failed to load Encleso scanner script.");
    };

    document.body.appendChild(script);
  });
};
