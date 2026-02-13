import { useState } from 'react';
import { encodeMBP2 } from './encoder';
import './App.css';

function App() {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [message, setMessage] = useState('');
  const [encoding, setEncoding] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please upload a valid image file');
        return;
      }
      setImageFile(file);
      setError(null);
      setSuccess(false);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleEncode = async () => {
    if (!imageFile) {
      setError('Please upload an image first');
      return;
    }
    if (!message.trim()) {
      setError('Please enter a message to encode');
      return;
    }

    setEncoding(true);
    setError(null);
    setSuccess(false);

    try {
      const stegoBlob = await encodeMBP2(imageFile, message);
      
      // Download the encoded image
      const url = URL.createObjectURL(stegoBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'stego.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setSuccess(true);
      setEncoding(false);
    } catch (err) {
      setError(err.message);
      setEncoding(false);
    }
  };

  const calculateCapacity = () => {
    if (!imageFile || !imagePreview) return null;
    
    const img = new Image();
    img.src = imagePreview;
    const pixels = img.width * img.height;
    const bytes = Math.floor(pixels / 8) - 12; // Account for header
    return bytes;
  };

  return (
    <div className="app">
      <header>
        <h1>🔐 MB Stego Encoder</h1>
        <p>Hide secret messages in PNG images using LSB steganography</p>
      </header>

      <main>
        <div className="upload-section">
          <h2>1. Upload Cover Image</h2>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            id="image-upload"
          />
          <label htmlFor="image-upload" className="upload-button">
            Choose Image
          </label>
          
          {imagePreview && (
            <div className="preview">
              <img src={imagePreview} alt="Preview" />
              <p className="capacity">
                Capacity: ~{calculateCapacity()?.toLocaleString()} bytes
              </p>
            </div>
          )}
        </div>

        <div className="message-section">
          <h2>2. Enter Your Secret Message</h2>
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

        <div className="encode-section">
          <button
            onClick={handleEncode}
            disabled={!imageFile || !message.trim() || encoding}
            className="encode-button"
          >
            {encoding ? 'Encoding...' : '🔒 Encode & Download'}
          </button>
        </div>

        {error && (
          <div className="message error">
            ❌ {error}
          </div>
        )}

        {success && (
          <div className="message success">
            ✅ Success! Your stego image has been downloaded.
            <br />
            <small>Use the Python decoder to extract the message.</small>
          </div>
        )}

        <div className="info-section">
          <h3>ℹ️ How It Works</h3>
          <ul>
            <li>Your message is compressed and embedded in the image's pixels</li>
            <li>The resulting image looks identical to the original</li>
            <li>Use the <a href="https://github.com/milesburton/mb-stego">Python decoder</a> to extract the message</li>
            <li>Do NOT re-encode or compress the stego image - it will destroy the message</li>
          </ul>
        </div>
      </main>

      <footer>
        <p>
          <a href="https://github.com/milesburton/mb-stego" target="_blank" rel="noopener noreferrer">
            View on GitHub
          </a>
        </p>
      </footer>
    </div>
  );
}

export default App;
