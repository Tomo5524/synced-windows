export default function displayText(
  words: string[],
  id: string,
  colors: string[] | undefined = ["#fff"]
): void {
  let letterCount = 1;
  let x = 1;
  let waiting = false;
  const target = document.getElementById(id) as HTMLElement;
  target.setAttribute("style", "color:" + colors[0]);

  window.setInterval(function () {
    if (letterCount === 0 && waiting === false) {
      waiting = true;
      target.innerHTML = words[0].substring(0, letterCount);

      window.setTimeout(function () {
        const usedColor = colors.shift();
        colors.push(usedColor as string);
        const usedWord = words.shift();
        words.push(usedWord as string);
        x = 1;
        target.setAttribute("style", "color:" + colors[0]);
        letterCount += x;
        waiting = false;
      }, 1000);
    } else if (letterCount === words[0].length + 1 && waiting === false) {
      waiting = true;
      window.setTimeout(function () {
        x = -1;
        letterCount += x;
        waiting = false;
      }, 1000);
    } else if (waiting === false) {
      target.innerHTML = words[0].substring(0, letterCount);
      letterCount += x;
    }
  }, 120);
}
