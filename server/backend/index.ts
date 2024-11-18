import expressServer from "./src/expressServer";
import webSocketServer from "./src/webSocketServer";
import tcpSocketServer from "./src/tcpSocketServer";

expressServer(3000);
webSocketServer(8081);
tcpSocketServer("0.0.0.0", 8080);