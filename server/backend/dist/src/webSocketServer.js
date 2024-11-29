"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMessageToAllWsClients = sendMessageToAllWsClients;
exports.default = webSocketServer;
const ws_1 = require("ws");
const packetManager_1 = require("../utils/packetManager");
const tcpSocketServer_1 = require("./tcpSocketServer");
const timer_1 = require("../utils/timer");
const webSocketClients = [];
function sendMessageToAllWsClients(message) {
    webSocketClients.forEach(ws => {
        ws.send(message);
    });
}
const messageTypesHangler = {
    [4 /* messageType.lock */]: () => {
        (0, tcpSocketServer_1.sendMessageToAllTcpClients)((0, packetManager_1.encodePacket)(4 /* messageType.lock */));
        (0, timer_1.stopTimer)();
        sendMessageToAllWsClients((0, packetManager_1.encodePacket)(6 /* messageType.updateTimer */).buffer);
        (0, tcpSocketServer_1.changeWicketLockState)(true);
    },
    [0 /* messageType.unlock */]: () => {
        (0, tcpSocketServer_1.sendMessageToAllTcpClients)((0, packetManager_1.encodePacket)(0 /* messageType.unlock */));
        (0, timer_1.resetTimer)();
        sendMessageToAllWsClients((0, packetManager_1.encodePacket)(6 /* messageType.updateTimer */).buffer);
        (0, tcpSocketServer_1.changeWicketLockState)(false);
    }
};
function webSocketServer(wsPort) {
    const wss = new ws_1.WebSocketServer({ port: wsPort });
    wss.on('connection', (ws) => {
        webSocketClients.push(ws);
        console.log("[web socket]: Connected clients", webSocketClients.length);
        ws.on("open", () => { });
        ws.on('error', console.error);
        ws.on('message', (data, isBinary) => {
            if (!isBinary)
                return;
            const decodedData = (0, packetManager_1.decodePacket)(data);
            messageTypesHangler[decodedData.messageType] !== undefined ?
                messageTypesHangler[decodedData.messageType]() :
                console.log('[web socket]: unknown messageType');
        });
        ws.on("close", () => {
            console.log("[web socket]: close");
            webSocketClients.splice(webSocketClients.indexOf(ws), 1);
        });
    });
}
