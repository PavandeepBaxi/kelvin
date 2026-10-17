#!/usr/bin/env python3
"""Serve public/ locally with the headers from public/_headers, to test them before deploying."""
import http.server
import pathlib

ROOT = pathlib.Path("public")
PORT = 8000


def load_headers(path):
    """Read the '/*' block of a Cloudflare-style _headers file."""
    headers = []
    current = None
    for raw in path.read_text(encoding="utf-8").splitlines():
        if not raw.strip() or raw.lstrip().startswith("#"):
            continue
        if not raw[0].isspace():          # a path line, e.g. /*
            current = raw.strip()
            continue
        if current == "/*":               # an indented header line
            name, _, value = raw.strip().partition(":")
            headers.append((name.strip(), value.strip()))
    return headers


HEADERS = load_headers(ROOT / "_headers")


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self):
        for name, value in HEADERS:
            self.send_header(name, value)
        super().end_headers()


if __name__ == "__main__":
    print(f"Serving {ROOT}/ with {len(HEADERS)} headers on http://localhost:{PORT}")
    # 127.0.0.1, not 0.0.0.0: only this laptop can reach it, not everyone on the Wi-Fi.
    http.server.ThreadingHTTPServer(("127.0.0.1", PORT), Handler).serve_forever()