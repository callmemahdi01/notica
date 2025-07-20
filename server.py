import socket
import threading

LISTEN_HOST = '0.0.0.0'
LISTEN_PORT = 8888
TARGET_HOST = '127.0.0.1'
TARGET_PORT = 8788

def handle_client(client_socket):
    remote_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    remote_socket.connect((TARGET_HOST, TARGET_PORT))

    def forward(src, dst):
        while True:
            try:
                data = src.recv(4096)
                if not data:
                    break
                dst.sendall(data)
            except:
                break
        src.close()
        dst.close()

    threading.Thread(target=forward, args=(client_socket, remote_socket)).start()
    threading.Thread(target=forward, args=(remote_socket, client_socket)).start()

server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
server.bind((LISTEN_HOST, LISTEN_PORT))
server.listen(5)
print(f"Proxy running on http://{LISTEN_HOST}:{LISTEN_PORT} -> {TARGET_HOST}:{TARGET_PORT}")

while True:
    client_sock, addr = server.accept()
    threading.Thread(target=handle_client, args=(client_sock,)).start()
