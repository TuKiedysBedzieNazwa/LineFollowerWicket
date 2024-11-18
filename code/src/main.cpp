#include <Arduino.h>
#include <Wire.h>

#include <packetManager.h>
#include <definitions.h>


unsigned short int sensorVal = 0;
unsigned long long int timer = 0;

bool isLoading = true;
bool isConnectedToWifi = false;
bool isConnectedToTcpSocket = false;
bool isLocked = true;


void timedTasks(){
	isConnectedToWifi = WiFi.isConnected();
	isConnectedToTcpSocket = TCP_SOCKET.connected();

	if(!isConnectedToWifi || !isConnectedToTcpSocket)
		isLoading = true;
}

void displayData(){
	DEVICE_DISPLAY.clearDisplay();
	DEVICE_DISPLAY.setCursor(0,0);

	DEVICE_DISPLAY.print("ip: ");
	DEVICE_DISPLAY.println(WiFi.localIP());
	DEVICE_DISPLAY.print("id: ");
	DEVICE_DISPLAY.println(DEVICE_ID >> 3);

	if(isLocked){
		DEVICE_DISPLAY.println("Device is locked");
	}
	else {
		DEVICE_DISPLAY.print("analog: ");
		DEVICE_DISPLAY.println(analogRead(A0));
	}

	DEVICE_DISPLAY.display();
}

void loading(){
	DEVICE_DISPLAY.clearDisplay();

	DEVICE_DISPLAY.setCursor(0,0);
	DEVICE_DISPLAY.println("Loading, Tasks to Do:");

	if(isConnectedToWifi && isConnectedToTcpSocket)
		isLoading = false;

	if(!isConnectedToWifi)
		DEVICE_DISPLAY.println("- wifi");

	if(isConnectedToWifi && !isConnectedToTcpSocket){
		DEVICE_DISPLAY.println("- tcp socket");
		TCP_SOCKET.connect(TCP_SOCKET_IP, TCP_SOCKET_PORT);
		TCP_SOCKET.setNoDelay(true);
	}

	if(isConnectedToTcpSocket)
		TCP_SOCKET.write(encodePacket(messageType::ping));

	DEVICE_DISPLAY.display();
	delay(1000);
}

void tcpSocketHandler(){
	if(!isConnectedToTcpSocket) return;

	if(TCP_SOCKET.available()){
		switch(decodePacket(TCP_SOCKET.read())){
			case messageType::lock:
				isLocked = true;
			break;
			case messageType::unlock:
				isLocked = false;
			break;
		}
	}
}


void setup(){
	Serial.begin(115200);
	Wire.begin(2, 14);
	DEVICE_DISPLAY.begin();
	DEVICE_DISPLAY.setTextSize(1);
	DEVICE_DISPLAY.setTextColor(SSD1306_WHITE);

	pinMode(A0, INPUT);

	WiFi.mode(WIFI_STA);
	WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
	TCP_SOCKET.connect(TCP_SOCKET_IP, TCP_SOCKET_PORT);
	TCP_SOCKET.setNoDelay(true);

	pinMode(10, INPUT);
	pinMode(12, OUTPUT);
	pinMode(13, OUTPUT);
}

void loop(){
	timer = millis();

	if(!isLocked){

		sensorVal = analogRead(A0);
		if(sensorVal > 700){
			digitalWrite(12, LOW);
			digitalWrite(13, LOW);

			if (isConnectedToTcpSocket){
				TCP_SOCKET.write(encodePacket(messageType::fireSensor));
				isLocked = true;
			}
		}
	}
	else{
		digitalWrite(12, HIGH);
		digitalWrite(13, HIGH);
	}

	tcpSocketHandler();

	if(timer % 10 == 0){
		timedTasks();

		if(isLoading)
			loading();
		else
			displayData();
	}
}