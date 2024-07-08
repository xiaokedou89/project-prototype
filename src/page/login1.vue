<template>
  <div class="login-container">
    <h1 class="project-title">{{ projectTitle }}</h1>
    <div class="main">  	
		  <input type="checkbox" id="chk" aria-hidden="true">
			  <div class="signup">
				  <!-- <form> -->
          <el-form :model="signupForm">
					  <label for="chk" aria-hidden="true">注册</label>
            <el-form-item prop="username">
              <el-input v-model="signupForm.username" type="text" placeholder="用户名" />
            </el-form-item>
					  <!-- <input type="text" name="txt" placeholder="User name" required=""> -->
            <el-form-item prop="email">
              <el-input v-model="signupForm.email" type="email" name="email" placeholder="邮箱" />
            </el-form-item>
					  <!-- <input type="email" name="email" placeholder="Email" required=""> -->
            <!-- <input type="number" name="broj" placeholder="BrojTelefona" required=""> -->
            <el-form-item prop="password">
              <el-input v-model="signupForm.password" type="password" name="pswd" placeholder="密码" show-password />
            </el-form-item>
            <el-form-item prop="repeatPassword">
              <el-input v-model="signupForm.repeatPassword" type="password" placeholder="确认密码" show-password />
            </el-form-item>
					  <!-- <input type="password" name="pswd" placeholder="Password" required=""> -->
					  <button type="button">注册</button>
				  <!-- </form> -->
          </el-form>
			  </div>
      
			  <div class="login">
				  <!-- <form> -->
          <el-form :model="loginForm">
					  <label for="chk" aria-hidden="true">登录</label>
            <el-form-item prop="email">
              <el-input v-model="loginForm.email" type="email" placeholder="邮箱" />
            </el-form-item>
					  <!-- <input type="email" name="email" placeholder="Email" required=""> -->
            <el-form-item prop="password">
              <el-input type="password" show-password v-model="loginForm.password" placeholder="密码" />
            </el-form-item>
					  <!-- <input type="password" name="pswd" placeholder="Password" required=""> -->
					  <button type="button">登录</button>
				  <!-- </form> -->
        </el-form>
			  </div>
	  </div>
  </div>
  
</template>
<script setup>
import {ref} from 'vue'
const signupForm = ref({
  username: '',
  email: '',
  password: '',
  repeatPassword: ''
});
const loginForm = ref({
  email: '',
  password: ''
});
const projectTitle = ref('图像隐写算法组合生成平台');


</script>
<style lang='scss' scoped>
.login-container {
	margin: 0;
	padding: 0;
	display: flex;
  flex-direction: column;
	justify-content: center;
	align-items: center;
	min-height: 100vh;
	font-family: 'Jost', sans-serif;
	background: linear-gradient(to bottom, #0f0c29, #302b63, #24243e);
}
.project-title {
  color: #fff;
}
.main{
	width: 350px;
	height: 500px;
	overflow: hidden;
	border-radius: 10px;
	box-shadow: 5px 20px 50px #000;
  margin-top: 100px;
}
#chk{
	display: none;
}
.signup{
	position: relative;
	width:100%;
	height: 100%;
}
label{
	color: #fff;
	font-size: 2.3em;
	justify-content: center;
	display: flex;
	margin: 50px;
	font-weight: bold;
	cursor: pointer;
	transition: .5s ease-in-out;
}
input{
	width: 60%;
	height: 10px;
	background: #e0dede;
	justify-content: center;
	display: flex;
	margin: 20px auto;
	padding: 12px;
	border: none;
	outline: none;
	border-radius: 5px;
}
button{
	width: 60%;
	height: 40px;
	margin: 10px auto;
	justify-content: center;
	display: block;
	color: #fff;
	background: #573b8a;
	font-size: 1em;
	font-weight: bold;
	margin-top: 30px;
	outline: none;
	border: none;
	border-radius: 5px;
	transition: .2s ease-in;
	cursor: pointer;
}
button:hover{
	background: #6d44b8;
}
.login{
	height: 460px;
	background: #eee;
	border-radius: 60% / 10%;
	transform: translateY(-180px);
	transition: .8s ease-in-out;
}
.login label{
	color: #573b8a;
	transform: scale(.6);
}

#chk:checked ~ .login{
	transform: translateY(-500px);
}
#chk:checked ~ .login label{
	transform: scale(1);	
}
#chk:checked ~ .signup label{
	transform: scale(.6);
}

.el-input {
  width: 60%;
  margin: 0 auto;
  justify-content: center;
	display: flex;
  &::v-deep .el-input__wrapper {
    background-color: #e0dede;
  }
}
@media (min-width: 1500px){
  .main {
    width: 650px;
  }
}
@media (max-width: 1500px){
  .main {
    width: 500px;
  }
}
@media (max-width: 900px){
  .main {
    width: 350px;
  }
}
</style>