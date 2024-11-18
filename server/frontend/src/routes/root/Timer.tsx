import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion";

import formatTime from "./formatTime";

import { timerState } from "../../utils/enums";


export default function Timer({ tState, finishTime }: {
	tState: timerState,
	finishTime: React.MutableRefObject<number>
}){

	const [timer, updateTimer] = useState<number>(0);
	const interval = useRef<number>();
	const startTimeLocal = useRef<number>(0);

	useEffect(() => {

		switch(tState){
			case timerState.reset:
				clearInterval(interval.current);
				updateTimer(0);

				break;
			case timerState.run:
				startTimeLocal.current = Math.floor(performance.now());

				interval.current = setInterval(() => {
					updateTimer(Math.floor(performance.now()) - startTimeLocal.current);
				}, 1);
				
				break;
			case timerState.stop:
				clearInterval(interval.current);
				updateTimer(finishTime.current);
				break;
			}

		return () => clearInterval(interval.current);
	}, [tState]);

	let {mins, secs, ms} = formatTime(timer);

	const animationSet = {
		initial:{
			y: -100,
			opacity: 0
		},
		animate:{
			y: 0,
			opacity: 1
		},
		exit:{
			y: 80,
			opacity: 0
		}
	}

	return <div className="text-10xl flex items-stretch justify-center tracking-widest mb-20 mr-32">
		<AnimatePresence>
			{
				mins > 0 && <>
					<motion.div key={mins}
						transition={{delay: 0.21}}
						{ ...animationSet }
					>
						{mins}
					</motion.div>
					<motion.div
						transition={{delay: 0.14}}
						{ ...animationSet }
					>
						:
					</motion.div>
				</>
			}
		</AnimatePresence>
		<AnimatePresence mode="popLayout">
			{
				String(secs).split("").map((val, i) =>
					<motion.div className="w-72 flex items-center justify-center"
						transition={{delay: (1 - i) * 0.07}}
						key={`${val}${i}`}
						{ ...animationSet }
					>
						{val}
					</motion.div>
				)
			}
		</AnimatePresence>
		<div className="w-[370px] text-9xl mt-32">
			{ms}
		</div>
	</div>
}