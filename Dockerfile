FROM python:3.11-slim

# Backend version: 2026-01-18-v2 - Force cache invalidation
# Build timestamp: 2026-01-18T16:30:00Z
# Install system dependencies including FFmpeg, git, Node.js, Playwright dependencies, and build tools
RUN apt-get update && apt-get install -y \
    ffmpeg \
    git \
    gcc \
    python3-dev \
    pkg-config \
    libcairo2-dev \
    curl \
    wget \
    xz-utils \
    && wget https://nodejs.org/dist/v20.10.0/node-v20.10.0-linux-x64.tar.xz \
    && tar -xJf node-v20.10.0-linux-x64.tar.xz -C /usr/local --strip-components=1 \
    && rm node-v20.10.0-linux-x64.tar.xz \
    && npm install -g pnpm \
    && rm -rf /var/lib/apt/lists/*

# Install Playwright system dependencies (required for Chromium to run)
RUN apt-get update && apt-get install -y \
    libnss3 \
    libnspr4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libpango-1.0-0 \
    libcairo2 \
    libasound2 \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy the entire repo first
COPY . /tmp/repo
WORKDIR /tmp/repo

# Always clone latest backend from GitHub (force fresh pull every time)
RUN rm -rf trevnoctilla-backend && \
    echo "Cloning latest justpdf-backend from GitHub..." && \
    git clone https://github.com/KodeKenobi/justpdf-backend.git trevnoctilla-backend && \
    cd trevnoctilla-backend && \
    echo "=== Backend version ===" && \
    git log --oneline -1 && \
    echo "=== Verifying trevnoctilla-backend contents ===" && \
    ls -la | head -20

# Copy requirements and install Python dependencies
# Handle both root-level and trevnoctilla-backend/ build contexts
WORKDIR /app
RUN if [ ! -f "/tmp/repo/trevnoctilla-backend/requirements.txt" ]; then \
        echo "ERROR: requirements.txt not found in trevnoctilla-backend!"; \
        echo "Contents of trevnoctilla-backend:"; \
        ls -la /tmp/repo/trevnoctilla-backend/ || echo "Directory doesn't exist"; \
        exit 1; \
    fi && \
    cp /tmp/repo/trevnoctilla-backend/requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Install Playwright browsers with dependencies (required for automation)
RUN playwright install --with-deps chromium

# Copy application code
RUN cp -r /tmp/repo/trevnoctilla-backend/* . && \
    cp -r /tmp/repo/trevnoctilla-backend/.[!.]* . 2>/dev/null || true

# Create necessary directories
RUN mkdir -p uploads edited saved_html converted_videos converted_audio

# Make start scripts executable
RUN chmod +x start.sh

# Install Node.js dependencies and build Next.js frontend
WORKDIR /tmp/repo
RUN if [ -f "package.json" ]; then \
        echo "Building Next.js frontend..." && \
        rm -rf .next && \
        # Install dependencies without frozen lockfile to avoid cross-platform issues
        pnpm install && \
        NEXT_TELEMETRY_DISABLED=1 pnpm exec next build; \
    else \
        echo "WARNING: package.json not found, skipping frontend build"; \
    fi

# Copy built Next.js app and necessary files to /app
WORKDIR /app
RUN if [ -f "/tmp/repo/package.json" ]; then \
        cp /tmp/repo/package.json /app/ && \
        cp /tmp/repo/package-lock.json /app/ 2>/dev/null || cp /tmp/repo/pnpm-lock.yaml /app/ 2>/dev/null || true && \
        cp /tmp/repo/next.config.js /app/ 2>/dev/null || true && \
        cp /tmp/repo/next-env.d.ts /app/ 2>/dev/null || true && \
        cp /tmp/repo/tsconfig.json /app/ 2>/dev/null || true && \
        cp /tmp/repo/middleware.ts /app/ 2>/dev/null || true && \
        cp -r /tmp/repo/.next /app/ 2>/dev/null || true && \
        cp -r /tmp/repo/public /app/ 2>/dev/null || true && \
        cp -r /tmp/repo/app /app/ 2>/dev/null || true && \
        cp -r /tmp/repo/components /app/ 2>/dev/null || true && \
        cp -r /tmp/repo/lib /app/ 2>/dev/null || true && \
        cp -r /tmp/repo/contexts /app/ 2>/dev/null || true && \
        cp -r /tmp/repo/hooks /app/ 2>/dev/null || true && \
        cp -r /tmp/repo/types /app/ 2>/dev/null || true && \
        cp -r /tmp/repo/node_modules /app/ 2>/dev/null || true; \
    fi

# Expose port (Next.js)
EXPOSE 3000

# Run Next.js only (backend is deployed separately)
CMD ["npm", "start"]
