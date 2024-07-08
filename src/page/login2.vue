<template>
	<div ref="loginContainer" class="login-container" :style="{backgroundSize: bgSize}">
		<h1 class="project-title">{{ projectTitle }}</h1>
		<div class="container" id="container">
    	<div class="form-container sign-up-container">
				<el-form :model="signupForm" :rules="rules">
    	    <h1>注册</h1>
    	    <el-form-item prop="username">
						<el-input type="text" v-model="signupForm.username" placeholder="账号名" />	
					</el-form-item>
    	    <el-form-item prop="email">
						<el-input type="email" v-model="signupForm.email" placeholder="邮箱" />
					</el-form-item>
					<el-form-item prop="password">
						<el-input type="password" show-password v-model="signupForm.password" placeholder="密码" />
					</el-form-item>
					<el-form-item prop="repeatPassword">
						<el-input type="password" show-password v-model="signupForm.repeatPassword" placeholder="确认密码" />
					</el-form-item>
				  <button type="button">注册</button>
				</el-form>
    	</div>
    	<div class="form-container sign-in-container">
				<el-form :model="loginForm">
    	    <h1>登录</h1>
    	    <el-form-item prop="email">
						<el-input type="email" v-model="loginForm.email" placeholder="邮箱" />
					</el-form-item>
					<el-form-item prop="password">
						<el-input type="password" show-password v-model="loginForm.password" placeholder="密码" />
					</el-form-item>
				  <a href="#">忘记密码?</a>
				  <button type="button">登录</button>
				</el-form>
    	</div>
    	<div class="overlay-container">
    	  <div class="overlay">
    	    <div class="overlay-panel overlay-left">
    	      <h1>欢迎回来!</h1>
					  <p>如果您已有该系统账号，请使用账号前往登录</p>
					  <button class="ghost" id="signIn" @click="changeLogin">去登录</button>
    	    </div>
    	    <div class="overlay-panel overlay-right">
    	      <h1>您好!</h1>
					  <p>没有该系统账号，请使用个人信息注册账号</p>
					  <button class="ghost" id="signUp" @click="changeSignup">去注册</button>
    	    </div>
    	  </div>
    	</div>
  	</div>
	</div>
</template>
<script setup>
import { onMounted, ref } from 'vue';
const loginContainer = ref(null);
const bgSize = ref('');
const projectTitle = ref('图像隐写算法组合生成平台')
const loginForm = ref({
	email: '',
	password: ''
});
const signupForm = ref({
	username: '',
  email: '',
  password: '',
  repeatPassword: ''
})
const rules = {
	username: [{required: true, trigger: ['change', 'blur'], message: '不能为空'}]
}

function changeSignup(){
	const container = document.getElementById('container');
	if (container){
		container.classList.add("right-panel-active");
	}
}
function changeLogin(){
	const container = document.getElementById('container');
	if (container){
		container.classList.remove("right-panel-active");
	}
}
onMounted(() => {
	if (loginContainer.value){
		console.dir(loginContainer.value)
		let width = loginContainer.value.offsetWidth,
				height = loginContainer.value.offsetHeight,
				ratio = 1728 / 919;
		
		bgSize.value = width > height ? `auto ${height + 150}px` : `${width + 150}px auto`;

	}
})

</script>
<style lang='scss' scoped>
@import '@/assets/styles/mixin.scss';
.login-container {
	@include flex-all-center;
	@include wh-100;
	flex-direction: column;
	font-family: 'Montserrat', sans-serif;
	background-image: url('@/assets/images/03.png');
	background-position: center center;
	background-repeat: no-repeat;
	.bg {
		width: 100%;
		height: 100%;
		position: absolute;
		top: 0;
		left: 0;

	}
}

h1 {
	font-weight: bold;
	margin: 0;
}

h2 {
	text-align: center;
}

p {
	font-size: 14px;
	font-weight: 100;
	line-height: 20px;
	letter-spacing: 0.5px;
	margin: 20px 0 30px;
}

span {
	font-size: 12px;
}

a {
	color: #333;
	font-size: 14px;
	text-decoration: none;
	margin: 15px 0;
}

button {
	border-radius: 20px;
	border: 1px solid #FF4B2B;
	background-color: #FF4B2B;
	color: #FFFFFF;
	font-size: 12px;
	font-weight: bold;
	padding: 12px 45px;
	letter-spacing: 1px;
	text-transform: uppercase;
	transition: transform 80ms ease-in;
}

button:active {
	transform: scale(0.95);
}

button:focus {
	outline: none;
}

button.ghost {
	background-color: transparent;
	border-color: #FFFFFF;
}

form {
	background-color: #FFFFFF;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-direction: column;
	padding: 0 50px;
	height: 100%;
	text-align: center;
}

input {
	background-color: #eee;
	border: none;
	padding: 12px 15px;
	margin: 8px 0;
	width: 100%;
}

.container {
	background-color: #fff;
	border-radius: 10px;
  	box-shadow: 0 14px 28px rgba(0,0,0,0.25), 
			0 10px 10px rgba(0,0,0,0.22);
	position: relative;
	overflow: hidden;
	width: 768px;
	max-width: 100%;
	min-height: 480px;
	margin-top: 100px;
}

.form-container {
	position: absolute;
	top: 0;
	height: 100%;
	transition: all 0.6s ease-in-out;
}

.sign-in-container {
	left: 0;
	width: 50%;
	z-index: 2;
}

.container.right-panel-active .sign-in-container {
	transform: translateX(100%);
}

.sign-up-container {
	left: 0;
	width: 50%;
	opacity: 0;
	z-index: 1;
}

.container.right-panel-active .sign-up-container {
	transform: translateX(100%);
	opacity: 1;
	z-index: 5;
	animation: show 0.6s;
}

@keyframes show {
	0%, 49.99% {
		opacity: 0;
		z-index: 1;
	}
	
	50%, 100% {
		opacity: 1;
		z-index: 5;
	}
}

.overlay-container {
	position: absolute;
	top: 0;
	left: 50%;
	width: 50%;
	height: 100%;
	overflow: hidden;
	transition: transform 0.6s ease-in-out;
	z-index: 100;
}

.container.right-panel-active .overlay-container{
	transform: translateX(-100%);
}

.overlay {
	background: #FF416C;
	background: -webkit-linear-gradient(to right, #FF4B2B, #FF416C);
	background: linear-gradient(to right, #FF4B2B, #FF416C);
	background-repeat: no-repeat;
	background-size: cover;
	background-position: 0 0;
	color: #FFFFFF;
	position: relative;
	left: -100%;
	height: 100%;
	width: 200%;
  	transform: translateX(0);
	transition: transform 0.6s ease-in-out;
}

.container.right-panel-active .overlay {
  	transform: translateX(50%);
}

.overlay-panel {
	position: absolute;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-direction: column;
	padding: 0 40px;
	text-align: center;
	top: 0;
	height: 100%;
	width: 50%;
	transform: translateX(0);
	transition: transform 0.6s ease-in-out;
}

.overlay-left {
	transform: translateX(-20%);
}

.container.right-panel-active .overlay-left {
	transform: translateX(0);
}

.overlay-right {
	right: 0;
	transform: translateX(0);
}

.container.right-panel-active .overlay-right {
	transform: translateX(20%);
}

.el-form-item {
	width: 100%;
	margin-bottom: 10px;
}
.el-input {
	width: 100%;
	&::v-deep .el-input__wrapper {
		margin: 8px 0;
		background-color: #eee;
	}
	&::v-deep .el-input__inner {
		border: none;
		width: 100%;
	}
}
.project-title {
	color: #fff;
}

</style>