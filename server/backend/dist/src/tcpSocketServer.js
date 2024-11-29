"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMessageToAllTcpClients = sendMessageToAllTcpClients;
exports.getAllTcpClients = getAllTcpClients;
exports.changeWicketLockState = changeWicketLockState;
exports.default = tcpSocketServer;
const net_1 = __importDefault(require("net"));
const webSocketServer_1 = require("./webSocketServer");
const packetManager_1 = require("../utils/packetManager");
const timer_1 = require("../utils/timer");
const socketClients = [];
function sendMessageToAllTcpClients(message) {
    socketClients.forEach(socketData => {
        socketData.socket.write(message);
    });
}
function getAllTcpClients() {
    return socketClients.map((socketData) => {
        const { socket } = socketData, rest = __rest(socketData, ["socket"]);
        return Object.assign(Object.assign({}, rest), { address: socketData.socket.remoteAddress });
    });
}
function changeWicketLockState(state) {
    socketClients.map((_, i) => {
        socketClients[i].areLocked = state;
    });
    (0, webSocketServer_1.sendMessageToAllWsClients)((0, packetManager_1.encodePacket)(5 /* messageType.updateWickets */).buffer);
}
const getSocketDataBySocket = (socket) => {
    return socketClients.map((socketData) => {
        if (socketData.socket == socket)
            return socketData;
    }).filter((elemenet) => elemenet !== undefined)[0];
};
const messageTypesHandler = {
    [1 /* messageType.fireSensor */]: (socket, decodedData) => {
        if (decodedData.deviceId === 0) {
            (0, timer_1.startTimer)();
            (0, webSocketServer_1.sendMessageToAllWsClients)((0, packetManager_1.encodePacket)(1 /* messageType.fireSensor */).buffer);
        }
        else if (decodedData.deviceId !== 3)
            (0, timer_1.createTimestamp)();
        if (decodedData.deviceId === 3) {
            (0, timer_1.stopTimer)();
            sendMessageToAllTcpClients((0, packetManager_1.encodePacket)(4 /* messageType.lock */));
            changeWicketLockState(true);
        }
        else {
            const socketIndex = socketClients.indexOf(getSocketDataBySocket(socket));
            socketClients[socketIndex].areLocked = true;
        }
        (0, webSocketServer_1.sendMessageToAllWsClients)((0, packetManager_1.encodePacket)(6 /* messageType.updateTimer */).buffer);
        (0, webSocketServer_1.sendMessageToAllWsClients)((0, packetManager_1.encodePacket)(5 /* messageType.updateWickets */).buffer);
    },
    [2 /* messageType.ping */]: (socket, decodedData) => {
        const socketIndex = socketClients.indexOf(getSocketDataBySocket(socket));
        socketClients[socketIndex].id = decodedData.deviceId;
        (0, webSocketServer_1.sendMessageToAllWsClients)((0, packetManager_1.encodePacket)(5 /* messageType.updateWickets */).buffer);
    },
    [3 /* messageType.batteryStatus */]: (socket, decodedData) => {
        const socketIndex = socketClients.indexOf(getSocketDataBySocket(socket));
        if (socketClients[socketIndex].batteryStatus !== Boolean(decodedData.value)) {
            socketClients[socketIndex].batteryStatus = Boolean(decodedData.value);
            (0, webSocketServer_1.sendMessageToAllWsClients)((0, packetManager_1.encodePacket)(5 /* messageType.updateWickets */).buffer);
        }
    }
};
function tcpSocketServer(tcpHost, tcpPort) {
    const server = net_1.default.createServer((socket) => {
        console.log('[tcp socket]: Client connected:', socket.remoteAddress, socket.remotePort);
        socketClients.push({ socket: socket, areLocked: true, batteryStatus: false });
        console.log("[tcp socket]: ", socketClients.length);
        socket.setNoDelay(true);
        socket.setKeepAlive(true, 2000);
        socket.on('data', data => {
            if (!Buffer.isBuffer(data) || data.length !== 1)
                return;
            const decodedData = (0, packetManager_1.decodePacket)(data);
            messageTypesHandler[decodedData.messageType] !== undefined ?
                messageTypesHandler[decodedData.messageType](socket, decodedData) :
                console.log('[tcp socket]: unknown messageType');
        });
        socket.on('error', (err) => {
            console.error('[tcp socket]: Socket error:', err);
        });
        socket.on("close", () => {
            console.log('[tcp socket]: Client disconnected');
            const toDelete = getSocketDataBySocket(socket);
            socketClients.splice(socketClients.indexOf(toDelete), 1);
            (0, webSocketServer_1.sendMessageToAllWsClients)((0, packetManager_1.encodePacket)(5 /* messageType.updateWickets */).buffer);
        });
    });
    server.listen(tcpPort, tcpHost, () => {
        console.log(`[tcp socket]: Server is running on ${tcpHost}:${tcpPort}`);
    });
}
