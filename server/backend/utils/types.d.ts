import { messageType } from "./enums"

export type packetDataT = {
	messageType: messageType,
	deviceId: number,
	value: number
}