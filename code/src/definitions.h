#include <Adafruit_SSD1306.h>
#include <ESP8266WiFi.h>


#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 32
Adafruit_SSD1306 DEVICE_DISPLAY(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);

WiFiClient TCP_SOCKET;

// const char WIFI_SSID[18] = "HUAWEI-E5186-74C8";
// const char WIFI_PASSWORD[12] = "Q2JQF143707";

// const char TCP_SOCKET_IP[14] = "192.168.8.120";


const char WIFI_SSID[13] = "Cheeseburger";
const char WIFI_PASSWORD[24] = "HasloOMocyBombyAtomowej";

const char TCP_SOCKET_IP[9] = "10.0.0.1";


const unsigned short int TCP_SOCKET_PORT = 8080;
