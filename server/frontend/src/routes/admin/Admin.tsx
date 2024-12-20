import { useEffect, useState, useRef } from "react"

import { decodePacket, encodePacket } from "../../utils/packetManager";

import lock from "../../assets/lock.svg";
import batteryFull from "../../assets/batteryFull.svg";
import batteryEmpty from "../../assets/batteryEmpty.svg";

import { messageType } from "../../utils/enums";

export default function Admin(){

	const wsConn = useRef<WebSocket>();
	const [wickets, setWickets] = useState<Array<any>>();
	const [isStopDisabled, setIsStopDisabled] = useState<boolean>(false);

	const getWickets = async () => {
		await fetch(`/api/tcpClients`).then(
			res => res.json()
		).then(
			res => setWickets(res.sort((a: any, b: any) => a.id - b.id))
		);
	}

	const messageTypesHangler: {[key in messageType]?: () => void} = {
		[messageType.updateWickets]: () => { getWickets() }
	}

	useEffect(() => {
		const ws = new WebSocket(`ws://10.0.0.1:8081/`);
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

	useEffect(() => {

		const shouldDisableStop = wickets && wickets?.map((wicket) => {
			if(!wicket.areLocked)
				return false;
		}).filter((elemenet) => elemenet !== undefined)[0];

		setIsStopDisabled(shouldDisableStop === undefined);
	}, [ wickets ]);

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
									<div className="flex w-18 items-center justify-center">
										<span className="w-7">
											{ wicket.id }
										</span>
										<div className="w-10 h-5 flex items-center justify-center">
											{
												wicket.batteryStatus ?
												<img src={batteryFull} className="h-8" /> :
												<img src={batteryEmpty} className="h-8" />
											}
										</div>
										{ wicket.areLocked && <img src={lock} className="ml-2 h-5 mb-0.5" /> }
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
							Start
						</button>
						<button className="bg-red-700 text-white"
							onClick={() => {
								wsConn.current && wsConn.current.send(encodePacket(messageType.lock));
							}}
							disabled={isStopDisabled}
						>
							Stop
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
}