// ===================== 🌌 建立 3D 水晶球場景 =====================

// 建立 Three.js 場景
const scene = new THREE.Scene();

// 建立相機：75 度視角，畫面比例 1（固定方形），近 0.1 ~ 遠 1000
const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
camera.position.z = 5; // 相機往後移，看到整顆球

// 建立渲染器（透明背景、抗鋸齒），大小與容器一致
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(300, 300);
document.getElementById("crystal-container").appendChild(renderer.domElement);

// 建立水晶球幾何體與光澤材質
const geometry = new THREE.SphereGeometry(2, 64, 64);
const material = new THREE.MeshPhysicalMaterial({
  color: 0x88ccff, // 藍色基底
  transmission: 1, // 全透明（玻璃感）
  roughness: 0.05, // 表面粗糙度
  thickness: 1,     // 厚度
  clearcoat: 1,     // 表層清漆
  reflectivity: 0.9, // 高反光
  envMapIntensity: 1.2, // 環境光強度
  emissive: new THREE.Color(0x224466), // 自發光色
  emissiveIntensity: 0.2
});
const sphere = new THREE.Mesh(geometry, material);
scene.add(sphere);

// 加入環境光與主燈光
scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const light = new THREE.PointLight(0xffffff, 1.2);
light.position.set(10, 10, 10);
scene.add(light);

// ===================== 🎮 拖曳控制 =====================

// 拖曳旗標與初始位置
let isDragging = false;
let prev = { x: 0, y: 0 };

// 旋轉球體（滑鼠/手指移動量 * 速度）
function rotate(dx, dy) {
  const speed = 0.005;
  sphere.rotation.y += dx * speed;
  sphere.rotation.x += dy * speed;
}

// 滑鼠／手指按下時開始拖曳
renderer.domElement.addEventListener("pointerdown", (e) => {
  e.preventDefault();
  isDragging = true;
  prev = { x: e.clientX, y: e.clientY };
});

// 拖曳中：持續旋轉
document.addEventListener("pointermove", (e) => {
  if (!isDragging) return;
  const dx = e.clientX - prev.x;
  const dy = e.clientY - prev.y;
  rotate(dx, dy);
  prev = { x: e.clientX, y: e.clientY };
});

// 拖曳結束
document.addEventListener("pointerup", () => {
  isDragging = false;
});

// ===================== 🔄 繪製循環 =====================
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();

// ===================== 🧠 心情推薦邏輯 =====================

// 點選心情按鈕後詢問是否進入小遊戲，否則直接推薦
function selectMood(mood) {
  const confirmGame = confirm("要不要讓小遊戲來幫你決定吃什麼呢？😋");
  if (confirmGame) {
    alert("即將進入小遊戲模組（未來開發）...");
  } else {
    getAIRecommendation(mood);
  }
}

// 根據心情推薦食物，並記錄到 localStorage
function getAIRecommendation(mood) {
  let recommendation = "";
  switch (mood) {
    case "happy":
      recommendation = "你今天心情超棒！不如吃點火鍋來慶祝吧 🍲"; break;
    case "sad":
      recommendation = "甜點最能療癒悲傷，來塊蛋糕或冰淇淋吧 🎂🍦"; break;
    case "tired":
      recommendation = "補充體力！咖哩飯或牛肉麵是個不錯的選擇 🍛🍜"; break;
    case "angry":
      recommendation = "來點辣的！麻辣燙或韓式炸雞正適合你現在的怒火 🔥🐔"; break;
    case "bored":
      recommendation = "試試異國料理或街邊小吃，今天就來點不一樣的 🍱🥟"; break;
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
  logs.unshift(log); // 新紀錄放最前面
  localStorage.setItem("eat-log", JSON.stringify(logs));
  renderLogList(); // 更新清單
}

// ===================== 📖 顯示推薦紀錄 =====================

function renderLogList() {
  const logList = document.getElementById("log-list");
  if (!logList) return;
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

// ===================== ✏️ 修改實際食物紀錄 =====================

function editActualFood(index) {
  const input = prompt("你實際吃的是什麼？");
  if (!input) return;
  const logs = JSON.parse(localStorage.getItem("eat-log") || "[]");
  logs[index].actualFood = input;
  localStorage.setItem("eat-log", JSON.stringify(logs));
  renderLogList();
}

// ===================== 🚀 初始化載入 =====================

window.onload = () => {
  renderLogList(); // 顯示今日紀錄
};
