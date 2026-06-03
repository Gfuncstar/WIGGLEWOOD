#!/usr/bin/env python3
"""Tiny static file server for previewing the Wiggle Wood site.
Reads the port from the PORT environment variable (assigned by the preview
runtime when autoPort is enabled), falling back to 8931 for manual use.
Serves the project root so / resolves to index.html.
"""
import functools
import http.server
import os
import socketserver

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORT = int(os.environ.get("PORT", "8931"))

Handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=ROOT)


class Server(socketserver.TCPServer):
    allow_reuse_address = True


with Server(("", PORT), Handler) as httpd:
    print(f"Wiggle Wood preview serving {ROOT} on http://localhost:{PORT}")
    httpd.serve_forever()
