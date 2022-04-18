const BLE_NAME = 'MySpeed';
const BLE_INTERVAL = 1000;
const BLE_SERVICE = '0x1816';
const BLE_CHARACTERISTIC = '0x2A5B';

const CSC_SPEED_MIN = 1;  // kph
const CSC_SPEED_MAX = 70; // kph
const CSC_GEAR_RATIO = 3; // Set your gear-ratio
const CSC_WHEEL_CIRCUM = 2000;

// Create an UART instance
const {UART} = require('uart');
const serial = new UART(0, {baudrate: 9600});
const pin = 2; // pin for wheel sensor

let buffer = '';
let timer = null;
let watcher = null;
let revs = 0; // crank revs
let wheel_revs = 0;
let time = 0;
let delta = 0;
let speed = 0;
let t0 = millis();
let t1 = t0;

pinMode(pin, INPUT_PULLUP);

function send(revs, time) {
  let val = new Uint8Array(7);
  val[0] = 0x01;
  val[1] = revs & 0xFF;
  val[2] = (revs >> 8) & 0xFF;
  val[3] = (revs >> 16) & 0xFF;
  val[4] = (revs >> 24) & 0xFF;
  val[5] = (time) & 0xFF;
  val[6] = (time >> 8) & 0xFF;
  serial.write(val);
}

// previous revs
let _revs = revs;

function start() {
  // Watch crank revolutions
  watcher = setWatch(() => {
    t1 = millis();
    delta = t1 - t0;
    speed = (CSC_WHEEL_CIRCUM * CSC_GEAR_RATIO * 36) / (delta * 10);
    t0 = t1;
    if (speed >= CSC_SPEED_MIN && speed <= CSC_SPEED_MAX) {
      revs++;
      time = Math.round(((time + delta) * 1024) / 1000) & 0xFFFF;
      wheel_revs += CSC_GEAR_RATIO;
    }
  }, pin, FALLING, 10);
  // Send BLE signal
  timer = setInterval(() => {
    if (revs > _revs) {
      send(Math.round(wheel_revs), time);
      _revs = revs;
      console.log(`speed=${speed.toFixed(1)}, wheel_revs=${wheel_revs}, time=${time}`);
    }
  }, BLE_INTERVAL);
}

function stop() {
  if (watcher) { 
    clearWatch(watcher);
    watcher = null;
  }
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

serial.on('data', (data) => {
  var s = String.fromCharCode.apply(null, data);
  buffer += s;
  if (buffer.includes('OK+CONN')) {
    console.log('Connected.');
    start();
    buffer = '';
  } else if (buffer.includes('OK+LOST')) {
    console.log('Disconnected.');
    console.log('Advertising...');
    stop();
    buffer = '';
  }
});

function wait (t) {
  return new Promise((resolve) => setTimeout(resolve, t));
}

async function main () {
  console.log('Initializing...');
  serial.write(`AT+NAME${BLE_NAME}\r\n`);
  await wait(500);
  serial.write(`AT+UUID${BLE_SERVICE}\r\n`);
  await wait(500);
  serial.write(`AT+CHAR${BLE_CHARACTERISTIC}\r\n`);
  await wait(500);
  serial.write(`AT+RESET\r\n`);
  console.log('Advertising...');
}

main();
