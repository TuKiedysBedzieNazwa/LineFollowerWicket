import net from "net";
import { sendMessageToAllWsClients } from "../webSocketServer";

import { decodePacket, encodePacket } from "./packetManager";

import type { packetDataT } from "../../utils/types";
import { messageType } from "../../utils/enums";


const messageTypesHangler: {[key in messageType]: (packet: packetDataT) => void} = {
	[messageType.reset]: () => {
		console.log("reset")
	},
	[messageType.fireSensor]: () => {
		sendMessageToAllWsClients(encodePacket(messageType.fireSensor))
		console.log("fire sensor")
	},
	[messageType.ping]: () => {
		console.log("ping")
	},
	[messageType.runTimer]: () => {
		console.log("Run timer")
	}
}


const socketClients: net.Socket[] = [];
export function sendMessageToAllTcpClients(message: string): void{
	socketClients.forEach(socket => {
		socket.write(message);
	});
}

export default function tcpSocketServer(tcpHost: string, tcpPort: number): void{

	const server = net.createServer((socket: net.Socket) => {
		console.log('[tcp socket]: Client connected:', socket.remoteAddress, socket.remotePort);
		socketClients.push(socket);
		console.log("[tcp socket]: ", socketClients.length);

		socket.on('data', data => {
			if(!Buffer.isBuffer(data) || data.length !== 1) return;

			const decodedData = decodePacket(data);
			messageTypesHangler[decodedData.messageType](decodedData);
		});

		socket.on('error', (err) => {
			console.error('[tcp socket]: Socket error:', err);
		});


		socket.on("close", () => {
			console.log('[tcp socket]: Client disconnected');
			socketClients.splice(socketClients.indexOf(socket), 1);
		})

		socket.setKeepAlive(true, 1000);
	});

	server.listen(tcpPort, tcpHost, () => {
		console.log(`[tcp socket]: Server is running on ${tcpHost}:${tcpPort}`);
	});
}