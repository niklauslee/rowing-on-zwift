# Overview

This project is to connect an inexpensive rowing machine to Zwift using Bluetooth LE to reduce boredom when using a rowing machine at home.

![photo](https://github.com/niklauslee/rowing-on-zwift/blob/main/images/photo.png?raw=true)

# How to sense rowing

This will be slightly different for each rowing machine. The one I use is a copy of a WaterRower product. Here, an LCD monitor that displays speed and distance, and a rotating disk are connected with two wires of JST connector.

The two wires connected to the JST connector are like a switch. A magnet is attached to a position of the disk, and when it turns and comes to the switch position, two wires are connected. Therefore, one switch click occurs every time the disk rotates.

As I know, WaterRower's products have the same principle. It's not exact, but I've seen several magnets attached to it in an article. I think it's necessary to check how many clicks occur when the disk rotates once of your machine.

![assemble](https://github.com/niklauslee/rowing-on-zwift/blob/main/images/assemble.jpg?raw=true)

# How to generate BLE (Bluetooth LE) signal

Zwift requires either cycling power or cycling speed information by default. To send cycling speed information via BLE, we should follow Bluetooth SIG's Cycling Speed and Cadence profile. Here is some articles for this.

- [Adafruit's article](https://learn.adafruit.com/bluetooth-bicycle-speed-cadence-sensor-display-with-clue?view=all)
- [Bluetooth Specifications](https://www.bluetooth.com/specifications/specs/)

Here, a Bluetooth signal will be generated to convert the disk rpm read from the rowing machine into the wheel rpm of the bicycle.

We used a HM-10 bluetooth module which support Bluetooth LE (Low Energy). To be recognized as Cycling Speed and Cadence (CSC) Sensor, we set the HM-10 bluetooth module's service UUID and characteristic UUID to CSC Service and CSC Measurement Characteristics respectively.

When the disk rotates, we record the rotation speed and time, convert it to the bike's wheel rotation speed at an appropriate rate, and then generate a Bluetooth signal every second.

> Calculations that convert the rotation of a rowing machine's disk into rotation of a bicycle wheel are not accurate. This will need to be adjusted to the right proportions for you.

# Components

| Part                   | Quantity | Note   |
| ---------------------- | -------- | ------ |
| Raspberry Pi Pico      | 1        |        |
| JST Connector          | 1        | Female |
| 2xAA Battery Holder    | 1        |        |
| HM-10 Bluetooth Module | 1        |        |

# Circuit

| Pico           | HM-10 | Battery Holder | JST Connector |
| -------------- | ----- | -------------- | ------------- |
| 3V3            | VCC   |                |               |
| VSYS           |       | +              |               |
| GND            | GND   | -              | one           |
| GP2            |       |                | one           |
| GP0 (UART0 TX) | RX    |                |               |
| GP1 (UART0 RX) | TX    |                |               |

![circuit](https://github.com/niklauslee/rowing-on-zwift/blob/main/images/circuit.png?raw=true)

# Usage

Once you have uploaded the program, connect it to the JST connector of your rowing machine and turn on battery power. If the LED of the HM-10 module is blinking, Bluetooth is in adverting mode. Launch the PC or mobile version of Zwift and search for the speed sensor, it will search for "MySpeed" and connect it. Then, strokes on the rowing machine will make the bike move. It seems that it takes some time for the speed to be reflected.

# Comments

- Zwift as well as other Bluetooth CSC Profile based applications will work well.
- We found that not only the rowing machine but also many other indoor cycles operate on the same principle. In other words, when you turn the pedal once, the switch is clicked. It would be interesting to try hacking for this device as well.
