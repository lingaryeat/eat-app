
// ===================== 🌌 建立 3D 水晶球場景 =====================

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(300, 300);
document.getElementById("crystal-container").appendChild(renderer.domElement);

// 球體
const geometry = new THREE.SphereGeometry(2, 64, 64);
const material = new THREE.MeshPhysicalMaterial({
  color: 0x88ccff,
  transmission: 1,
  roughness: 0.05,
  thickness: 1,
  clearcoat: 1,
  reflectivity: 0.9,
  envMapIntensity: 1.2,
  emissive: new THREE.Color(0x224466),
  emissiveIntensity: 0.3
});
const sphere = new THREE.Mesh(geometry, material);
scene.add(sphere);


// ⭐球內星星粒子
const starGeo = new THREE.BufferGeometry();
const starCount = 100;
const starPositions = [];
for (let i = 0; i < starCount; i++) {
  const r = Math.random() * 1.5;
  const theta = Math.random() * 2 * Math.PI;
  const phi = Math.random() * Math.PI;
  starPositions.push(
    r * Math.sin(phi) * Math.cos(theta),
    r * Math.sin(phi) * Math.sin(theta),
    r * Math.cos(phi)
  );
}
starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.05 });
const stars = new THREE.Points(starGeo, starMat);
sphere.add(stars); // 加到球裡

// 🌌 外部粒子效果（圍繞球體）
const outerGeo = new THREE.BufferGeometry();
const outerPositions = [];
for (let i = 0; i < 80; i++) {
  const angle = Math.random() * 2 * Math.PI;
  const radius = 3 + Math.random() * 0.5;
  outerPositions.push(
    radius * Math.cos(angle),
    (Math.random() - 0.5) * 2,
    radius * Math.sin(angle)
  );
}
outerGeo.setAttribute('position', new THREE.Float32BufferAttribute(outerPositions, 3));
const outerMat = new THREE.PointsMaterial({ color: 0x88ccff, size: 0.08, transparent: true, opacity: 0.6 });
const outerPoints = new THREE.Points(outerGeo, outerMat);
scene.add(outerPoints);

scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const light = new THREE.PointLight(0xffffff, 1.2);
light.position.set(10, 10, 10);
scene.add(light);



// 拖曳阻尼
let isDragging = false;
let prev = { x: 0, y: 0 };
let velocity = { x: 0, y: 0 };

renderer.domElement.addEventListener("pointerdown", e => {
  isDragging = true;
  prev.x = e.clientX;
  prev.y = e.clientY;
});
document.addEventListener("pointermove", e => {
  if (!isDragging) return;
  const dx = e.clientX - prev.x;
  const dy = e.clientY - prev.y;
  velocity.x = dy * 0.01;
  velocity.y = dx * 0.01;
  prev.x = e.clientX;
  prev.y = e.clientY;
});
document.addEventListener("pointerup", () => { isDragging = false; });

let t = 0;
function animate() {
  requestAnimationFrame(animate);

  if (!isDragging) {
    sphere.rotation.y += velocity.y;
    sphere.rotation.x += velocity.x;
    velocity.x *= 0.95;
    velocity.y *= 0.95;
  }

  // 呼吸動畫
  t += 0.05;
  material.emissiveIntensity = 0.25 + 0.15 * Math.sin(t);

  // 星星微轉
  stars.rotation.y += 0.002;
  outerPoints.rotation.y -= 0.001;

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
