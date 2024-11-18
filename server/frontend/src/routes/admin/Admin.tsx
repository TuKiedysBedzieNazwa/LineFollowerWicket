import { useEffect, useState, useRef } from "react"

import { decodePacket, encodePacket } from "../../utils/packetManager";

import { messageType } from "../../utils/enums";
import { serverIp } from "../../utils/config";

export default function Admin(){

	const wsConn = useRef<WebSocket>();
	const [wickets, setWickets] = useState<Array<any>>();

	const getWickets = async () => {
		await fetch(`/api/tcpClients`).then(
			res => res.json()
		).then(
			res => setWickets(res)
		);
	}

	const messageTypesHangler: {[key in messageType]?: () => void} = {
		[messageType.updateWickets]: () => { getWickets() }
	}

	useEffect(() => {
		const ws = new WebSocket(`ws://${serverIp}:8081`);
		ws.binaryType = "arraybuffer";

		// ws.onopen = () => {}
		ws.onmessage = (message) => {
			const decodedData = decodePacket(message.data);
			messageTypesHangler[decodedData.messageType] !== undefined ?
				messageTypesHangler[decodedData.messageType]!() : null;
		}

		wsConn.current = ws;

		return () => ws.close();
	}, []);

	useEffect(() => { getWickets() }, []);


	return <div className="rootDiv">
		<div className="nav">
			Admin Panel
		</div>

		<div className="h-full flex w-full">
			<div className="w-1/4 flex justify-stretch items-stretch">
				<div className="w-full m-10 p-5 shadow-2xl rounded-2xl text-3xl text-center">
					Wickets
					<div className="text-sm mt-5">
						{
							wickets && wickets.map((wicket, i) =>
								<div className="border-b-2 rounded-lg p-3 flex justify-between" key={i}>
									<div>
										{ wicket.id }
									</div>
									<div>
										{ wicket.address }
									</div>
								</div>
							)
						}
					</div>
				</div>
			</div>

			<div className="w-3/4 flex justify-stretch items-stretch">
				<div className="w-full m-10 p-5 shadow-2xl rounded-2xl text-3xl text-center">
					Loop State
					<div className="mt-20 flex justify-evenly mx-32">
						<button className="bg-indigo-700 text-white"
							onClick={() => {
								wsConn.current && wsConn.current.send(encodePacket(messageType.unlock));
							}}
						>
							reset
						</button>
						<button className="bg-red-700 text-white"
							onClick={() => {
								wsConn.current && wsConn.current.send(encodePacket(messageType.lock));
							}}
						>
							stop
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
}