# VPS deployment

The image is built in two stages: Node and pnpm produce the Vite `dist` directory, then an unprivileged Nginx image serves only those static files. The container does not run a second Caddy or terminate TLS. Caddy on the VPS remains responsible for HTTPS and reverse proxying.

Nginx enables gzip, gives Vite's hashed assets a one-year immutable cache, keeps `index.html` fresh, and falls back to `index.html` for client-side routes.

## Publish the image

The GitHub Actions workflow publishes only `ghcr.io/sguzmanbeltran/codeteller:latest` on pushes to `main` (or when manually started). The image targets `linux/amd64`, matching this VPS's `x86_64` architecture; no emulation is needed.

After the first publish, make the package public in GitHub **Packages → Package settings** if the VPS should pull it without credentials. For a private package, log in on the VPS with a GitHub token that has `read:packages`:

```sh
echo "$GHCR_TOKEN" | docker login ghcr.io -u SGuzmanBeltran --password-stdin
```

## Run with Docker Compose

Copy `compose.yaml` to the VPS. By default it pulls `latest` and publishes Nginx only on `127.0.0.1:8080`, so the container is not directly exposed to the internet.

```sh
docker compose pull
docker compose up -d
docker compose ps
```

To use a different host port, create a `.env` file beside `compose.yaml`:

```dotenv
HTTP_PORT=8090
```

## Connect Caddy

This Compose setup assumes Caddy runs directly on the VPS. Add a site to Caddy's configuration and replace the hostname:

```caddyfile
codeteller.example.com {
    reverse_proxy 127.0.0.1:8080
}
```

Caddy will handle TLS; Nginx serves the app behind it. If Caddy itself runs in Docker, put both containers on a shared Docker network and proxy to `codeteller:8080` instead of using the loopback port mapping.

## Build locally

```sh
docker build -t codeteller:local .
docker run --rm -p 8080:8080 codeteller:local
```
