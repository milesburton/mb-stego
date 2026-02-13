import pako from 'pako';

const MAGIC = new Uint8Array([0x4D, 0x42, 0x50, 0x32]); // 'MBP2'
const SEED = 0x4D425032; // 'MBP2' as int
const HEADER_SIZE = 12; // magic(4) + payload_len(4) + crc32(4)

// Simple PRNG matching Python's numpy.random.default_rng behavior
class PRNG {
  constructor(seed) {
    this.state = seed;
  }

  next() {
    // Linear congruential generator (LCG)
    // Using same constants as numpy PCG64
    this.state = (this.state * 6364136223846793005n + 1442695040888963407n) & 0xFFFFFFFFFFFFFFFFn;
    return Number((this.state >> 32n) & 0xFFFFFFFFn);
  }

  shuffle(array) {
    const indices = Array.from({ length: array }, (_, i) => i);
    // Fisher-Yates shuffle with our PRNG
    for (let i = indices.length - 1; i > 0; i--) {
      const j = this.next() % (i + 1);
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices;
  }
}

// CRC32 implementation
function crc32(data) {
  let crc = 0xFFFFFFFF;
  const table = new Uint32Array(256);
  
  // Build CRC table
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  
  // Calculate CRC
  for (let i = 0; i < data.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ data[i]) & 0xFF];
  }
  
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

// Convert uint32 to little-endian bytes
function uint32ToLE(value) {
  return new Uint8Array([
    value & 0xFF,
    (value >> 8) & 0xFF,
    (value >> 16) & 0xFF,
    (value >> 24) & 0xFF
  ]);
}

// Encode message into image
export async function encodeMBP2(imageFile, message) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    
    reader.onload = (e) => {
      img.onload = () => {
        try {
          // Create canvas and get image data
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const pixels = imageData.data;
          
          // Compress message
          const messageBytes = new TextEncoder().encode(message);
          const compressed = pako.deflate(messageBytes);
          
          // Build header
          const payloadLen = compressed.length;
          const crc = crc32(compressed);
          
          const header = new Uint8Array(HEADER_SIZE);
          header.set(MAGIC, 0);
          header.set(uint32ToLE(payloadLen), 4);
          header.set(uint32ToLE(crc), 8);
          
          // Combine header + payload
          const fullPayload = new Uint8Array(HEADER_SIZE + compressed.length);
          fullPayload.set(header, 0);
          fullPayload.set(compressed, HEADER_SIZE);
          
          // Convert to bits
          const bits = [];
          for (let i = 0; i < fullPayload.length; i++) {
            for (let j = 7; j >= 0; j--) {
              bits.push((fullPayload[i] >> j) & 1);
            }
          }
          
          // Check capacity
          const nPixels = (pixels.length / 4);
          if (bits.length > nPixels) {
            reject(new Error(`Message too large. Need ${bits.length} pixels but image only has ${nPixels}`));
            return;
          }
          
          // Generate pseudorandom order
          const rng = new PRNG(BigInt(SEED));
          const order = rng.shuffle(nPixels);
          
          // Encode bits into blue channel LSBs
          for (let i = 0; i < bits.length; i++) {
            const pixelIdx = order[i];
            const blueIdx = pixelIdx * 4 + 2; // Blue channel
            pixels[blueIdx] = (pixels[blueIdx] & 0xFE) | bits[i];
          }
          
          // Put modified data back
          ctx.putImageData(imageData, 0, 0);
          
          // Convert to blob
          canvas.toBlob((blob) => {
            resolve(blob);
          }, 'image/png');
          
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target.result;
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(imageFile);
  });
}
