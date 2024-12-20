import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";

import Timer from "./Timer";
import { decodePacket } from "../../utils/packetManager";
import formatTime from "./formatTime";

import { messageType, timerState } from "../../utils/enums";

export default function Root() {

	const finishTime = useRef<number>(0);
	const [timestamps, setTimestamps] = useState<number[]>([]);
	const [tState, setTState] = useState<timerState>(timerState.stop);

	const getTime = async () => {
		await fetch("/api/timer").then(
			res => res.json()
		).then(
			res => {
				setTimestamps(res.timestamps);
				if(!res.isRunning){
					finishTime.current = res.finishTime;
					setTState(timerState.stop);
				}
				console.log(res);
			}
		)
	}


	const messageTypesHangler: {[key in messageType]?: () => void} = {
		[messageType.fireSensor]: () => {
			setTState(timerState.run);
			getTime();
		},
		[messageType.updateTimer]: () => {
			getTime();
		}
	}


	useEffect(() => {getTime()}, [])

	useEffect(() => {
		const ws = new WebSocket(`ws://10.0.0.1:8081/`);
		ws.binaryType = "arraybuffer";

		ws.onmessage = (message) => {
			const decodedData = decodePacket(message.data)
			messageTypesHangler[decodedData.messageType] !== undefined ?
				messageTypesHangler[decodedData.messageType]!() : null;
		}

		return () => ws.close();
	}, []);


	return (
		<div className="rootDiv">
			<div className='nav'>
				Stoper
			</div>
			<div className="flex w-full justify-evenly">
				<div className="w-1/6 p-7 my-20 shadow-2xl rounded-2xl font-black text-5xl">
					Bramki
					<AnimatePresence>
						{
							timestamps.map((timestamp, i) => {
								const {mins, secs, ms} = formatTime(timestamp);

								return <motion.div className="mt-12 flex" key={i}
								transition={{delay: i * 0.1}}
								initial={{
										y: -10,
										opacity: 0
									}}
									animate={{
										y: 0,
										opacity: 1
									}}
									exit={{
										y: 8,
										opacity: 0
									}}
								>
									<div className="font-bold mr-3">
										{ i + 1 }.
									</div>
									{ mins !== 0 &&
										<div className="mr-3">
											{ mins }<span className="text-xl">M</span>
										</div>
									}
									<div className="mr-3">
										{ secs }<span className="text-xl">S</span>
									</div>
									<div className="text-xl">
										{ ms }<span className="text-sm">ms</span>
									</div>
								</motion.div>;
							})
						}
					</AnimatePresence>
					
				</div>
				<Timer tState={tState} finishTime={finishTime} />
			</div>
			<div>
				Created By Dominik Kalicun
			</div>
		</div>
	)
}