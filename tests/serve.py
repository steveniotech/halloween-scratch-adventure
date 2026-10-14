"""Optional local QA server; serves this project only, with a Pages-like prefix."""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import os
root = Path(__file__).resolve().parent.parent
os.chdir(root)
class Handler(SimpleHTTPRequestHandler):
    def do_GET(self):
        prefix = '/halloween-scratch-adventure/'
        if self.path.startswith(prefix):
            self.path = '/' + self.path[len(prefix):]
        super().do_GET()
ThreadingHTTPServer(('127.0.0.1', 8767), Handler).serve_forever()
