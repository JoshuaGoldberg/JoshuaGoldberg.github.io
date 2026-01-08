let totalPoints = 0;
let pps = 0;
let secretActivated = false;
let lifetimePoints = 0;
let clickMulti = 100000;
const profileImage = document.querySelector(".profile-image");
const pointsDisplay = document.getElementById("points-d");
const proofsDisplay = document.getElementById("proofs-d");
const ppsDisplay = document.getElementById("pps");
const prpsDisplay = document.getElementById("prps");
const secretImage = document.querySelector(".secret-image");

let proofBonus = 1;
let totalProofs = 0;
let proofsps = 0;
let lifetimeProofs = 0;
let totalClicks = 0;

let errorPopup = 0;

// alternate search pattern
const pointsElement = document.getElementById("points");
const proofsElement = document.getElementById("proofs");
const pointspsElement = document.getElementById("pointsps");
const proofspsElement = document.getElementById("proofsps");

const mainBox = document.getElementById("main-box");

function updatePoints(amount) {
  totalPoints += amount;
  pointsElement.textContent = Math.floor(totalPoints).toString();
}

function updateProofs(amount) {
  totalProofs += amount;
  proofsElement.textContent = Math.floor(totalProofs).toString();
}

function updatePointsps(amount) {
  pointspsElement.textContent = (Math.round(amount * 100) / 100).toString();
}

function updateProofsps(amount) {
  proofspsElement.textContent = (Math.round(amount * 100) / 100).toString();
}

class GameInteractable {
  constructor(name, tooltipText, icon) {
    this.name = name;
    this.tooltipText = tooltipText;
    this.icon = icon;
    this.button = null;
    this.disabled = false;
  }

  createButton() {
    this.button = document.createElement("button");
    this.button.classList.add("side-button", "clickable-small");
  }

  reveal() {
    this.button.classList.add("show");
  }

  removeFromArray(array) {
    const index = array.indexOf(this);
    if (index > -1) {
      array.splice(index, 1);
    }
  }

  remove() {
    this.button.style.display = "none";
  }
}

class Unit extends GameInteractable {
  constructor(name, tooltipText, icon, baseCost, ppsGain, proofGain = 0) {
    super(name, tooltipText, icon);
    this.currentCost = baseCost;
    this.ppsGain = ppsGain;
    this.owned = 0;
    this.costField = null;
    this.ownedLine = null;
    this.iconField = null;
    this.proofGain = proofGain;
  }

  revealUnit(container) {
    if (!this.disabled) {
      this.createButton(container);
      this.reveal();
      this.disabled = true;
    }
  }

  createButton(container) {
    super.createButton();

    const fullText = document.createElement("div");
    fullText.classList.add("right-side-text");

    const nameSpan = document.createElement("span");
    nameSpan.textContent = this.name;

    this.costField = document.createElement("span");
    this.costField.textContent = this.currentCost;

    fullText.appendChild(nameSpan);
    fullText.appendChild(document.createTextNode(" : "));
    fullText.appendChild(this.costField);
    fullText.appendChild(document.createTextNode(" points"));
    this.button.appendChild(fullText);

    this.ownedLine = document.createElement("div");
    this.ownedLine.style.textAlign = "center";
    this.ownedLine.style.marginTop = "12px";
    this.ownedLine.textContent = "Currently Employed: " + this.owned;
    this.button.appendChild(this.ownedLine);

    this.iconField = document.createElement("span");
    this.iconField.textContent = this.icon;

    this.iconField.style.position = "absolute";
    this.iconField.style.left = "5%";
    this.iconField.style.top = "10px";
    this.iconField.style.fontSize = "2.5rem";
    this.button.appendChild(this.iconField);

    const tooltipSpan = document.createElement("span");
    tooltipSpan.classList.add("tooltiptext");
    tooltipSpan.textContent = this.tooltipText;

    if (this.proofGain > 0) {
      this.button.classList.add("proof");
      tooltipSpan.classList.add("proof");
    }

    this.button.appendChild(tooltipSpan);
    const lockedAudio = new Audio("/assets/locked.wav");

    this.button.addEventListener("click", () => this.purchase(lockedAudio));
    container.appendChild(this.button);
  }

  changeIcon(icon) {
    this.iconField.textContent = icon;
  }

  purchase(lockedAudio) {
    if (totalPoints >= this.currentCost) {
      if (this.proofGain > 0) {
        proofsDisplay.classList.add("show");
        prpsDisplay.classList.add("show");
      }

      updatePoints(-this.currentCost);
      this.currentCost = Math.floor(this.currentCost * 1.1);
      this.owned++;
      this.ownedLine.textContent = "Currently Employed: " + this.owned;
      this.costField.textContent = this.currentCost;

      const audio = new Audio("/assets/click.wav");
      audio.play();
    } else {
      lockedAudio.play();
      this.button.classList.add("locked-move-1");

      setTimeout(() => {
        this.button.classList.add("locked-move-2");

        setTimeout(() => {
          this.button.classList.remove("locked-move-1");
          this.button.classList.remove("locked-move-2");
        }, 30);
      }, 30);
    }
  }
}

class Upgrade extends GameInteractable {
  constructor(name, tooltipText, icon, cost, effect, proof = false) {
    super(name, tooltipText, icon);
    this.cost = cost;
    this.effect = effect;
    this.proof = proof;
  }

  createButton(container) {
    super.createButton();

    const fullText = document.createElement("div");
    fullText.classList.add("left-side-text");

    const nameSpan = document.createElement("span");

    nameSpan.textContent = this.name;
    nameSpan.classList.add("left-side");

    const costSpan = document.createElement("span");
    costSpan.textContent = this.cost;

    fullText.appendChild(nameSpan);
    fullText.appendChild(document.createTextNode(" : "));
    fullText.appendChild(costSpan);
    fullText.appendChild(document.createTextNode(" points"));

    this.button.appendChild(fullText);

    const iconSpan = document.createElement("span");
    iconSpan.textContent = this.icon;
    iconSpan.style.position = "absolute";
    iconSpan.style.right = "5%";
    iconSpan.style.fontSize = "2.0rem";
    iconSpan.style.top = "0";

    this.button.appendChild(iconSpan);

    const tooltipSpan = document.createElement("span");
    tooltipSpan.classList.add("tooltiptext");
    tooltipSpan.textContent = this.tooltipText;
    this.button.appendChild(tooltipSpan);
    const lockedAudio = new Audio("/assets/locked.wav");

    this.button.addEventListener("click", () => {
      if (totalPoints >= this.cost && !this.disabled) {
        this.disabled = true;
        totalPoints -= this.cost;
        this.button.classList.remove("show");
        this.effect();
        this.button.classList.add("leave-left");
        this.button.addEventListener("animationend", () => {
          this.remove();
        });

        const audio = new Audio("/assets/upgrade-buy.wav");
        audio.volume = 0.35;
        audio.play();
      } else {
        lockedAudio.play();
        setTimeout(() => {
          this.button.classList.add("locked-move-2");

          setTimeout(() => {
            this.button.classList.remove("locked-move-1");
            this.button.classList.remove("locked-move-2");
          }, 30);
        }, 30);
      }
    });

    if (this.proof) {
      this.button.classList.add("proof");
      tooltipSpan.classList.add("proof");
    }

    container.appendChild(this.button);
  }

  init(component, array) {
    if (array.indexOf(this) > -1) {
      this.createButton(component);
      this.reveal();
      this.removeFromArray(array);
      if (this.proof) {
        upgradeBox.classList.add("compress");
        researchUpgradeBox.classList.add("compress");
        researchUpgradeBox.classList.add("show");
      }
    }
  }
}

profileImage.addEventListener("click", () => {
  if (secretActivated) {
    updatePoints(clickMulti);
    lifetimePoints += clickMulti;
    totalClicks += 1;

    profileImage.classList.remove("jiggle", "jiggle-alt");

    requestAnimationFrame(() => {
      const randomAnim = Math.floor(Math.random() * 2);
      profileImage.classList.add(randomAnim === 0 ? "jiggle" : "jiggle-alt");
    });

    const audio = new Audio("/assets/click.wav");
    audio.play();
  }
});

const can = document.querySelector(".cool-can");
const bottle = document.querySelector(".cool-soda");

const upgradeBox = document.getElementById("upgrades");
const researchUpgradeBox = document.getElementById("research-upgrades");

const unitBox = document.getElementById("workers");
const researchBox = document.getElementById("researchers");

const frontPage = document.querySelector(".front-page-body");

// units
const unit0 = new Unit(
  "Student Helper",
  "Ready to put their coding skills to use. Sadly classes make them much less productive. Grants 0.1 points/s at base.",
  "🙂",
  25,
  0.1
);
const unit1 = new Unit(
  "College Intern",
  "An aspiring CS student getting their first taste of the real world. As a result, they're cheap labor. Grants 1 point/s at base.",
  "🙂",
  120,
  1
);
const unit2 = new Unit(
  "Entry Level Programmer",
  "Fresh out of university, frankly just happy to have a job. Grants 15 point/s at base.",
  "🙂",
  1500,
  15
);
const unit3 = new Unit(
  "Research Assistant",
  "Working on proofs all day can hurt the brain, but it is fairly rewarding. One can only work in Rocq for so long though. Grants 1 point/s at base, as well as proof progress at 0.01/s at base.",
  "🙂",
  2000,
  1,
  0.01
);
const unit4 = new Unit(
  "Graduate Student",
  "All that undergrad research paid off, and it's time for the real deal! We can check back on them in 5 - 8 years. Grants 25 points/s at base, as well as proof progress at 0.1/s at base.",
  "🧑‍🎓",
  15000,
  25,
  0.1
);
const unit5 = new Unit(
  "Post Doctorate",
  "It's quite the accomplishment to earn a PhD. Now it's time for the next chapter in their life, which is of course earning you lots and lots of points. Grants 50 points/s at base, as well as proof progress at 0.5/s at base.",
  "🧑‍🎓",
  100000,
  50,
  0.5
);
const unit6 = new Unit(
  "Developer",
  "A hard (perhaps overworked) worker in the industry. Their true passion, however, is secretly opera singing. Grants 100 points/s at base.",
  "🧑‍💻",
  15000,
  100
);
const unit7 = new Unit(
  "Senior Developer",
  "A veteran of the industry. They've seen almost every type of problem within their codebase, and still live to tell the tale." +
    " Also tends to play lots of Runescape when nobody is looking. Grants 750 points/s at base.",
  "🧑‍💻",
  120000,
  750
);

const unit8 = new Unit(
  "Research Professor",
  "Seemingly the final form of a Post Doctorate. The end of a multi year journey finally comes to fruition." +
    " Now they get to worry about the important things in life, like staff meetings and RMP scores! Grants 200 points/s at base, as well as proof progress at 4/s at base.",
  "🧑‍🏫",
  750000,
  200,
  4
);

const unit9 = new Unit(
  "Tech CEO",
  "Truth be told, they don't seem to do any work at all. But they'll hire developers and claim credit for the work. Hey, points are points, right? Grants 5000 points/s at base.",
  "🤑",
  1000000,
  5000
);

const unit10 = new Unit(
  "Generative AI Agent",
  "Hands over all code development to our new generative AI, ClaudeGPT 5.0! Surely nothing bad would ever happen. Grants ∞ points/s at base.",
  "🤖",
  10000000,
  0
);

// initialize units
const unitArray = [
  unit0,
  unit1,
  unit2,
  unit3,
  unit4,
  unit5,
  unit6,
  unit7,
  unit8,
  unit9,
  unit10,
];

// upgrades
const upgradeInitial = new Upgrade(
  "Free Cookie",
  "You found the secret cookie! Click on the picture of me to get points. Take this extra cookie as well, on the house.",
  "🍪️",
  0,
  () => {
    totalPoints += 1;
  }
);

const upgrade0 = new Upgrade(
  "Online Classes",
  "Allows students to leverage a lighter course load, doubling their points per second.",
  "🖥️",
  100,
  () => {
    unit0.ppsGain *= 2;
    unit0.changeIcon("😎");
  }
);
const upgrade1 = new Upgrade(
  "Caffeinated Drinks",
  "Allows you to click faster and longer (Just don't overdo it). Doubles points per click.",
  "☕",
  125,
  () => {
    clickMulti *= 2;
    can.classList.add("show");
    bottle.classList.add("show");
  }
);
const upgrade2 = new Upgrade(
  "80 hour work weeks",
  "It turns out the interns will just work longer if you ask them to. Unethical? Yes, but it makes money. Doubles the production for College Interns.",
  "⏰",
  250,
  () => {
    unit1.ppsGain *= 2;
    unit1.changeIcon("😢");
  }
);
const upgrade3 = new Upgrade(
  "Wollaston's Sandwich",
  "Northeastern's pride and joy, as well as the key to productivity. Doubles points per click.",
  "🥪",
  500,
  () => {
    clickMulti *= 2;
  }
);
const upgrade4 = new Upgrade(
  "Recreation Rooms",
  "A chance to unwind is perfect for increasing overall productivity, and in this case it doubles the production of Entry Level Programmers!",
  "🏓",
  5000,
  () => {
    unit2.ppsGain *= 2;
  }
);
const upgrade5 = new Upgrade(
  "Corporate Pizza Party",
  "Pizza for the whole office! Except the office was expecting pay raises. Better luck next time! Boosts point production for" +
    " College Interns and Entry Level Programmers by 1.1x",
  "🍕",
  10000,
  () => {
    unit2.ppsGain *= 1.1;
    unit1.ppsGain *= 1.1;
    unit2.changeIcon("😐");
    unit1.changeIcon("😐");
  }
);
const upgrade6 = new Upgrade(
  "`try grind`",
  "The era of proof solving is over, now that can simply call `grind` on every proof obligation. Well, maybe not, but it will allow" +
    " Research Assistants to produce double the amount of proofs generated.",
  "🦾",
  5000,
  () => {
    unit3.proofGain *= 2;
  },
  true
);
const upgrade7 = new Upgrade(
  "160 hour work weeks",
  "8 hours a sleep is fine... per week right? Doubles the points College Interns make, but this surely can't be good for them.",
  "🌙",
  10000,
  () => {
    unit1.ppsGain *= 2;
    unit1.changeIcon("🫩");
  }
);
const upgrade8 = new Upgrade(
  "Winter Break",
  "No classes means more time to finally assist with the codebase. It's so effective that Student Helpers increase their point production by 4.",
  "❄️",
  5000,
  () => {
    unit0.ppsGain *= 4;
    unit0.changeIcon("⛄");
  }
);

// initialize upgrade
const upgradeArray = [
  upgradeInitial,
  upgrade0,
  upgrade1,
  upgrade2,
  upgrade3,
  upgrade4,
  upgrade5,
  upgrade6,
  upgrade7,
  upgrade8,
];
const upgradeArrayCopy = upgradeArray.slice();

secretImage.addEventListener("click", startGame);

function startGame() {
  profileImage.classList.add("clickable-small");
  pointsDisplay.classList.add("show");
  ppsDisplay.classList.add("show");
  mainBox.classList.add("page-box-small");
  secretImage.style.visibility = "hidden";
  upgradeBox.classList.add("show");
  unitBox.classList.add("show");
  secretActivated = true;
  upgradeInitial.init(upgradeBox, upgradeArray);
  unit0.revealUnit(unitBox);
  const audio = new Audio("/assets/click.wav");
  audio.play();
}

function createErrorIcon(container) {
  const error = document.createElement("img");
  error.classList.add("error-icon");
  error.setAttribute("src", "/assets/error.jpg");

  const randomX = Math.floor(Math.random() * 100);
  const randomY = Math.floor(Math.random() * 100);

  error.style.position = "absolute";
  error.style.left = randomX + "%";
  error.style.top = randomY + "%";
  error.style.width = "25%";
  error.classList.add("fadeIn");

  container.appendChild(error);
}

function deleteElements(container) {
  createErrorIcon(container);

  if (errorPopup >= 2) {
    const audio = new Audio("/assets/error.mp3");
    const result = audio.play();
    errorPopup = 0;
  } else {
    errorPopup += 1;
  }

  const allElements = document.querySelectorAll("*");

  const elements = Array.from(allElements)
    .filter((element) => {
      const style = window.getComputedStyle(element);
      return style.visibility !== "hidden";
    })
    .filter((element) => {
      if (element.classList.contains("error-icon")) return false;
      return !(
        element.tagName === "HTML" ||
        element.tagName === "HEAD" ||
        element.tagName === "BODY"
      );
    });

  if (elements.length > 0) {
    const randomIndex = Math.floor(Math.random() * elements.length);
    const element = elements[randomIndex];
    element.style.visibility = "hidden";
  }

  return elements;
}

function gameLogicLoop() {
  pps = 0;
  proofsps = 0;
  unitArray.forEach((unit) => {
    pps += unit.owned * unit.ppsGain;
    proofsps += unit.owned * unit.proofGain;
  });

  updatePoints(pps / 10);
  updateProofs((proofsps * proofBonus) / 10);
  lifetimePoints += pps / 10;
  lifetimeProofs += (proofsps * proofBonus) / 10;

  updatePointsps(pps);
  updateProofsps(proofsps * proofBonus);

  // handle units
  unitArray.forEach((unit) => {
    if (lifetimePoints >= unit.currentCost / 2 && unit.proofGain < 0.1) {
      if (unit === unit3) {
        unitBox.classList.add("compress");
        researchBox.classList.add("show");
        researchBox.classList.add("compress");

        unit.revealUnit(researchBox);
      } else {
        unit.revealUnit(unitBox);
      }
    }

    if (unit.button !== null) {
      if (totalPoints < unit.currentCost) {
        unit.button.classList.add("button-locked", "tool-locked");
      } else {
        unit.button.classList.remove("button-locked", "tool-locked");
      }
    }
  });

  upgradeArrayCopy.forEach((upgrade) => {
    if (upgrade.button !== null) {
      if (totalPoints < upgrade.cost) {
        upgrade.button.classList.add("button-locked", "tool-locked");
      } else {
        upgrade.button.classList.remove("button-locked", "tool-locked");
      }
    }
  });

  // proof units (separate from regular points)
  if (lifetimeProofs >= 5) {
    unit4.revealUnit(researchBox);
  }

  if (lifetimeProofs >= 100) {
    unit5.revealUnit(researchBox);
  }

  if (lifetimeProofs >= 1000) {
    unit8.revealUnit(researchBox);
  }

  // handle upgrades
  if (unit0.owned >= 1) {
    upgrade0.init(upgradeBox, upgradeArray);
  }

  if (lifetimePoints >= 50) {
    upgrade1.init(upgradeBox, upgradeArray);
  }

  if (unit1.owned >= 1) {
    upgrade2.init(upgradeBox, upgradeArray);
  }

  if (lifetimePoints >= 400) {
    upgrade3.init(upgradeBox, upgradeArray);
  }

  if (unit2.owned >= 1) {
    upgrade4.init(upgradeBox, upgradeArray);
  }

  if (unit1.owned >= 10 && unit2.owned >= 5) {
    upgrade5.init(upgradeBox, upgradeArray);
  }

  // research upgrade
  if (unit3.owned >= 1) {
    upgrade6.init(researchUpgradeBox, upgradeArray);
  }

  if (unit1.owned >= 15) {
    upgrade7.init(upgradeBox, upgradeArray);
  }

  if (unit0.owned >= 20) {
    upgrade8.init(upgradeBox, upgradeArray);
  }

  if (unit10.owned >= 1) {
    const dataLeft = deleteElements(frontPage);
    if (dataLeft.length === 0) {
      window.location.href = "/front-page/game/critical-game-error.html";
    }
  }
}

setInterval(gameLogicLoop, 100);
