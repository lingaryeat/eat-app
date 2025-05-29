// 🔸 使用者點選心情後：詢問是否用遊戲來推薦，否則直接推薦食物
function selectMood(mood) {
  const confirmGame = confirm("要不要讓小遊戲來幫你決定吃什麼呢？😋");
  if (confirmGame) {
    alert("即將進入小遊戲模組（未來開發）...");
    // TODO: 將來可跳轉遊戲功能
  } else {
    getAIRecommendation(mood);
  }
}

// 🔸 根據心情推薦食物，並儲存紀錄到 localStorage
function getAIRecommendation(mood) {
  let recommendation = "";
  switch (mood) {
    case "happy":
      recommendation = "你今天心情超棒！不如吃點火鍋來慶祝吧 🍲";
      break;
    case "sad":
      recommendation = "甜點最能療癒悲傷，來塊蛋糕或冰淇淋吧 🎂🍦";
      break;
    case "tired":
      recommendation = "補充體力！咖哩飯或牛肉麵是個不錯的選擇 🍛🍜";
      break;
    case "angry":
      recommendation = "來點辣的！麻辣燙或韓式炸雞正適合你現在的怒火 🔥🐔";
      break;
    case "bored":
      recommendation = "試試異國料理或街邊小吃，今天就來點不一樣的 🍱🥟";
      break;
  }
  document.getElementById("result").innerText = recommendation;

  const now = new Date();
  const log = {
    time: now.toLocaleString(),
    mood: mood,
    aiFood: recommendation,
    actualFood: "（尚未紀錄）",
  };

  const logs = JSON.parse(localStorage.getItem("eat-log") || "[]");
  logs.unshift(log); // 最新的放最前面
  localStorage.setItem("eat-log", JSON.stringify(logs));

  renderLogList(); // 重新顯示紀錄
}

// 🔸 顯示當天的紀錄清單（含修改按鈕）
function renderLogList() {
  const logList = document.getElementById("log-list");
  logList.innerHTML = "";
  const logs = JSON.parse(localStorage.getItem("eat-log") || "[]");
  const today = new Date().toLocaleDateString();

  logs
    .filter((log) => log.time.startsWith(today))
    .forEach((log, index) => {
      const div = document.createElement("div");
      div.className = "log-item";
      div.innerHTML = `
        🕒 ${log.time}<br>
        🧠 心情：${log.mood}<br>
        🤖 推薦：${log.aiFood}<br>
        🍴 實際：<span id="actual-${index}">${log.actualFood}</span>
        <button onclick="editActualFood(${index})">✏️ 修改</button>
      `;
      logList.appendChild(div);
    });
}

// 🔸 修改實際吃了什麼食物
function editActualFood(index) {
  const input = prompt("你實際吃的是什麼？");
  if (!input) return;
  const logs = JSON.parse(localStorage.getItem("eat-log") || "[]");
  logs[index].actualFood = input;
  localStorage.setItem("eat-log", JSON.stringify(logs));
  renderLogList();
}

// 🔸 初始載入：自動顯示紀錄
window.onload = () => {
  renderLogList();
};
