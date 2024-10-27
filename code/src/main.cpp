#include <Arduino.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SH110X.h>
#include <ESP8266WiFi.h>


#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 128
Adafruit_SH1107 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);
WiFiClient tcpSocket;


const char ssid[18] = "HUAWEI-E5186-74C8";
const char pass[12] = "Q2JQF143707";
const char tcpSocketIp[14] = "192.168.8.120";
const unsigned short int tcpSocketPort = 8080;

unsigned short int sensorVal = 0;
unsigned long long int timer = 0;

bool isLoading = true;
bool isConnectedToWifi = false;
bool isConnectedToTcpSocket = false;


const byte deviceId = 0b00000001 << 3;
enum messageType {
	reset = 0b00000000,
	fireSensor = 0b00000001,
	ping = 0b00000010
};
byte encodePacket(messageType type){
	return deviceId | type;
}
messageType decodePacket(byte packet){
	return ( messageType )( packet ^ deviceId );
}


void timedTasks(){
	isConnectedToWifi = WiFi.isConnected();
	isConnectedToTcpSocket = tcpSocket.connected();

	if(!isConnectedToWifi || !isConnectedToTcpSocket)
		isLoading = true;
}

void displayData(){
	display.clearDisplay();

	display.setCursor(0,0);
	display.print("analog: ");
	display.println(analogRead(A0));
	display.print("ip: ");
	display.println(WiFi.localIP());
	display.print("gateway: ");
	display.println(WiFi.gatewayIP());
	display.print("socket con/ava: ");
	display.print(tcpSocket.connected());
	display.println(tcpSocket.available());
	display.print("time: ");
	display.println((int)timer / 1000);
	display.print("tcp socket read: ");
	display.println(tcpSocket.read());

	display.display();
}

void loading(){
	display.clearDisplay();

	display.setCursor(0,0);
	display.println("loading ...");
	display.println("Tasks to Do: ");

	if(isConnectedToWifi && isConnectedToTcpSocket)
		isLoading = false;
	if(!isConnectedToWifi)
		display.println("- wifi");
	if(!isConnectedToTcpSocket){
		display.println("- tcp socket");
		tcpSocket.connect(tcpSocketIp, tcpSocketPort);
		tcpSocket.setNoDelay(true);
	}

	display.display();
	delay(2000);
}

void tcpSocketHandler(){
	if(!isConnectedToTcpSocket) return;

	if(tcpSocket.available()){ }
}


void setup(){
	Serial.begin(115200);
	Wire.begin(2, 14);
	display.begin();
	display.setTextSize(1);
	display.setTextColor(SH110X_WHITE);

	pinMode(A0, INPUT);

	WiFi.mode(WIFI_STA);
	WiFi.begin(ssid, pass);
	tcpSocket.connect(tcpSocketIp, tcpSocketPort);
	tcpSocket.setNoDelay(true);
}

void loop(){
	timer = millis();

	sensorVal = analogRead(A0);
	if(sensorVal > 200){
		if (isConnectedToTcpSocket){
			tcpSocket.write(encodePacket(messageType::fireSensor));
		}
	}

	tcpSocketHandler();

	// if(timer % 2 == 0){
	timedTasks();
	if(isLoading) loading();
	else displayData();
	// }
}