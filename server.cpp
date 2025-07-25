#include <iostream>
#include <fstream>
#include <sstream>
#include <string>
#include <cstring>
#include <unistd.h>
#include <netinet/in.h>

#define PORT 8080
#define PUBLIC_DIR "public/"

// Detect MIME type (basic)
// Read file content into string
bool ends_with(const std::string &value, const std::string &ending) {
    if (ending.size() > value.size()) return false;
    return std::equal(ending.rbegin(), ending.rend(), value.rbegin());
}

std::string get_content_type(const std::string &path) {
    if (ends_with(path, ".html")) return "text/html";
    if (ends_with(path, ".css")) return "text/css";
    if (ends_with(path, ".js")) return "application/javascript";
    if (ends_with(path, ".png")) return "image/png";
    if (ends_with(path, ".jpg") || ends_with(path, ".jpeg")) return "image/jpeg";
    if (ends_with(path, ".gif")) return "image/gif";
    return "text/plain";
}
std::string read_file(const std::string &filepath) {
    std::ifstream file(filepath, std::ios::binary);
    if (!file) return "";
    std::ostringstream ss;
    ss << file.rdbuf();
    return ss.str();
}

int main() {
    int server_fd, new_socket;
    struct sockaddr_in address;
    int opt = 1;
    int addrlen = sizeof(address);
    char buffer[30000] = {0};

    if ((server_fd = socket(AF_INET, SOCK_STREAM, 0)) == 0) {
        perror("Socket failed");
        exit(EXIT_FAILURE);
    }

    if (setsockopt(server_fd, SOL_SOCKET, SO_REUSEADDR | SO_REUSEPORT, &opt, sizeof(opt))) {
        perror("setsockopt");
        exit(EXIT_FAILURE);
    }

    address.sin_family = AF_INET;
    address.sin_addr.s_addr = INADDR_ANY;
    address.sin_port = htons(PORT);

    if (bind(server_fd, (struct sockaddr *)&address, sizeof(address)) < 0) {
        perror("Bind failed");
        exit(EXIT_FAILURE);
    }

    if (listen(server_fd, 10) < 0) {
        perror("Listen failed");
        exit(EXIT_FAILURE);
    }

    std::cout << "HTTP Server running on http://localhost:" << PORT << std::endl;

    while (true) {
        if ((new_socket = accept(server_fd, (struct sockaddr *)&address, (socklen_t *)&addrlen)) < 0) {
            perror("Accept failed");
            exit(EXIT_FAILURE);
        }

        read(new_socket, buffer, 30000);
        std::string request(buffer);
        std::cout << "Request: " << request << std::endl;

        // Parse GET path
        std::string path = "/index.html";
        if (request.find("GET ") == 0) {
            size_t start = request.find(" ") + 1;
            size_t end = request.find(" ", start);
            path = request.substr(start, end - start);
            if (path == "/") path = "/index.html";
        }

        std::string filepath = PUBLIC_DIR + path;
        std::string content = read_file(filepath);

        std::ostringstream response;
        if (!content.empty()) {
            response << "HTTP/1.1 200 OK\r\n";
            response << "Content-Type: " << get_content_type(path) << "\r\n";
            response << "Content-Length: " << content.size() << "\r\n";
            response << "Connection: close\r\n\r\n";
            response << content;
        } else {
            std::string not_found = "<h1>404 Not Found</h1>";
            response << "HTTP/1.1 404 Not Found\r\n";
            response << "Content-Type: text/html\r\n";
            response << "Content-Length: " << not_found.size() << "\r\n";
            response << "Connection: close\r\n\r\n";
            response << not_found;
        }

        send(new_socket, response.str().c_str(), response.str().size(), 0);
        close(new_socket);
        memset(buffer, 0, sizeof(buffer));
    }

    return 0;
}
