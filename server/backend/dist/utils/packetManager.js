"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodePacket = decodePacket;
exports.encodePacket = encodePacket;
const messageTypeBoilerplate = 0b00000111;
const deviceIdBoilerplate = 0b00111000;
const valueBoilerplate = 0b11000000;
function decodePacket(packet) {
    const fixedPacket = new Uint8Array(packet)[0];
    const type = fixedPacket & messageTypeBoilerplate;
    const deviceId = (fixedPacket & deviceIdBoilerplate) >> 3;
    const value = (fixedPacket & valueBoilerplate) >> 6;
    return {
        messageType: type,
        deviceId: deviceId,
        value: value
    };
}
function encodePacket(type, deviceId = 0b0000000) {
    return new Uint8Array([deviceId | type]);
}
