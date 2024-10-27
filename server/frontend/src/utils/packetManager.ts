import type { packetDataT } from "./types";
import { messageType } from "./enums";


const messageTypeBoilerplate = 0b00000111;
const deviceIdBoilerplate = 0b00111000;

export function decodePacket(packet: ArrayBuffer): packetDataT{
	const fixedPacket = new Uint8Array(packet)[0]

	const type = fixedPacket & messageTypeBoilerplate;
	const deviceId = (fixedPacket & deviceIdBoilerplate) >> 3;

	return {
		messageType: type,
		deviceId: deviceId
	}
}

export function encodePacket(type: messageType, deviceId: number = 0b0000000): ArrayBuffer{
	return new Uint8Array([deviceId | type]).buffer;
}