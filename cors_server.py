from http.server import HTTPServer, SimpleHTTPRequestHandler
import webbrowser
import os

class CORSRequestHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        return super().end_headers()

if __name__ == '__main__':
    PORT = 8000
    DIRECTORY = os.path.dirname(os.path.abspath(__file__))
    
    # Change to the directory where the script is located
    os.chdir(DIRECTORY)
    
    server_address = ('', PORT)
    httpd = HTTPServer(server_address, CORSRequestHandler)
    
    print(f"Serving at http://localhost:{PORT}")
    webbrowser.open(f'http://localhost:{PORT}')
    httpd.serve_forever()
