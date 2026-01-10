# mb-stego-decoder

A cyberpunk-themed project that hides a secret message in a visually striking PNG using LSB steganography. This repo contains:

- A visually identical decoy image for display
- The real stego image (download only)
- A Python decoder script
- Instructions for verifying and decoding the hidden message
- SHA256 checksum for integrity

## ⚡️ Project Structure

- `webapp/` — React (Vite) frontend for Netlify
- `assets/` — Stego image, decoy image, and checksum
- `scripts/` — Python decoder script

## 🚫 Important Usage Notes

- **Do NOT embed the stego image in README, issues, or chat uploads.**
- Only distribute the stego image as a raw download or release asset.
- Any re-encoding (e.g., screenshot, editor save) will destroy the payload.

## 🖼️ Decoy Image

A visually identical image is shown below for preview purposes:

![Decoy Image](assets/decoy.png)

## 🕵️‍♂️ Stego Image Download

[Download the real stego image](assets/stego.png)

SHA256 checksum:
```
<TO-BE-REPLACED>
```

## 🧑‍💻 How to Decode

1. Download the stego image (see above).
2. Download the Python decoder script from `scripts/mbp2_decoder.py`.
3. Run the decoder:
   ```bash
   python3 scripts/mbp2_decoder.py assets/stego.png
   ```
4. The script will extract and verify the hidden message.

## 📝 Decoder Script

See [`scripts/mbp2_decoder.py`](scripts/mbp2_decoder.py) for the full code and usage.

---

**Design intent:** Reward curiosity, encourage low-level thinking, and appeal to engineers. The hidden message is discoverable, not advertised.

---

For Netlify deployment, see `webapp/README.md`.
