import net from "net";
import { sendMessageToAllWsClients } from "./webSocketServer";

import { decodePacket, encodePacket } from "../utils/packetManager";
import { startTimer, stopTimer, createTimestamp } from "../utils/timer";

import type { packetDataT } from "../utils/types";
import { messageType } from "../utils/enums";


const socketClients: {
	socket: net.Socket,
	id?: number,
	areLocked: boolean,
	batteryStatus: boolean
}[] = [];

export function sendMessageToAllTcpClients(message: Uint8Array): void{
	socketClients.forEach(socketData => {
		socketData.socket.write(message);
	});
}

export function getAllTcpClients(){
	return socketClients.map((socketData) => {
		const {socket, ...rest} = socketData;

		return {
			...rest,
			address: socketData.socket.remoteAddress
		}
	});
}

export function changeWicketLockState(state: boolean){
	socketClients.map((_, i) => {
		socketClients[i].areLocked = state
	})
	sendMessageToAllWsClients(encodePacket(messageType.updateWickets).buffer)
}

const getSocketDataBySocket = (socket: net.Socket) => {
	return socketClients.map((socketData) => {
		if(socketData.socket == socket) return socketData;
	}).filter((elemenet) => elemenet !== undefined)[0];
}

const messageTypesHandler: {[key in messageType]?: (socket: net.Socket, decodedData: packetDataT) => void} = {
	[messageType.fireSensor]: (socket, decodedData) => {

		if(decodedData.deviceId === 0){
			startTimer();
			sendMessageToAllWsClients(encodePacket(messageType.fireSensor).buffer);
		}
		else if(decodedData.deviceId !== 3) createTimestamp();

		if(decodedData.deviceId === 3){
			stopTimer();
			sendMessageToAllTcpClients(encodePacket(messageType.lock));
			changeWicketLockState(true);
		}
		else {
			const socketIndex = socketClients.indexOf(getSocketDataBySocket(socket));
			socketClients[socketIndex].areLocked = true;
		}

		sendMessageToAllWsClients(encodePacket(messageType.updateTimer).buffer);
		sendMessageToAllWsClients(encodePacket(messageType.updateWickets).buffer);
	},
	[messageType.ping]: (socket, decodedData) => {

		const socketIndex = socketClients.indexOf(getSocketDataBySocket(socket));

		socketClients[socketIndex].id = decodedData.deviceId
		sendMessageToAllWsClients(encodePacket(messageType.updateWickets).buffer)
	},
	[messageType.batteryStatus]: (socket, decodedData) => {

		const socketIndex = socketClients.indexOf(getSocketDataBySocket(socket));

		if(socketClients[socketIndex].batteryStatus !== Boolean(decodedData.value)){
			socketClients[socketIndex].batteryStatus = Boolean(decodedData.value)
			sendMessageToAllWsClients(encodePacket(messageType.updateWickets).buffer)
		}
	}
}


export default function tcpSocketServer(tcpHost: string, tcpPort: number): void{

	const server = net.createServer((socket: net.Socket) => {
		console.log('[tcp socket]: Client connected:', socket.remoteAddress, socket.remotePort);
		socketClients.push({ socket: socket, areLocked: true, batteryStatus: false });
		console.log("[tcp socket]: ", socketClients.length);


		socket.setNoDelay(true);
		socket.setKeepAlive(true, 2000);


		socket.on('data', data => {
			if(!Buffer.isBuffer(data) || data.length !== 1) return;

			const decodedData = decodePacket(data);

			messageTypesHandler[decodedData.messageType] !== undefined ?
				messageTypesHandler[decodedData.messageType]!(socket, decodedData) :
				console.log('[tcp socket]: unknown messageType');
		});

		socket.on('error', (err) => {
			console.error('[tcp socket]: Socket error:', err);
		});

		socket.on("close", () => {
			console.log('[tcp socket]: Client disconnected');
			const toDelete = getSocketDataBySocket(socket);
			socketClients.splice(socketClients.indexOf(toDelete), 1);

			sendMessageToAllWsClients(encodePacket(messageType.updateWickets).buffer)
		})
	});

	server.listen(tcpPort, tcpHost, () => {
		console.log(`[tcp socket]: Server is running on ${tcpHost}:${tcpPort}`);
	});
}