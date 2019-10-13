import iro from "@jaames/iro";
import axios from "axios";
import * as config from "../webpack.config.js";

const defaultChannels = 4;
const defaultSync = false;
const defaultSetImmediate = false;
const remote = ".";
//const remote = 'http://192.168.178.123:7777';

let channelCountSlider: HTMLInputElement;
let pickerSyncCheckbox: HTMLInputElement;
let fadeSpeedSlider: HTMLInputElement;
let setImmediateCheckBox: HTMLInputElement;
let setChannelsButton: HTMLButtonElement;

let channelCountValue: HTMLElement;
let fadeSpeedValue: HTMLElement;
let pickersDOM: HTMLElement;
let pickers: iro.ColorPicker[];

const channelCount = function(): number {
  return Number(channelCountSlider.value)
}

const fadeSpeed = function(): number {
  const mapLog = function(position: number, max: number, scale: number): number {
    return Math.floor(scale * Math.pow(position, 5) / Math.pow(max, 5));
  }
  return mapLog(Number(fadeSpeedSlider.value), 100, 65536);
}

const pickerSynced = function(): boolean {
  return pickerSyncCheckbox.checked;
}

const setImmediate = function(): boolean {
  return setImmediateCheckBox.checked;
}

const updateChannelCountValue = function(): void {
  channelCountValue.innerHTML = channelCount().toString();
}

const updateFadeSpeedValue = function(): void {
  fadeSpeedValue.innerHTML = fadeSpeed().toString();
}

const setChannelsRemote = function(): void {
  const params: any = {};
  pickers.forEach(function(ipicker: iro.ColorPicker): void {
    let {r,g,b} = ipicker.color.rgb;
    console.log(ipicker);
    let id = Number(ipicker.id.split('picker_')[1]);
    params[ id*3 ] = r;
    params[ id*3 + 1 ] = g;
    params[ id*3 + 2 ] = b;
  });

  axios.get(`${remote}/set`,
    {
      params: params
    }
  ).then(function (response) {

  }).catch(function (error) {

  })
}

const getChannelsRemote = function(): void {
  axios.get(`${remote}/get`).then(function(response) {
    let data = response.data.current;
    pickers.forEach(function(picker: iro.ColorPicker): void {
      let id = Number(picker.id.split("_")[1])
      let r = data[ id*3 ];
      let g = data[ id*3 + 1 ];
      let b = data[ id*3 + 2 ];
      console.log(r,g,b);
      picker.color.rgb = { r, g, b};
    })
  });
}

const onPickerColorChange = function(picker: iro.ColorPicker, color: iro.Color): void {
  if (pickerSynced()) {
    pickers.forEach(function(ipicker: iro.ColorPicker): void {
      if (ipicker !== picker) {
        ipicker.color.hexString = color.hexString;
      }
    })
  }
  if (setImmediate()) {
    setChannelsRemote();
  }
}

const setupPicker = function(id: string): iro.ColorPicker {
  const colorPicker = new iro.ColorPicker(`#${id}`, { id: id });
  colorPicker.on('color:change',  function(color: iro.Color): void {
    onPickerColorChange(colorPicker, color);
  });
  return colorPicker;
}

const updateDOMPicker = function(): void {
  while(pickersDOM.firstChild) {
    pickersDOM.firstChild.remove();
  }
  pickers = [];

  for (let i = 0; i < channelCount(); i++) {
    let picker = document.createElement("div");
    const id = `picker_${i}`;
    picker.id = id;
    picker.className = "picker";
    pickersDOM.appendChild(picker);
    pickers.push(setupPicker(id));
  }
}

const onChannelCountChange = function(): void {
    updateChannelCountValue();
    updateDOMPicker();
}

const onFadeSpeedSlider = function(): void {
  updateFadeSpeedValue();


  axios.get(`${remote}/fade`,
    {
      params: {
        speed: fadeSpeed(),
      }
    }
  ).then(function (response) {

  }).catch(function (error) {

  })
}

const onSyncCheckboxChange = function(): void {
  console.log("Pickers synched", pickerSynced());
}

const init = function(): void {
  channelCountSlider = <HTMLInputElement>document.getElementById("channelCountSlider")!;
  pickerSyncCheckbox = <HTMLInputElement>document.getElementById("pickerSyncCheckbox")!;
  fadeSpeedSlider    = <HTMLInputElement>document.getElementById("fadeSpeedSlider")!;
  setImmediateCheckBox = <HTMLInputElement>document.getElementById("setImmediateCheckbox")!;
  setChannelsButton = <HTMLButtonElement>document.getElementById("setChannelsButton")!;

  channelCountValue = document.getElementById("channelCountValue")!;
  fadeSpeedValue = document.getElementById("fadeSpeedValue")!;
  pickersDOM = document.getElementById("pickers")!;

  channelCountSlider.value = defaultChannels.toString();
  channelCountSlider.oninput = onChannelCountChange;

  pickerSyncCheckbox.checked = defaultSync;
  pickerSyncCheckbox.oninput = onSyncCheckboxChange;

  setImmediateCheckBox.checked = defaultSetImmediate;

  fadeSpeedSlider.value = '0';
  fadeSpeedSlider.oninput = onFadeSpeedSlider;

  setChannelsButton.onclick = setChannelsRemote;

  onChannelCountChange();
  onFadeSpeedSlider();
  getChannelsRemote();
}

window.onload = function(): void {
  init();
}