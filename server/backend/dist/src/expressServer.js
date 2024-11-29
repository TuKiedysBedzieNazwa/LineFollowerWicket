"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = expressServer;
const express_1 = __importDefault(require("express"));
const tcpSocketServer_1 = require("./tcpSocketServer");
const timer_1 = require("../utils/timer");
function expressServer(exPort) {
    const server = (0, express_1.default)();
    server.get("/tcpClients", (req, res) => {
        res.send((0, tcpSocketServer_1.getAllTcpClients)());
    });
    server.get("/timer", (req, res) => {
        res.send((0, timer_1.getTime)());
    });
    server.listen(exPort, () => {
        console.log(`[backend server]: Server is running at http://localhost:${exPort}`);
    });
}
