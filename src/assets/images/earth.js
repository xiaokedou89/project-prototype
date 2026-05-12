console.log(THREE)
// 基类
class Basic {
  constructor(dom) {
    // 场景
    this.scene = null;
    // 相机
    this.camera = null;
    // 渲染器
    this.renderer = null;
    // 控制器
    this.controls = null;
    // 外层容器
    this.dom = dom;
    this.initScenes();
    this.setControls();
  }
  // 初始化场景
  initScenes() {
    this.scene = new THREE.Scene();
    // todo-origin
    // this.camera = new THREE.PerspectiveCamera(
    //   45,
    //   window.innerWidth / window.innerHeight,
    //   1,
    //   100000
    // );
    this.camera = new THREE.PerspectiveCamera(45, this.dom.offsetWidth / this.dom.offsetHeight, 1, 100000);
    // @important
    // 设置相机位置 - 这里可以调整初始地球显示的大小
    this.camera.position.set(0, 30, -200);
    this.renderer = new THREE.WebGLRenderer({
      alpha: true, // 透明
      antialias: true, // 抗锯齿
      preserveDrawingBuffer: true
    });
    this.renderer.setPixelRatio(window.devicePixelRatio); // 设置屏幕像素比
    // todo-origin
    // this.renderer.setSize(window.innerWidth, window.innerHeight); // 设置渲染器宽高
    this.renderer.setSize(this.dom.offsetWidth, this.dom.offsetHeight);
    this.dom.appendChild(this.renderer.domElement); // 添加到dom中
  }
  // 设置控制器
  setControls() {
    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.controls.autoRotateSpeed = 3;
    // 使动画循环使用时阻尼或自转 意思是否有惯性
    this.controls.enableDamping = true;
    // 动态阻尼系数 就是鼠标拖拽旋转灵敏度
    this.controls.dampingFactor = 0.05;
    // 是否可以缩放
    this.controls.enableZoom = true;
    // 设置相机距离原点的最远距离
    // this.controls.minDistance = 50;
    this.controls.minDistance = 220;
    // 设置相机距离原点的最远距离
    this.controls.maxDistance = 300;
    // 是否开启右键拖拽
    this.controls.enablePan = false;
  }
}

// 定义事件发射类
function EventEmitter() {
  this.handlers = {};
}
EventEmitter.prototype.on = function (event, handler) {
  var eventHandlers = this.handlers[event];
  if (!eventHandlers) {
    eventHandlers = [];
    this.handlers[event] = eventHandlers;
  }
  this.handlers[event].push(handler);
  return handler;
};
EventEmitter.prototype.off = function (event, handler) {
  var eventHandlers = this.handlers[event];
  if (!handler) {
    return;
  }
  var index = eventHandlers.indexOf(handler);
  if (index === -1) {
    return;
  }
  this.handlers[event].splice(index, 1);
};
EventEmitter.prototype.offAll = function () {
  this.handlers = {};
};
EventEmitter.prototype.emit = function (event) {
  var args = [];
  for (var _i = 1; _i < arguments.length; _i++) {
    args[_i - 1] = arguments[_i];
  }
  var eventHandlers = this.handlers[event];
  if (!eventHandlers) {
    return;
  }
  eventHandlers.forEach(function (handler) {
    return handler.apply(void 0, args);
  });
};
// 定义重置大小事件类
class Sizes {
  constructor(options) {
    this.width = 0;
    this.height = 0;
    this.viewport = {
      width: 0,
      height: 0
    };
    this.$sizeViewport = options.dom;
    this.emitter = new EventEmitter();
    this.resize = this.resize.bind(this);
    window.addEventListener('resize', this.resize);
    this.resize();
  }
  $on(event, fun) {
    this.emitter.on(event, () => {
      fun();
    });
  }
  resize() {
    // 可视区域大小
    this.viewport.width = this.$sizeViewport.offsetWidth;
    this.viewport.height = this.$sizeViewport.offsetHeight;
    this.emitter.emit('resize');
  }
}

// 定义获取资源类
class Resources {
  constructor(callback, filePath) {
    this.filePath = filePath || '../img/earth/';
    this.manager = null;
    // 资源加载完成回调
    this.callback = callback;
    // 贴图对象
    this.textures = {};
    this.setLoadingManager();
    this.loadResources();
  }
  // 获取模型贴图
  getTextures() {
    const fileSuffix = ['circle', 'gradient', 'redCircle', 'label', 'aperture', 'glow', 'light_column', 'aircraft'];
    const filePath = this.filePath;
    const textures = fileSuffix.map((item) => {
      // console.log(`检查贴图路径: ${filePath}${item}.png`)
      return {
        name: item,
        url: `${filePath}${item}.png`
      };
    });
    textures.push({
      name: 'earth',
      url: `${filePath}earth.jpg`
    });
    return { textures };
  }
  setLoadingManager() {
    this.manager = new THREE.LoadingManager();
    this.manager.onStart = () => {
      // console.log('开始加载资源文件');
    };
    this.manager.onLoad = () => {
      this.callback();
    };
    this.manager.onProgress = (url) => {
      // console.log(`正在加载： ${url}`);
    };
    this.manager.onError = (url) => {
      console.log(`加载失败：${url}`);
    };
  }
  loadResources() {
    this.textureLoader = new THREE.TextureLoader(this.manager);
    let { textures } = this.getTextures();
    textures.forEach((item) => {
      // console.log(item)
      this.textureLoader.load(item.url, (t) => {
        this.textures[item.name] = t;
      });
    });
  }
}

// 地球模型相关
// 地球顶点渲染器
const earthVertex = `varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vp;
varying vec3 vPositionNormal;
void main(void){
  vUv = uv;
  vNormal = normalize( normalMatrix * normal ); // 转换到视图空间
  vp = position;
  vPositionNormal = normalize(( modelViewMatrix * vec4(position, 1.0) ).xyz);
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`;
// 地球片段渲染器
const earthFragment = `uniform vec3 glowColor;
uniform float bias;
uniform float power;
uniform float time;
varying vec3 vp;
varying vec3 vNormal;
varying vec3 vPositionNormal;
uniform float scale;
uniform sampler2D map;
varying vec2 vUv;

void main(void){
  float a = pow( bias + scale * abs(dot(vNormal, vPositionNormal)), power );
  if(vp.y > time && vp.y < time + 20.0) {
    float t =  smoothstep(0.0, 0.8,  (1.0 - abs(0.5 - (vp.y - time) / 20.0)) / 3.0  );
    gl_FragColor = mix(gl_FragColor, vec4(glowColor, 1.0), t * t );
  }
  gl_FragColor = mix(gl_FragColor, vec4( glowColor, 1.0 ), a);
  float b = 0.8;
  gl_FragColor = gl_FragColor + texture2D( map, vUv );
}`;
/**
 * 经纬度坐标转球面坐标
 * @param {地球半径} R
 * @param {经度(角度值)} longitude
 * @param {维度(角度值)} latitude
 */
function lon2xyz(R, longitude, latitude) {
  let lon = (longitude * Math.PI) / 180; // 转弧度值
  const lat = (latitude * Math.PI) / 180; // 转弧度值
  lon = -lon; // js坐标系z坐标轴对应经度-90度，而不是90度
  // 经纬度坐标转球面坐标计算公式
  const x = R * Math.cos(lat) * Math.cos(lon);
  const y = R * Math.sin(lat);
  const z = R * Math.cos(lat) * Math.sin(lon);
  // 返回球面坐标
  return new THREE.Vector3(x, y, z);
}
// 创建动态的线
function createAnimateLine(option) {
  // 由多个点数组构成的曲线 通常用于道路
  const l = [];
  option.pointList.forEach((e) => l.push(new THREE.Vector3(e[0], e[1], e[2])));
  const curve = new THREE.CatmullRomCurve3(l); // 曲线路径

  // 管道体
  const tubeGeometry = new THREE.TubeGeometry(curve, option.number || 50, option.radius || 1, option.radialSegments);
  return new THREE.Mesh(tubeGeometry, option.material);
}
// 创建柱状
/**
 *
 * @param {
 * radius,
 * lon,
 * lat,
 * index,
 * textures,
 * punctuation
 * } options
 */
function createLightPillar(options) {
  // const height = options.radius * 0.3;
  // @change - 这里修改光柱的高度
  // const height = options.radius * 0.3 / 2;
  const height = (options.radius * 0.3) / 3;
  const geometry = new THREE.PlaneBufferGeometry(options.radius * 0.05, height);
  geometry.rotateX(Math.PI / 2);
  geometry.translate(0, 0, height / 2);
  const material = new THREE.MeshBasicMaterial({
    map: options.textures.light_column,
    color: options.index == 0 ? options.punctuation.lightColumn.startColor : options.punctuation.lightColumn.endColor,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false //是否对深度缓冲区有任何的影响
  });
  const mesh = new THREE.Mesh(geometry, material);
  const group = new THREE.Group();
  // 两个光柱交叉叠加
  group.add(mesh, mesh.clone().rotateZ(Math.PI / 2)); //几何体绕x轴旋转了，所以mesh旋转轴变为z
  // 经纬度转球面坐标
  const SphereCoord = lon2xyz(options.radius, options.lon, options.lat); //SphereCoord球面坐标
  group.position.set(SphereCoord.x, SphereCoord.y, SphereCoord.z); //设置mesh位置
  const coordVec3 = new THREE.Vector3(SphereCoord.x, SphereCoord.y, SphereCoord.z).normalize();
  const meshNormal = new THREE.Vector3(0, 0, 1);
  group.quaternion.setFromUnitVectors(meshNormal, coordVec3);
  return group;
}
// 光柱底座矩形平面
/*
  options: {
    radius: number, 
    lon: number,
    lat: number, 
    material: MeshBasicMaterial
  }
*/
function createPointMesh(options) {
  const geometry = new THREE.PlaneBufferGeometry(1, 1); //默认在XOY平面上
  const mesh = new THREE.Mesh(geometry, options.material);
  // 经纬度转球面坐标
  const coord = lon2xyz(options.radius * 1.001, options.lon, options.lat);
  const size = options.radius * 0.05; // 矩形平面Mesh的尺寸
  mesh.scale.set(size, size, size); // 设置mesh大小

  // 设置mesh位置
  mesh.position.set(coord.x, coord.y, coord.z);
  const coordVec3 = new THREE.Vector3(coord.x, coord.y, coord.z).normalize();
  const meshNormal = new THREE.Vector3(0, 0, 1);
  mesh.quaternion.setFromUnitVectors(meshNormal, coordVec3);
  return mesh;
}
// 创建波动光圈
function createWaveMesh(options) {
  const geometry = new THREE.PlaneBufferGeometry(1, 1); //默认在XOY平面上
  const texture = options.textures.aperture;

  const material = new THREE.MeshBasicMaterial({
    // @important - 波纹颜色
    // color: 0xe99f68,
    color: 0xffffff,
    map: texture,
    transparent: true, //使用背景透明的png贴图，注意开启透明计算
    opacity: 1.0,
    depthWrite: false //禁止写入深度缓冲区数据
  });
  const mesh = new THREE.Mesh(geometry, material);
  // 经纬度转球面坐标
  const coord = lon2xyz(options.radius * 1.001, options.lon, options.lat);
  // const size = options.radius * 0.12; //矩形平面Mesh的尺寸
  // @important 修改底座光环大小
  const size = (options.radius * 0.12) / 2;
  mesh.scale.set(size, size, size); //设置mesh大小
  mesh.userData['size'] = size; //自顶一个属性，表示mesh静态大小
  mesh.userData['scale'] = Math.random() * 1.0; //自定义属性._s表示mesh在原始大小基础上放大倍数  光圈在原来mesh.size基础上1~2倍之间变化
  mesh.position.set(coord.x, coord.y, coord.z);
  const coordVec3 = new THREE.Vector3(coord.x, coord.y, coord.z).normalize();
  const meshNormal = new THREE.Vector3(0, 0, 1);
  mesh.quaternion.setFromUnitVectors(meshNormal, coordVec3);
  return mesh;
}
// 获取点
function getCirclePoints(option) {
  const list = [];
  for (let j = 0; j < 2 * Math.PI - 0.1; j += (2 * Math.PI) / (option.number || 100)) {
    list.push([parseFloat((Math.cos(j) * (option.radius || 10)).toFixed(2)), 0, parseFloat((Math.sin(j) * (option.radius || 10)).toFixed(2))]);
  }
  if (option.closed) list.push(list[0]);
  return list;
}

/*
 * 把3D球面上任意的两个飞线起点和结束点绕球心旋转到到XOY平面上，
 * 同时保持关于y轴对称，借助旋转得到的新起点和新结束点绘制
 * 一个圆弧，最后把绘制的圆弧反向旋转到原来的起点和结束点即可
 */
function _3Dto2D(startSphere, endSphere) {
  /*计算第一次旋转的四元数：表示从一个平面如何旋转到另一个平面*/
  const origin = new THREE.Vector3(0, 0, 0); //球心坐标
  const startDir = startSphere.clone().sub(origin); //飞线起点与球心构成方向向量
  const endDir = endSphere.clone().sub(origin); //飞线结束点与球心构成方向向量
  // dir1和dir2构成一个三角形，.cross()叉乘计算该三角形法线normal
  const normal = startDir.clone().cross(endDir).normalize();
  const xoyNormal = new THREE.Vector3(0, 0, 1); //XOY平面的法线
  //.setFromUnitVectors()计算从normal向量旋转达到xoyNormal向量所需要的四元数
  // quaternion表示把球面飞线旋转到XOY平面上需要的四元数
  const quaternion3D_XOY = new THREE.Quaternion().setFromUnitVectors(normal, xoyNormal);
  /*第一次旋转：飞线起点、结束点从3D空间第一次旋转到XOY平面*/
  const startSphereXOY = startSphere.clone().applyQuaternion(quaternion3D_XOY);
  const endSphereXOY = endSphere.clone().applyQuaternion(quaternion3D_XOY);

  /*计算第二次旋转的四元数*/
  // middleV3：startSphereXOY和endSphereXOY的中点
  const middleV3 = startSphereXOY.clone().add(endSphereXOY).multiplyScalar(0.5);
  const midDir = middleV3.clone().sub(origin).normalize(); // 旋转前向量midDir，中点middleV3和球心构成的方向向量
  const yDir = new THREE.Vector3(0, 1, 0); // 旋转后向量yDir，即y轴
  // .setFromUnitVectors()计算从midDir向量旋转达到yDir向量所需要的四元数
  // quaternion2表示让第一次旋转到XOY平面的起点和结束点关于y轴对称需要的四元数
  const quaternionXOY_Y = new THREE.Quaternion().setFromUnitVectors(midDir, yDir);

  /*第二次旋转：使旋转到XOY平面的点再次旋转，实现关于Y轴对称*/
  const startSpherXOY_Y = startSphereXOY.clone().applyQuaternion(quaternionXOY_Y);
  const endSphereXOY_Y = endSphereXOY.clone().applyQuaternion(quaternionXOY_Y);

  /**一个四元数表示一个旋转过程
   *.invert()方法表示四元数的逆，简单说就是把旋转过程倒过来
   * 两次旋转的四元数执行.invert()求逆，然后执行.multiply()相乘
   *新版本.invert()对应旧版本.invert()
   */
  const quaternionInverse = quaternion3D_XOY.clone().invert().multiply(quaternionXOY_Y.clone().invert());
  return {
    // 返回两次旋转四元数的逆四元数
    quaternion: quaternionInverse,
    // 范围两次旋转后在XOY平面上关于y轴对称的圆弧起点和结束点坐标
    startPoint: startSpherXOY_Y,
    endPoint: endSphereXOY_Y
  };
}

/*计算球面上两点和球心构成夹角的弧度值
参数point1, point2:表示地球球面上两点坐标Vector3
计算A、B两点和顶点O构成的AOB夹角弧度值*/
function radianAOB(A, B, O) {
  // dir1、dir2：球面上两个点和球心构成的方向向量
  const dir1 = A.clone().sub(O).normalize();
  const dir2 = B.clone().sub(O).normalize();
  //点乘.dot()计算夹角余弦值
  const cosAngle = dir1.clone().dot(dir2);
  const radianAngle = Math.acos(cosAngle); //余弦值转夹角弧度值,通过余弦值可以计算夹角范围是0~180度
  return radianAngle;
}

//求三个点的外接圆圆心，p1, p2, p3表示三个点的坐标Vector3。
function threePointCenter(p1, p2, p3) {
  const L1 = p1.lengthSq(); //p1到坐标原点距离的平方
  const L2 = p2.lengthSq();
  const L3 = p3.lengthSq();
  const x1 = p1.x,
    y1 = p1.y,
    x2 = p2.x,
    y2 = p2.y,
    x3 = p3.x,
    y3 = p3.y;
  const S = x1 * y2 + x2 * y3 + x3 * y1 - x1 * y3 - x2 * y1 - x3 * y2;
  const x = (L2 * y3 + L1 * y2 + L3 * y1 - L2 * y1 - L3 * y2 - L1 * y3) / S / 2;
  const y = (L3 * x2 + L2 * x1 + L1 * x3 - L1 * x2 - L2 * x3 - L3 * x1) / S / 2;
  // 三点外接圆圆心坐标
  const center = new THREE.Vector3(x, y, 0);
  return center;
}

/*绘制一条圆弧曲线模型Line
5个参数含义：(圆心横坐标, 圆心纵坐标, 飞线圆弧轨迹半径, 开始角度, 结束角度)*/
function circleLine(x, y, r, startAngle, endAngle, color) {
  const geometry = new THREE.BufferGeometry(); //声明一个几何体对象Geometry
  //  ArcCurve创建圆弧曲线
  const arc = new THREE.ArcCurve(x, y, r, startAngle, endAngle, false);
  //getSpacedPoints是基类Curve的方法，返回一个vector2对象作为元素组成的数组
  const points = arc.getSpacedPoints(80); //分段数50，返回51个顶点
  geometry.setFromPoints(points); // setFromPoints方法从points中提取数据改变几何体的顶点属性vertices
  // 基础线条材质
  // const material = new THREE.LineBasicMaterial({
  //   color:color || 0xd18547,
  // });
  // @important
  // 使用虚线材质线条 - 把虚线线条间隔和虚线长度初始设置为0模拟实线
  const material = new THREE.LineDashedMaterial({
    color: color || 0xd18547,
    dashSize: 3,
    gapSize: 0,
    scale: 1
  });
  const line = new THREE.Line(geometry, material); //线条模型对象
  // @important 这里要创建线以后计算一下虚线的间隔
  line.computeLineDistances();
  return line;
}

/*
 * 绘制一条圆弧飞线
 * 5个参数含义：( 飞线圆弧轨迹半径, 开始角度, 结束角度)
 */
function createFlyLine(radius, startAngle, endAngle, color) {
  const geometry = new THREE.BufferGeometry(); //声明一个几何体对象BufferGeometry
  //  ArcCurve创建圆弧曲线
  const arc = new THREE.ArcCurve(0, 0, radius, startAngle, endAngle, false);
  //getSpacedPoints是基类Curve的方法，返回一个vector2对象作为元素组成的数组
  const pointsArr = arc.getSpacedPoints(100); //分段数80，返回81个顶点
  geometry.setFromPoints(pointsArr); // setFromPoints方法从pointsArr中提取数据改变几何体的顶点属性vertices
  // 每个顶点对应一个百分比数据attributes.percent 用于控制点的渲染大小
  const percentArr = []; //attributes.percent的数据
  for (let i = 0; i < pointsArr.length; i++) {
    // @important - 这里可以把每个点的渲染大小再减小来提升飞线段的视觉效果
    // percentArr.push(i / pointsArr.length);
    percentArr.push(i / pointsArr.length / 2);
  }
  const percentAttribue = new THREE.BufferAttribute(new Float32Array(percentArr), 1);
  // 通过顶点数据percent点模型从大到小变化，产生小蝌蚪形状飞线
  geometry.attributes.percent = percentAttribue;
  // 批量计算所有顶点颜色数据
  const colorArr = [];
  for (let i = 0; i < pointsArr.length; i++) {
    const color1 = new THREE.Color(0xec8f43); //轨迹线颜色 青色
    const color2 = new THREE.Color(0xf3ae76); //黄色
    const color = color1.lerp(color2, i / pointsArr.length);
    colorArr.push(color.r, color.g, color.b);
  }
  // 设置几何体顶点颜色数据
  geometry.attributes.color = new THREE.BufferAttribute(new Float32Array(colorArr), 3);
  // @important - 这里可以修改飞线段的线属性:
  /*
  {
    size: 线段大小
    opacity: 颜色透明度
  }
  */
  const materialOptions = {
    size: 2,
    opacity: 0.8,
    // vertexColors: VertexColors, //使用顶点颜色渲染
    transparent: true,
    depthWrite: false
  };
  // 点模型渲染几何体每个顶点
  const material = new THREE.PointsMaterial(materialOptions);
  // 修改点材质的着色器源码(注意：不同版本细节可能会稍微会有区别，不过整体思路是一样的)
  material.onBeforeCompile = function (shader) {
    // 顶点着色器中声明一个attribute变量:百分比
    shader.vertexShader = shader.vertexShader.replace(
      'void main() {',
      [
        'attribute float percent;', //顶点大小百分比变量，控制点渲染大小
        'void main() {'
      ].join('\n') // .join()把数组元素合成字符串
    );
    // 调整点渲染大小计算方式
    shader.vertexShader = shader.vertexShader.replace(
      'gl_PointSize = size;',
      ['gl_PointSize = percent * size;'].join('\n') // .join()把数组元素合成字符串
    );
  };
  const FlyLine = new THREE.Points(geometry, material);
  material.color = new THREE.Color(color);
  FlyLine.name = '飞行线';
  FlyLine.userData['isFlyLine'] = true;
  return FlyLine;
}

/**通过函数arcXOY()可以在XOY平面上绘制一个关于y轴对称的圆弧曲线
 * startPoint, endPoint：表示圆弧曲线的起点和结束点坐标值，起点和结束点关于y轴对称
 * 同时在圆弧轨迹的基础上绘制一段飞线*/
function arcXOY(radius, startPoint, endPoint, options, lineType, lineStatus) {
  // 计算两点的中点
  const middleV3 = new THREE.Vector3().addVectors(startPoint, endPoint).multiplyScalar(0.5);
  // 弦垂线的方向dir(弦的中点和圆心构成的向量)
  const dir = middleV3.clone().normalize();
  // 计算球面飞线的起点、结束点和球心构成夹角的弧度值
  const earthRadianAngle = radianAOB(startPoint, endPoint, new THREE.Vector3(0, 0, 0));
  /*设置飞线轨迹圆弧的中间点坐标
  弧度值 * radius * 0.2：表示飞线轨迹圆弧顶部距离地球球面的距离
  起点、结束点相聚越远，构成的弧线顶部距离球面越高*/
  // @important
  // const arcTopCoord = dir.multiplyScalar(radius + earthRadianAngle * radius * 0.2) // 黄色飞行线的高度
  const arcTopCoord = dir.multiplyScalar(radius + earthRadianAngle * radius * 0.05);
  //求三个点的外接圆圆心(飞线圆弧轨迹的圆心坐标)
  const flyArcCenter = threePointCenter(startPoint, endPoint, arcTopCoord);
  // 飞线圆弧轨迹半径flyArcR
  const flyArcR = Math.abs(flyArcCenter.y - arcTopCoord.y);
  /*坐标原点和飞线起点构成直线和y轴负半轴夹角弧度值
  参数分别是：飞线圆弧起点、y轴负半轴上一点、飞线圆弧圆心*/
  const flyRadianAngle = radianAOB(startPoint, new THREE.Vector3(0, -1, 0), flyArcCenter);
  const startAngle = -Math.PI / 2 + flyRadianAngle; //飞线圆弧开始角度
  const endAngle = Math.PI - startAngle; //飞线圆弧结束角度
  // 调用圆弧线模型的绘制函数
  // @important
  const arcline = circleLine(flyArcCenter.x, flyArcCenter.y, flyArcR, startAngle, endAngle, options.color);
  arcline.userData['lineType'] = lineType;
  arcline.userData['lineStatus'] = lineStatus;
  // const arcline = new  Group();// 不绘制轨迹线，使用 Group替换circleLine()即可
  arcline.center = flyArcCenter; //飞线圆弧自定一个属性表示飞线圆弧的圆心
  arcline.topCoord = arcTopCoord; //飞线圆弧自定一个属性表示飞线圆弧中间也就是顶部坐标

  // const flyAngle = Math.PI/ 10; //飞线圆弧固定弧度
  const flyAngle = (endAngle - startAngle) / 7; //飞线圆弧的弧度和轨迹线弧度相关
  // 绘制一段飞线，圆心做坐标原点
  const flyLine = createFlyLine(flyArcR, startAngle, startAngle + flyAngle, options.flyLineColor);
  flyLine.position.y = flyArcCenter.y; //平移飞线圆弧和飞线轨迹圆弧重合
  //飞线段flyLine作为飞线轨迹arcLine子对象，继承飞线轨迹平移旋转等变换
  arcline.add(flyLine);
  //飞线段运动范围startAngle~flyEndAngle
  flyLine.flyEndAngle = endAngle - startAngle - flyAngle;
  flyLine.startAngle = startAngle;
  // arcline.flyEndAngle：飞线段当前角度位置，这里设置了一个随机值用于演示
  flyLine.AngleZ = arcline.flyEndAngle * Math.random();
  // flyLine.rotation.z = arcline.AngleZ;
  // arcline.flyLine指向飞线段,便于设置动画是访问飞线段
  arcline.userData['flyLine'] = flyLine;

  return arcline;
}

/**输入地球上任意两点的经纬度坐标，通过函数flyArc可以绘制一个飞线圆弧轨迹
 * lon1,lat1:轨迹线起点经纬度坐标
 * lon2,lat2：轨迹线结束点经纬度坐标
 */
function flyArc(radius, lon1, lat1, lon2, lat2, options, lineType, lineStatus) {
  // console.log('飞线配置项')
  // console.log(options)
  const sphereCoord1 = lon2xyz(radius, lon1, lat1); //经纬度坐标转球面坐标
  // startSphereCoord：轨迹线起点球面坐标
  const startSphereCoord = new THREE.Vector3(sphereCoord1.x, sphereCoord1.y, sphereCoord1.z);
  const sphereCoord2 = lon2xyz(radius, lon2, lat2);
  // startSphereCoord：轨迹线结束点球面坐标
  const endSphereCoord = new THREE.Vector3(sphereCoord2.x, sphereCoord2.y, sphereCoord2.z);

  //计算绘制圆弧需要的关于y轴对称的起点、结束点和旋转四元数
  const startEndQua = _3Dto2D(startSphereCoord, endSphereCoord);
  // 调用arcXOY函数绘制一条圆弧飞线轨迹
  const arcline = arcXOY(radius, startEndQua.startPoint, startEndQua.endPoint, options, lineType, lineStatus);
  arcline.quaternion.multiply(startEndQua.quaternion);
  return arcline;
}

// 经度longitude
// 纬度latitude
function getPointAlongRay(longitude, latitude, distance = 50, earthRadius = 50) {
  // 1. 首先利用你代码中已有的 lon2xyz 方法，获取目标点的 3D 坐标
  // 注意：lon2xyz 返回的坐标模长通常是 earthRadius
  const targetPoint = lon2xyz(earthRadius, longitude, latitude);

  // 2. 计算从原点指向目标点的单位向量 (方向)
  // targetPoint 向量本身就是从原点指向目标的，归一化即可
  const direction = targetPoint.clone().normalize();

  // 3. 计算新点的坐标
  // 逻辑：目标点坐标 - (方向向量 * 距离)
  // 这样得到的点就在射线上，且距离目标点正好是 `distance`
  const resultPoint = targetPoint.sub(direction.multiplyScalar(distance));

  return resultPoint;
}

// 声明地球类
class Earth {
  constructor(options) {
    this.options = options;
    this.group = new THREE.Group();
    this.group.name = 'group';
    this.group.scale.set(0, 0, 0);
    this.earthGroup = new THREE.Group();
    this.group.add(this.earthGroup);
    this.earthGroup.name = 'EarthGroup';
    // 标注点效果
    this.markupPoint = new THREE.Group();
    this.markupPoint.name = 'markupPoint';
    this.waveMeshArr = [];
    // 卫星和标签
    this.circleLineList = [];
    this.circleList = [];
    this.x = 0;
    this.n = 0;
    this.lineColors = options.lineColors;
    this.flyLineColors = options.flyLineColors;
    /*
    color: 0xf3ae76, // 飞线的颜色
    flyLineColor: 0xff7714
    */
    // 地球自转
    this.isRotation = this.options.earth.isRotation;
    // 扫光动画 shader
    this.timeValue = 100;
    this.uniforms = {
      glowColor: {
        value: new THREE.Color(0x0cd1eb)
      },
      scale: {
        type: 'f',
        value: -1.0
      },
      bias: {
        type: 'f',
        value: 1.0
      },
      power: {
        type: 'f',
        value: 3.3
      },
      time: {
        type: 'f',
        value: this.timeValue
      },
      isHover: {
        value: false
      },
      map: {
        value: null
      }
    };
  }
  // second
  async init() {
    return new Promise(async (resolve, reject) => {
      this.createEarth(); // 创建地球
      await this.createSatellite(); // 创建卫星
      this.createStars(); // 添加星星
      this.createEarthGlow(); // 创建地球辉光
      this.createEarthAperture(); // 创建地球的大气层
      await this.createMarkupPoint(); // 创建柱状点位
      // await this.createSpriteLabel() // 创建标签
      this.createSpriteLabelAsync();
      // this.createAnimateCircle() // 创建环绕卫星
      this.createFlyLine(); // 创建飞线
      this.show();
      resolve();
    });
  }
  // 创建地球
  createEarth() {
    const earth_geometry = new THREE.SphereBufferGeometry(this.options.earth.radius, 50, 50);

    const earth_border = new THREE.SphereBufferGeometry(this.options.earth.radius + 10, 60, 60);

    const pointMaterial = new THREE.PointsMaterial({
      color: 0x81ffff, //设置颜色，默认 0xFFFFFF
      transparent: true,
      sizeAttenuation: true,
      opacity: 0.1,
      vertexColors: false, //定义材料是否使用顶点颜色，默认false ---如果该选项设置为true，则color属性失效
      size: 0.01 //定义粒子的大小。默认为1.0
    });
    const points = new THREE.Points(earth_border, pointMaterial); //将模型添加到场景

    this.earthGroup.add(points);

    this.uniforms.map.value = this.options.textures.earth;

    const earth_material = new THREE.ShaderMaterial({
      // wireframe:true, // 显示模型线条
      uniforms: this.uniforms,
      vertexShader: earthVertex,
      fragmentShader: earthFragment
    });

    earth_material.needsUpdate = true;
    // console.log('模型片段')
    // console.log(earthFragment)
    // console.log(earth_material)
    this.earth = new THREE.Mesh(earth_geometry, earth_material);
    this.earth.name = 'earth';
    this.earthGroup.add(this.earth);
  }
  createSatellite(){
    return new Promise((resolve, reject) => {
      // 1. 轨道容器（只负责公转）
    const orbit = new THREE.Object3D();
    const orbitR = this.options.earth.radius + 30;
    // 2. 加载卫星模型
    new THREE.GLTFLoader().load(
      '/assets/model/station.glb',
      (gltf) => {
        // console.log('卫星加载回调')
        // console.log(this)
        const station = gltf.scene;
        // 缩放 / 朝向一次调准
        // station.scale.setScalar(0.3);
        station.scale.setScalar(0.9);
        station.rotation.x = -Math.PI / 2; // y-up → z-up
        station.position.set(orbitR, 0, 0);
        station.name = 'satellite';
        // 额外再转 180° 或 90° 根据真机再细调
        // station.rotateY(Math.PI);   // 如发现反方向可放开
        orbit.add(station);
        // 【核心】把引用挂到实例，供动画循环使用
        this.satelliteModel = station;
        resolve();
      },
      undefined,
      (err) => {
        console.error('加载卫星模型失败', err)
        resolve();
      }
    );
    // 3. 可视线环
    const ringGeo = new THREE.RingGeometry(orbitR - 0.2, orbitR + 0.2, 128);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x4488ff,
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide
    });
    const orbitRing = new THREE.Mesh(ringGeo, ringMat);
    orbitRing.rotation.x = Math.PI / 2;
    orbit.add(orbitRing);
    // 4. 挂到地球
    this.earthGroup.add(orbit);
    this.satOrbit = orbit; // 供公转
    });
  }
  // 添加星星
  createStars() {
    const vertices = [];
    const colors = [];
    for (let i = 0; i < 500; i++) {
      const vertex = new THREE.Vector3();
      vertex.x = 800 * Math.random() - 300;
      vertex.y = 800 * Math.random() - 300;
      vertex.z = 800 * Math.random() - 300;
      vertices.push(vertex.x, vertex.y, vertex.z);
      colors.push(new THREE.Color(1, 1, 1));
    }

    // 星空效果
    this.around = new THREE.BufferGeometry();
    this.around.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
    this.around.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3));

    const aroundMaterial = new THREE.PointsMaterial({
      size: 2,
      sizeAttenuation: true, // 尺寸衰减
      color: 0x4d76cf,
      transparent: true,
      opacity: 1,
      map: this.options.textures.gradient
    });

    this.aroundPoints = new THREE.Points(this.around, aroundMaterial);
    this.aroundPoints.name = '星空';
    this.aroundPoints.scale.set(1, 1, 1);
    this.group.add(this.aroundPoints);
  }
  // 创建地球辉光
  createEarthGlow() {
    const R = this.options.earth.radius; //地球半径

    // TextureLoader创建一个纹理加载器对象，可以加载图片作为纹理贴图
    const texture = this.options.textures.glow; // 加载纹理贴图

    // 创建精灵材质对象SpriteMaterial
    const spriteMaterial = new THREE.SpriteMaterial({
      map: texture, // 设置精灵纹理贴图
      color: 0x4390d1,
      transparent: true, //开启透明
      opacity: 0.7, // 可以通过透明度整体调节光圈
      depthWrite: false //禁止写入深度缓冲区数据
    });

    // 创建表示地球光圈的精灵模型
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(R * 3.0, R * 3.0, 1); //适当缩放精灵
    this.earthGroup.add(sprite);
  }
  // 创建大气层
  createEarthAperture() {
    const vertexShader = [
      'varying vec3	vVertexWorldPosition;',
      'varying vec3	vVertexNormal;',
      'varying vec4	vFragColor;',
      'void main(){',
      '	vVertexNormal	= normalize(normalMatrix * normal);', //将法线转换到视图坐标系中
      '	vVertexWorldPosition	= (modelMatrix * vec4(position, 1.0)).xyz;', //将顶点转换到世界坐标系中
      '	// set gl_Position',
      '	gl_Position	= projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
      '}'
    ].join('\n');

    //大气层效果
    const AeroSphere = {
      uniforms: {
        coeficient: {
          type: 'f',
          value: 1.0
        },
        power: {
          type: 'f',
          value: 3
        },
        glowColor: {
          type: 'c',
          value: new THREE.Color(0x4390d1)
        }
      },
      vertexShader: vertexShader,
      fragmentShader: [
        'uniform vec3	glowColor;',
        'uniform float	coeficient;',
        'uniform float	power;',

        'varying vec3	vVertexNormal;',
        'varying vec3	vVertexWorldPosition;',

        'varying vec4	vFragColor;',

        'void main(){',
        '	vec3 worldCameraToVertex = vVertexWorldPosition - cameraPosition;', //世界坐标系中从相机位置到顶点位置的距离
        '	vec3 viewCameraToVertex	= (viewMatrix * vec4(worldCameraToVertex, 0.0)).xyz;', //视图坐标系中从相机位置到顶点位置的距离
        '	viewCameraToVertex= normalize(viewCameraToVertex);', //规一化
        '	float intensity	= pow(coeficient + dot(vVertexNormal, viewCameraToVertex), power);',
        '	gl_FragColor = vec4(glowColor, intensity);',
        '}'
      ].join('\n')
    };
    //球体 辉光 大气层
    const material1 = new THREE.ShaderMaterial({
      uniforms: AeroSphere.uniforms,
      vertexShader: AeroSphere.vertexShader,
      fragmentShader: AeroSphere.fragmentShader,
      blending: THREE.NormalBlending,
      transparent: true,
      depthWrite: false
    });
    const sphere = new THREE.SphereBufferGeometry(this.options.earth.radius + 0, 50, 50);
    const mesh = new THREE.Mesh(sphere, material1);
    this.earthGroup.add(mesh);
  }
  // 创建柱状点位
  async createMarkupPoint() {
    this.markupPoint.clear();
    // second
    await Promise.all(
      this.options.data.map(async (item) => {
        const radius = this.options.earth.radius;
        const lon = item.startArray.E; //经度
        const lat = item.startArray.N; //纬度
        // @important - 底座点位周边的材质(蓝色光圈)
        this.punctuationMaterial = new THREE.MeshBasicMaterial({
          // color: this.options.punctuation.circleColor,
          // map: this.options.textures.label,
          map: this.options.textures.circle,
          transparent: true, //使用背景透明的png贴图，注意开启透明计算
          depthWrite: false //禁止写入深度缓冲区数据
        });

        const mesh = createPointMesh({ radius, lon, lat, material: this.punctuationMaterial }); //光柱底座矩形平面
        mesh.userData['selectable'] = true;
        mesh.userData['positionName'] = item.startArray.name;
        this.markupPoint.add(mesh);
        const LightPillar = createLightPillar({
          radius: this.options.earth.radius,
          lon,
          lat,
          index: 0,
          textures: this.options.textures,
          punctuation: this.options.punctuation
        }); //光柱
        LightPillar.userData['isLightPillar'] = true;
        LightPillar.userData['selectable'] = true;
        LightPillar.userData['positionName'] = item.startArray.name;
        this.markupPoint.add(LightPillar);
        const WaveMesh = createWaveMesh({ radius, lon, lat, textures: this.options.textures }); //波动光圈
        WaveMesh.userData['isWaveMesh'] = true;
        WaveMesh.userData['selectable'] = true;
        WaveMesh.userData['positionName'] = item.startArray.name;
        this.markupPoint.add(WaveMesh);
        this.waveMeshArr.push(WaveMesh);
        // await Promise.all(
        //   item.endArray.map((obj) => {
        //     const lon = obj.E; //经度
        //     const lat = obj.N; //纬度
        //     const mesh = createPointMesh({ radius, lon, lat, material: this.punctuationMaterial }); //光柱底座矩形平面
        //     mesh.userData['selectable'] = true;
        //     mesh.userData['positionName'] = obj.name;
        //     this.markupPoint.add(mesh);
        //     const LightPillar = createLightPillar({
        //       radius: this.options.earth.radius,
        //       lon,
        //       lat,
        //       index: 1,
        //       textures: this.options.textures,
        //       punctuation: this.options.punctuation
        //     }); //光柱
        //     LightPillar.userData['isLightPillar'] = true;
        //     LightPillar.userData['selectable'] = true;
        //     // @important - 为终点光柱添加点信息
        //     LightPillar.userData['positionName'] = obj.name;
        //     this.markupPoint.add(LightPillar);
        //     const WaveMesh = createWaveMesh({ radius, lon, lat, textures: this.options.textures }); //波动光圈
        //     WaveMesh.userData['isWaveMesh'] = true;
        //     WaveMesh.userData['selectable'] = true;
        //     WaveMesh.userData['positionName'] = obj.name;
        //     this.markupPoint.add(WaveMesh);
        //     this.waveMeshArr.push(WaveMesh);
        //   })
        // );
        this.markupPoint.userData['isMarkupPoint'] = true;
        this.earthGroup.add(this.markupPoint);
      })
    );
  }
  async createSpriteLabel() {
    await Promise.all(
      this.options.data.map(async (item) => {
        let cityArry = [];
        cityArry.push(item.startArray);
        // second - 渲染label地点标签时不渲染endArray数组
        // cityArry = cityArry.concat(...item.endArray);
        await Promise.all(
          cityArry.map(async (e) => {
            const p = lon2xyz(this.options.earth.radius * 1.001, e.E, e.N);
            const div = `<div class="fire-div">${e.name}</div>`;
            const shareContent = document.getElementById('html2canvas');
            shareContent.innerHTML = div;
            const opts = {
              backgroundColor: null, // 背景透明
              scale: 6,
              dpi: window.devicePixelRatio,
              // @important 这个函数可以过滤遍历标签label的途径dom从而优化遍历路径和生成标签label的时间，大大减少加载速度
              ignoreElements(e) {
                if ((e.tagName !== 'META' && e.tagName !== 'DIV' && e.tagName !== 'STYLE') || e.contains(shareContent) || shareContent.contains(e) || e.tagName === 'HEAD' || e.tagName === 'LINK') {
                  return false;
                }
                return true;
              }
            };
            const canvas = await html2canvas(document.getElementById('html2canvas'), opts);
            const dataURL = canvas.toDataURL('image/png');
            const map = new THREE.TextureLoader().load(dataURL);
            const material = new THREE.SpriteMaterial({
              map: map,
              transparent: true
            });
            const sprite = new THREE.Sprite(material);
            const len = 5 + (e.name.length - 2) * 2;
            sprite.scale.set(len, 3, 1);
            sprite.position.set(p.x * 1.1, p.y * 1.1, p.z * 1.1);
            this.earth.add(sprite);
          })
        );
      })
    );
  }
  createSpriteLabelAsync() {
    let tempGroup = new THREE.Group();
    this.options.data.forEach((item) => {
      let cityArry = [];
      cityArry.push(item.startArray);
      // second - 渲染地点标签时不渲染endArray
      // cityArry = cityArry.concat(...item.endArray);
      cityArry.forEach((e) => {
        const p = lon2xyz(this.options.earth.radius * 1.001, e.E, e.N);
        // const div = `<div class="fire-div">${e.name}</div>`;
        const div = `<h6 class="fire-div">${e.name}</h6>`;
        const shareContent = document.getElementById('html2canvas');
        shareContent.innerHTML = div;
        const opts = {
          backgroundColor: null, // 背景透明
          scale: 6,
          dpi: window.devicePixelRatio,
          // @important 这个函数可以过滤遍历标签label的途径dom从而优化遍历路径和生成标签label的时间，大大减少加载速度
          ignoreElements(e) {
            if ((e.tagName !== 'META' && e.tagName !== 'DIV' && e.tagName !== 'STYLE') || e.contains(shareContent) || shareContent.contains(e) || e.tagName === 'HEAD' || e.tagName === 'LINK') {
              return false;
            }
            return true;
          }
        };
        html2canvas(document.getElementById('html2canvas'), opts).then((canvas) => {
          const dataURL = canvas.toDataURL('image/png');
          const map = new THREE.TextureLoader().load(dataURL);
          const material = new THREE.SpriteMaterial({
            map: map,
            transparent: true
          });
          const sprite = new THREE.Sprite(material);
          const len = 5 + (e.name.length - 2) * 2;
          sprite.scale.set(len, 3, 1);
          sprite.position.set(p.x * 1.1, p.y * 1.1, p.z * 1.1);
          sprite.userData['type'] = 'label';
          sprite.userData['selectable'] = true;
          sprite.userData['positionName'] = e.name;
          // this.earth.add(sprite);
          tempGroup.add(sprite);
        });
      });
    });
    tempGroup.userData['isLabelGroup'] = true;
    this.earthGroup.add(tempGroup);
  }
  createAnimateCircle() {
    // 创建 圆环 点
    const list = getCirclePoints({
      radius: this.options.earth.radius + 15,
      number: 150, //切割数
      closed: true // 闭合
    });
    const mat = new THREE.MeshBasicMaterial({
      color: '#0c3172',
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide
    });
    const line = createAnimateLine({
      pointList: list,
      material: mat,
      number: 100,
      radius: 0.1
    });
    this.earthGroup.add(line);

    // 在clone两条线出来
    const l2 = line.clone();
    l2.scale.set(1.2, 1.2, 1.2);
    l2.rotateZ(Math.PI / 6);
    this.earthGroup.add(l2);

    const l3 = line.clone();
    l3.scale.set(0.8, 0.8, 0.8);
    l3.rotateZ(-Math.PI / 6);
    this.earthGroup.add(l3);

    /**
     * 旋转的球
     */
    const ball = new THREE.Mesh(
      new THREE.SphereBufferGeometry(this.options.satellite.size, 32, 32),
      new THREE.MeshBasicMaterial({
        color: '#e0b187' // 745F4D
      })
    );

    const ball2 = new THREE.Mesh(
      new THREE.SphereBufferGeometry(this.options.satellite.size, 32, 32),
      new THREE.MeshBasicMaterial({
        color: '#628fbb' // 324A62
      })
    );

    const ball3 = new THREE.Mesh(
      new THREE.SphereBufferGeometry(this.options.satellite.size, 32, 32),
      new THREE.MeshBasicMaterial({
        color: '#806bdf' //6D5AC4
      })
    );

    this.circleLineList.push(line, l2, l3);
    ball.name = ball2.name = ball3.name = '卫星';

    for (let i = 0; i < this.options.satellite.number; i++) {
      const ball01 = ball.clone();
      // 一根线上总共有几个球，根据数量平均分布一下
      const num = Math.floor(list.length / this.options.satellite.number);
      ball01.position.set(list[num * (i + 1)][0] * 1, list[num * (i + 1)][1] * 1, list[num * (i + 1)][2] * 1);
      line.add(ball01);

      const ball02 = ball2.clone();
      const num02 = Math.floor(list.length / this.options.satellite.number);
      ball02.position.set(list[num02 * (i + 1)][0] * 1, list[num02 * (i + 1)][1] * 1, list[num02 * (i + 1)][2] * 1);
      l2.add(ball02);

      const ball03 = ball2.clone();
      const num03 = Math.floor(list.length / this.options.satellite.number);
      ball03.position.set(list[num03 * (i + 1)][0] * 1, list[num03 * (i + 1)][1] * 1, list[num03 * (i + 1)][2] * 1);
      l3.add(ball03);
    }
  }
  // 创建飞线
  createFlyLine() {
    this.flyLineArcGroup = new THREE.Group();
    this.flyLineArcGroup.userData['flyLineArray'] = [];
    this.earthGroup.add(this.flyLineArcGroup);
    //  @important - 在这里入口修改创建飞线逻辑
    this.options.data.forEach((cities) => {
      // @important - 在这里通过传入的datas的endArray点来区分飞线的颜色
      cities.endArray.forEach((item) => {
        let flyLine = JSON.parse(JSON.stringify(this.options.flyLine));
        flyLine.color = this.lineColors[item.label || 'xxts'].value;
        flyLine.flyLineColor = this.flyLineColors[item.status || 'tc'].value;
        // @change
        // 调用函数flyArc绘制球面上任意两点之间飞线圆弧轨迹
        const arcline = flyArc(this.options.earth.radius, cities.startArray.E, cities.startArray.N, item.E, item.N, flyLine, item.label || 'xxts', item.status || 'tc');
        this.flyLineArcGroup.add(arcline); // 飞线插入flyArcGroup中
        this.flyLineArcGroup.userData['flyLineArray'].push(arcline.userData['flyLine']);
        this.flyLineArcGroup.userData['isLinesGroup'] = true;
      });
    });
  }
  show() {
    gsap.to(this.group.scale, {
      x: 1,
      y: 1,
      z: 1,
      duration: 2,
      ease: 'Quadratic'
    });
  }
  render() {
    this.flyLineArcGroup?.userData['flyLineArray']?.forEach((fly) => {
      fly.rotation.z += this.options.flyLine.speed; // 调节飞线速度
      if (fly.rotation.z >= fly.flyEndAngle) fly.rotation.z = 0;
    });
    if (this.isRotation) {
      this.earthGroup.rotation.y += this.options.earth.rotateSpeed;
    }
    this.circleLineList.forEach((e) => {
      e.rotateY(this.options.satellite.rotateSpeed);
    });
    this.uniforms.time.value = this.uniforms.time.value < -this.timeValue ? this.timeValue : this.uniforms.time.value - 1;
    if (this.waveMeshArr.length) {
      this.waveMeshArr.forEach((mesh) => {
        mesh.userData['scale'] += 0.007;
        mesh.scale.set(mesh.userData['size'] * mesh.userData['scale'], mesh.userData['size'] * mesh.userData['scale'], mesh.userData['size'] * mesh.userData['scale']);
        if (mesh.userData['scale'] <= 1.5) {
          // 这里可能会有问题 todo
          mesh.material.opacity = (mesh.userData['scale'] - 1) * 2;
          //2等于1/(1.5-1.0)，保证透明度在0~1之间变化
        } else if (mesh.userData['scale'] > 1.5 && mesh.userData['scale'] <= 2) {
          mesh.material.opacity = 1 - (mesh.userData['scale'] - 1.5) * 2;
          //2等于1/(2.0-1.5) mesh缩放2倍对应0 缩放1.5被对应1
        } else {
          mesh.userData['scale'] = 1;
        }
      });
    }
    if (this.satOrbit) this.satOrbit.rotation.y += 0.005; // 每帧约 0.005 弧度，可自行改小/改大
    // 设置卫星的点光源随卫星角度同时旋转
    if (this.satLightOrbit){
      this.satLightOrbit.rotation.y += 0.005;
    }
    // 让卫星一直指向地球中心
    if (this.satelliteModel) {
      this.satelliteModel.lookAt(0, 0, 0);
    }
  }
}
console.log('!!!!!!!')
// 导出的地球组件
const MyEarth = {
  template: `<div id="my-earth" class="my-earth">
    <div id="loading">
      <div class="sk-chase">
        <div class="sk-chase-dot"></div>
        <div class="sk-chase-dot"></div>
        <div class="sk-chase-dot"></div>
        <div class="sk-chase-dot"></div>
        <div class="sk-chase-dot"></div>
        <div class="sk-chase-dot"></div>
      </div>
      <div>加载资源中...</div>
    </div>
    <h6 id="html2canvas" class="css3d-wapper">
      <h6 class="fire-div"></h6>
    </h6>
    <div id="earth-canvas"></div>
  </div>`,
  props: {
    datas: {
      type: Array,
      default() {
        return [
          {
            startArray: {
              name: '杭州',
              N: 30.246026,
              E: 120.210792
            },
            endArray: [
              {
                name: '曼谷',
                N: 22, //维度
                E: 100.49074172973633, //经度
                label: 'xxts',
                status: 'tc'
              },
              {
                name: '美国',
                N: 34.125447565116126,
                E: 241.7431640625,
                label: 'xxts',
                status: 'yj'
              },
              {
                name: '北京',
                N: 39.4,
                E: 115.7,
                label: 'sjhc',
                status: 'zd'
              },
              {
                name: '西藏',
                N: 26.5,
                E: 78.25,
                label: 'sjhc',
                status: 'tc'
              }
            ]
          }
        ];
      }
    },
    lineColors: {
      type: Object,
      default() {
        return {
          xxts: '',
          sjhc: '',
          zlkz: ''
        };
      }
    },
    flyLineColors: {
      type: Object,
      default() {
        return {
          tc: '',
          yj: '',
          zd: ''
        };
      }
    }
  },
  data() {
    return {
      dom: null,
      basic: null,
      scene: null,
      renderer: null,
      controls: null,
      satOrbit: null,
      satelliteModel: null,
      camera: null,
      sizes: null,
      resources: null,

      material: null,
      option: null,
      earth: null,
      lastTime: Date.now(),
      initTime: null,
      composer: null,

      satelliteLight: null
    };
  },
  created() {},
  mounted() {
    // this.init();
  },
  beforeDestroy() {
    this.removeEvent(this.dom.firstChild);
  },
  methods: {
    init() {
      let dom = document.getElementById('earth-canvas');
      this.option = { dom };
      this.dom = dom;
      this.basic = new Basic(dom);
      this.scene = this.basic.scene;
      this.renderer = this.basic.renderer;
      this.controls = this.basic.controls;
      this.camera = this.basic.camera;
      this.sizes = new Sizes({ dom });
      this.sizes.$on('resize', () => {
        this.renderer.setSize(Number(this.sizes.viewport.width), Number(this.sizes.viewport.height));
        this.camera.aspect = Number(this.sizes.viewport.width) / Number(this.sizes.viewport.height);
        this.camera.updateProjectionMatrix();
      });
      // 灯光移到场景初始化
      const light = new THREE.DirectionalLight(0xffffff, 1.5);
      light.position.set(200, 100, 200);
      this.scene.add(light);
      this.resources = new Resources(async () => {
        await this.createEarth();
        this.earth.earthGroup.rotation.y -= 0.3
        // this.earth.earthGroup.rotation.x -= 0.3
        // 获取卫星x轴平面位置
        let satelliteX = this.earth.satelliteModel.position.x;
        const color = 0xffffff;
        const intensity = 3;
        // 设置y轴上下各增加点光源
        const bottomPointLight = new THREE.PointLight(color, intensity);
        const topPointLight = new THREE.PointLight(color, intensity);
        bottomPointLight.position.set(0, -300, 0);
        bottomPointLight.distance = 500
        topPointLight.position.set(0, 300, 0);
        topPointLight.distance = 500
        this.scene.add(bottomPointLight);
        this.scene.add(topPointLight);

        // satOrbit
        // 在卫星半径射线上添加照向卫星的点光源, 添加到3d中挂在到earthGroup上
        const satelliteLight = new THREE.PointLight(0xffffff, 4);
        satelliteLight.position.set(satelliteX + 50, 0, 0);
        satelliteLight.distance = 90;
        this.scene.add(satelliteLight);
        this.satelliteLight = satelliteLight;
        const satLightObject = new THREE.Object3D();
        satLightObject.add(satelliteLight);
        this.earth.satLightOrbit = satLightObject;
        this.earth.earthGroup.add(satLightObject)
        

        this.addComposer();
        if (this.dom.firstChild.tagName === 'CANVAS' && this.earth) {
          // 为canvas添加mousedown事件控制地球旋转
          this.addEvent(this.dom.firstChild);
        }
        this.render();
      }, '/assets/earth/');
    },
    addComposer() {
      // @add-change 尝试添加辉光
      this.composer = new THREE.EffectComposer(this.renderer);
      this.composer.setSize(this.dom.offsetWidth, this.dom.offsetHeight);
      this.composer.setPixelRatio(window.devicePixelRatio);
      const rendererPass = new THREE.RenderPass(this.scene, this.camera);
      this.composer.addPass(rendererPass);
      const bloomPass = new THREE.UnrealBloomPass(
        new THREE.Vector2(this.dom.offsetWidth, this.dom.offsetHeight),
        // strength, // 辉光强度
        // 1.5,
        0.4,
        // radius,   // 辉光模糊半径
        // 0.4,
        0.1,
        // threshold //亮度阈值，低于此值的像素不参与辉光计算
        0.1
      );
      this.composer.addPass(bloomPass);
    },
    async createEarth() {
      // 资源加载完成，开始制作地球，注释在new Earth()类型里面
      this.earth = new Earth({
        data: this.datas,
        dom: this.option.dom,
        textures: this.resources.textures,
        earth: {
          radius: 50,
          rotateSpeed: 0.002,
          // isRotation: true
          isRotation: false
        },
        satellite: {
          show: true,
          rotateSpeed: -0.01,
          size: 1,
          number: 2
        },
        punctuation: {
          circleColor: 0x3892ff,
          lightColumn: {
            startColor: 0xe4007f, // 起点颜色
            endColor: 0xffffff // 终点颜色
          }
        },
        flyLine: {
          color: 0xf3ae76, // 飞线的颜色
          flyLineColor: 0xff7714, // 飞行线的颜色
          speed: 0.004 // 拖尾飞线的速度
        },
        lineColors: this.lineColors,
        flyLineColors: this.flyLineColors
      });

      this.scene.add(this.earth.group);
      await this.earth.init();

      // 隐藏dom
      const loading = document.querySelector('#loading');
      loading.classList.add('out');
    },
    render() {
      requestAnimationFrame(this.render.bind(this));
      this.renderer.render(this.scene, this.camera);
      // this.composer.render();
      this.controls && this.controls.update();
      this.earth && this.earth.render();
    },
    addEvent(dom) {
      dom.addEventListener('mousedown', this.mousedown);
      dom.addEventListener('mouseup', this.mouseup);
      dom.addEventListener('click', this.handleMousemove);
    },
    removeEvent(dom) {
      dom.removeEventListener('mousedown', this.mousedown);
      dom.removeEventListener('mouseup', this.mouseup);
      // dom.removeEventListener('click', this.handleMousemove);
    },
    mousedown() {
      this.earth.isRotation = false;
    },
    mouseup() {
      const that = this;
      if (this.earth && this.earth.isRotation === false) {
        setTimeout(() => {
          that.earth.isRotation = true;
        }, 1500);
      }
    },
    // ====================> 暴露方法外部使用
    // 暴露到外部的控制飞线显隐方法
    clearFlyLine(key, value, flag) {
      if (this?.earth?.earthGroup?.children && Array.isArray(this.earth.earthGroup.children) && this.earth.earthGroup.children.length > 0) {
        let linesGroup = this.earth.earthGroup.children.find((item) => item.userData['isLinesGroup']);
        if (linesGroup && Array.isArray(linesGroup.children) && linesGroup.children.length > 0) {
          linesGroup.children.forEach((item) => {
            if (item.userData[key] === value) {
              let itemOtherObj = key === 'lineType' ? { key: 'lineStatus', value: item.userData['lineStatus'], propKey: 'flyLineColors' } : { key: 'lineType', value: item.userData['lineType'], propKey: 'lineColors' };
              item.visible = flag && this[itemOtherObj.propKey][itemOtherObj.value].flag;
            }
          });
        }
      }
    },
    // 暴露到组件外部的重启地球旋转
    playRotation() {
      this.earth.isRotation = true;
      this.addEvent(this.dom.firstChild);
    },
    // 暴露到组件外部的停止地球旋转
    stopRotation() {
      this.removeEvent(this.dom.firstChild);
      this.earth.isRotation = false;
    },
    // 暴露到组件外的重置相机视角事件
    resetCamera() {
      this.camera.position.set(0, 30, -200);
    },
    // 清楚所有datas相关的光柱、飞线、label
    clearAllDatas() {
      let linesIndex = this.earth.earthGroup.children.findIndex((item) => item.userData['isLinesGroup']);
      linesIndex > 0 && this.earth.earthGroup.children.splice(linesIndex, 1);
      let markupIndex = this.earth.earthGroup.children.findIndex((item) => item.userData['isMarkupPoint']);
      markupIndex > 0 && this.earth.earthGroup.children.splice(markupIndex, 1);
      let labelGroupIndex = this.earth.earthGroup.children.findIndex((item) => item.userData['isLabelGroup']);
      labelGroupIndex > 0 && this.earth.earthGroup.children.splice(labelGroupIndex, 1);
    },
    // 重新渲染地球数据
    async renderDatas(datas) {
      this.earth.options.data = datas;
      await this.earth.createMarkupPoint(); // 创建柱状点位
      // await this.createSpriteLabel() // 创建标签
      this.earth.createSpriteLabelAsync();
      // this.createAnimateCircle() // 创建环绕卫星
      this.earth.createFlyLine(); // 创建飞线
    },
    // 尝试为地球添加鼠标悬浮的射线器侦测事件
    handleMousemove(e) {
      const px = e.offsetX;
      const py = e.offsetY;
      const x = (px / this.dom.offsetWidth) * 2 - 1;
      const y = -(py / this.dom.offsetHeight) * 2 + 1;
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(x, y), this.camera);

      const intersects = raycaster.intersectObjects(this.scene.children);
      // console.log(intersects)
      if (intersects.length > 0 && intersects[0].object.userData['selectable']) {
        console.log('射线器拾取到地点标签');
        console.log(intersects[0].object.userData['positionName']);
        console.log(px);
        console.log(py);
      }
    },
    // ============> 暴露到外部的方法
    // 根据传入的经纬度和到该经纬度的距离返回地球上的目标点和相机移动位置点
    outReturnAnimationVector({N, E}, distance){
      const R = this.earth.options.earth.radius;
      const target = lon2xyz(R, N, E);
      const position = getPointAlongRay(N, E, -distance, R);
      return { target, position };
    }
  }
};
