import { useEffect } from "react";
import { Html5Qrcode } from "html5-qrcode";

function QRScanner() {
  useEffect(() => {
    const scanner = new Html5Qrcode("reader");

    scanner.start(
      { facingMode: "environment" }, // caméra arrière
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
      },
      (decodedText) => {
        console.log("QR détecté :", decodedText);
        scanner.stop(); // stop après scan
      },
      (errorMessage) => {
        // erreurs ignorées
        console.warn("Scan error:", errorMessage);
      }
    );

    return () => {
      scanner.stop().catch(() => {});
    };
  }, []);

  return <div id="reader" style={{ width: "300px" }}></div>;
}

export default QRScanner;