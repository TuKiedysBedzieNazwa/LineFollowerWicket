import { WebSocketServer } from "ws";
import type WebSocket from "ws";

import { messageType } from "../utils/enums";
import { decodePacket } from "./tcpSocketServer/packetManager";


const messageTypesHangler: {[key in messageType]: () => void} = {
	[messageType.reset]: () => {
		console.log("reset")
	},
	[messageType.fireSensor]: () => {
		console.log("fire sensor")
	},
	[messageType.ping]: () => {
		console.log("ping")
	},
	[messageType.runTimer]: () => {
		console.log("Run timer")
	}
}

const webSocketClients: WebSocket[] = [];
export function sendMessageToAllWsClients(message: ArrayBuffer): void{
	webSocketClients.forEach(ws => {
		ws.send(message);
	})
}

export default function webSocketServer(wsPort: number): void{

	const wss = new WebSocketServer({ port: wsPort });

	wss.on('connection', (ws: WebSocket) => {
		webSocketClients.push(ws);
		console.log("Connected clients", webSocketClients.length);

		ws.on("open", () => {
			console.log(open)
		})
		ws.on('error', console.error);

		ws.on('message', (data: WebSocket.RawData, isBinary: boolean) => {
			if(!isBinary) return;
			const decodedData = decodePacket(data as ArrayBuffer);
			messageTypesHangler[decodedData.messageType]();
		});


		ws.on("close", () => {
			console.log("close")
			webSocketClients.splice(webSocketClients.indexOf(ws), 1);
		});
	});
}