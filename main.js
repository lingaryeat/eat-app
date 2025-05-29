// 🔸 心情與對應推薦資料（範例）
const foodMap = {
  '開心': ['壽司', '烤雞', '冰淇淋'],
  '難過': ['拉麵', '炸雞', '巧克力'],
  '很累': ['牛肉麵', '熱湯', '能量飲'],
  '生氣': ['麻辣鍋', '漢堡', '可樂'],
  '無聊': ['鹽酥雞', '泡麵', '蛋糕']
};

// 🔸 使用者選擇心情時的主動作
function selectMood(mood) {
  const foodList = foodMap[mood];
  const choice = foodList[Math.floor(Math.random() * foodList.length)];
  document.getElementById("recommendation").innerText = `你現在心情是「${mood}」，我推薦你吃：${choice}`;

  // 儲存推薦紀錄到 localStorage
  const today = new Date().toISOString().split('T')[0];
  let history = JSON.parse(localStorage.getItem("history") || "{}");
  if (!history[today]) history[today] = [];
  history[today].push({ mood, food: choice });
  localStorage.setItem("history", JSON.stringify(history));
}

// 🔸 顯示今日推薦紀錄
function showHistory() {
  const today = new Date().toISOString().split('T')[0];
  let history = JSON.parse(localStorage.getItem("history") || "{}");
  let list = history[today] || [];
  if (list.length === 0) {
    alert("你今天還沒有推薦紀錄喔！");
  } else {
    const msg = list.map((item, i) => `${i + 1}. ${item.mood} ➜ ${item.food}`).join('\n');
    alert("今日推薦紀錄：\n" + msg);
  }
}
