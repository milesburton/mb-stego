# png-stego-toolkit

A steganography toolkit for hiding secret messages in PNG images using LSB (Least Significant Bit) encoding. This repository contains both an encoder and decoder implementation using the MBP2 format.

## ⚡️ Project Structure

- `webapp/` — Browser-based encoder webapp (React + Vite) for GitHub Pages
- `assets/` — Sample stego images and checksums
- `scripts/` — Python decoder script

## 🔐 Features

- **LSB Steganography**: Hides messages in the least significant bits of image pixels
- **MBP2 Format**: Custom format with magic header, compression, and integrity checking
- **Pseudorandom Distribution**: Messages are distributed across pixels in pseudorandom order for security
- **Compression**: Messages are compressed using zlib before encoding
- **Integrity Verification**: CRC32 checksums ensure message integrity
- **Browser-based Encoder**: No installation required - encode messages directly in your browser
- **Python Decoder**: Command-line tool for extracting hidden messages

## 🖼️ How It Works

The encoder embeds your message into a PNG image by:
1. Compressing the message with zlib
2. Adding a header with magic bytes (`MBP2`), length, and CRC32 checksum
3. Distributing the bits across the blue channel's LSBs in pseudorandom order
4. Producing a visually identical image with your hidden message

The decoder reverses this process to extract the original message.

## 🌐 Web Encoder

Visit the GitHub Pages site to encode messages:
[https://milesburton.github.io/png-stego-toolkit/](https://milesburton.github.io/png-stego-toolkit/)

## 🧑‍💻 How to Decode

1. Download the stego image
2. Download the Python decoder script from `scripts/mbp2_decoder.py`
3. Install dependencies:
   ```bash
   pip install pillow numpy
   ```
4. Run the decoder:
   ```bash
   python3 scripts/mbp2_decoder.py path/to/stego.png
   ```

## 🚫 Important Usage Notes

- **Do NOT re-encode the stego image** (screenshots, editor saves, compression)
- Any modification to the image will destroy the hidden payload
- Only distribute stego images as raw PNG downloads
- The encoding is NOT cryptographically secure - use encryption separately if needed

## 📝 Technical Details

### MBP2 Format Specification

```
Header (16 bytes):
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

---

**Design Philosophy**: A practical tool for hiding messages in plain sight, encouraging exploration of low-level data manipulation techniques.

---

For development and deployment instructions, see `webapp/README.md`.
