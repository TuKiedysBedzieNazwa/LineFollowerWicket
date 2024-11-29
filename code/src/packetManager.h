#include <Arduino.h>


const byte DEVICE_ID = 0b00000011 << 3;

enum messageType {
	unlock = 0b00000000,
	fireSensor = 0b00000001,
	ping = 0b00000010,
	batteryStatus = 0b00000011,
	lock = 0b00000100,
};

byte encodePacket(messageType type, byte value=0b00000000);

messageType decodePacket(byte packet);
