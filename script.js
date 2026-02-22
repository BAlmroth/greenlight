const wheelEl = document.getElementById("wheel");

let greenChance = 0.2;
let currentDeg = 0;
let spinning = false;

//dumb quotes to insert in results box with random interval and colors when you lose
const lossQuotes = [
  "Maybe you should give up",
  "So close!... kidding",
  "Green really does not like you",
  "Are you ok?",
  "Why are you still playing?",
  "Give up",
  "The wheel is mocking you",
  "You are not good at this",
  "I feel bad for you",
  "HAHAHAHAHAHAHAH"
];
//quotes when you win
const winQuotes = [
  "FINNALY",
  "Are you still consious?",
  "Luck is in the air!",
  "You must be a green thumb!",
  "The wheel loves you today!",
  "WOW, you are not worthlessa after all!",
];



function updateWheel() {
  const greenDeg = greenChance * 360;
  wheelEl.style.background = `conic-gradient( #33a563 0deg ${greenDeg}deg, #c52d2d ${greenDeg}deg 360deg)`;
}

updateWheel();
wheelEl.style.setProperty("--rot", "0deg");

function spin() {
  if (spinning) return;
  spinning = true;
  document.getElementById("spinBtn").disabled = true;

  const duration = 500;
  const isWin = Math.random() < greenChance;
  const greenDeg = greenChance * 360;

  let targetDeg;
  if (isWin) {
    targetDeg = Math.random() * greenDeg;
  } else {
    targetDeg = greenDeg + Math.random() * (360 - greenDeg);
  }

  const targetRot = 360 - targetDeg;
  const extraSpins = (5 + Math.floor(Math.random() * 4)) * 360;
  const currentMod = ((currentDeg % 360) + 360) % 360;
  let diff = targetRot - currentMod;
  if (diff <= 0) diff += 360;

  const totalDelta = extraSpins + diff;
  const startDeg = currentDeg;
  const startTime = performance.now();

  function easeOut(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function animate(now) {
    const t = Math.min((now - startTime) / duration, 1);
    currentDeg = startDeg + totalDelta * easeOut(t);
    wheelEl.style.setProperty("--rot", currentDeg + "deg");

    if (t < 1) {
      requestAnimationFrame(animate);
    } else {
      spinning = false;
      document.getElementById("spinBtn").disabled = false;
      onResult(isWin);
    }
  }

  requestAnimationFrame(animate);
}

let money = 0;
let moneyAmount = 0.01;
let chanceUpgradeCost = 0.01;
let prizeUpgradeCost = 0.01;

function onResult(isWin) {
  const box = document.getElementById("result");

 // show result
  const row = document.createElement("div");
  row.className = "result-row " + (isWin ? "win" : "loss");
  row.textContent = isWin ? "GREEN" : "RED";
  box.append(row);

  // random quote
  if (Math.random() < 0.2) {
    const quotes = isWin ? winQuotes : lossQuotes;
    const quote = quotes[Math.floor(Math.random() * quotes.length)];
    const colors = ["#f0a500", "#a855f7", "#3b82f6", "#ec4899", "#14b8a6", "#f97316"];

    const quoteRow = document.createElement("div");
    quoteRow.className = "result-row quote";
    quoteRow.textContent = `"${quote}"`;
    quoteRow.style.color = colors[Math.floor(Math.random() * colors.length)];
    box.append(quoteRow);
  }

  box.scrollTop = box.scrollHeight; //automatically scrolls the result box to the bottom after a new result is added

  const rows = box.querySelectorAll(".result-row");
  if (rows.length > 20) rows[0].remove();

  if (isWin) {
    money += moneyAmount;
    updateMoneyDisplay();
  }
}

// UPDATE UI
function updateMoneyDisplay() {
  document.getElementById("money").textContent = "Money: $" + money.toFixed(2);
  updateShopButtons();
}

function updateShopButtons() {
  document.querySelector('[data-upgrade="chance"]').disabled =
    money < chanceUpgradeCost;
  document.querySelector('[data-upgrade="prize"]').disabled =
    money < prizeUpgradeCost;
}
function updateShopPrices() {
  document.getElementById("chanceCost").textContent =
    "Cost: $" + chanceUpgradeCost.toFixed(2);
  document.getElementById("prizeCost").textContent =
    "Cost: $" + prizeUpgradeCost.toFixed(2);
}

// BUY UPGRADES
function buyUpgrade(type) {
  if (type === "chance" && money >= chanceUpgradeCost) {
    greenChance = Math.min(greenChance + 0.05, 1);
    document.getElementById("greenProcent").textContent =
      Math.round(greenChance * 100) + "%";
    money -= chanceUpgradeCost;
    chanceUpgradeCost *= 10; //upgrade price cost after purchase by x10
    updateWheel();
    updateMoneyDisplay();
    updateShopPrices();
  } else if (type === "prize" && money >= prizeUpgradeCost) {
    moneyAmount += 0.01;
    money -= prizeUpgradeCost;
    prizeUpgradeCost *= 10; //upgrade price cost after purchase
    updateMoneyDisplay(); //update how much money you have
    updateShopPrices(); //update prices of upgrades
  }
}

// Event listeners
document.getElementById("spinBtn").addEventListener("click", spin);

document.getElementById("upgrades").addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  buyUpgrade(btn.dataset.upgrade);
});

updateShopButtons();
updateShopPrices();
