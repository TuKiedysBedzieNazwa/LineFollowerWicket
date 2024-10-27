import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion";

import { timerState } from "../utils/enums";

export default function Timer({ tState }: { tState: timerState }){

	const startPoint = useRef(Math.floor(performance.now()))
	const [clock, updateClock] = useState<number>(0);
	const interval = useRef<number>();


	useEffect(() => {

		switch(tState){
			case timerState.reset:
				clearInterval(interval.current);
				break;
			case timerState.run:
				startPoint.current = Math.floor(performance.now());
				interval.current = setInterval(() => {
					updateClock(Math.floor(performance.now()) - startPoint.current);
				}, 1);
				break;
			case timerState.stop:
				clearInterval(interval.current);
				break;
		}

		return () => clearInterval(interval.current);
	}, [tState]);

	let mins: number = Math.floor(clock / 60000) % 60;
	let secs: string | number = Math.floor(clock / 1000) % 60;
	secs = secs > 9 ? secs : `0${secs}`;
	let ms: string | number = clock % 1000;
	ms = ms > 99 ? ms :
		ms > 9 ? `0${ms}` : `00${ms}`;

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

	return <div className="text-10xl w-full flex items-stretch justify-center tracking-widest mb-20">
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