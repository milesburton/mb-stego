# png-stego-toolkit

A steganography toolkit for hiding secret messages in PNG images using LSB (Least Significant Bit) encoding. Both encoder and decoder run entirely in your browser - no installation required!

## ⚡️ Project Structure

- `webapp/` — Browser-based encoder and decoder (React + Vite) for GitHub Pages
- `scripts/` — Python decoder script (optional, for automation/offline use)
- `assets/` — Sample stego images and checksums

## 🔐 Features

- **LSB Steganography**: Hides messages in the least significant bits of image pixels
- **MBP2 Format**: Custom format with magic header, compression, and integrity checking
- **Pseudorandom Distribution**: Messages are distributed across pixels in pseudorandom order for security
- **Compression**: Messages are compressed using zlib before encoding
- **Integrity Verification**: CRC32 checksums ensure message integrity
- **Browser-based**: No installation required - everything runs in your browser
- **Fully Client-side**: No data sent to any server - complete privacy

## 🌐 Use the Web App (Recommended)

Visit the GitHub Pages site to encode and decode messages:

**[https://milesburton.github.io/png-stego-toolkit/](https://milesburton.github.io/png-stego-toolkit/)**

### Features:
- ✅ Encode messages into PNG images
- ✅ Decode hidden messages from stego images
- ✅ Side-by-side interface for easy workflow
- ✅ Works entirely in your browser
- ✅ No software installation needed
- ✅ Complete privacy - nothing sent to servers

## 🖼️ How It Works

**Encoding:**
1. Upload a PNG image (the "cover" image)
2. Enter your secret message
3. Download the stego image (looks identical to the original)

**Decoding:**
1. Upload a stego image
2. Click "Extract Message"
3. Your hidden message appears instantly

The encoder embeds your message by:
1. Compressing the message with zlib
2. Adding a header with magic bytes (`MBP2`), length, and CRC32 checksum
3. Distributing the bits across the blue channel's LSBs in pseudorandom order
4. Producing a visually identical image with your hidden message

## 🚫 Important Usage Notes

- **Do NOT re-encode the stego image** (screenshots, editor saves, compression)
- Any modification to the image will destroy the hidden payload
- Only distribute stego images as raw PNG downloads
- The encoding is NOT cryptographically secure - use encryption separately if needed

## 📝 Technical Details

### MBP2 Format Specification

```
Header (12 bytes):
- Magic: 4 bytes ('MBP2')
- Payload Length: 4 bytes (little-endian uint32)
- CRC32: 4 bytes (little-endian uint32)

Payload:
- Zlib-compressed message data
```

### Encoding Algorithm

1. Message → zlib compress → payload
2. Create header (magic + length + CRC32)
3. Combine header + payload into byte array
4. Convert to bit array
5. Use PRNG (seed: 0x4D425032) to shuffle pixel indices
6. Write each bit to LSB of blue channel in shuffled order

### Security Considerations

- This is steganography, not encryption
- The PRNG seed is fixed and known
- Anyone with the decoder can extract the message
- For secure communication, encrypt your message before encoding

## 🐍 Python Decoder (Optional)

For automation, batch processing, or offline use, a Python decoder is available:

```bash
# Install dependencies
pip install pillow numpy

# Decode an image
python3 scripts/mbp2_decoder.py path/to/stego.png
```

**Note:** Most users should use the web app instead - it's easier and requires no installation!

---

**Design Philosophy**: A practical tool for hiding messages in plain sight, encouraging exploration of low-level data manipulation techniques.

---

For development and deployment instructions, see `webapp/README.md`.
