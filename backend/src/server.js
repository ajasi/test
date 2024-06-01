import http from "http";

const requestListener = (req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Hello, World!");
};

const server = http.createServer(requestListener);

export default server;
