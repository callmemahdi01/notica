import socket
import threading
import time
from urllib.parse import urlparse
import requests
from flask import Flask, request, Response, jsonify
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

class WranglerProxy:
    def __init__(self, target_host='127.0.0.1', target_port=8788, listen_port=8790):
        self.target_host = target_host
        self.target_port = target_port
        self.listen_port = listen_port
        self.target_url = f'http://{target_host}:{target_port}'
    
    def proxy_request(self, path, method='GET', data=None, files=None, headers=None):
        """پروکسی درخواست به wrangler"""
        url = f'{self.target_url}{path}'
        
        # حذف headers مشکل‌ساز
        if headers:
            headers = {k: v for k, v in headers.items() 
                      if k.lower() not in ['host', 'content-length', 'transfer-encoding']}
        
        try:
            if method == 'GET':
                resp = requests.get(url, params=request.args, headers=headers, timeout=30)
            elif method == 'POST':
                if files:
                    resp = requests.post(url, data=data, files=files, headers=headers, timeout=30)
                else:
                    resp = requests.post(url, json=data, headers=headers, timeout=30)
            elif method == 'PUT':
                resp = requests.put(url, json=data, headers=headers, timeout=30)
            elif method == 'DELETE':
                resp = requests.delete(url, headers=headers, timeout=30)
            else:
                resp = requests.request(method, url, json=data, headers=headers, timeout=30)
            
            return resp
        except requests.exceptions.RequestException as e:
            logger.error(f"Proxy error for {url}: {e}")
            return None

proxy = WranglerProxy()

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>', methods=['GET', 'POST', 'PUT', 'DELETE', 'PATCH'])
def proxy_all(path):
    """پروکسی تمام درخواست‌ها"""
    
    # ساخت path کامل
    full_path = f'/{path}' if path else '/'
    if request.query_string:
        full_path += f'?{request.query_string.decode()}'
    
    # آماده‌سازی data
    data = None
    files = None
    
    if request.method in ['POST', 'PUT', 'PATCH']:
        if request.content_type and 'multipart/form-data' in request.content_type:
            # فایل آپلود
            data = request.form.to_dict()
            files = {key: (file.filename, file.stream, file.mimetype) 
                    for key, file in request.files.items()}
        else:
            try:
                data = request.get_json()
            except:
                data = request.get_data()
    
    # پروکسی درخواست
    resp = proxy.proxy_request(
        full_path, 
        method=request.method, 
        data=data, 
        files=files,
        headers=dict(request.headers)
    )
    
    if resp is None:
        return jsonify({"error": "Cannot connect to wrangler server"}), 502
    
    # بازگرداندن پاسخ
    response_headers = dict(resp.headers)
    
    # حذف headers مشکل‌ساز
    for header in ['content-encoding', 'content-length', 'transfer-encoding']:
        response_headers.pop(header, None)
    
    # مدیریت content-type
    content_type = response_headers.get('content-type', 'text/html')
    
    try:
        if 'application/json' in content_type:
            return jsonify(resp.json()), resp.status_code
        else:
            return Response(
                resp.content,
                status=resp.status_code,
                headers=response_headers
            )
    except:
        return Response(
            resp.content,
            status=resp.status_code,
            headers=response_headers
        )

@app.before_request
def log_request():
    """لاگ درخواست‌ها"""
    logger.info(f"{request.method} {request.path} from {request.remote_addr}")

if __name__ == '__main__':
    print("🚀 Wrangler Proxy Server Starting...")
    print(f"📡 Proxying: http://127.0.0.1:8788 -> http://0.0.0.0:8790")
    print(f"🌐 Access from network: http://[YOUR_IP]:8790")
    print("⏹️  Press Ctrl+C to stop")
    
    app.run(
        host='0.0.0.0',
        port=8790,
        debug=False,
        threaded=True
    )
