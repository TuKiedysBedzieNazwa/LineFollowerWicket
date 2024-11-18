export const enum messageType {
	unlock = 0b00000000,
	fireSensor = 0b00000001,
	ping = 0b00000010,
	batteryStatus = 0b00000011,
	lock = 0b00000100,
	updateWickets = 0b00000101,
	updateTimer = 0b00000110
}

export const enum timerState {
	run,
	stop,
	reset
}