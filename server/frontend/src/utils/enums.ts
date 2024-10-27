export const enum messageType {
	reset = 0b00000000,
	fireSensor = 0b00000001,
	ping = 0b00000010,
	runTimer = 0b00000011
}

export const enum timerState {
	run,
	stop,
	reset
}