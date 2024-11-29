import type { packetDataT } from "./types";
import { messageType } from "./enums";


const messageTypeBoilerplate = 0b00000111;
const deviceIdBoilerplate    = 0b00111000;
const valueBoilerplate       = 0b11000000;


export function decodePacket(packet: ArrayBuffer): packetDataT{
	const fixedPacket = new Uint8Array(packet)[0]

	const type: messageType = fixedPacket & messageTypeBoilerplate;
	const deviceId = (fixedPacket & deviceIdBoilerplate) >> 3;
	const value = (fixedPacket & valueBoilerplate) >> 6;

	return {
		messageType: type,
		deviceId: deviceId,
		value: value
	}
}

export function encodePacket(type: messageType, deviceId: number = 0b0000000): Uint8Array{
	return new Uint8Array([deviceId | type]);
}