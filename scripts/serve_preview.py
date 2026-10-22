"""Serve the local build without retaining stale HTML or assets in browser caches."""

from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import argparse


class PreviewHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--port", type=int, default=4007)
    args = parser.parse_args()
    build = Path(__file__).resolve().parent.parent / "_site"
    if not (build / "index.html").is_file():
        parser.error("Build the site before starting the preview server.")
    server = ThreadingHTTPServer(
        ("127.0.0.1", args.port), partial(PreviewHandler, directory=str(build))
    )
    print(f"Preview: http://127.0.0.1:{args.port}/ (browser cache disabled)", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
