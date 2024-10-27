import { useRef, useState, useEffect } from "react";

import Timer from "./components/Timer";
import { encodePacket, decodePacket } from "./utils/packetManager";

import { messageType, timerState } from "./utils/enums";


function App() {

	const wsConn = useRef<WebSocket>();
	const [state, setState] = useState<boolean>(true);
	const [tState, setTState] = useState<timerState>(timerState.stop);


	const messageTypesHangler: {[key in messageType]: () => void} = {
		[messageType.reset]: () => {
			console.log("reset")
		},
		[messageType.fireSensor]: () => {
			console.log("fire sensor")
			setTState(timerState.stop);
			setState(true);
		},
		[messageType.ping]: () => {
			console.log("ping")
		},
		[messageType.runTimer]: () => {
			console.log("Run timer")
		}
	}


	useEffect(() => {
		const ws = new WebSocket('ws://localhost:8081');
		ws.binaryType = "arraybuffer";

		ws.onopen = () => {
			console.log('ws opened on browser');
		}
		ws.onmessage = (message) => {
			const decodedData = decodePacket(message.data)
			messageTypesHangler[decodedData.messageType]();
		}

		wsConn.current = ws;

		return () => ws.close();
	}, []);


	const startTimer = () => {
		setTState(timerState.run);
		setState(false);
	}
	const resetTimer = () => {
		wsConn.current && wsConn.current.send(encodePacket(messageType.reset));
		setTState(timerState.stop);
		setState(true);
	}

	return (
		<div className="flex items-center justify-between flex-col h-screen">
			<div className='flex items-center justify-center text-8xl mt-12 font-black'>
				Timer
				{
					state ?
					<button className="text-white ml-20"
						onClick={startTimer}
					>
						start
					</button>:
					<button className="text-white ml-20 bg-red-500"
						onClick={resetTimer}
					>
						stop
					</button>
				}
			</div>
			<Timer tState={tState} />
			<div>
				Created By Dominik Kalicun
			</div>
		</div>
	)
}


export default App;