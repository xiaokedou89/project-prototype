// 1. 添加尾迹效果
function addTrailEffect() {
    const trails = [];
    const trailCount = 10;
    
    for (let i = 0; i < trailCount; i++) {
        const trail = document.createElement('div');
        trail.className = 'trail';
        parent.appendChild(trail);
        trails.push(trail);
    }
    
    const positions = [];
    
    gsap.to({ angle: 0 }, {
        angle: 360,
        duration: 8,
        ease: "none",
        repeat: -1,
        onUpdate: function() {
            const rad = this.targets()[0].angle * Math.PI / 180;
            const x = centerX + radiusX * Math.cos(rad);
            const y = centerY + radiusY * Math.sin(rad);
            
            // 记录位置历史
            positions.unshift({ x, y });
            if (positions.length > trailCount) positions.pop();
            
            // 更新尾迹
            positions.forEach((pos, index) => {
                const trail = trails[index];
                if (trail) {
                    const opacity = 0.6 * (1 - index / trailCount);
                    gsap.set(trail, {
                        x: pos.x - 4,
                        y: pos.y - 4,
                        opacity: opacity
                    });
                }
            });
            
            gsap.set(child, {
                x: x - 20,
                y: y - 20
            });
        }
    });
}

// 2. 变速椭圆运动（非匀速）
function animateVariableSpeed() {
    const state = { angle: 0 };
    
    // 自定义缓动曲线：快-慢-快
    const customEase = "power2.inOut";
    
    gsap.to(state, {
        angle: 360,
        duration: 12,
        ease: customEase,
        repeat: -1,
        yoyo: false,
        onUpdate: () => {
            const rad = state.angle * Math.PI / 180;
            const x = centerX + radiusX * Math.cos(rad);
            const y = centerY + radiusY * Math.sin(rad);
            gsap.set(child, { x: x - 20, y: y - 20 });
        }
    });
}

// 3. 控制动画（暂停/继续/重置）
function createAnimationControls() {
    const state = { angle: 0 };
    const animation = gsap.to(state, {
        angle: 360,
        duration: 8,
        ease: "none",
        repeat: -1,
        onUpdate: () => {
            const rad = state.angle * Math.PI / 180;
            const x = centerX + radiusX * Math.cos(rad);
            const y = centerY + radiusY * Math.sin(rad);
            gsap.set(child, { x: x - 20, y: y - 20 });
        }
    });
    
    return {
        pause: () => animation.pause(),
        resume: () => animation.resume(),
        restart: () => animation.restart(),
        reverse: () => animation.reverse(),
        setSpeed: (speed) => animation.timeScale(speed)
    };
}