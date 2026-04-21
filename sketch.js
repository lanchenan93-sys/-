/**
 * 水底世界：課程作品展覽區
 * 技術點：Class, 陣列, Vertex, Iframe 整合
 * 創意發想：海草高度隨作品增加而成長
 */

let seaweeds = []; // 儲存海草物件的陣列
let fishes = [];   // 儲存魚群物件的陣列
let pods = [];     // 儲存作品展示氣泡物件的陣列
let ambientBubbles = []; // 儲存背景裝飾小氣泡的陣列
let shark;         // 儲存鯊魚物件

let currentIframe = null; // 儲存 iframe 元素
let closeButton = null;   // 儲存關閉按鈕元素

// 模擬兩週的作品資料 (請替換為實際的作業連結)
// 'growth' 屬性用於控制海草的高度，象徵學習的成長
const assignments = [
  { week: "第一週", url: "https://lanchenan93-sys.github.io/0223-/", growth: 150 },
  { week: "第二週", url: "https://lanchenan93-sys.github.io/0302-/", growth: 200 },
  { week: "第三週", url: "https://lanchenan93-sys.github.io/0309-/", growth: 250 },
  { week: "第四週", url: "https://lanchenan93-sys.github.io/0316-/", growth: 300 },
  { week: "第五週", url: "https://lanchenan93-sys.github.io/20260323/", growth: 350 },
  { week: "第六週", url: "https://lanchenan93-sys.github.io/0330-/", growth: 400 }
];

function setup() {
  // 創建全螢幕畫布
  createCanvas(windowWidth, windowHeight);
  
  // 初始化 60 株海草，隨機四散於底部
  for (let i = 0; i < 60; i++) {
    let x = random(width);
    let h = random(height * 0.1, height / 3); // 隨機高度，限制在畫面的 1/3 以內
    seaweeds.push(new Seaweed(x, h));
  }
  
  // 初始化作品展示氣泡：對應兩週作業
  for (let i = 0; i < assignments.length; i++) {
    let x = (width / (assignments.length + 1)) * (i + 1);
    pods.push(new DisplayPod(x, height * 0.3, assignments[i]));
  }

  // 產生一些隨機游動的魚
  for (let i = 0; i < 8; i++) { // 增加魚的數量
    fishes.push(new Fish());
  }

  // 初始化鯊魚
  shark = new Shark();

  // 設定 iframe 和關閉按鈕的 UI
  setupIframeUI();
}

function draw() {
  // 繪製深海漸層背景
  drawDeepSeaBackground();

  // 更新並顯示所有海草
  seaweeds.forEach(s => {
    s.update();
    s.display();
  });

  // 產生環境小氣泡 (從隨機海草的位置冒出)
  if (random(1) < 0.08 && seaweeds.length > 0) {
    let rs = random(seaweeds);
    ambientBubbles.push(new AmbientBubble(rs.x + random(-15, 15), height));
  }

  // 更新並顯示背景小氣泡
  for (let i = ambientBubbles.length - 1; i >= 0; i--) {
    ambientBubbles[i].update();
    ambientBubbles[i].display();
    // 移除超出螢幕頂部的氣泡
    if (ambientBubbles[i].isOffScreen()) {
      ambientBubbles.splice(i, 1);
    }
  }

  // 更新並顯示所有魚群
  fishes.forEach(f => {
    f.update();
    f.display();
  });

  // 更新並顯示所有作品展示氣泡
  pods.forEach(p => {
    p.update();
    p.display();
  });

  // 更新並顯示鯊魚
  shark.update();
  shark.display();
  
  // 顯示提示文字
  fill(255, 200);
  noStroke();
  textAlign(CENTER);
  textSize(18);
  text("點擊漂浮的「作品氣泡」查看各週練習", width / 2, 40);
}

// 繪製深海漸層背景
function drawDeepSeaBackground() {
  for (let i = 0; i <= height; i++) {
    let inter = map(i, 0, height, 0, 1);
    // 從淺藍色到深藍色再到深紫色/黑色
    let c1 = color(0, 105, 148); // 淺藍
    let c2 = color(0, 30, 80);   // 深藍
    let c3 = color(0, 5, 30);    // 深紫黑
    
    let lerpedColor;
    if (inter < 0.5) {
      lerpedColor = lerpColor(c1, c2, map(inter, 0, 0.5, 0, 1));
    } else {
      lerpedColor = lerpColor(c2, c3, map(inter, 0.5, 1, 0, 1));
    }
    stroke(lerpedColor);
    line(0, i, width, i);
  }
}

// --- Seaweed Class (海草類別) ---
class Seaweed {
  constructor(x, targetH) {
    this.x = x;
    this.h = 0; // 當前高度，從0開始生長
    this.targetH = targetH; // 目標高度
    this.segments = floor(random(12, 22)); // 隨機節點數量增加差異
    this.offset = random(1000); // 隨機偏移量，使每株海草擺動不同步
    this.swaySpeed = random(0.02, 0.05); // 稍微加快擺動速度
    this.swayAmount = random(20, 25); // 增加擺動幅度範圍
    this.baseWeight = random(25, 25); // 隨機根部粗細

    // 統一配色方案，讓顏色更一致相近（採用藍綠色系）
    let v = random(-15, 15);
    this.colorRoot = color(20 + v, 65 + v, 50 + v, 180);
    this.colorTip = color(145 + v, 235 + v, 195 + v, 130);
  }

  update() {
    // 讓海草逐漸長到目標高度
    if (this.h < this.targetH) {
      this.h = lerp(this.h, this.targetH, 0.05); // 平滑生長
    }
  }

  display() {
    push();
    noFill();
    strokeCap(ROUND); // 將頂端與線段連接處改為圓弧
    let px = this.x;
    let py = height;
    
    // 逐段繪製以實現漸層與變細效果
    for (let i = 1; i <= this.segments; i++) {
      let t = i / this.segments; // 正規化進度 (0 to 1)
      
      // 計算當前節點的位置
      let y = height - t * this.h;
      let sway = sin(frameCount * this.swaySpeed + i * 0.4 + this.offset) * t * this.swayAmount;
      let x = this.x + sway;
      
      // 設定漸層顏色，並保持粗度相同
      stroke(lerpColor(this.colorRoot, this.colorTip, t));
      strokeWeight(this.baseWeight); 
      
      line(px, py, x, y);
      px = x;
      py = y;
    }
    pop();
  }
}

// --- Fish Class (魚群類別) ---
class Fish {
  constructor() {
    this.flipY = 1;  // 初始化翻轉標志
    this.reset();
  }

  reset() {
    // 隨機從左或右邊開始游動
    let fromRight = random() > 0.5;
    
    if (fromRight) {
      // 從右邊開始，向左游
      this.pos = createVector(random(width + 50, width + 200), random(height * 0.2, height * 0.8));
      this.vel = createVector(random(-2, -0.5), random(-0.2, 0.2));
      this.flipY = -1;  // 上下翻轉
    } else {
      // 從左邊開始，向右游
      this.pos = createVector(random(-200, -50), random(height * 0.2, height * 0.8));
      this.vel = createVector(random(0.5, 2), random(-0.2, 0.2));
      this.flipY = 1;   // 不翻轉
    }
    
    this.size = random(30, 60);
    this.bodyLength = this.size * 1.6;
    this.tailLength = this.size * 0.6;
    this.tailWidth = this.size * 0.5;
    this.wagOffset = random(1000); // 隨機偏移量，使每條魚擺尾不同步
  }

  update() {
    this.pos.add(this.vel);
    // 如果魚游出螢幕的左邊或右邊，則重置位置
    if (this.pos.x > width + 200 || this.pos.x < -200) {
      this.reset();
    }
  }

  display() {
    push();
    translate(this.pos.x, this.pos.y);
    scale(1, this.flipY);  // 上下翻轉或不翻轉
    
    let angle = this.vel.heading();
    rotate(angle);  // 直接使用速度角度，無需加 PI
    
    let clrOrange = color(255, 120, 0);
    let clrWhite = color(255);
    let clrBlack = color(0);

    // 魚鰭與尾巴 (橘色帶黑邊)
    stroke(clrBlack);
    strokeWeight(2);
    fill(clrOrange);
    
    // 計算尾巴擺動量，隨時間產生規律的上下偏移
    let wag = sin(frameCount * 0.2 + this.wagOffset) * (this.tailWidth * 0.3);

    // 尾鰭
    beginShape();
    vertex(-this.bodyLength * 0.4, 0);
    vertex(-this.bodyLength * 0.4 - this.tailLength, -this.tailWidth + wag);
    vertex(-this.bodyLength * 0.4 - this.tailLength, this.tailWidth + wag);
    endShape(CLOSE);

    // 背鰭
    beginShape();
    vertex(this.bodyLength * 0.1, -this.size * 0.4);
    vertex(-this.bodyLength * 0.2, -this.size * 0.8);
    vertex(-this.bodyLength * 0.3, -this.size * 0.4);
    endShape(CLOSE);

    // 腹鰭
    beginShape();
    vertex(this.bodyLength * 0.1, this.size * 0.4);
    vertex(-this.bodyLength * 0.1, this.size * 0.7);
    vertex(-this.bodyLength * 0.2, this.size * 0.4);
    endShape(CLOSE);

    // 魚身主體
    noStroke();
    fill(clrOrange);
    ellipse(0, 0, this.bodyLength, this.size);

    // 白色條紋 (小丑魚特徵)
    fill(clrWhite);
    stroke(clrBlack);
    strokeWeight(1.5);
    // 第一條 (頭部)
    rect(this.bodyLength * 0.1, -this.size * 0.45, this.bodyLength * 0.12, this.size * 0.9, 10);
    // 第二條 (中間)
    rect(-this.bodyLength * 0.15, -this.size * 0.5, this.bodyLength * 0.15, this.size * 1, 10);
    // 第三條 (尾部)
    rect(-this.bodyLength * 0.35, -this.size * 0.3, this.bodyLength * 0.08, this.size * 0.6, 5);

    // 眼睛
    fill(clrBlack);
    noStroke();
    circle(this.bodyLength * 0.3, -this.size * 0.1, this.size * 0.2);
    fill(clrWhite);
    circle(this.bodyLength * 0.32, -this.size * 0.12, this.size * 0.08);

    pop();
  }
}

// --- AmbientBubble Class (背景裝飾小氣泡) ---
class AmbientBubble {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = createVector(random(-0.5, 0.5), random(-1, -2.5)); // 緩慢上升
    this.size = random(3, 10); // 隨機大小
    this.alpha = random(100, 200); // 隨機透明度
    this.noiseOffset = random(1000);
  }

  update() {
    this.pos.add(this.vel);
    // 加入水平的微弱晃動
    this.pos.x += map(noise(this.noiseOffset, frameCount * 0.01), 0, 1, -1, 1);
  }

  display() {
    push();
    noFill();
    stroke(255, 255, 255, this.alpha);
    strokeWeight(1);
    // 繪製氣泡圓圈
    circle(this.pos.x, this.pos.y, this.size);
    
    // 加上一個微小的反光點
    fill(255, 255, 255, this.alpha * 0.5);
    noStroke();
    circle(this.pos.x - this.size * 0.2, this.pos.y - this.size * 0.2, this.size * 0.2);
    pop();
  }

  isOffScreen() {
    // 當氣泡完全升出螢幕頂端時返回 true
    return this.pos.y < -this.size;
  }
}

// --- 作品展示板 (氣泡) ---
class DisplayPod {
  constructor(x, y, data) {
    this.basePos = createVector(x, y);
    this.pos = createVector(x, y);
    this.data = data;
    this.size = 100;
    this.floatOffset = random(1000);
    this.hovered = false;
  }

  update() {
    // 漂浮感
    this.pos.y = this.basePos.y + sin(frameCount * 0.03 + this.floatOffset) * 15;
    // 檢查滑鼠是否懸停在氣泡上
    let d = dist(mouseX, mouseY, this.pos.x, this.pos.y);
    this.hovered = d < this.size / 2;
  }

  display() {
    push();
    // 畫出帶有漸層感的氣泡
    drawingContext.shadowBlur = this.hovered ? 20 : 10;
    drawingContext.shadowColor = this.hovered ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.5)';
    fill(255, 255, 255, this.hovered ? 180 : 100);
    stroke(255, this.hovered ? 200 : 150);
    ellipse(this.pos.x, this.pos.y, this.size);
    
    // 文字
    fill(0, 0, 0, 200); // 文字顏色
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(16);
    text(this.data.week, this.pos.x, this.pos.y - 10);
    textSize(12);
    text("點擊查看", this.pos.x, this.pos.y + 15);
    pop();
  }

  // 檢查滑鼠是否點擊到氣泡
  isClicked(mx, my) {
    let d = dist(mx, my, this.pos.x, this.pos.y);
    return d < this.size / 2;
  }
}

// --- Iframe 與 UI 控制 ---
function setupIframeUI() {
  // 建立 iframe
  currentIframe = createElement('iframe');
  currentIframe.position(width * 0.1, height * 0.1);
  currentIframe.size(width * 0.8, height * 0.8);
  currentIframe.style('border', '5px solid #007bff'); // 藍色邊框
  currentIframe.style('border-radius', '15px');      // 圓角
  currentIframe.style('box-shadow', '0 0 20px rgba(0, 123, 255, 0.8)'); // 藍色陰影
  currentIframe.style('background-color', 'rgba(255, 255, 255, 0.9)'); // 半透明背景
  currentIframe.style('z-index', '1000');            // 確保在最上層
  currentIframe.hide(); // 初始隱藏

  // 建立關閉按鈕
  closeButton = createButton('關閉展覽');
  closeButton.position(width * 0.9 - 100, height * 0.1 + 10); // 預設位置
  closeButton.style('background-color', '#dc3545'); // 紅色背景
  closeButton.style('color', 'white');
  closeButton.style('border', 'none');
  closeButton.style('padding', '10px 15px');
  closeButton.style('border-radius', '8px');
  closeButton.style('cursor', 'pointer');
  closeButton.style('z-index', '1001'); // 確保在 iframe 上方
  closeButton.mousePressed(() => {
    currentIframe.hide();
    closeButton.hide();
  });
  closeButton.hide(); // 初始隱藏
}

// 處理滑鼠點擊事件
function mousePressed() {
  pods.forEach(p => {
    if (p.isClicked(mouseX, mouseY)) {
      currentIframe.attribute('src', p.data.url); // 設定 iframe 來源
      currentIframe.show(); // 顯示 iframe
      closeButton.show();   // 顯示關閉按鈕
    }
  });
}

// 處理視窗大小改變事件
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  // 重新調整 iframe 和按鈕的位置和大小
  currentIframe.position(width * 0.1, height * 0.1);
  currentIframe.size(width * 0.8, height * 0.8);
  closeButton.position(width * 0.9 - 100, height * 0.1 + 10);
}

// --- Shark Class (鯊魚類別) ---
class Shark {
  constructor() {
    this.pos = createVector(width / 2, height / 2);
    this.size = 150;
    this.angle = 0;
    this.mouthOpen = 0; // 0 為閉合，1 為全開
  }

  update() {
    // 讓鯊魚平滑地跟隨滑鼠
    let target = createVector(mouseX, mouseY);
    let dir = p5.Vector.sub(target, this.pos);
    
    if (dir.mag() > 5) {
      this.angle = dir.heading();
      dir.setMag(3); // 設定鯊魚游動速度
      this.pos.add(dir);
    }

    // 偵測是否靠近任何作品氣泡 (單元氣泡)
    // 修正為「碰到」氣泡才張嘴：當鯊魚中心與氣泡中心的距離小於兩者半徑之和
    let nearPod = pods.some(p => {
      return dist(this.pos.x, this.pos.y, p.pos.x, p.pos.y) < (this.size / 2) + (p.size / 2);
    });
    let targetMouth = nearPod ? 1 : 0;
    
    // 使用 lerp 讓張嘴動作更平滑
    this.mouthOpen = lerp(this.mouthOpen, targetMouth, 0.1);
  }

  display() {
    push();
    translate(this.pos.x, this.pos.y);
    
    // 核心邏輯：旋轉後，若角度指向左側，則垂直翻轉 Y 軸，防止鯊魚倒著游
    rotate(this.angle);
    if (abs(this.angle) > HALF_PI) {
      scale(1, -1);
    }

    noStroke();
    // 尾鰭
    fill(60, 85, 110);
    beginShape();
    vertex(-this.size * 0.45, 0);
    vertex(-this.size * 0.7, -this.size * 0.3);
    vertex(-this.size * 0.6, 0);
    vertex(-this.size * 0.7, this.size * 0.3);
    endShape(CLOSE);

    // 背鰭
    fill(80, 105, 130);
    beginShape();
    vertex(-this.size * 0.1, -this.size * 0.15);
    vertex(-this.size * 0.25, -this.size * 0.45);
    vertex(this.size * 0.1, -this.size * 0.15);
    endShape(CLOSE);

    // 身體 (拆分為上下顎以實現張嘴動畫)
    // 建立銀白色腹部漸層效果 (從背部到腹部)
    let bodyGrad = drawingContext.createLinearGradient(0, -this.size * 0.2, 0, this.size * 0.2);
    bodyGrad.addColorStop(0, 'rgb(80, 105, 130)');    // 背部深灰藍
    bodyGrad.addColorStop(0.5, 'rgb(100, 125, 150)'); // 側面中間色
    bodyGrad.addColorStop(1, 'rgb(220, 225, 230)');   // 腹部銀白色
    drawingContext.fillStyle = bodyGrad;

    let openAmount = this.mouthOpen * 20; // 嘴巴張開的垂直位移

    // 上半身 / 上顎
    beginShape();
    vertex(-this.size * 0.5, 0); // 從尾部起始
    bezierVertex(-this.size * 0.2, -this.size * 0.25, this.size * 0.2, -this.size * 0.25, this.size * 0.5, -openAmount);
    vertex(this.size * 0.2, 0); // 嘴巴鉸鏈處
    endShape(CLOSE);

    // 下半身 / 下顎
    beginShape();
    vertex(-this.size * 0.5, 0);
    bezierVertex(-this.size * 0.2, this.size * 0.25, this.size * 0.2, this.size * 0.25, this.size * 0.5, openAmount);
    vertex(this.size * 0.2, 0);
    endShape(CLOSE);

    // 眼睛
    fill(0);
    circle(this.size * 0.3, -this.size * 0.08 - openAmount * 0.5, 6); // 眼睛隨上顎輕微位移

    // 牙齒 (只有在嘴巴稍微張開時才顯示)
    if (this.mouthOpen > 0.1) {
      fill(255);
      noStroke();
      // 上排牙齒
      for (let i = 0; i < 4; i++) {
        let t = map(i, 0, 3, 0.2, 0.8);
        let tx = lerp(this.size * 0.2, this.size * 0.5, t);
        let ty = lerp(0, -openAmount, t);
        triangle(tx, ty, tx - 7, ty, tx - 3.5, ty + 10 * this.mouthOpen);
      }
      // 下排牙齒
      for (let i = 0; i < 4; i++) {
        let t = map(i, 0, 3, 0.2, 0.8);
        let tx = lerp(this.size * 0.2, this.size * 0.5, t);
        let ty = lerp(0, openAmount, t);
        triangle(tx, ty, tx - 7, ty, tx - 3.5, ty - 10 * this.mouthOpen);
      }
    }
    pop();
  }
}
