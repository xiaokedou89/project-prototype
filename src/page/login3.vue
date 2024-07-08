<template>
  <div class="cotn_principal">
    <h1 class="project-title">{{ projectTitle }}</h1>
    <div class="cont_centrar">

      <div class="cont_login">
        <div class="cont_info_log_sign_up">
          <div class="col_md_login">
            <div class="cont_ba_opcitiy">
              <h2>登录</h2>  
              <p>如果您已有该系统账号，请使用账号前往登录</p> 
              <button type="button" class="btn_login" @click="change_to_login">去登录</button>
            </div>
          </div>
          <div class="col_md_sign_up">
            <div class="cont_ba_opcitiy">
              <h2>注册</h2>
              <p>没有该系统账号，请使用个人信息注册账号</p>
              <button type="button" class="btn_sign_up" @click="change_to_sign_up">去注册</button>
            </div>
          </div>
        </div>
        <div class="cont_back_info">
          <div class="cont_img_back_grey">
            <img :src="loginBg" alt="" />
          </div>
        </div>
        <div class="cont_forms" >
          <div class="cont_img_back_">
            <img :src="loginBg" alt="" />
          </div>
          <div class="cont_form_login">
            <a href="#" @click="hidden_login_and_sign_up" ><i class="iconfont icon-zuojiantou1 material-icons"></i></a>
            <h2>登录</h2>
            <el-form :model="loginForm">
              <el-form-item prop="emial">
                <el-input type="email" v-model="loginForm.email" placeholder="邮箱" />
              </el-form-item>
              <el-form-item prop="password">
                <el-input type="password" show-password v-model="loginForm.password" placeholder="密码" />
              </el-form-item>
            </el-form>
            <!-- <input type="text" placeholder="Email" />
            <input type="password" placeholder="Password" /> -->
            <button type="button" class="btn_login" @click="change_to_login">登录</button>
          </div>
          <div class="cont_form_sign_up">
            <a href="#" @click="hidden_login_and_sign_up"><i class="iconfont icon-zuojiantou1 material-icons">&#xE5C4;</i></a>
            <h2>注册</h2>
            <el-form :model="signupForm">
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
            </el-form>
            <!-- <input type="text" placeholder="Email" />
            <input type="text" placeholder="User" />
            <input type="password" placeholder="Password" />
            <input type="password" placeholder="Confirm Password" /> -->
            <button type="button" class="btn_sign_up" @click="change_to_sign_up">注册</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import loginBg from '@/assets/images/login3-bg.jpg';
// import loginBg from '@/assets/images/login4-bg.jpg';
import { ref } from 'vue';

const projectTitle = ref('图像隐写算法组合生成平台');
const loginForm = ref({
  email: '',
  password: ''
});
const signupForm = ref({
  username: '',
  email: '',
  password: '',
  repeatPassword: ''
});

const time_to_show_login = 400;
const time_to_hidden_login = 200;

function change_to_login() {
  document.querySelector('.cont_forms').className = "cont_forms cont_forms_active_login";  
  document.querySelector('.cont_form_login').style.display = "block";
  document.querySelector('.cont_form_sign_up').style.opacity = "0";               

  setTimeout(function(){  
    document.querySelector('.cont_form_login').style.opacity = "1"; 
  },time_to_show_login);  
  
  setTimeout(function(){    
    document.querySelector('.cont_form_sign_up').style.display = "none";
  },time_to_hidden_login);  
}

const time_to_show_sign_up = 100;
const time_to_hidden_sign_up = 400;

function change_to_sign_up(at) {
  document.querySelector('.cont_forms').className = "cont_forms cont_forms_active_sign_up";
  document.querySelector('.cont_form_sign_up').style.display = "block";
  document.querySelector('.cont_form_login').style.opacity = "0";
  
  setTimeout(function(){  
    document.querySelector('.cont_form_sign_up').style.opacity = "1";
  },time_to_show_sign_up);  

  setTimeout(function(){   
    document.querySelector('.cont_form_login').style.display = "none";
  },time_to_hidden_sign_up);  
}    

const time_to_hidden_all = 500;

function hidden_login_and_sign_up() {
  document.querySelector('.cont_forms').className = "cont_forms";  
  document.querySelector('.cont_form_sign_up').style.opacity = "0";               
  document.querySelector('.cont_form_login').style.opacity = "0"; 

  setTimeout(function(){
    document.querySelector('.cont_form_sign_up').style.display = "none";
    document.querySelector('.cont_form_login').style.display = "none";
  },time_to_hidden_all);  
}
 
</script>
<style lang='scss' scoped>


* {
  margin: 0px auto;
  padding: 0px;
  text-align: center;
  font-family: "Open Sans", sans-serif;
}

.cotn_principal {
  position: absolute;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  background: #cfd8dc; 
  background: -moz-linear-gradient(
    -45deg,
    #cfd8dc 0%,
    #607d8b 100%,
    #b0bec5 100%
  ); 
  background: -webkit-linear-gradient(
    -45deg,
    #cfd8dc 0%,
    #607d8b 100%,
    #b0bec5 100%
  ); 
  background: linear-gradient(
    135deg,
    #cfd8dc 0%,
    #607d8b 100%,
    #b0bec5 100%
  ); 
  filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#cfd8dc', endColorstr='#b0bec5',GradientType=1 ); 
}

.cont_centrar {
  display: flex;
  align-self: center;
  width: 100%;
  margin-top: 100px;
}

.cont_login {
  position: relative;
  width: 640px;
}

.cont_back_info {
  position: relative;
  float: left;
  width: 640px;
  height: 280px;
  overflow: hidden;
  background-color: #fff;
  box-shadow: 1px 10px 30px -10px rgba(0, 0, 0, 0.5);
}

.cont_forms {
  position: absolute;
  overflow: hidden;
  top: 0px;
  left: 0px;
  width: 320px;
  height: 280px;
  background-color: #eee;
  -webkit-transition: all 0.5s;
  -moz-transition: all 0.5s;
  -ms-transition: all 0.5s;
  -o-transition: all 0.5s;
  transition: all 0.5s;
}

.cont_forms_active_login {
  box-shadow: 1px 10px 30px -10px rgba(0, 0, 0, 0.5);
  height: 420px;
  top: -60px;
  left: 0px;
  -webkit-transition: all 0.5s;
  -moz-transition: all 0.5s;
  -ms-transition: all 0.5s;
  -o-transition: all 0.5s;
  transition: all 0.5s;
}

.cont_forms_active_sign_up {
  box-shadow: 1px 10px 30px -10px rgba(0, 0, 0, 0.5);
  height: 420px;
  top: -60px;
  left: 320px;
  -webkit-transition: all 0.5s;
  -moz-transition: all 0.5s;
  -ms-transition: all 0.5s;
  -o-transition: all 0.5s;
  transition: all 0.5s;
}

.cont_img_back_grey {
  position: absolute;
  width: 950px;
  top: -80px;
  left: -116px;
}

.cont_img_back_grey > img {
  width: 100%;
  -webkit-filter: grayscale(100%);
  filter: grayscale(100%);
  opacity: 0.2;
  animation-name: animar_fondo;
  animation-duration: 20s;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
  animation-direction: alternate;
}

.cont_img_back_ {
  position: absolute;
  width: 950px;
  top: -80px;
  left: -116px;
}

.cont_img_back_ > img {
  width: 100%;
  opacity: 0.3;
  animation-name: animar_fondo;
  animation-duration: 20s;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
  animation-direction: alternate;
}

.cont_forms_active_login > .cont_img_back_ {
  top: -20px;
  -webkit-transition: all 0.5s;
  -moz-transition: all 0.5s;
  -ms-transition: all 0.5s;
  -o-transition: all 0.5s;
  transition: all 0.5s;
}

.cont_forms_active_sign_up > .cont_img_back_ {
  top: -20px;
  left: -435px;
  -webkit-transition: all 0.5s;
  -moz-transition: all 0.5s;
  -ms-transition: all 0.5s;
  -o-transition: all 0.5s;
  transition: all 0.5s;
}

.cont_info_log_sign_up {
  position: absolute;
  width: 640px;
  height: 280px;
  top: 0px;
  z-index: 1;
}

.col_md_login {
  position: relative;
  float: left;
  width: 50%;
}

.col_md_login > h2 {
  font-weight: 400;
  margin-top: 70px;
  color: #757575;
}

.col_md_login > p {
  font-weight: 400;
  margin-top: 15px;
  width: 80%;
  color: #37474f;
}

.btn_login {
  background-color: #26c6da;
  border: none;
  padding: 10px;
  width: 200px;
  border-radius: 3px;
  box-shadow: 1px 5px 20px -5px rgba(0, 0, 0, 0.4);
  color: #fff;
  margin-top: 10px;
  cursor: pointer;
}

.col_md_sign_up {
  position: relative;
  float: left;
  width: 50%;
}

.cont_ba_opcitiy > h2 {
  font-weight: 400;
  color: #fff;
}

.cont_ba_opcitiy > p {
  font-weight: 400;
  margin-top: 15px;
  color: #fff;
}
/* ----------------------------------
background text    
------------------------------------
 */
.cont_ba_opcitiy {
  position: relative;
  background-color: rgba(120, 144, 156, 0.55);
  width: 80%;
  border-radius: 3px;
  margin-top: 60px;
  padding: 15px 0px;
}

.btn_sign_up {
  background-color: #ef5350;
  border: none;
  padding: 10px;
  width: 200px;
  border-radius: 3px;
  box-shadow: 1px 5px 20px -5px rgba(0, 0, 0, 0.4);
  color: #fff;
  margin-top: 10px;
  cursor: pointer;
}
.cont_forms_active_sign_up {
  z-index: 2;
}

@-webkit-keyframes animar_fondo {
  from {
    -webkit-transform: scale(1) translate(0px);
    -moz-transform: scale(1) translate(0px);
    -ms-transform: scale(1) translate(0px);
    -o-transform: scale(1) translate(0px);
    transform: scale(1) translate(0px);
  }
  to {
    -webkit-transform: scale(1.5) translate(50px);
    -moz-transform: scale(1.5) translate(50px);
    -ms-transform: scale(1.5) translate(50px);
    -o-transform: scale(1.5) translate(50px);
    transform: scale(1.5) translate(50px);
  }
}
@-o-keyframes identifier {
  from {
    -webkit-transform: scale(1);
    -moz-transform: scale(1);
    -ms-transform: scale(1);
    -o-transform: scale(1);
    transform: scale(1);
  }
  to {
    -webkit-transform: scale(1.5);
    -moz-transform: scale(1.5);
    -ms-transform: scale(1.5);
    -o-transform: scale(1.5);
    transform: scale(1.5);
  }
}
@-moz-keyframes identifier {
  from {
    -webkit-transform: scale(1);
    -moz-transform: scale(1);
    -ms-transform: scale(1);
    -o-transform: scale(1);
    transform: scale(1);
  }
  to {
    -webkit-transform: scale(1.5);
    -moz-transform: scale(1.5);
    -ms-transform: scale(1.5);
    -o-transform: scale(1.5);
    transform: scale(1.5);
  }
}
@keyframes identifier {
  from {
    -webkit-transform: scale(1);
    -moz-transform: scale(1);
    -ms-transform: scale(1);
    -o-transform: scale(1);
    transform: scale(1);
  }
  to {
    -webkit-transform: scale(1.5);
    -moz-transform: scale(1.5);
    -ms-transform: scale(1.5);
    -o-transform: scale(1.5);
    transform: scale(1.5);
  }
}
.cont_form_login {
  position: absolute;
  opacity: 0;
  display: none;
  width: 320px;
  -webkit-transition: all 0.5s;
  -moz-transition: all 0.5s;
  -ms-transition: all 0.5s;
  -o-transition: all 0.5s;
  transition: all 0.5s;
}

.cont_forms_active_login {
  z-index: 2;
}

.cont_form_sign_up {
  position: absolute;
  width: 320px;
  float: left;
  opacity: 0;
  display: none;
  -webkit-transition: all 0.5s;
  -moz-transition: all 0.5s;
  -ms-transition: all 0.5s;
  -o-transition: all 0.5s;
  transition: all 0.5s;
}

.cont_form_sign_up > input {
  text-align: left;
  padding: 15px 5px;
  margin-left: 10px;
  margin-top: 20px;
  width: 260px;
  border: none;
  color: #757575;
}

.cont_form_sign_up > h2 {
  margin-top: 50px;
  font-weight: 400;
  color: #757575;
}

.cont_form_login > input {
  padding: 15px 5px;
  margin-left: 10px;
  margin-top: 20px;
  width: 260px;
  border: none;
  text-align: left;
  color: #757575;
}

.cont_form_login > h2 {
  margin-top: 110px;
  font-weight: 400;
  color: #757575;
}
.cont_form_login > a,
.cont_form_sign_up > a {
  color: #757575;
  position: relative;
  float: left;
  margin: 10px;
  margin-left: 30px;
}
.el-form-item {
  width: 260px;
  margin-top: 10px;
  margin-bottom: 20px;
  // padding: 15px 5px;
  // margin-left: 10px;
  // margin-top: 20px;
  // width: 260px;
  // border: none;
  // text-align: left;
  // color: #757575;
}
.material-icons {
  font-size: 20px;
  font-weight: bolder;
}
.project-title {
  color: #fff;
}
</style>