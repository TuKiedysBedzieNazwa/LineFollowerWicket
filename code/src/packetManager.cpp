#include <packetManager.h>




byte encodePacket(messageType type, byte value){
	return (value << 6) | DEVICE_ID | type;
}

messageType decodePacket(byte packet){
	return ( messageType )( packet & 0b00000111 );
}
