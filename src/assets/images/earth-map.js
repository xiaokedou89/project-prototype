// Vertex Shader: 传递 UV 坐标
const vs = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
`;
// Fragment Shader: 混合基础渲染和 Bloom 效果
const fs = `uniform sampler2D baseTexture;  // 基础渲染结果
uniform sampler2D bloomTexture; // Bloom 效果结果
varying vec2 vUv;
void main() {
vec4 base_color = texture2D(baseTexture, vUv);
vec4 bloom_color = texture2D(bloomTexture, vUv);
// 计算亮度 (人眼感知正确的权重)
float lum = 0.21 * bloom_color.r + 0.71 * bloom_color.g + 0.07 * bloom_color.b;
// 混合 RGB + 保持 Alpha
gl_FragColor = vec4(base_color.rgb + bloom_color.rgb, max(base_color.a, lum));
}`;

// 预加载中性灰度纹理，避免颜色混合污染
const staticTexture = new THREE.TextureLoader().load('./assets/earth/china_hc.png');
const pointTexture = new THREE.TextureLoader().load('./assets/earth/point.png');
// ============> 所有的utils工具函数
// 创建标签的配置项
function createLabel(){
  return {
    show: true, // 是否显示标签
    name: "{b}", // 标签文本内容，支持模板字符串
    isFormatter: false, // 是否使用自定义 formatter 函数
    formatter: null, // 自定义格式化函数 (data) => string
    formatterHtml: "", // 自定义 HTML 字符串（优先级高于 formatter）
    className: "", // 自定义 CSS 类名
    offset: [0, 0], // 标签位置偏移 [x, y]（像素单位）
    itemStyle: {
      padding: [0, 0, 0, 0], // 内边距 [上, 右, 下, 左]
      backgroundColor: "rgba(50,50,50,0)", // 背景颜色，默认完全透明
      borderRadius: 5, // 圆角半径
      borderColor: "rgba(255,255,255,0)", // 边框颜色，默认透明
      borderWidth: 0, // 边框宽度
      textStyle: {
        fontSize: 12, // 字体大小
        color: "#FFF", // 文字颜色
        fontStyle: "normal", // 字体样式：normal | italic | oblique
        fontWeight: "normal", // 字体粗细：normal | bold | 100-900
        fontFamily: "Microsoft Yahei", // 字体族
        textDecoration: "", // 文本装饰：underline | line-through
        textShadow: "", // 文字阴影：'2px 2px 4px #000'
      },
    },
  };
}
// 初始化默认地图配置项
function createDefaultOptions(){
  const label = createLabel();
  return {
    // ========== 基础配置 ==========
    config: {
      autoScale: true, // 是否自动缩放地图以适应容器
      disableRotate: false, // 是否禁用鼠标旋转控制
      disableZoom: false, // 是否禁用鼠标缩放控制
      autoScaleFactor: 1, // 自动缩放的额外系数（1 = 原始大小）
      scale: 100, // 地图整体缩放比例
      depth: 35, // 区域拉伸高度（ExtrudeGeometry 的挤出深度）
    },
    // ========== 自动旋转配置 ==========
    autoRotate: {
      autoRotate: false, // 是否启用相机自动旋转
      autoRotateSpeed: 2, // 自动旋转速度（度/秒）
    },
    // ========== 相机位置配置 ==========
    camera: {
      x: 0.8, // 相机 X 轴位置（乘以地图缩放系数）
      y: 6, // 相机 Y 轴位置（高度）
      z: 3, // 相机 Z 轴位置（深度）
    },
    // ========== 网格辅助线配置 ==========
    grid: {
      show: false, // 是否显示坐标网格（用于调试）
      color: "#2BD9FF", // 网格线颜色
      opacity: 0.2, // 网格线透明度
    },
    // ========== 底座动画配置 ==========
    foundation: {
      show: false, // 是否显示底座
      size: 800, // 底座平面尺寸
      speed: 0.5, // 底座旋转速度（每帧旋转的角度）
      image: "default", // 底座纹理图片（'default' 使用内置纹理）
      isRotate: true, // 是否启用旋转动画
      static: false, // 是否为静态底座（不旋转）
    },
    // ========== Tooltip 提示框配置 ==========
    tooltip: {
      show: false, // 是否启用 tooltip
      content: "", // 静态内容（优先级低于 formatter）
      styleType: "0", // 样式类型标识
      isFormatter: false, // 是否使用自定义 formatter
      formatterHtml: "", // 自定义 HTML（优先级最高）
      // 默认格式化函数：显示名称和数值
      formatter: function (data) {
        const name = data.name || "-- ";
        const value = data.value === undefined ? "-- " : data.value;
        return "<span>" + name + "：</span>" + "<span>" + value + "</span>";
      },
      itemStyle: {
        // Tooltip 容器样式
        backgroundColor: "rgba(8, 20, 45, 0.82)", // 半透明深蓝背景
        borderColor: "rgba(72, 204, 255, 0.45)", // 淡蓝色边框
        borderWidth: 0,
        padding: [10, 10, 10, 10], // 内边距 [上, 右, 下, 左]
        color: "#DFF6FF", // 文字颜色
        fontSize: 14,
        minWidth: 80, // 最小宽度
        width: "max-content", // 自适应内容宽度
        borderRadius: 5,
        borderStyle: "solid",
      },
    },
    // ========== 镜面反射配置 ==========
    mirror: {
      show: false, // 是否显示镜面反射效果（在地图下方渲染翻转的副本）
      color: ["#020B1F", "#00D2FF"], // 镜面渐变色：[底部颜色, 顶部颜色]
    },
    // ========== 边界墙体配置 ==========
    wall: {
      show: false, // 是否显示区域边界的垂直墙体
      height: 40, // 墙体高度
      color: "#4DEBFF", // 墙体颜色（支持 alphaMap 渐变透明）
    },
    // ========== 区域表面纹理配置 ==========
    texture: {
      show: true, // 是否启用纹理贴图
      autoRepeat: false, // 是否自动计算纹理重复（false 时使用手动 repeat 值）
      repeat: { x: 0.0927, y: 0.124 }, // 纹理 UV 重复次数
      offset: { x: 0.5918, y: 0.324 }, // 纹理 UV 偏移量
      image: "default", // 纹理图片（'default' 使用内置纹理）
    },
    // ========== 地图数据配置 ==========
    map: "100000", // 地图区域代码（100000 = 中国）
    mapName: "china", // 地图名称标识
    // ========== Bloom 辉光后处理配置 ==========
    glow: {
      show: true, // 是否启用 Bloom 效果
      threshold: 0, // 发光阈值（亮度低于此值的不会发光）
      strength: 1, // 发光强度
      radius: 0, // 发光扩散半径
    },
    // ========== 区域样式配置 ==========
    itemStyle: {
      range: {
        // 数据可视化映射配置
        show: false, // 是否启用数据映射（影响区域颜色）
        mode: "range", // 映射模式：'range' = 连续渐变 | 'separate' = 分段规则
        rules: [
          // 分段规则数组（mode='separate' 时使用）
          {
            value: 0, // 规则阈值
            color: "#27F4FF", // 对应颜色
            label: ">=0", // 标签文本
          },
        ],
        color: ["#18D7FF", "#2665FF"], // 连续渐变色（mode='range' 时使用）
        min: 0, // 数据最小值
        max: 1000, // 数据最大值
        visualMap: {
          // 可视化图例配置（类似 ECharts visualMap）
          show: false, // 是否显示图例
          left: "2%", // 图例水平位置
          top: "2%", // 图例垂直位置
          maxText: "高", // 最大值文本标签
          minText: "低", // 最小值文本标签
          textStyle: {
            // 图例文字样式
            fontSize: 12,
            color: "#FFF",
            fontStyle: "normal",
            fontWeight: "normal",
            fontFamily: "Microsoft Yahei",
            textDecoration: "",
            textShadow: "",
          },
        },
      },
      topColor: "rgba(42, 233, 255, 0.95)", // 区域顶面颜色（ExtrudeGeometry 上表面）
      sideColor: "rgba(59, 132, 255, 0.92)", // 区域侧面颜色（挤出侧面）
      uColor: "rgba(19, 48, 128, 1)", // Shader 扫光动画的 U 通道颜色
    },
    // ========== 鼠标悬停高亮配置 ==========
    emphasis: {
      show: false, // 是否启用悬停高亮效果
      topColor: "#73F8FF", // 悬停时的顶面颜色
      textStyle: {
        // 悬停时的文本样式（用于标签）
        fontSize: 12,
        color: "#FFF",
        fontStyle: "normal",
        fontWeight: "normal",
        fontFamily: "Microsoft Yahei",
        textDecoration: "",
        textShadow: "",
      },
    },
    // ========== 边界线样式配置 ==========
    lineStyle: {
      color: "#78CFFF", // 区域内部边界线颜色（如省内市界）
    },
    outLineStyle: {
      color: "rgba(83, 198, 230, 1)", // 区域外部轮廓线颜色（如省界）
    },
    // ========== 区域标签配置 ==========
    label: {
      ...label, // 继承默认标签配置
      show: true, // 默认不显示区域标签（避免地图过于拥挤）
    },
    // ========== 系列和数据配置 ==========
    seriesName: "map", // 主地图系列名称
    data: [], // 区域数据数组（用于 itemStyle.range 的数据映射）
    series: [], // 附加系列数组（存放 cylinder, flight, marker 等）
  }
}
// 生成 UUID v4 格式的随机字符串
function uuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
// 深度合并对象 - 递归合并嵌套属性
function deepMerge(target, ...sources){
  for (const source of sources) {
    if (!source) continue;
    for (const key of Object.keys(source)) {
      const val = source[key];
      if (val && typeof val === "object" && !Array.isArray(val)) {
        if (!target[key] || typeof target[key] !== "object") {
          target[key] = {};
        }
        deepMerge(target[key], val);
      } else {
        target[key] = val;
      }
    }
  }
  return target;
}
function labelStringToFunction(template, data) {
  if (!template) return "";
  return template
    .replace(/\{a\}/g, data.seriesName ?? "")
    .replace(/\{b\}/g, data.name ?? "")
    .replace(/\{c\}/g, data.value ?? "")
    .replace(/\{d\}/g, data.adcode ?? "");
}
// 返回assets/geoJSON/ 下对应code的json对象
function register(code){
  code = code.toString();

  const fullPath = `./assets/geoJSON/${code}.json`;
  const boundPath = `./assets/geoJSON/${code}_bound.json`;
  return Promise.all([boundPath,fullPath].map(path => {
    return new Promise((resolve, reject) => {
      fetch(path)
        .then(res => {
          if (!res.ok) {
              reject(new Error('网络响应错误：' + res.status));
          }
          return res.json();
        })
        .then(data => {
          resolve(data);
        })
    })
  }))
}
// 从 GeoJSON Feature 中提取所有坐标点
function getAllCoordinates(geojson){
  const coords = [];
  function extract(obj){
    if (!obj) return;
    if (obj.type === 'FeatureCollection'){
      obj.features.forEach(extract);
    } else if (obj.type === "Feature"){
      extract(obj.geometry);
    } else if (obj.geometry){
      extract(obj.geometry);
    } else if (obj.type === 'Polygon'){
      obj.coordinates.forEach(ring => {
        ring.forEach(p => {
          coords.push(p);
        })
      })
    } else if (obj.type === 'MultiPolygon'){
      obj.coordinates.forEach(poly => {
        poly.forEach(ring => {
          ring.forEach(p => {
            coords.push(p);
          })
        })
      })
    } else if (obj.type === 'Point'){
      coords.push(obj.coordinates);
    } else if (obj.type === 'LineString'){
      obj.coordinates.forEach(p => {
        coords.push(p);
      })
    } else if (obj.type === 'MultiLineString'){
      obj.coordinates.forEach(line => {
        line.forEach(p => {
          coords.push(p);
        })
      })
    }
  }
  extract(geojson);
  return coords;
}
// 计算 GeoJSON Feature 的质心（简化版本
function centerOfMass(feature){
  const coords = getAllCoordinates(feature);
  if (coords.length === 0) return { geometry: { coordinates: [0, 0] } };
  let sumX = 0,
    sumY = 0;
  for (const [x, y] of coords) {
    sumX += x;
    sumY += y;
  }
  return {
    geometry: {
      coordinates: [sumX / coords.length, sumY / coords.length],
    },
  };
}

//获取 GeoJSON 的 bbox [minX, minY, maxX, maxY]
function bbox(feature){
  const coords = getAllCoordinates(feature);
  if (coords.length === 0) return [0, 0, 0, 0];
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  for (const [x, y] of coords) {
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }
  return [minX, minY, maxX, maxY];
}
//  创建 FeatureCollection
function featureCollection(features){
  return {
    type: "FeatureCollection",
    features,
  };
}
// 分段色阶 - 根据规则区间匹配颜色
// 应用场景: 地图区域分级、等级分类
function separateColor(value, rules, defaultColor) {
  if (!Array.isArray(rules) || !rules.length) return defaultColor;
  for (let i = rules.length - 1; i >= 0; i--) {
    if (value >= rules[i].value) {
      return rules[i].color;
    }
  }
  return defaultColor;
}
// 范围色阶 - 根据 value 在 [min, max] 区间线性插值颜色
// 应用场景: 热力图、数据可视化渐变色
function rangeColor(startColor, endColor, min, max, value) {
  if (value == null || isNaN(value)) return endColor;
  const ratio = Math.max(0, Math.min(1, (value - min) / (max - min || 1)));
  const sc = tinycolor(startColor).toRgb();
  const ec = tinycolor(endColor).toRgb();
  const r = Math.round(sc.r + (ec.r - sc.r) * ratio);
  const g = Math.round(sc.g + (ec.g - sc.g) * ratio);
  const b = Math.round(sc.b + (ec.b - sc.b) * ratio);
  return `rgb(${r},${g},${b})`;
}
// 转换飞线起点终点坐标函数
function transform(code, districtData, projection){
  let x = 0,
    y = 0;
  if (Array.isArray(code)) {
    // 情况1：直接提供经纬度坐标
    const point = projection(code);
    x = point[0];
    y = point[1];
  } else {
    // 情况2：提供区域代码，查找对应区域的中心点
    const district = districtData.find((city) => city.adcode == code);
    if (district) {
      const center = district.centroid || district.center; // 优先使用 centroid（质心）
      const point = projection(center);
      x = point[0];
      y = point[1];
    } else {
      return false; // 未找到区域
    }
  }
  // 如果 x == y 说明投影失败（通常不会出现）
  if (x == y) return null;
  return [x, y];
}
function transformRgb(color){
  const c = tinycolor(color);
  const rgb = c.toRgb();
  return {
    r: rgb.r,
    g: rgb.g,
    b: rgb.b,
    opacity: rgb.a,
  };
}
// 更新飞行线动画 - 每帧调用
function updateMiniFly(group){
  group.forEach((mesh) => {
    // Material 可能是数组或 ShaderMaterial，需要类型守卫
    const material = mesh.material;
    const uniforms = material.uniforms;
    // 当主系统 time 达到 0 时，激活对应的副系统
    if (uniforms.time.value >= 0 && !mesh._isHalf) {
      const halfMesh = group.find((it) => it._isHalf === mesh.uuid);
      if (halfMesh) halfMesh._isHalf = null; // 取消 _isHalf 标记，启用副系统
    }

    // 跳过未激活的副系统
    if (mesh._isHalf) return false;

    // 更新动画时间
    if (uniforms.time.value < mesh._total) {
      uniforms.time.value += mesh._speed * 0.5; // 每帧递增
    } else {
      // 到达终点，重置到起点
      uniforms.time.value = -uniforms.u_len.value;
    }
  });
}
// 区域渲染（hover效果）
function districtRender(){
  const { raycaster, scene } = this;

  if (this.pickDistrictMesh) {
    const mesh = this.pickDistrictMesh.object;
    mesh.material[0].opacity = mesh.material[0]._opacity;
    if (mesh._type === "district") {
      const { deriveColor, textStyle } = mesh._privateData;
      const polygonFormat = tinycolor(deriveColor);
      const { r, g, b } = polygonFormat.toRgb();
      mesh.material[0].color.set(`rgb(${r},${g},${b})`);

      if (mesh._label) {
        const ele = mesh._label;
        Object.keys(textStyle).forEach((key) => {
          if (typeof textStyle[key] === 'number') {
            ele.style[key] = textStyle[key] + "px";
          } else if (Array.isArray(textStyle[key])) {
            ele.style[key] = textStyle[key].join("px ") + "px";
          } else {
            ele.style[key] = textStyle[key];
          }
        });
      }
    }
  }

  this.pickDistrictMesh = null;
  const intersects = raycaster.intersectObjects(scene.children, true);
  const r = intersects.filter((it) => it.object._type === "district" || it.object._type === "scatter");

  if (r.length && (r[0].object)._type === "district") {
    this.pickDistrictMesh = r[0];
    const mesh = this.pickDistrictMesh.object;
    mesh.material[0]._opacity = mesh.material[0].opacity;

    const { emphasisColor, emphasisText } = mesh._privateData;
    emphasisColor && mesh.material[0].color.set(emphasisColor);
    if (emphasisText && mesh._label) {
      const ele = mesh._label;
      Object.keys(emphasisText).forEach((key) => {
        if (typeof emphasisText[key] === 'number') {
          ele.style[key] = emphasisText[key] + "px";
        } else if (Array.isArray(emphasisText[key])) {
          ele.style[key] = emphasisText[key].join("px ") + "px";
        } else {
          ele.style[key] = emphasisText[key];
        }
      });
    }
  }
}
// 侧边动画
function districtAnimate (mapUf) {
  if (!mapUf) return false;
  const deltaTime = this.clock.getDelta();
  mapUf.uTime.value += deltaTime;
  if (mapUf.uTime.value >= 2) {
    mapUf.uTime.value = 0.0;
  }
};
// 生成 Fragment Shader 代码片段 - 实现侧面扫光动画效果
function outputFragment(depth){
  return `
  // 获取基础间接漫反射光照
  vec3 outgoingLight = reflectedLight.indirectDiffuse;
  
  // 垂直渐变：根据 z 高度在黑色和浅蓝色之间插值，模拟天空光
  vec3 gradient = mix(vec3(0,0,0),vec3(0.9,0.9,1.0), vPosition.z/${depth}.0);
  outgoingLight = outgoingLight*gradient;
  
  // 计算扫光带的当前位置 y = 起始位置 + 时间 * 速度
  float y = uStart + uTime * uSpeed;
  float h = uHeight / 1.0; // 扫光带高度
  
  // 如果顶点在扫光带范围内 [y, y+h]，则与高亮颜色混合
  if(vPosition.z > y && vPosition.z < y + h * 1.0) {
      float per = 0.0; // 混合比例
      if(vPosition.z < y + h){
          // 上升阶段：从原始颜色渐变到高亮色
          per = (vPosition.z - y) / h;
          outgoingLight = mix(outgoingLight,uColor,per);
      }else{
          // 下降阶段：从高亮色渐变回原始颜色
          per = (vPosition.z - y - h) / h;
          outgoingLight = mix(uColor,outgoingLight,per);
      }
  }
  
  // 输出最终颜色（保持原始 alpha 通道）
  diffuseColor = vec4( outgoingLight, diffuseColor.a );
  `;
}
/**
 * 创建侧面材质 - 应用扫光动画 Shader
 *
 * Shader 注入原理：
 * 1. 使用 onBeforeCompile 钩子在编译前修改 Three.js 内置 shader
 * 2. 在 vertexShader 中传递 vPosition 到 fragmentShader
 * 3. 在 fragmentShader 中注入自定义 uniform 变量和扫光逻辑
 * 4. 替换默认光照计算为 outputFragment 生成的扫光代码
 *
 * Uniform 变量说明：
 * - uTime: 动画时间（0-2 循环），每帧累加 deltaTime
 * - uHeight: 扫光带高度（depth/2）
 * - uColor: 扫光高亮颜色（科技蓝）
 * - uStart: 扫光起始位置（-depth/2，从底部开始）
 * - uSpeed: 扫光移动速度（depth/4，深度越大速度越快）
 *
 * @param color - 侧面基础颜色
 * @param uColor - 扫光高亮颜色
 * @param config - 地图配置（包含 depth）
 * @returns { mapUf: Uniform 对象引用, materialSide: 编译后的材质 }
 */
function createSideMaterial(color, uColor, config){
  const { depth } = config;
  // 创建 Uniform 变量对象，动画循环时会修改 uTime.value
  const mapUf = {
    uTime: { value: 0.0 }, // 当前动画时间
    uHeight: { value: depth / 2 }, // 扫光带高度
    uColor: { value: new THREE.Color(uColor) }, // 高亮颜色（RGB）
    uStart: { value: -depth / 2 }, // 起始 Z 坐标（底部）
    uSpeed: { value: Math.ceil(depth / 4) }, // 移动速度
  };
  // 解析颜色字符串获取 RGB 和 Alpha
  const format = tinycolor(color);
  const { r, g, b } = format.toRgb();
  // 创建基础材质（MeshBasicMaterial 无光照计算，性能更好）
  const materialSide = new THREE.MeshBasicMaterial({
    color: `rgb(${r},${g},${b})`,
    transparent: true,
    opacity: format.getAlpha(),
  });

  // onBeforeCompile: 在 shader 编译前注入自定义代码
  materialSide.onBeforeCompile = (shader) => {
    // 将自定义 uniform 合并到 shader.uniforms
    shader.uniforms = {
      ...shader.uniforms,
      ...mapUf,
    };

    // 修改 Vertex Shader：声明 varying 变量传递顶点位置到 Fragment Shader
    shader.vertexShader = shader.vertexShader.replace(
      "void main() {",
      `
          varying vec3 vPosition; // 将 position 传递给 fragment shader
          void main() {
            vPosition = position; // 赋值顶点局部坐标
        `,
    );

    // 修改 Fragment Shader：声明 varying 和 uniform 变量
    shader.fragmentShader = shader.fragmentShader.replace(
      "void main() {",
      `
          varying vec3 vPosition;  // 接收 vertex shader 传来的位置
          uniform float uTime;     // 动画时间
          uniform vec3 uColor;     // 高亮颜色
          uniform float uSpeed;    // 扫光速度
          uniform float uStart;    // 起始位置
          uniform float uHeight;   // 扫光带高度
          void main() {
        `,
    );

    // 替换默认光照计算为扫光动画逻辑
    const d = parseInt(String(config.depth / 2));
    shader.fragmentShader = shader.fragmentShader.replace("vec3 outgoingLight = reflectedLight.indirectDiffuse;", outputFragment(d));
  };

  return { mapUf, materialSide };
}
// 创建 Bloom 发光效果处理器
function drawGlow(options){
  const glow = options.glow;
  const { scene, camera, renderer, innerWidth, innerHeight } = this;
  // 创建渲染通道
  const renderPass = new THREE.RenderPass(scene, camera);

  // 创建 Bloom 通道
  const bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(renderer.domElement.offsetWidth, renderer.domElement.offsetHeight), 1, 1, 0.1);
  bloomPass.threshold = glow.threshold; // 亮度阈值
  bloomPass.strength = glow.strength; // 发光强度
  bloomPass.radius = glow.radius; // 扩散半径
  // Bloom 合成器: 仅渲染高亮区域
  const bloomComposer = new THREE.EffectComposer(renderer);
  bloomComposer.renderToScreen = false; // 不直接输出到屏幕
  bloomComposer.addPass(renderPass);
  bloomComposer.addPass(bloomPass);
  // 最终合成器: 混合基础渲染 + Bloom
  const finalComposer = new THREE.EffectComposer(renderer);
  // 混合 Shader 通道
  const shaderPass = new THREE.ShaderPass(
    new THREE.ShaderMaterial({
      uniforms: {
        baseTexture: { value: null }, // 基础渲染输入
        bloomTexture: { value: bloomComposer.renderTarget2.texture }, // Bloom 纹理输入
      },
      vertexShader: vs,
      fragmentShader: fs,
      defines: {},
    }),
    "baseTexture",
  );
  shaderPass.needsSwap = true; // 需要交换 render target
  finalComposer.addPass(renderPass);
  finalComposer.addPass(shaderPass);
    
  // SMAA 抗锯齿通道
  const smaaPass = new THREE.SMAAPass();
  finalComposer.addPass(smaaPass);

  return { bloomComposer, finalComposer };
}
// 绘制标签 DOM 元素 - 创建带样式的标签 HTML
function drawLabel(options, data){
  const { padding, borderRadius, backgroundColor, borderColor, borderWidth, textStyle } = options.itemStyle;
  const label = document.createElement("div");
  label.style.pointerEvents = "auto"; // 启用鼠标事件
  label.style.cursor = "pointer";
  // 应用基础样式
  label.style.padding = padding.join("px ") + "px";
  label.style.borderRadius = Array.isArray(borderRadius) ? borderRadius.join("px ") + "px" : borderRadius + "px";
  label.style.backgroundColor = backgroundColor;
  label.style.borderColor = borderColor;
  label.style.borderWidth = typeof borderWidth === "number" ? borderWidth + "px" : borderWidth;

  // 应用文本样式 (fontSize, color, fontWeight 等)
  Object.keys(textStyle).forEach((key) => {
    const val = textStyle[key];
    if (typeof val === "number") {
      label.style[key] = val + "px"; // 数字值添加 px
    } else if (Array.isArray(val)) {
      label.style[key] = val.join("px ") + "px"; // 数组值如 margin
    } else {
      label.style[key] = val; // 字符串值直接赋值
    }
  });

  // 生成标签内容
  const name = options.name;
  let innerHtml = "";
  if (typeof options.formatter === "function" && options.isFormatter) {
    // 使用自定义 formatter
    innerHtml = options.formatter(data);
  } else {
    // 使用模板字符串 {a} {b} {c} {d}
    innerHtml = labelStringToFunction(name, data);
  }
  label.innerHTML = innerHtml;
  label.className = `three-label-name ${options.className || ""}`; // 应用自定义类名

  return label;
}
//  辅助函数：批量构建拉伸几何体（ExtrudeGeometry）
function drawShapeAssist(shapeData){
  const group = new THREE.Group();
  shapeData.forEach((item) => {
    const { shape, extrudeSettings, material, materialSide, _privateData, label, scale } = item;
    // ExtrudeGeometry 将 2D Shape 沿 Z 轴拉伸，生成带厚度的 3D 几何体
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    // 双材质数组：[0] 用于顶面和底面，[1] 用于侧面
    const district = new THREE.Mesh(geometry, [material, materialSide]);
    // 标记类型方便后续 raycaster 拾取判断
    district._type = "district";
    district._privateData = _privateData; // 存储区域属性、颜色、高亮配置等
    // 绕 X 轴旋转 -90度，将 XY 平面转为 XZ 平面（Three.js 默认 Y 轴向上）
    district.rotation.x = -0.5 * Math.PI;
    // Z 轴缩放 2/scale，调整拉伸高度以匹配地图比例
    district.scale.set(1, 1, 2 / scale);
    // 关联 CSS2D 标签的 DOM 元素，用于高亮时访问
    label && (district._label = label.element);
    group.add(district);
  });
  return group;
}
function createMesh({ curvePoints, speed, color, size, len }){
  // 自定义 Shader 代码
  const flightShader = {
    // Vertex Shader：计算顶点位置和粒子大小
    vertexshader: `
        uniform float size;        // 粒子基础大小
        uniform float time;        // 当前动画时间
        uniform float u_len;       // 显示窗口长度
        attribute float u_index;   // 顶点索引（用于判断是否在窗口内）
        varying float u_opacitys;  // 传递给 fragment shader 的透明度
        
        void main() {
            // 判断当前顶点是否在显示窗口内 [time, time+u_len]
            if( u_index < time + u_len && u_index > time){
                // 计算粒子在窗口中的位置比例（0.0 - 1.0）
                float u_scale = 1.0 - (time + u_len - u_index) /u_len;
                u_opacitys = u_scale;  // 传递透明度
                
                // 计算视空间位置
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                gl_Position = projectionMatrix * mvPosition;
                
                // 设置粒子大小：距离越远越小，且根据 u_scale 缩放
                gl_PointSize = size * u_scale * 300.0 / (-mvPosition.z);
            }
        }
        `,
    // Fragment Shader：计算粒子颜色和透明度
    fragmentshader: `
        uniform sampler2D u_map;   // 粒子纹理
        uniform float u_opacity;   // 基础透明度
        uniform vec3 color;        // 粒子颜色
        uniform float isTexture;   // 是否启用纹理
        varying float u_opacitys;  // 从 vertex shader 传入的透明度
        
        void main() {
            // 组合颜色和透明度
            vec4 u_color = vec4(color,u_opacity * u_opacitys);
            
            // 如果启用纹理，与纹理相乘（gl_PointCoord 为粒子的 UV 坐标）
            if( isTexture != 0.0 ){
                gl_FragColor = u_color * texture2D(u_map, vec2(gl_PointCoord.x, 1.0 - gl_PointCoord.y));
            }else{
                // 纯色粒子
                gl_FragColor = u_color;
            }
        }`,
  };
  // 创建几何体
  const geometry = new THREE.BufferGeometry();
  const { opacity } = transformRgb(color); // 解析颜色获取透明度
  const threeColor = new THREE.Color(color);
  // 创建 Shader 材质
  const material = new THREE.ShaderMaterial({
    uniforms: {
      color: { value: threeColor }, // 粒子颜色
      size: { value: size }, // 粒子大小
      u_map: { value: pointTexture }, // 粒子纹理
      u_len: { value: len }, // 显示窗口长度
      u_opacity: { value: opacity }, // 透明度
      time: { value: -len }, // 初始时间（负值使粒子从起点外开始）
      isTexture: { value: 1.0 }, // 启用纹理
    },
    transparent: true, // 启用透明
    depthTest: false, // 禁用深度测试（粒子始终可见）
    vertexShader: flightShader.vertexshader,
    fragmentShader: flightShader.fragmentshader,
  });

  // 构建 position 和 u_index 属性
  const [position, u_index] = [[], []];
  curvePoints.forEach((it, index) => {
    position.push(it.x, it.y, it.z); // 添加顶点坐标
    u_index.push(index); // 添加顶点索引（用于 shader 中判断）
  });
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(position, 3));
  geometry.setAttribute("u_index", new THREE.Float32BufferAttribute(u_index, 1)); // 自定义属性
  // 创建 Points 对象（粒子系统）
  // 由于 THREE.Points 类型不包含自定义属性，需要先转为 unknown 再转为 FlightMesh
  const mesh = new THREE.Points(geometry, material);

  // 附加自定义属性，用于动画更新
  mesh._speed = speed; // 移动速度
  mesh._repeat = Infinity; // 无限循环
  mesh._been = 0; // 已经移动的距离（未使用）
  mesh._total = curvePoints.length; // 总点数

  return mesh;
}
// 绘制飞线
function drawFlight(options, config){
  console.log('看一下传入绘制飞线时的options数据')
  console.log(options)
  const projection = this.projection;
  const modelScale = this.scale; // 地图缩放比例
  const data = options.data || [];
  const group = new THREE.Group();
  const { depth, scale } = config;
  const z = (depth + 1) / scale; // 飞行线的基准高度
  const { flightColor, headSize, points, speed = 10 } = options;
  // todo
  // const size = (1 * headSize) / scale; // 粒子大小
  const size = (6 * headSize) / scale; // 粒子大小
  data.forEach((it) => {
    // 转换起点和终点坐标
    const start = transform(it.start, this.districtData, projection);
    const end = transform(it.end, this.districtData, projection);
    if (start && end){
      const [sx, sy] = start;
      const [ex, ey] = end;
      // 创建起点和终点的 Vector3
      const startPoint = new THREE.Vector3(sx, z, sy);
      const endPoint = new THREE.Vector3(ex, z, ey);
      // 计算中间控制点
      const middle = new THREE.Vector3(0, 0, 0);
      middle.add(startPoint).add(endPoint).divideScalar(2); // 中点 = (起点 + 终点) / 2
      const L = startPoint.clone().sub(endPoint).length(); // 起终点距离
      middle.y = z + L * 0.4 * modelScale; // 抬高控制点，形成抛物线
      // 使用二次贝塞尔曲线连接三个点
      const curve = new THREE.QuadraticBezierCurve3(startPoint, middle, endPoint);
      const curvePoints = curve.getPoints(points * 2); // 离散化曲线

      const color = flightColor[0];
      const len = curvePoints.length;

      // 创建主粒子系统
      const mesh = createMesh({ curvePoints, speed, color, size, len });
      // 创建副粒子系统（用于循环动画）
      const halfMesh = createMesh({ curvePoints, speed, color, size, len });
      halfMesh._isHalf = mesh.uuid; // 关联到主系统

      group.add(mesh);
      group.add(halfMesh);
    }
  });
  group._category = "flight"; // 标记类型
  return group;
}
// 绘制区域名称
function drawDistrictName(data, options, properties, feature, config){
  const projection = this.projection;
  let center = properties.centroid || properties.center;
  if (options.show){
    if (!Array.isArray(center)) {
      center = centerOfMass(feature).geometry.coordinates;
    }
    const [x, y] = projection(center);
    const label = drawLabel(options, { ...properties, ...data });
    let now = new Date().getTime();
    let isDbl = false;
    label.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      e.preventDefault();
      const clickTime = new Date().getTime();
      if (clickTime - now < 300) {
        isDbl = true;
        if (this.events["dblclick"]) {
          this.events["dblclick"].forEach((cb) => {
            cb(properties);
          });
        }
      } else {
        setTimeout(() => {
          if (!isDbl && this.events["click"]) {
            this.events["click"].forEach((cb) => {
              cb(properties);
            });
          }
          isDbl = false;
        }, 300);
      }
      now = clickTime;
    });
    const name = new THREE.CSS2DObject(label);
    const { depth, scale } = config;
    const z = (depth + 1) / scale;
    name.position.set(x, z, y);
    name._type = "label";
    name._isDistrict = true;
    return name;
  }
}

/**
 * 构建区域数据 - 核心渲染函数
 *
 * 工作流程：
 * 1. 数据准备：解析颜色范围、映射 data 到 district，计算分段/渐变色阶
 * 2. GeoJSON 遍历：处理 Polygon 和 MultiPolygon 几何类型
 * 3. 坐标投影：将经纬度坐标通过 d3.geoMercator 转为屏幕坐标
 * 4. Shape 构建：使用 THREE.Shape 构造 2D 轮廓（moveTo/lineTo）
 * 5. 几何生成：
 *    - ShapeGeometry: 快速平面几何（低精度预览）
 *    - ExtrudeGeometry: 延迟创建的拉伸几何（高精度渲染）
 * 6. 材质应用：顶面材质、侧面扫光材质
 * 7. 纹理映射：计算 BoundingBox，UV 比例缩放，应用中性灰度纹理
 *
 * 返回值说明：
 * - meshGroup: 包含边界线和标签的组合
 * - advanceMeshGroup: 包含平面 ShapeGeometry Mesh 的组合（用于快速预览）
 * - districtData: 所有区域属性数组
 * - _realShape: 延迟创建函数，返回 ExtrudeGeometry 的 Promise
 * - mapTexture: 纹理对象引用
 * - mapUf: Uniform 对象，用于扫光动画控制
 *
 * @param data - 用户数据数组（district, value, color）
 * @param options - 系列配置（itemStyle, emphasis, label 等）
 * @param features - GeoJSON Feature 数组
 * @param config - 地图全局配置（depth, scale）
 */
function drawDistrict(data, options, features, config){
  const projection = this.projection;
  const itemStyle = options.itemStyle;
  const emphasis = options.emphasis;
  const seriesName = options.seriesName;
  const range = itemStyle.range;

  // 色阶参数解析：如果开启 range.show，根据 value 计算颜色
  let sc = null; // startColor
  let ec = null; // endColor
  let min = Number.MIN_SAFE_INTEGER;
  let max = Number.MAX_SAFE_INTEGER;
  if (range.show) {
    sc = range.color[0];
    ec = range.color[1];
    min = range.min;
    max = range.max;
  }

  // 构建 district -> DataItem 的映射表，并计算每个区域的显示颜色
  const dataMap = new Map();
  data.forEach((it) => {
    if (sc != null && ec != null) {
      const value = it.value;
      let color;
      // 分段色阶 vs 渐变色阶
      if (range.mode === "separate") {
        // 分段：根据 rules 匹配颜色
        color = separateColor(value, range.rules, ec);
      } else {
        // 渐变：在 [min, max] 范围内线性插值
        color = rangeColor(sc, ec, min, max, value);
      }
      it.color = color;
    } else {
      it.color = null; // 使用默认颜色
    }
    dataMap.set(it.district + "", it);
  });

  const lineStyle = options.lineStyle;
  const topColor = itemStyle.topColor; // 顶面颜色
  const sideColor = itemStyle.sideColor; // 侧面基色
  const uColor = itemStyle.uColor; // 扫光高亮色

  // 解析边界线颜色
  const lineColor = lineStyle.color;
  const lineFormat = tinycolor(lineColor);
  const lineRgb = lineFormat.toRgb();
  const lineOpacity = lineFormat.getAlpha();
  const _lineColor = `rgb(${lineRgb.r},${lineRgb.g},${lineRgb.b})`;
  // 创建侧面扫光材质，返回 Uniform 引用和材质对象
  const { mapUf, materialSide } = createSideMaterial(sideColor, uColor, config);
  let mapTexture = null;

  const meshGroup = new THREE.Group(); // 快速组：线框 + 标签
  const advanceMeshGroup = new THREE.Group(); // 预览组：ShapeGeometry 平面体

  const { depth, scale } = config;
  const z = (depth + 1) / scale; // Z 轴基准高度
  const districtData = []; // 收集所有区域属性
  const shapeData = []; // 收集 ExtrudeGeometry 所需数据

  // 遍历 GeoJSON features，每个 feature 代表一个省/市/区
  features.forEach((feature) => {
    let { geometry, properties } = feature;

    districtData.push(properties); // 收集所有区域属性
    properties.seriesName = seriesName;
    const item = dataMap.get(properties.adcode + ""); // 匹配用户数据

    let { coordinates } = geometry;
    // 合并 properties 和用户 data，用户数据优先级更高
    properties = deepMerge({}, properties, item || {});

    // 绘制区域名称标签（CSS2DObject）
    const label = drawDistrictName.call(this, item ? item : undefined, options.label, properties, feature, options.config);
    label && meshGroup.add(label);
    // 处理 Polygon 和 MultiPolygon 两种几何类型
    // Polygon: [[x,y],[x,y],...]
    // MultiPolygon: [[[x,y],[x,y],...], [[x,y],[x,y],...]]
    if (geometry.type === "Polygon") {
      coordinates = [coordinates]; // 统一转为 MultiPolygon 格式
    }
    coordinates.forEach((multiPolygon) => {
      multiPolygon.forEach((polygon) => {
        const shape = new THREE.Shape(); // 创建 2D 轮廓 Shape
        // 创建边界线材质
        const lineMaterial = new THREE.LineBasicMaterial({
          color: _lineColor,
          transparent: true,
          opacity: lineOpacity,
        });
        const points = []; // 用于 LineGeometry
        // 遍历多边形的每个顶点
        for (let i = 0; i < polygon.length; i++) {
          // 将经纬度 [lng, lat] 投影到屏幕坐标 [x, y]
          const [x, y] = projection(polygon[i]);

          // 第一个点使用 moveTo，后续点使用 lineTo 连接成闭合图形
          if (i === 0) {
            shape.moveTo(x, -y); // Y 轴反转（地理坐标系 -> Three.js 坐标系）
          }
          if (x && y) {
            shape.lineTo(x, -y); // 构建 Shape 路径
            points.push(new THREE.Vector3(x, -y, z)); // 构建边界线顶点
          }
        }
        // 使用顶点数组创建线条几何体
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
        // ExtrudeGeometry 拉伸设置：深度 + 斜角参数
        const extrudeSettings= {
          depth: depth / 2, // 拉伸深度（为 depth 的一半，后续缩放 2x）
          bevelEnabled: true, // 启用斜角
          bevelSegments: 10, // 斜角分段数，增加圆滑度
          bevelThickness: 0.1, // 斜角厚度
        };
        // 决定顶面颜色：用户 data 中的 color > 默认 topColor
        const color = item && item.color ? item.color : topColor;
        const polygonFormat = tinycolor(color);
        const { r, g, b } = polygonFormat.toRgb();

        // 创建顶面/底面材质（MeshBasicMaterial 无光照）
        const material = new THREE.MeshBasicMaterial({
          color: `rgb(${r},${g},${b})`,
          transparent: true,
          opacity: polygonFormat.getAlpha(),
        });

        // 构建私有数据对象，存储于 Mesh._privateData 用于交互
        const _privateData = {
          ...properties,
          deriveColor: color, // 计算后的颜色
          textStyle: options.label.itemStyle.textStyle, // 标签样式
        };

        // 如果启用 emphasis （鼠标悬停高亮），存储高亮配置
        if (emphasis.show) {
          _privateData["emphasisColor"] = emphasis.topColor; // hover 时的颜色
          _privateData["emphasisText"] = emphasis.textStyle; // hover 时的文字样式
        } else {
          Reflect.deleteProperty(_privateData, "emphasisColor");
          Reflect.deleteProperty(_privateData, "emphasisText");
        }
        // 将数据收集到 shapeData，用于延迟创建 ExtrudeGeometry
        shapeData.push({
          shape,
          extrudeSettings,
          material,
          materialSide,
          label: label || null,
          scale,
          _privateData,
        });
        // 创建快速预览版本：ShapeGeometry 平面体（不带厚度）
        const shapeGeo = new THREE.ShapeGeometry(shape);
        const district = new THREE.Mesh(shapeGeo, material);
        district._type = "shape_district"; // 标记为平面版本
        district._privateData = _privateData;

        // 旋转到 XZ 平面并抬高到区域拉伸的顶部
        district.rotation.x = -0.5 * Math.PI;
        district.position.y = depth / scale; // 抬高到顶部

        label && (district._label = label.element);
        advanceMeshGroup.add(district); // 加入预览组
        // 创建边界线 Mesh
        const line = new THREE.Line(lineGeometry, lineMaterial);
        line.rotation.x = -0.5 * Math.PI;
        line._type = "districtLine";
        lineOpacity > 0 && meshGroup.add(line); // 只在不透明时添加
      })
    })
  });

  // ==================== 纹理映射：计算 UV 缩放并应用纹理 ====================
  if (options.texture && options.texture.show) {
    // 计算 advanceMeshGroup 的包围盒，获取整个地图的边界
    const box = new THREE.Box3().setFromObject(advanceMeshGroup);
    const boxMin = box.min;
    const boxMax = box.max;

    // 计算 UV 缩放比例：1 / 地图宽度，1 / 地图高度
    // 这样纹理会铺满整个地图区域
    const uvScale = new THREE.Vector2(1 / (boxMax.x - boxMin.x), 1 / (boxMax.z - boxMin.z));
    // 缓存 uvScale 到上下文，避免切换地图时重复计筗
    if (this.refresh) {
      this.uvScale = uvScale;
    }
    if (!mapTexture){
      let scaleX = 1;
      let scaleY = 1;
      const { repeat, autoRepeat, offset } = options.texture;

      // 加载纹理图片：自定义图片 or 默认灰度纹理
      if (options.texture.image !== "default") {
        const image = options.texture.image;
        const texture = new THREE.TextureLoader().load(image);
        mapTexture = texture;
      } else {
        mapTexture = staticTexture; // 使用预加载的 china_tintable_hc.png
      }
      // 自动重复 vs 手动设置重复次数
      if (autoRepeat) {
        const { x, y } = repeat;
        scaleX = x;
        scaleY = y;
      } else {
        // 使用计算的 UV 缩放，纹理铺满整个地图
        scaleX = this.uvScale.x;
        scaleY = this.uvScale.y;
      }
      // 纹理配置：
      mapTexture.flipY = true; // Y 轴翻转（匹配地理坐标系）
      mapTexture.wrapS = THREE.RepeatWrapping; // 水平重复
      mapTexture.wrapT = THREE.RepeatWrapping; // 垂直重复
      mapTexture.repeat.set(scaleX, scaleY); // 设置重复次数
      mapTexture.offset.set(offset.x, offset.y); // 偏移量
    }

    // 将纹理应用到所有区域 Mesh 的 material.map
    advanceMeshGroup.children.forEach((district) => {
      district.material.map = mapTexture;
      district.material.needsUpdate = true; // 通知 Three.js 重新编译 shader
    });
  }

  // isClearRef 用于检查地图是否已被销毁，避免延迟创建时执行已销毁的操作
  const isClearRef = this;

  /**
   * 延迟创建 ExtrudeGeometry - 避免卡顿，提升首屏渲染速度
   *
   * 延迟策略：
   * - 立即显示 ShapeGeometry（平面版，性能高）
   * - 17ms 后异步创建 ExtrudeGeometry（拉伸版，计算量大）
   * - ThreeMap.ts 中会调用该函数，用 ExtrudeGeometry 替换 ShapeGeometry
   *
   * @returns Promise<THREE.Group> - 包含所有 ExtrudeGeometry Mesh 的 Group
   */
  let _realShapeTimerId = null;
  const _realShape = () => {
    return new Promise((resolve) => {
      // setTimeout 17ms 约等于 1 帧（60fps），让浏览器先渲染平面版
      _realShapeTimerId = setTimeout(() => {
        _realShapeTimerId = null;
        if (!isClearRef.isClear) {
          // 调用 drawShapeAssist 批量构建 ExtrudeGeometry
          const group = drawShapeAssist(shapeData);
          resolve(group);
        } else {
          // 已销毁，返回空 Group
          resolve(new THREE.Group());
        }
      }, 17);
    });
  };

  const _cancelRealShape = () => {
    if (_realShapeTimerId !== null) {
      clearTimeout(_realShapeTimerId);
      _realShapeTimerId = null;
    }
  };
  return { mapUf, meshGroup, advanceMeshGroup, districtData, _realShape, _cancelRealShape, mapTexture };
}


// ============> 定义的地图类
class ThreeMap {
  // el 为外部挂载dom
  constructor(el, tooltipDom){
    this.el = el;
    this.innerWidth = el.offsetWidth;
    this.innerHeight = el.offsetHeight;

    // 是否已初始化相机
    this.isInitCamera = false;
    // 映射map
    this.registerList = new Map();
    // 场景
    this.scene = null;
    // 渲染器
    this.renderer = null;
    // 相机
    this.camera = null;
    this.tooltipDom = tooltipDom;
    this.tooltip = null;

    this.events = {};
    this.mapTextures = [];
    this.projection = null;
    // 坐标辅助器
    this.axesHelper = null;
    this.cacheMaterials = {};
    this.cacheDarkMaterials = {};

    this.districtData = [];
    // 地图的功能组
    this.seriesGroup = new THREE.Group();
    // 地图的环境组
    this.environmentGroup = new THREE.Group();
    this.refresh = true;

    this.scale = 1;

    this.cacheModel = {
      modelScale: [],
      modelBox: null,
      code: null,
    };

    this.foundationIns = [];
    this.isClear = false;

    // 2D的光标点
    this.pointer = new THREE.Vector2(-100000, -10000);
    // 鼠标移动事件的实时事件对象
    this.mouseEvent = null;
    // 配置项
    this.options = null;
    this.mapKey = "";
    this.pickDistrictMesh = null;
    this.bloomComposer = null;
    this.finalComposer = null;
    this.controls = null;
    // 地名的CSS2D渲染器
    this.CSS2DRenderer = null;
    this.lights = [];
    this.clock = null;
    // 射线拾取器
    this.raycaster = null;
    this.resizeObserver = null;
    this._cancelRealShape = null;

    // 自定义鼠标移动事件
    const onPointerMove = (mouseEvent) => {
      this.pointer.x = (mouseEvent.offsetX / this.innerWidth) * 2 - 1;
      this.pointer.y = -(mouseEvent.offsetY / this.innerHeight) * 2 + 1;
      this.mouseEvent = mouseEvent;
    }
    this.onPointerMove = onPointerMove;

    const onPointerClick = (e) => {
      e.stopPropagation();
      e.preventDefault();
      const { raycaster, scene } = this;
      if (!raycaster || !scene) return;
      const intersects = raycaster.intersectObjects(scene.children, true);
      const r = intersects.filter(it => it.object._type === "cylinder" || it.object._type === "district" || it.object._type === "scatter");
      if (r.length){
        const mesh = r[0].object;
        const { deriveColor, ...properties } = mesh._privateData;
        if (this.events["click"]) {
          this.events["click"].forEach((cb) => {
            cb(properties);
          });
        }
      }
    }
    this.onPointerClick = onPointerClick;
    this.el.addEventListener("mousemove", this.onPointerMove);
    this.el.addEventListener("mousedown", this.onPointerClick);

    // 初始化场景
    this.scene = new THREE.Scene();
    this.scene.add(this.seriesGroup);
    this.scene.add(this.environmentGroup);
    this.clock = new THREE.Clock();
    // 初始化射线拾取器
    this.raycaster = new THREE.Raycaster();

    // 初始化灯光
    this.lights = this.setLight();
    // 初始化相机
    this.initCamera();
    // 设置渲染器
    this.setRenderer();
    // 设置CSS渲染器
    this.setCssRenderer();
    // 添加坐标辅助器
    this.addHelper();
    // 设置控制器
    this.setController();

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.el);
  }

  // 创建四向平行光,增强地图立体层次
  setLight(){
    const front = new THREE.DirectionalLight(0xe8eaeb, 0.8);
    front.position.set(0, 15, 25);
    const back = front.clone();
    back.position.set(0, 15, -25);
    const left = front.clone();
    left.position.set(-25, 15, 0);
    const right = front.clone();
    right.position.set(25, 15, 0);

    this.scene.add(front);
    this.scene.add(back);
    this.scene.add(left);
    this.scene.add(right);
    return [front, back, left, right];
  }
  // 初始化透视相机默认位置
  initCamera(){
    this.camera = new THREE.PerspectiveCamera(75, this.innerWidth / this.innerHeight, 0.1, 1000);
    this.camera.position.set(1, 5, 5);
    this.camera.lookAt(0, 0, 0);
  }
  // 设置渲染器
  setRenderer(){
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
    });
    this.renderer.setSize(this.innerWidth, this.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMapSoft = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setAnimationLoop(this.animate.bind(this));
    this.renderer.setClearAlpha(0);
    this.el.appendChild(this.renderer.domElement);
  }
  // 初始化 CSS2DRenderer，用于渲染标签层
  setCssRenderer(){
    this.CSS2DRenderer = new THREE.CSS2DRenderer();
    this.CSS2DRenderer.setSize(this.innerWidth, this.innerHeight);
    this.CSS2DRenderer.domElement.style.position = "absolute";
    this.CSS2DRenderer.domElement.style.top = "0px";
    this.el.appendChild(this.CSS2DRenderer.domElement);
  }
  // 动画循环入口
  animate(){
    this.render();
  }
  // 每帧渲染：更新控制器、飞线/散点动画、辉光后处理与交互状态。
  render(){
    const { cacheDarkMaterials, cacheMaterials, controls, pointer, camera, raycaster, scene, bloomComposer, finalComposer } = this;
    if (!controls || !pointer || !camera || !raycaster || !scene) return;

    controls.update();
    raycaster.setFromCamera(pointer, camera);
    const flightGroup = this.seriesGroup.children.filter((it) => it._category === "flight");

    flightGroup.forEach((group) => {
      updateMiniFly(group.children);
    });

    this.CSS2DRenderer.render(scene, camera);
    scene.traverse((mesh) => {
      if (mesh instanceof THREE.Scene) {
        cacheDarkMaterials.scene = mesh.background;
        mesh.background = null;
      }

      const material = mesh.material;
      if (material && !mesh._isGlow && material.type != "ShaderMaterial") {
        cacheMaterials[mesh.uuid] = material;

        if (!cacheDarkMaterials[material.type]) {
          const Proto = Object.getPrototypeOf(material).constructor;
          cacheDarkMaterials[material.type] = new Proto({ color: 0x000000 });
        }
        mesh.material = cacheDarkMaterials[material.type];
      }
    });
    bloomComposer && bloomComposer.render();


    scene.traverse((mesh) => {
      if (cacheMaterials[mesh.uuid]) {
        mesh.material = cacheMaterials[mesh.uuid];
        delete cacheMaterials[mesh.uuid];
      }
      if (mesh instanceof THREE.Scene) {
        mesh.background = cacheMaterials.scene;
        delete cacheMaterials.scene;
      }
    });
    finalComposer && finalComposer.render();
    districtRender.call(this);

    const scatterGroup = this.seriesGroup.children.filter((it) => it._category === "scatter");
    scatterGroup.forEach((group) => {
      group.children.forEach((mesh) => {
        const ring = mesh.children[0];
        if (ring) {
          ring._scale += 0.01;
          ring.scale.set(1 * ring._scale, 1 * ring._scale, 1 * ring._scale);
          if (ring._scale <= 2) {
            ring.material.opacity = 2 - ring._scale;
          } else {
            ring._scale = 1;
          }
        }
      });
    });

    this.foundationIns.forEach((mesh) => {
      mesh && (mesh.rotation.z -= mesh._speed || 0.003);
    });

    const mapUf = this.mapUf;
    districtAnimate.call(this, mapUf);
  }
  // 设置控制器
  setController(){
    const controls = new THREE.OrbitControls(this.camera, this.el);
    controls.enableDamping = true;
    controls.maxPolarAngle = 1.2;
    controls.minPolarAngle = 0;
    controls.enablePan = false;
    this.controls = controls;
    this.controls.addEventListener("change", () => {
      const events = this.events["change"];
      events &&
        events.forEach((callback) => {
          callback(this.camera);
        });
    });
    // 设置相机距离原点的最远距离
    // this.controls.minDistance = 3;
    // 设置相机距离原点的最远距离
    // this.controls.maxDistance = 8;
    
  }
  // 添加坐标辅助器（默认长度为 0，可按需调试时放大）
  addHelper() {
    const axesHelper = new THREE.AxesHelper(0);
    axesHelper.layers.enableAll();
    this.axesHelper = axesHelper;
    this.scene.add(axesHelper);
  }
  // 响应容器尺寸变化并同步渲染器与相机参数
  resize(){
    const el = this.el;
    this.innerWidth = el.offsetWidth;
    this.innerHeight = el.offsetHeight;
    this.renderer.setSize(this.innerWidth, this.innerHeight);
    this.CSS2DRenderer.setSize(this.innerWidth, this.innerHeight);
    this.camera.aspect = this.innerWidth / this.innerHeight;
    this.camera.updateProjectionMatrix();
  }
  // 注册地图
  registerMap(code = '100000', registerCode, config){
    code = code.toString();
    registerCode = registerCode.toString();
    return register(code).then(([boundary, full]) => {
      let center = centerOfMass(boundary.features[0]).geometry.coordinates;
      let scale = 10;
      if (boundary.features[0]){
        if (config.autoScale){
          let box = bbox(boundary.features[0]);
          if (code == "100000"){
            box = bbox(featureCollection(full.features));
          }
          const { innerHeight, innerWidth } = this;
          const latDelta = Math.abs(box[1] - box[3]);
          const latProperty = innerHeight / latDelta;

          const lngDelta = Math.abs(box[0] - box[2]);
          const lngProperty = innerWidth / lngDelta;
          const ratio = 550 / Math.max(innerHeight, innerWidth);
          scale = Math.floor(Math.min(lngProperty, latProperty)) * ratio * (config.autoScaleFactor || 1);
        } else {
          scale = config.scale;
        }
        const projection = d3.geoMercator().center(center).scale(scale).translate([0, 0]);
        this.registerList.set(registerCode, [boundary, full, projection]);
      }
      return full;
    })
  }
  // 绘制行政区主体（顶面/侧面/标签）并维护缩放缓存模型
  drawDistrictArea(data, features, options){
    const { meshGroup, advanceMeshGroup, mapUf, districtData, _realShape, _cancelRealShape, mapTexture } = drawDistrict.call(this, data, options, features, options.config);
    this._cancelRealShape = _cancelRealShape;
    this.mapTextures.push(mapTexture);
    this.mapUf = mapUf;
    this.districtData = districtData;

    if (!this.refresh) {
      advanceMeshGroup.scale.set(this.scale, 1, this.scale);
      const scaledBox = new THREE.Box3().setFromObject(advanceMeshGroup);
      advanceMeshGroup.scale.set(1, 1, 1);
      const center = new THREE.Vector3();
      scaledBox.getCenter(center);
      this.seriesGroup.position.sub(center);
      this.seriesGroup.scale.set(this.scale, 1, this.scale);

      this.seriesGroup.add(advanceMeshGroup);
      this.seriesGroup.add(meshGroup);
    } else {
      this.seriesGroup.add(advanceMeshGroup);
      this.seriesGroup.add(meshGroup);
    }
    const mapKey = this.mapKey;
    _realShape().then((group) => {
      this.seriesGroup.remove(advanceMeshGroup);

      if (mapKey != this.mapKey) return false;

      const res = group.children;
      this.seriesGroup.add(group);

      if (this.refresh) {
        const modelBox = new THREE.Box3();
        res.forEach((district) => {
          const itemBox = new THREE.Box3().setFromObject(district);
          modelBox.union(itemBox);
        });
        this.cacheModel.modelBox = modelBox;
      }
      const modelBox = this.cacheModel.modelBox;
      const modelScale = [];
      res.forEach((mesh) => {
        const code = mesh._privateData.adcode;
        const model = mesh.clone();
        model.scale.set(1, 1, 1);
        const currentModel = new THREE.Box3().setFromObject(model);
        const widthA = modelBox.max.x - modelBox.min.x;
        const heightA = modelBox.max.z - modelBox.min.z;
        const widthB = currentModel.max.x - currentModel.min.x;
        const heightB = currentModel.max.z - currentModel.min.z;
        const widthRatio = widthA / widthB;
        const heightRatio = heightA / heightB;
        const scaleVal = (widthRatio + heightRatio) / 2;
        modelScale.push({ code, scale: scaleVal });
      });
      this.cacheModel.modelScale.push(...modelScale);
    });
  }
  // 添加飞线图层
  addLinkLayer(options) {
    console.log('调用了添加飞线图层')
    const config = this.options.config;
    const group = drawFlight.call(this, options, config);
    console.log(group)
    this.seriesGroup.add(group);
  }
  // 设置地图配置项
  setOption(options, refresh){
    console.log('调用map.setOption')
    this.mapKey = uuid();
    this.clearMap();
    this.isClear = false;
    this.seriesGroup = new THREE.Group();
    this.scene.add(this.seriesGroup);
    this.environmentGroup = new THREE.Group();
    this.scene.add(this.environmentGroup);
    this.options = options;

    const code = options.map + "";
    const camera = options.camera;
    const { x, y, z } = camera;
    this.setEnvironment(options);
    if (!this.isInitCamera) {
      this.setCamera(x, y, z);
    }
    this.isInitCamera = true;

    const { autoRotate, config } = options;
    const { disableRotate = false, disableZoom = false } = config;

    if (autoRotate && this.controls) {
      this.controls.autoRotate = autoRotate.autoRotate;
      this.controls.autoRotateSpeed = autoRotate.autoRotateSpeed;
    }
    if (this.controls) {
      this.controls.enableRotate = !disableRotate;
      this.controls.enableZoom = !disableZoom;
    }
    // 这里可能要添加tooltip
    if (this.registerList.get(code)){
      const [boundary, full, projection] = this.registerList.get(code);

      this.refresh = refresh;
      if (refresh) {
        this.projection = projection;
        this.scale = 1;
        this.cacheModel = {
          modelScale: [],
          modelBox: null,
          code: code,
        };
      } else {
        try {
          if (code === this.cacheModel.code) {
            this.scale = 1;
          } else {
            const item = this.cacheModel.modelScale.find((it) => it.code == code);
            this.scale = item.scale;
          }
        } catch (error) {
          console.warn(`abstain model failed ${error}`);
          this.refresh = true;
          this.projection = projection;
          this.scale = 1;
        }
      }
      this.drawDistrictArea(options.data, full.features, options);
      const series = options.series;
      series.forEach((item) => {
        switch (item.type) {
          // case "marker":
          //   this.addMarkerLayer(item);
          //   break;
          // case "prism":
          //   this.addPrismLayer(item);
          //   break;
          case "flight":
            this.addLinkLayer(item);
            break;
          // case "scatter":
          //   this.addSCatterLayer(item);
          //   break;
          // case "cylinder":
          //   this.addCylinderLayer(item);
          //   break;
        }
      });
    } else {
      throw Error("请先注册地图: " + code);
    }
  }
  // 配置场景环境特效（辉光、镜面、渐变底板）
  setEnvironment(options){
    const { bloomComposer, finalComposer } = drawGlow.call(this, options);
    this.bloomComposer = bloomComposer;
    this.finalComposer = finalComposer;
  }
  setCamera(x, y, z){
    this.camera && this.camera.position.set(x, y, z);
  }
  // 清空当前地图图层并回收 mesh/material/texture 资源。
  clearMap(){
    this.isClear = true;
    if (this._cancelRealShape) {
      this._cancelRealShape();
      this._cancelRealShape = null;
    }
    const disposeObject = (obj) => {
      if (obj.geometry) {
        obj.geometry.dispose();
      }
      if (obj.material) {
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m) => {
            m.map?.dispose();
            m.dispose?.();
          });
        } else {
          obj.material.map?.dispose();
          obj.material.dispose?.();
        }
      }
    }
    const environmentGroup = this.environmentGroup;
    environmentGroup.traverse(disposeObject);
    if (environmentGroup.children.length) {
      environmentGroup.children = [];
    }
    const seriesGroup = this.seriesGroup;
    seriesGroup.traverse((obj) => {
      disposeObject(obj);
      if (["label", "marker", "prism", "scatter"].includes(obj._type)) {
        obj.element?.remove();
      }
    });
    if (seriesGroup.children.length) {
      seriesGroup.children = [];
    }
    this.foundationIns = [];
    this.scene.remove(this.seriesGroup);
    this.scene.remove(this.environmentGroup);
  }
  // 取消事件监听
  off(eventName){
    if (eventName){
      Reflect.deleteProperty(this.events, eventName);
    } else {
      this.events = {};
    }
  }
}
// 最后导出的组件
const EarthMap = {
  template: `
    <div id="my-earth-map" class="earth-map">
      <div ref="mapRef" id="earth-map"></div>
      <div ref="tooltipRef" class="earth-tooltip"></div>
    </div>
  `,
  props: {

  },
  data(){
    return {
      map: null,
      currentMapJson: null,
      options: null
    }
  },
  created(){
    this.options = createDefaultOptions();
  },
  mounted(){
    this.map = new ThreeMap(this.$refs.mapRef, this.$refs.tooltipRef);
    let code = '100000';
    this.map.registerMap(code, code, this.options.config)
      .then(mapJson => {
        this.currentMapJson = mapJson;
        this.options.series.forEach(it => {
          if (!it.data || !it.data.length){
            // it.data = 
          }
        });
        this.setMap(this.options)
      })
  },
  methods: {
    // 根据map实例和配置options来调用ThreeMap内部的setOption
    setMap(){
      if (!this.map || !this.options) return;
      try {
        this.map.off('click');
        this.map.off('dbclick');
        this.map.off('change');
      } catch (error){
        console.log(error);
      }
      this.map.setOption(this.options, true);
    },
    // 添加飞线数据
    addFlightData(data){
      const flightSeries = this.options.series.find(s => s.type === 'flight');
      if (!flightSeries){
        // this.options.series.push({
        //   type: "flight", // 系列类型标识
        //   seriesName: "flight", // 系列名称
        //   points: 200, // 路径上的粒子总数，越多越平滑但性能开销越大
        //   flightLen: 50, // 飞行流光的长度（粒子数量），决定可见窗口大小
        //   speed: 10, // 飞行速度，每帧移动的索引步长
        //   flightColor: ["#ffff00", "#FFFFFF"], // 粒子渐变色：[起始颜色, 结束颜色]
        //   headSize: 1, // 粒子头部放大系数，用于强调飞行方向
        //   data
        // });
        this.options.series.push({
          type: "flight", // 系列类型标识
          seriesName: "flight", // 系列名称
          points: 100, // 路径上的粒子总数，越多越平滑但性能开销越大
          flightLen: 50, // 飞行流光的长度（粒子数量），决定可见窗口大小
          speed: 5, // 飞行速度，每帧移动的索引步长
          flightColor: ["#ffff00", "#FFFFFF"], // 粒子渐变色：[起始颜色, 结束颜色]
          headSize: 1, // 粒子头部放大系数，用于强调飞行方向
          data
        });
      } else {
        flightSeries.data = data;
      }
      // this.setMap();
      console.log('添加飞线数据测试！！！！')
      this.map.addLinkLayer(this.options)
    }
  }
}
