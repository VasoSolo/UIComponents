import logo from "./logo.svg";
import "./App.css";
import BarD3 from "./Components/HorizontalChart/HorizontalChart";
import { color } from "d3";

const data = [
  { platform: "TG16", count: 2 },
  { platform: "PSP", count: 1213 },
  { platform: "2600", count: 133 },
  { platform: "PS4", count: 336 },
  { platform: "N64", count: 319 },
  { platform: "GBA", count: 822 },
  { platform: "GG", count: 1 },
  { platform: "PSV", count: 411 },
  { platform: "XB", count: 824 },
  { platform: "DC", count: 52 },
  { platform: "XOne", count: 213 },
  { platform: "PS2", count: 2161 },
  { platform: "Wii", count: 1325 },
  { platform: "X360", count: 1265 },
  { platform: "WiiU", count: 143 },
  { platform: "PC", count: 960 },
  { platform: "DS", count: 2162 },
  { platform: "WS", count: 6 },
  { platform: "PCFX", count: 1 },
  { platform: "PS3", count: 1329 },
  { platform: "GEN", count: 27 },
  { platform: "SNES", count: 239 },
  { platform: "NG", count: 12 },
  { platform: "GB", count: 98 },
  { platform: "PS", count: 1196 },
  { platform: "SCD", count: 6 },
  { platform: "3DS", count: 509 },
  { platform: "3DO", count: 3 },
  { platform: "NES", count: 98 },
  { platform: "SAT", count: 173 },
  { platform: "GC", count: 556 },
];
//console.log("data", data);
const props = {
  color: "green",
  data: data,
  height: 700,
  width: 1000,
  cols: ["platform"],
  metrics: ["count"],
  hoverColor: "red",
  mainColor: "blue",
};

function App() {
  return (
    <div className="App">
      <BarD3 {...props}></BarD3>
    </div>
  );
}

export default App;
