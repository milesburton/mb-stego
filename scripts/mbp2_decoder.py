import zlib
import struct
import sys
import numpy as np
from PIL import Image
import binascii

MAGIC = b'MBP2'
HEADER_FMT = '<4sI I'  # magic, payload_len, crc32
HEADER_SIZE = struct.calcsize(HEADER_FMT)
SEED = 0x4D425032  # 'MBP2' as int


class SimpleLCG:
    """Simple Linear Congruential Generator matching JavaScript implementation"""
    def __init__(self, seed):
        self.state = seed & 0xFFFFFFFF
    
    def next(self):
        # Park-Miller LCG
        self.state = (self.state * 48271) % 2147483647
        return self.state
    
    def next_int(self, max_val):
        return self.next() % max_val


def shuffle_array(n, seed):
    """Fisher-Yates shuffle with matching LCG"""
    rng = SimpleLCG(seed)
    indices = list(range(n))
    for i in range(len(indices) - 1, 0, -1):
        j = rng.next_int(i + 1)
        indices[i], indices[j] = indices[j], indices[i]
    return indices


def extract_lsb_payload(img_path):
    img = Image.open(img_path)
    arr = np.array(img)
    h, w, c = arr.shape
    flat = arr.reshape(-1, c)
    blue = flat[:, 2]
    n_pixels = blue.size

    # Pseudorandom order using compatible shuffle
    order = shuffle_array(n_pixels, SEED)

    # Extract LSBs
    bits = blue[order] & 1
    # Group bits into bytes
    n_bytes = len(bits) // 8
    payload_bits = bits[:n_bytes * 8].reshape(-1, 8)
    payload_bytes = np.packbits(payload_bits, axis=1).flatten()

    # Parse header
    if len(payload_bytes) < HEADER_SIZE:
        raise ValueError('Image too small or not a valid MBP2 stego image.')
    magic, payload_len, crc32 = struct.unpack(HEADER_FMT, payload_bytes[:HEADER_SIZE])
    if magic != MAGIC:
        raise ValueError('Magic bytes not found. Not a valid MBP2 image.')
    payload = payload_bytes[HEADER_SIZE:HEADER_SIZE+payload_len]
    if len(payload) != payload_len:
        raise ValueError('Payload length mismatch.')
    if binascii.crc32(payload) & 0xFFFFFFFF != crc32:
        raise ValueError('CRC32 mismatch. Payload corrupted.')
    msg = zlib.decompress(payload)
    return msg.decode('utf-8')


def main():
    if len(sys.argv) != 2:
        print('Usage: python3 mbp2_decoder.py <stego_image.png>')
        sys.exit(1)
    msg = extract_lsb_payload(sys.argv[1])
    print('Hidden message:')
    print(msg)

if __name__ == '__main__':
    main()
