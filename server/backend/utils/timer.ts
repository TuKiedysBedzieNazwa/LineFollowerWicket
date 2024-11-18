
var isRunning = false;
var startTime = 0;
const timestamps: number[] = [];

export function createTimestamp(){
	timestamps.push(Math.floor(performance.now() - startTime));
}

export function startTimer(){
	startTime = Math.floor(performance.now());
	isRunning = true;
}
export function getTime(){
	return {
		finishTime: isRunning ? 0 : startTime,
		timestamps: timestamps,
		isRunning: isRunning
	};
}
export function resetTimer(){
	startTime = 0;
	isRunning = false;
	timestamps.splice(0, timestamps.length);
}
export function stopTimer(){
	startTime = Math.floor(performance.now() - startTime);
	isRunning = false;

	return startTime;
}