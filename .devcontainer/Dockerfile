# Dev container for mb-stego-decoder
FROM mcr.microsoft.com/vscode/devcontainers/javascript-node:22-bullseye

# Install Python and Pillow/NumPy for decoder
RUN apt-get update && \
    apt-get install -y python3 python3-pip && \
    pip3 install pillow numpy

# Set up working directory
WORKDIR /workspace

# Install Vite globally for convenience
RUN npm install -g create-vite

# Default shell
CMD ["/bin/bash"]
