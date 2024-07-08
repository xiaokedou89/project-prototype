import axios from 'axios';

axios.defaults.headers['Content-Type'] = 'application/json;charset=utf-8';

const service = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API,
  timeout: 20000
});

// 请求拦截
service.interceptors.request.use(config => {

},
error => {

});

// 相应拦截
service.interceptors.response.use(res => {

},
error => {

});

export default service;