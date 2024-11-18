import { WebSocketServer } from "ws";
import type WebSocket from "ws";

import { messageType } from "../utils/enums";
import { decodePacket, encodePacket } from "../utils/packetManager";
import { sendMessageToAllTcpClients } from "./tcpSocketServer";
import { resetTimer, stopTimer } from "../utils/timer";


const webSocketClients: WebSocket[] = [];
export function sendMessageToAllWsClients(message: ArrayBuffer): void{
	webSocketClients.forEach(ws => {
		ws.send(message);
	})
}

const messageTypesHangler: {[key in messageType]?: () => void} = {
	[messageType.lock]: () => {
		sendMessageToAllTcpClients(encodePacket(messageType.lock));
		stopTimer();
	},
	[messageType.unlock]: () => {
		sendMessageToAllTcpClients(encodePacket(messageType.unlock));
		resetTimer();
	}
}


export default function webSocketServer(wsPort: number): void{

	const wss = new WebSocketServer({ port: wsPort });

	wss.on('connection', (ws: WebSocket) => {
		webSocketClients.push(ws);
		console.log("[web socket]: Connected clients", webSocketClients.length);

		ws.on("open", () => {})
		ws.on('error', console.error);

		ws.on('message', (data: WebSocket.RawData, isBinary: boolean) => {
			if(!isBinary) return;
			const decodedData = decodePacket(data as ArrayBuffer);
			messageTypesHangler[decodedData.messageType] !== undefined ?
				messageTypesHangler[decodedData.messageType]!() :
				console.log('[web socket]: unknown messageType');
		});

		ws.on("close", () => {
			console.log("[web socket]: close")
			webSocketClients.splice(webSocketClients.indexOf(ws), 1);
		});
	});
}