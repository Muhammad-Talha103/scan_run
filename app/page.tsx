'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

interface EnclesoType {
  OnReady?: (ret: any) => void;
  OnError?: (err: { Message: string }) => void;
  SetCapabilities: (cap: { Resolution: number; PixelType: number }) => Promise<void>;
  StartScan: (scannerName: string, showUI: boolean) => Promise<any>;
  GetImagePreview: (index: number) => Promise<Blob>;
}

export default function ScanPage() {
  const [scannerConnected, setScannerConnected] = useState(false);
  const [scannerName, setScannerName] = useState('');
  const [scannedImages, setScannedImages] = useState<string[]>([]);
  const [showUI, setShowUI] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    if (!scriptLoaded) return;

    const interval = setInterval(() => {
      if (typeof window !== 'undefined' && (window as any).Encleso) {
        initEncleso();
        clearInterval(interval);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [scriptLoaded]);

  const initEncleso = () => {
    const Encleso = (window as any).Encleso as EnclesoType;

    if (!Encleso) {
      setError('Encleso SDK failed to initialize.');
      return;
    }

    Encleso.OnError = function (err: any) {
      console.error('Scanner Error:', err?.Message || err);
      setScannerConnected(false);
      setScannerName('');
      setError(`Scanner Error: ${err?.Message || 'Unknown error'}`);
    };

    Encleso.OnReady = function (ret: any) {
      if (ret?.ScannersList?.length > 0) {
        const defaultScanner = ret.ScannersList[ret.DefaultIndex];
        setScannerConnected(true);
        setScannerName(defaultScanner);
        setError(null); // Clear any old error
      } else {
        setScannerConnected(false);
        setScannerName('');
        setError('No scanners found. Please check your connection.');
      }
    };
  };

  const handleStartScan = async () => {
    setError(null);
    setIsLoading(true);

    try {
      const Encleso = (window as any).Encleso as EnclesoType;
      if (!scannerConnected || !scannerName || !Encleso) {
        setError('Scanner is not connected or Encleso is unavailable.');
        setIsLoading(false);
        return;
      }

      await Encleso.SetCapabilities({
        Resolution: 200,
        PixelType: 2, // RGB
      });

      const ret = await Encleso.StartScan(scannerName, showUI);

      if (ret.ScannedImagesCount > 0) {
        const newImages: string[] = [];
        for (
          let i = ret.ScannedImagesStartingIndex;
          i < ret.TotalImagesCount;
          i++
        ) {
          try {
            const blob = await Encleso.GetImagePreview(i);
            const url = URL.createObjectURL(blob);
            newImages.push(url);
          } catch (previewError) {
            console.error('Image preview error:', previewError);
            setError('Failed to load scanned image preview.');
          }
        }
        setScannedImages(prev => [...prev, ...newImages]);
      } else {
        setError('No pages were scanned.');
      }
    } catch (err: any) {
      console.error('Scan failed:', err);
      setError(err?.Message || 'Failed to scan.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Load Encleso Script */}
      <Script
        src="https://encleso.com/Assets/scripts/encleso.min.js"
        strategy="afterInteractive"
        onLoad={() => setScriptLoaded(true)}
        onError={() => setError('Failed to load Encleso script.')}
      />

      <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow-md">
        <h1 className="text-2xl font-bold mb-4">🖨️ Encleso Web Scanner</h1>

        {error && (
  <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4">
    ⚠️ {typeof error === 'string' ? error : JSON.stringify(error)}
  </div>
)}

        {scannerConnected ? (
          <p className="text-green-600 font-semibold mb-2">
            ✅ Scanner connected: <span className="font-bold">{scannerName}</span>
          </p>
        ) : (
          <p className="text-red-600 mb-2">🔌 No scanner connected.</p>
        )}

        <div className="flex items-center gap-4 my-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showUI}
              onChange={() => setShowUI(prev => !prev)}
            />
            Show Scanner UI
          </label>

          <button
            onClick={handleStartScan}
            disabled={!scannerConnected || isLoading}
            className={`px-4 py-2 rounded text-white transition ${
              isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isLoading ? 'Scanning...' : 'Start Scan'}
          </button>
        </div>

        {scannedImages.length > 0 && (
          <>
            <h2 className="text-xl font-semibold mt-6 mb-2">📄 Scanned Pages</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {scannedImages.map((src, index) => (
                <img
                  key={index}
                  src={src}
                  alt={`Scanned page ${index + 1}`}
                  className="border rounded shadow-sm"
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}




{/* 
  'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

interface EnclesoType {
  OnReady?: (ret: any) => void;
  OnError?: (err: { Message: string }) => void;
  SetCapabilities: (cap: { Resolution: number; PixelType: number }) => Promise<void>;
  StartScan: (scannerName: string, showUI: boolean) => Promise<any>;
  GetImagePreview: (index: number) => Promise<Blob>;
}

export default function ScanPage() {
  const [scannerConnected, setScannerConnected] = useState(false);
  const [scannerName, setScannerName] = useState('');
  const [scannedImages, setScannedImages] = useState<string[]>([]);
  const [showUI, setShowUI] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    if (!scriptLoaded) return;

    const interval = setInterval(() => {
      const Encleso = (window as any)?.Encleso as EnclesoType | undefined;
      if (Encleso) {
        initEncleso(Encleso);
        clearInterval(interval);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [scriptLoaded]);

  const initEncleso = (Encleso: EnclesoType) => {
    try {
      Encleso.OnError = function (err: any) {
        const msg = err?.Message || 'Unknown scanner error';
        console.error('Scanner Error:', msg);
        setScannerConnected(false);
        setScannerName('');
        setError(`Scanner Error: ${msg}`);
      };

      Encleso.OnReady = function (ret: any) {
        try {
          if (ret?.ScannersList?.length > 0) {
            const defaultScanner = ret.ScannersList[ret.DefaultIndex];
            setScannerConnected(true);
            setScannerName(defaultScanner);
            setError(null);
          } else {
            setScannerConnected(false);
            setScannerName('');
            setError('No scanners found. Please check your device connection.');
          }
        } catch (e) {
          console.error('OnReady processing error:', e);
          setError('Failed to process scanner list.');
        }
      };
    } catch (err) {
      console.error('Initialization error:', err);
      setError('Failed to initialize Encleso.');
    }
  };

  const handleStartScan = async () => {
    setError(null);
    setIsLoading(true);

    try {
      const Encleso = (window as any)?.Encleso as EnclesoType;
      if (!Encleso || !scannerConnected || !scannerName) {
        throw new Error('Scanner is not connected or Encleso SDK not available.');
      }

      try {
        await Encleso.SetCapabilities({
          Resolution: 200,
          PixelType: 2,
        });
      } catch (e) {
        throw new Error('Failed to set scanner capabilities.');
      }

      let ret;
      try {
        ret = await Encleso.StartScan(scannerName, showUI);
      } catch (e) {
        throw new Error('Scanning failed. Please check the scanner and try again.');
      }

      if (ret?.ScannedImagesCount > 0) {
        const newImages: string[] = [];

        for (
          let i = ret.ScannedImagesStartingIndex;
          i < ret.TotalImagesCount;
          i++
        ) {
          try {
            const blob = await Encleso.GetImagePreview(i);
            const url = URL.createObjectURL(blob);
            newImages.push(url);
          } catch (e) {
            console.error(`Failed to preview image at index ${i}:`, e);
            setError(`Error loading scanned image preview (Page ${i + 1}).`);
          }
        }

        if (newImages.length > 0) {
          setScannedImages(prev => [...prev, ...newImages]);
        } else {
          setError('Scan completed, but no images were successfully previewed.');
        }
      } else {
        setError('No pages were scanned.');
      }
    } catch (err: any) {
      console.error('Scan error:', err);
      setError(err?.message || 'Unknown error during scanning.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <Script
        src="https://encleso.com/Assets/scripts/encleso.min.js"
        strategy="afterInteractive"
        onLoad={() => setScriptLoaded(true)}
        onError={() => setError('Failed to load Encleso SDK script.')}
      />

      <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow-md">
        <h1 className="text-2xl font-bold mb-4">🖨️ Encleso Web Scanner</h1>

        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4 whitespace-pre-wrap">
            ⚠️ {error}
          </div>
        )}

        {scannerConnected ? (
          <p className="text-green-600 font-semibold mb-2">
            ✅ Scanner connected: <span className="font-bold">{scannerName}</span>
          </p>
        ) : (
          <p className="text-red-600 mb-2">🔌 No scanner connected.</p>
        )}

        <div className="flex items-center gap-4 my-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showUI}
              onChange={() => setShowUI(prev => !prev)}
            />
            Show Scanner UI
          </label>

          <button
            onClick={handleStartScan}
            disabled={!scannerConnected || isLoading}
            className={`px-4 py-2 rounded text-white transition ${
              isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isLoading ? 'Scanning...' : 'Start Scan'}
          </button>
        </div>

        {scannedImages.length > 0 && (
          <>
            <h2 className="text-xl font-semibold mt-6 mb-2">📄 Scanned Pages</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {scannedImages.map((src, index) => (
                <img
                  key={index}
                  src={src}
                  alt={`Scanned page ${index + 1}`}
                  className="border rounded shadow-sm"
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
*/}