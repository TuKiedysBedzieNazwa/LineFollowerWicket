#include <packetManager.h>




byte encodePacket(messageType type){
	return DEVICE_ID | type;
}

messageType decodePacket(byte packet){
	return ( messageType )( packet & 0b00000111 );
}
