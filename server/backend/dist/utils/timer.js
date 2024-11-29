"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTimestamp = createTimestamp;
exports.startTimer = startTimer;
exports.getTime = getTime;
exports.resetTimer = resetTimer;
exports.stopTimer = stopTimer;
var isRunning = false;
var startTime = 0;
const timestamps = [];
function createTimestamp() {
    timestamps.push(Math.floor(performance.now() - startTime));
}
function startTimer() {
    startTime = Math.floor(performance.now());
    isRunning = true;
}
function getTime() {
    return {
        finishTime: isRunning ? 0 : startTime,
        timestamps: timestamps,
        isRunning: isRunning
    };
}
function resetTimer() {
    startTime = 0;
    isRunning = false;
    timestamps.splice(0, timestamps.length);
}
function stopTimer() {
    startTime = Math.floor(performance.now() - startTime);
    isRunning = false;
    return startTime;
}
