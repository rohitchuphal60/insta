#include <drogon/drogon.h>
using namespace drogon;

int main() {
    // Define a simple route
    app().registerHandler("/", [](const HttpRequestPtr &req,
                                  std::function<void (const HttpResponsePtr &)> &&callback) {
        auto resp = HttpResponse::newHttpResponse();
        resp->setBody("<h1>Hello from Drogon!</h1>");
        callback(resp);
    });

    // Start server on port 8080
    app().addListener("0.0.0.0", 8080).run();
    return 0;
}
