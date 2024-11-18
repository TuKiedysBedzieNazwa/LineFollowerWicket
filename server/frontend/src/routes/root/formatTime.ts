export default function formatTime(time: number){

	let mins: number = Math.floor(time / 60000) % 60;
	let secs: string | number = Math.floor(time / 1000) % 60;
	secs = secs > 9 ? secs : `0${secs}`;
	let ms: string | number = time % 1000;
	ms = ms > 99 ? ms :
		ms > 9 ? `0${ms}` : `00${ms}`;

	return {
		mins: mins,
		secs: secs,
		ms: ms
	}
}