import { useState } from 'react';
import { encodeMBP2, decodeMBP2 } from './encoder';
import './App.css';

function App() {
  // Encoder state
  const [encodeImageFile, setEncodeImageFile] = useState(null);
  const [encodeImagePreview, setEncodeImagePreview] = useState(null);
  const [message, setMessage] = useState('');
  const [encoding, setEncoding] = useState(false);
  const [encodeError, setEncodeError] = useState(null);
  const [encodeSuccess, setEncodeSuccess] = useState(false);

  // Decoder state
  const [decodeImageFile, setDecodeImageFile] = useState(null);
  const [decodeImagePreview, setDecodeImagePreview] = useState(null);
  const [decoding, setDecoding] = useState(false);
  const [decodeError, setDecodeError] = useState(null);
  const [decodedMessage, setDecodedMessage] = useState(null);

  const handleEncodeImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setEncodeError('Please upload a valid image file');
        return;
      }
      setEncodeImageFile(file);
      setEncodeError(null);
      setEncodeSuccess(false);

      const reader = new FileReader();
      reader.onload = (e) => setEncodeImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleEncode = async () => {
    if (!encodeImageFile) {
      setEncodeError('Please upload an image first');
      return;
    }
    if (!message.trim()) {
      setEncodeError('Please enter a message to encode');
      return;
    }

    setEncoding(true);
    setEncodeError(null);
    setEncodeSuccess(false);

    try {
      const stegoBlob = await encodeMBP2(encodeImageFile, message);

      const url = URL.createObjectURL(stegoBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'stego.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setEncodeSuccess(true);
      setEncoding(false);
    } catch (err) {
      setEncodeError(err.message);
      setEncoding(false);
    }
  };

  const handleDecodeImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setDecodeError('Please upload a valid image file');
        return;
      }
      setDecodeImageFile(file);
      setDecodeError(null);
      setDecodedMessage(null);

      const reader = new FileReader();
      reader.onload = (e) => setDecodeImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleDecode = async () => {
    if (!decodeImageFile) {
      setDecodeError('Please upload a stego image first');
      return;
    }

    setDecoding(true);
    setDecodeError(null);
    setDecodedMessage(null);

    try {
      const msg = await decodeMBP2(decodeImageFile);
      setDecodedMessage(msg);
      setDecoding(false);
    } catch (err) {
      setDecodeError(err.message);
      setDecoding(false);
    }
  };

  const calculateCapacity = () => {
    if (!encodeImageFile || !encodeImagePreview) return null;

    const img = new Image();
    img.src = encodeImagePreview;
    const pixels = img.width * img.height;
    const bytes = Math.floor(pixels / 8) - 12;
    return bytes;
  };

  return (
    <div className="app">
      <header>
        <h1>🔐 PNG Steganography Toolkit</h1>
        <p>Hide and extract secret messages in PNG images using LSB steganography</p>
      </header>

      <main className="side-by-side">
        <div className="column encode-column">
          <h2>🔒 Encode Message</h2>
          
          <div className="upload-section">
            <h3>1. Upload Cover Image</h3>
            <input
              type="file"
              accept="image/*"
              onChange={handleEncodeImageUpload}
              id="encode-image-upload"
            />
            <label htmlFor="encode-image-upload" className="upload-button">
              Choose Image
            </label>

            {encodeImagePreview && (
              <div className="preview">
                <img src={encodeImagePreview} alt="Preview" />
                <p className="capacity">
                  Capacity: ~{calculateCapacity()?.toLocaleString()} bytes
                </p>
              </div>
            )}
          </div>

          <div className="message-section">
            <h3>2. Enter Secret Message</h3>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your secret message here..."
              rows={6}
            />
            <p className="char-count">
              Characters: {message.length}
            </p>
          </div>

          <div className="action-section">
            <button
              onClick={handleEncode}
              disabled={!encodeImageFile || !message.trim() || encoding}
              className="action-button"
            >
              {encoding ? 'Encoding...' : '🔒 Encode & Download'}
            </button>
          </div>

          {encodeError && (
            <div className="message error">
              ❌ {encodeError}
            </div>
          )}

          {encodeSuccess && (
            <div className="message success">
              ✅ Success! Your stego image has been downloaded.
            </div>
          )}
        </div>

        <div className="column decode-column">
          <h2>🔓 Decode Message</h2>
          
          <div className="upload-section">
            <h3>1. Upload Stego Image</h3>
            <input
              type="file"
              accept="image/*"
              onChange={handleDecodeImageUpload}
              id="decode-image-upload"
            />
            <label htmlFor="decode-image-upload" className="upload-button">
              Choose Stego Image
            </label>

            {decodeImagePreview && (
              <div className="preview">
                <img src={decodeImagePreview} alt="Stego Preview" />
              </div>
            )}
          </div>

          <div className="action-section">
            <button
              onClick={handleDecode}
              disabled={!decodeImageFile || decoding}
              className="action-button"
            >
              {decoding ? 'Decoding...' : '🔓 Extract Message'}
            </button>
          </div>

          {decodeError && (
            <div className="message error">
              ❌ {decodeError}
            </div>
          )}

          {decodedMessage && (
            <div className="decoded-message">
              <h3>📨 Hidden Message:</h3>
              <pre>{decodedMessage}</pre>
            </div>
          )}
        </div>
      </main>

      <footer>
        <div className="info-section">
          <h3>ℹ️ How It Works</h3>
          <ul>
            <li>Messages are compressed and embedded in the blue channel LSBs</li>
            <li>The resulting image looks identical to the original</li>
            <li>All processing happens in your browser - no data sent to servers</li>
            <li>Python decoder also available in the <a href="https://github.com/milesburton/png-stego-toolkit">GitHub repository</a></li>
          </ul>
        </div>
        <p>
          <a href="https://github.com/milesburton/png-stego-toolkit" target="_blank" rel="noopener noreferrer">
            View on GitHub
          </a>
        </p>
      </footer>
    </div>
  );
}

export default App;
