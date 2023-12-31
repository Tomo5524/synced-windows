import { PathMe } from "./path";
import displayText from "./text-effect";

const stats = document.querySelector<HTMLPreElement>(".stats");
const clear = document.querySelector<HTMLButtonElement>(".clear");
const video = document.querySelector<HTMLVideoElement>("video");
const svg = document.querySelector<SVGElement>("svg");
const path = document.querySelector<SVGElement>("svg path");
const messageButton =
  document.querySelector<HTMLButtonElement>(".messageButton");
// const message = document.getElementById("text");

type WindowDetails = {
  screenX: number;
  screenY: number;
  screenWidth: number;
  screenHeight: number;
  width: number;
  height: number;
  updated: number;
};

const bc = new BroadcastChannel("test_channel");

function getScreens(): [string, WindowDetails][] {
  return Object.entries(window.localStorage)
    .filter(([key]) => key.startsWith("screen-"))
    .map(([key, value]: [string, string]) => [
      key,
      JSON.parse(value) as WindowDetails,
    ]);
}
function getScreenId() {
  const existingScreens = Object.keys(window.localStorage)
    .filter((key) => key.startsWith("screen-"))
    .map((key) => parseInt(key.replace("screen-", "")))
    .sort((a, b) => a - b);
  return existingScreens.at(-1)! + 1 || 1;
}
const screenId = `screen-${getScreenId()}`;

function setScreenDetails() {
  const windowDetails = {
    screenX: window.screenX,
    screenY: window.screenY,
    screenWidth: window.screen.availWidth,
    screenHeight: window.screen.availHeight,
    width: window.outerWidth,
    height: window.innerHeight,
    updated: Date.now(),
  };
  window.localStorage.setItem(screenId, JSON.stringify(windowDetails));
  // console.log(windowDetails);
}

function displayStats() {
  if (!stats) return;
  const existingScreens = Object.fromEntries(getScreens());
  stats.innerHTML = JSON.stringify(existingScreens, null, " ");
}

function restart() {
  console.log(timers);
  timers.forEach((timer) => window.clearInterval(timer));
  window.localStorage.clear();
  setTimeout(() => window.location.reload(), Math.random() * 1000);
}

function removeScreen() {
  console.log(`removing screen ${screenId}`);
  localStorage.removeItem(screenId);
}

function removeOld() {
  const screens = getScreens();
  for (const [key, screen] of screens) {
    if (Date.now() - screen.updated > 1000) {
      localStorage.removeItem(key);
    }
  }
}

function makeSVG() {
  const screenPath = new PathMe();
  // Set the SVG viewBox using the screen size
  svg?.setAttribute(
    "viewBox",
    `0 0 ${window.screen.availWidth} ${window.screen.availHeight}`
  );
  svg?.setAttribute("width", `${window.screen.availWidth}px`);
  svg?.setAttribute("height", `${window.screen.availHeight}px`);
  // OFfset it by the window position
  svg?.setAttribute(
    "style",
    `transform: translate(-${window.screenX}px, -${window.screenY}px)`
  );
  // Also apply to video
  video?.setAttribute(
    "style",
    `transform: translate(-${window.screenX}px, -${window.screenY}px)`
  );
  const screens = getScreens();
  screens
    .map(([key, screen]) => {
      const x = screen.screenX + screen.width / 2;
      const y = screen.screenY + screen.height / 2;
      return [key, { ...screen, x, y }];
    })
    .forEach(([_, screen], i) => {
      if (i === 0) {
        screenPath.moveTo(
          (screen as WindowDetails).screenX,
          (screen as WindowDetails).screenY
        );
      } else {
        screenPath.lineTo(
          (screen as WindowDetails).screenX,
          (screen as WindowDetails).screenY
        );
      }
      // if (i === screens.length - 1) {
      // screenPath.lineTo(screens[0][1].x, screens[0][1].y);
      // }
    });

  screenPath.closePath();
  path?.setAttribute("d", screenPath.toString());
}

const timers: ReturnType<typeof setInterval>[] = [];
function go() {
  timers.push(setInterval(setScreenDetails, 10));
  timers.push(setInterval(displayStats, 10));
  timers.push(setInterval(removeOld, 100));
  timers.push(setInterval(makeSVG, 10));
}

function sendMessage() {
  const msg =
    Math.round(Math.random()) === 0
      ? "No I am out of your league"
      : "Yes you are love of my life";
  bc.postMessage(msg);
}

bc.onmessage = function (e) {
  console.log("🚀 ~ file: main.ts:146 ~ e", e);
  displayText([e.data], "text", ["tomato", "rebeccapurple", "lightblue"]);
  // messageBox!.innerHTML = e.data;
};

clear?.addEventListener("click", restart);
messageButton?.addEventListener("click", sendMessage);
window.addEventListener("beforeunload", () => {
  removeScreen();
  bc.close();
});

function populateWebcam() {
  console.log("fired 🔥");
  navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
    if (!video) return;
    video.width = window.screen.availWidth;
    video.height = window.screen.availHeight;
    video.srcObject = stream;
    video.play();
  });
}

go();

populateWebcam();
