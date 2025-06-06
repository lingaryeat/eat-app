// 匯入 three.js 主核心模組
import * as THREE from './lib/three/build/three.module.js';
// 匯入後處理用的效果合成器（可疊加特效）
import { EffectComposer } from './lib/three/examples/jsm/postprocessing/EffectComposer.js';
// 匯入基本的渲染通道（負責主場景渲染）
import { RenderPass } from './lib/three/examples/jsm/postprocessing/RenderPass.js';
// 匯入 UnrealBloom 光暈特效（讓光更柔和發散）
import { UnrealBloomPass } from './lib/three/examples/jsm/postprocessing/UnrealBloomPass.js';

// 等待 DOM 完全載入後再初始化畫面
window.addEventListener("DOMContentLoaded", () => {
  // 建立場景：所有物體與光源的容器
  const scene = new THREE.Scene();
  // 設定背景顏色為深紫
  scene.background = new THREE.Color(0x0b0616);
  // 添加霧氣效果，讓遠方物體逐漸淡出
  scene.fog = new THREE.Fog(0x0b0616, 10, 30);

  // 建立相機（透視攝影機）
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
  camera.position.z = 6; // 拉遠一點看整顆水晶球

  // 建立 WebGL 渲染器，啟用透明背景與抗鋸齒
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(300, 300); // 設定畫布大小
  // 把渲染器的畫布插入到 HTML 中的 #crystal-container
  document.getElementById("crystal-container").appendChild(renderer.domElement);

  // 添加環境光（柔和的整體光照）
  scene.add(new THREE.AmbientLight(0x6633aa, 0.3));
  // 添加點光源（模擬太陽、燈泡）
  const light = new THREE.PointLight(0xffffff, 1.5, 100);
  light.position.set(6, 6, 6); // 放在右上角
  scene.add(light);

  // 🔮 建立擬真水晶球材質（透明玻璃感）
  const material = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,            // 白色基底（靠其他參數展現透明）
    transmission: 2.0,          // 光線穿透程度（值愈大愈透）
    opacity: 1.0,               // 完全不透明（但配合 transparent 開啟可見）
    transparent: true,          // 必須開啟才能讓 transmission 生效
    roughness: 0.05,            // 表面光滑程度（越小越反光）
    metalness: 0.0,             // 非金屬材質
    clearcoat: 1.0,             // 表面塗層強度（類似上光）
    clearcoatRoughness: 0.05,   // 塗層的光滑度（越低越光亮）
    ior: 1.45,                  // 折射率（玻璃常見值）
    thickness: 3.0,             // 厚度影響內部折射感
    reflectivity: 0.6,          // 反光程度（會看到周圍顏色）
    specularIntensity: 1.0,     // 鏡面高光強度
    emissive: new THREE.Color(0x9444ff), // 發出淡紫光（會照亮自己）
    emissiveIntensity: 10.15     // 發光亮度
  });

  // 建立球體幾何形狀（直徑 4、細分 128x128）
  const geometry = new THREE.SphereGeometry(2, 128, 128);
  // 用幾何與材質建立 Mesh 並加入場景
  const sphere = new THREE.Mesh(geometry, material);
  scene.add(sphere);

  // ⭐ 建立內部星塵粒子幾何
  const starGeo = new THREE.BufferGeometry();
  const starCount = 150; // 粒子數量
  const starPositions = [];
  // 隨機產生星塵座標（以球形分布）
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
  // 把座標資料塞進 BufferGeometry
  starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
  // 粒子材質：淡紫色小點
  const starMat = new THREE.PointsMaterial({ color: 0xeeccff, size: 0.04 });
  const stars = new THREE.Points(starGeo, starMat);
  sphere.add(stars); // 加入球體內部

  // ✨ 外圍粒子環
  const outerGeo = new THREE.BufferGeometry();
  const outerPos = [];
  for (let i = 0; i < 120; i++) {
    const angle = Math.random() * 2 * Math.PI;
    const radius = 3.3 + Math.random() * 0.5; // 在球體外圍一圈
    outerPos.push(
      radius * Math.cos(angle),
      (Math.random() - 0.5) * 2.5,
      radius * Math.sin(angle)
    );
  }
  outerGeo.setAttribute('position', new THREE.Float32BufferAttribute(outerPos, 3));
  // 材質：淡紫半透明小點
  const outerMat = new THREE.PointsMaterial({
    color: 0xcc88ff,
    size: 0.06,
    transparent: true,
    opacity: 0.4
  });
  const outerPoints = new THREE.Points(outerGeo, outerMat);
  scene.add(outerPoints); // 加到場景外面繞著球

  // 後處理系統初始化
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera)); // 先畫主畫面
  // 加上 Bloom 發光特效（模糊發散）
  const bloomPass = new UnrealBloomPass(new THREE.Vector2(300, 300), 1.1, 0.6, 0.2);
  composer.addPass(bloomPass);

  // 🎮 滑鼠拖曳旋轉功能
  let isDragging = false;
  let prev = { x: 0, y: 0 };
  let velocity = { x: 0, y: 0 };

  // 滑鼠按下記錄座標
  renderer.domElement.addEventListener("pointerdown", e => {
    isDragging = true;
    prev.x = e.clientX;
    prev.y = e.clientY;
  });

  // 滑鼠移動計算速度
  document.addEventListener("pointermove", e => {
    if (!isDragging) return;
    const dx = e.clientX - prev.x;
    const dy = e.clientY - prev.y;
    velocity.x = dy * 0.01;
    velocity.y = dx * 0.01;
    prev.x = e.clientX;
    prev.y = e.clientY;
  });

  // 滑鼠放開停止拖曳
  document.addEventListener("pointerup", () => {
    isDragging = false;
  });

  // 🎞️ 主動畫迴圈
  function animate() {
    requestAnimationFrame(animate);

    // 根據滑鼠拖曳旋轉水晶球
    if (!isDragging) {
      sphere.rotation.y += velocity.y;
      sphere.rotation.x += velocity.x;
      velocity.x *= 0.95; // 漸漸減速
      velocity.y *= 0.95;
    }

    // 星塵與粒子持續轉動
    stars.rotation.y += 0.002;
    outerPoints.rotation.y -= 0.001;

    // 執行帶有後處理的渲染流程
    composer.render();
  }

  animate(); // 啟動動畫
});

// ✅ 定義全域函式，讓 HTML 中的 onclick 可以呼叫它
window.selectMood = function(mood) {
  // 根據心情對應推薦文字
  const moodSuggestions = {
    happy: "吃點甜甜的蛋糕慶祝吧 🎂",
    sad: "來碗熱湯拉麵療癒心情 🍜",
    tired: "補充能量，來杯黑糖珍奶 🧋",
    angry: "吃點辣的發洩情緒 🌶️",
    bored: "試試異國料理換口味 🍛"
  };

  // 取得頁面上顯示結果的 HTML 元素
  const result = document.getElementById("result");

  // 如果心情有對應建議，就顯示；否則顯示預設語句
  if (moodSuggestions[mood]) {
    result.textContent = moodSuggestions[mood];
  } else {
    result.textContent = "請選擇一個心情來獲得推薦 🍽️";
  }
};
