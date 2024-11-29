"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const expressServer_1 = __importDefault(require("./src/expressServer"));
const webSocketServer_1 = __importDefault(require("./src/webSocketServer"));
const tcpSocketServer_1 = __importDefault(require("./src/tcpSocketServer"));
(0, expressServer_1.default)(3000);
(0, webSocketServer_1.default)(8081);
(0, tcpSocketServer_1.default)("0.0.0.0", 8080);
