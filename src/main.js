import '@/assets/styles/normalize.scss';
import '@/assets/styles/main.scss';
import '@/assets/iconfont/iconfont.css';
import '@/utils/permission'
import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import zhCn from 'element-plus/es/locale/lang/zh-cn'


const app = createApp(App)

// console.log(import.meta)

app.use(createPinia())
app.use(router)
app.use(ElementPlus, {
  locale: zhCn
})
app.mount('#app')
// 初始化项目主题色，所有颜色都在assets/styles/theme.scss中定义
// 通过修改document.document.setAttribute('data-theme')切换
document.documentElement.setAttribute('data-theme', 'default')
