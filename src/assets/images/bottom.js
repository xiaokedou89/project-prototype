// 获取父容器和子元素
const parent = document.getElementById('parent');
const child = document.getElementById('child');

// 获取父容器的尺寸
const rect = parent.getBoundingClientRect();
const centerX = rect.width / 2;
const centerY = rect.height / 2;

// 椭圆半径（以父容器宽高的一半为基准）
const radiusX = centerX;      // 水平半径 = 宽度的一半
const radiusY = centerY;      // 垂直半径 = 高度的一半

// 方法一：使用 GSAP 的 .to 配合自定义属性动画
function animateEllipse() {
    // 创建一个角度属性对象
    const state = { angle: 0 };
    
    // 使用 GSAP 对角度进行无限循环动画
    gsap.to(state, {
        angle: 360,
        duration: 8,           // 完整一圈所需时间（秒）
        ease: "none",          // 线性运动，保持匀速
        repeat: -1,           // 无限循环
        onUpdate: () => {
            // 将角度转换为弧度
            const rad = state.angle * Math.PI / 180;
            
            // 计算椭圆上的位置
            const x = centerX + radiusX * Math.cos(rad);
            const y = centerY + radiusY * Math.sin(rad);
            
            // 更新子元素位置
            gsap.set(child, {
                x: x - child.offsetWidth / 2,
                y: y - child.offsetHeight / 2
            });
        }
    });
}

// 方法二：使用 GSAP 的 .fromTo 配合 modifiers（更简洁）
function animateEllipseModern() {
    gsap.fromTo(child, 
        {
            x: centerX - child.offsetWidth / 2,
            y: centerY - child.offsetHeight / 2
        },
        {
            duration: 8,
            repeat: -1,
            ease: "none",
            modifiers: {
                x: (x, target) => {
                    const progress = target._gsap?.progress || 0;
                    const angle = progress * Math.PI * 2;
                    return centerX + radiusX * Math.cos(angle) - child.offsetWidth / 2;
                },
                y: (y, target) => {
                    const progress = target._gsap?.progress || 0;
                    const angle = progress * Math.PI * 2;
                    return centerY + radiusY * Math.sin(angle) - child.offsetHeight / 2;
                }
            }
        }
    );
}

// 方法三：使用 GSAP 的 .to 并利用 SVG 路径（最精确）
function animateEllipseWithPath() {
    // 创建椭圆路径
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    const d = `M ${centerX + radiusX},${centerY} 
               A ${radiusX},${radiusY} 0 1,1 ${centerX - radiusX},${centerY}
               A ${radiusX},${radiusY} 0 1,1 ${centerX + radiusX},${centerY}`;
    path.setAttribute("d", d);
    
    // 使用 GSAP 的 MotionPathPlugin
    gsap.registerPlugin(MotionPathPlugin);
    
    gsap.to(child, {
        duration: 8,
        repeat: -1,
        ease: "none",
        motionPath: {
            path: path,
            align: path,
            autoRotate: false,
            alignOrigin: [0.5, 0.5]
        }
    });
}

// 方法四：响应窗口大小变化，重新计算椭圆轨迹
function responsiveEllipse() {
    let animation;
    
    function updateEllipse() {
        // 重新获取父容器尺寸
        const newRect = parent.getBoundingClientRect();
        const newCenterX = newRect.width / 2;
        const newCenterY = newRect.height / 2;
        const newRadiusX = newCenterX;
        const newRadiusY = newCenterY;
        
        // 如果已有动画，先杀死
        if (animation) animation.kill();
        
        // 创建新动画
        const state = { angle: 0 };
        animation = gsap.to(state, {
            angle: 360,
            duration: 8,
            ease: "none",
            repeat: -1,
            onUpdate: () => {
                const rad = state.angle * Math.PI / 180;
                const x = newCenterX + newRadiusX * Math.cos(rad);
                const y = newCenterY + newRadiusY * Math.sin(rad);
                gsap.set(child, {
                    x: x - child.offsetWidth / 2,
                    y: y - child.offsetHeight / 2
                });
            }
        });
    }
    
    // 监听窗口大小变化
    window.addEventListener('resize', () => {
        updateEllipse();
    });
    
    // 启动动画
    updateEllipse();
}

// 方法五：支持椭圆倾斜角度（斜椭圆）
function animateTiltedEllipse(tiltAngle = 30) {
    const state = { angle: 0 };
    const tiltRad = tiltAngle * Math.PI / 180;
    const cosTilt = Math.cos(tiltRad);
    const sinTilt = Math.sin(tiltRad);
    
    gsap.to(state, {
        angle: 360,
        duration: 8,
        ease: "none",
        repeat: -1,
        onUpdate: () => {
            const rad = state.angle * Math.PI / 180;
            
            // 计算标准椭圆上的点
            const x0 = radiusX * Math.cos(rad);
            const y0 = radiusY * Math.sin(rad);
            
            // 应用旋转变换
            const x = centerX + (x0 * cosTilt - y0 * sinTilt);
            const y = centerY + (x0 * sinTilt + y0 * cosTilt);
            
            gsap.set(child, {
                x: x - child.offsetWidth / 2,
                y: y - child.offsetHeight / 2
            });
        }
    });
}