<template>
  <div class="login-container">
    <h1 class="project-title">{{ projectTitle }}</h1>
    <div class="cont">
      <div class="form sign-in">
        <h2>欢迎回来</h2>
        <el-form class="ls-form" :model="loginForm" label-position="top">
          <el-form-item prop="email" label="邮箱">
            <el-input type="email" v-model="loginForm.email" />
          </el-form-item>
          <el-form-item prop="password" label="密码">
            <el-input type="password" show-password v-model="loginForm.password" />
          </el-form-item>
        </el-form>
        <!-- <label>
          <span>邮箱</span>
          <input type="email" />
        </label> -->
        <!-- <label>
          <span>密码</span>
          <input type="password" />
        </label> -->
        <p class="forgot-pass">忘记密码?</p>
        <button type="button" class="submit">登录</button>
        <!-- <button type="button" class="fb-btn">Connect with <span>facebook</span></button> -->
      </div>
      <div class="sub-cont">
        <div class="img">
          <div class="img__text m--up">
            <h2>还没有账号?</h2>
            <p>注册账号并试试我们的平台吧!</p>
          </div>
          <div class="img__text m--in">
            <h2>老朋友?</h2>
            <p>已有账号赶紧去登录吧!</p>
          </div>
          <div class="img__btn" @click="imgClick">
            <span class="m--up">前往注册</span>
            <span class="m--in">前往登录</span>
          </div>
        </div>
        <div class="form sign-up">
          <h2>欢迎你，新朋友</h2>
          <el-form class="ls-form" :model="signupForm" label-position="top">
            <el-form-item prop="username" label="用户名">
              <el-input type="text" v-model="signupForm.username" />
            </el-form-item>
            <el-form-item prop="email" label="邮箱">
              <el-input type="email" v-model="signupForm.email" />
            </el-form-item>
            <el-form-item prop="password" label="密码">
              <el-input type="password" show-password v-model="signupForm.password" />
            </el-form-item>
            <el-form-item prop="repeatPassword" label="确认密码">
              <el-input type="repeatPassword" show-password v-model="signupForm.password" />
            </el-form-item>
          </el-form>
          <!-- <label>
            <span>用户名</span>
            <input type="text" />
          </label> -->
          <!-- <label>
            <span>邮箱</span>
            <input type="email" />
          </label>
          <label>
            <span>密码</span>
            <input type="password" />
          </label> -->
          <button type="button" class="submit">注册</button>
          <!-- <button type="button" class="fb-btn">Join with <span>facebook</span></button> -->
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
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
})

function imgClick(){
  const cont = document.querySelector('.cont');
  if (cont){
    cont.classList.toggle('s--signup');
  }
}


</script>
<style lang='scss' scoped>
@import '@/assets/styles/mixin.scss';
*, *:before, *:after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.login-container {
  font-family: 'Open Sans', Helvetica, Arial, sans-serif;
  background: #ededed;
  flex-direction: column;
  @include flex-all-center; 
  @include wh-100;
}

input, button {
  border: none;
  outline: none;
  background: none;
  font-family: 'Open Sans', Helvetica, Arial, sans-serif;
}

$contW: 900px;
$imgW: 260px;
$formW: $contW - $imgW;
$switchAT: 1.2s;

$inputW: 260px;
$btnH: 36px;

$diffRatio: ($contW - $imgW) / $contW;

@mixin signUpActive {
  .cont.s--signup & {
    @content;
  }
}

.tip {
  font-size: 20px;
  margin: 40px auto 50px;
  text-align: center;
}

.cont {
  overflow: hidden;
  position: relative;
  width: $contW;
  height: 550px;
  margin: 0 auto 100px;
  background: #fff;
  margin-top: 100px;
}

.form {
  position: relative;
  width: $formW;
  height: 100%;
  transition: transform $switchAT ease-in-out;
  padding: 50px 30px 0;
}

.sub-cont {
  overflow: hidden;
  position: absolute;
  left: $formW;
  top: 0;
  width: $contW;
  height: 100%;
  padding-left: $imgW;
  background: #fff;
  transition: transform $switchAT ease-in-out;

  @include signUpActive {
    transform: translate3d($formW * -1,0,0);
  }
}

button {
  display: block;
  margin: 0 auto;
  width: $inputW;
  height: $btnH;
  border-radius: 30px;
  color: #fff;
  font-size: 15px;
  cursor: pointer;
}

.img {
  overflow: hidden;
  z-index: 2;
  position: absolute;
  left: 0;
  top: 0;
  width: $imgW;
  height: 100%;
  padding-top: 360px;

  &:before {
    content: '';
    position: absolute;
    right: 0;
    top: 0;
    width: $contW;
    height: 100%;
    background-image: url('@/assets/images/login4-bg.jpg');
    background-size: cover;
    transition: transform $switchAT ease-in-out;
  }

  &:after {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.6);
  }

  @include signUpActive {
    &:before {
      transform: translate3d($formW,0,0);
    }
  }

  &__text {
    z-index: 2;
    position: absolute;
    left: 0;
    top: 50px;
    width: 100%;
    padding: 0 20px;
    text-align: center;
    color: #fff;
    transition: transform $switchAT ease-in-out;

    h2 {
      margin-bottom: 10px;
      font-weight: normal;
    }

    p {
      font-size: 14px;
      line-height: 1.5;
    }

    &.m--up {

      @include signUpActive {
        transform: translateX($imgW*2);
      }
    }

    &.m--in {
      transform: translateX($imgW * -2);

      @include signUpActive {
        transform: translateX(0);
      }
    }
  }

  &__btn {
    overflow: hidden;
    z-index: 2;
    position: relative;
    width: 100px;
    height: $btnH;
    margin: 0 auto;
    background: transparent;
    color: #fff;
    text-transform: uppercase;
    font-size: 15px;
    cursor: pointer;
    
    &:after {
      content: '';
      z-index: 2;
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      border: 2px solid #fff;
      border-radius: 30px;
    }

    span {
      position: absolute;
      left: 0;
      top: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      height: 100%;
      transition: transform $switchAT;
      
      &.m--in {
        transform: translateY($btnH*-2);
        
        @include signUpActive {
          transform: translateY(0);
        }
      }
      
      &.m--up {
        @include signUpActive {
          transform: translateY($btnH*2);
        }
      }
    }
  }
}

h2 {
  width: 100%;
  font-size: 26px;
  text-align: center;
}

label {
  display: block;
  width: $inputW;
  margin: 25px auto 0;
  text-align: center;

  span {
    font-size: 12px;
    color: #cfcfcf;
    text-transform: uppercase;
  }
}

input {
  display: block;
  width: 100%;
  margin-top: 5px;
  padding-bottom: 5px;
  font-size: 16px;
  border-bottom: 1px solid rgba(0,0,0,0.4);
  text-align: center;
}

.forgot-pass {
  margin-top: 15px;
  text-align: center;
  font-size: 12px;
  color: #cfcfcf;
}

.submit {
  margin-top: 40px;
  margin-bottom: 20px;
  background: #d4af7a;
  text-transform: uppercase;
}

.fb-btn {
  border: 2px solid #d3dae9;
  color: darken(#d3dae9, 20%);

  span {
    font-weight: bold;
    color: darken(#768cb6, 20%);
  }
}

.sign-in {
  transition-timing-function: ease-out;

  @include signUpActive {
    transition-timing-function: ease-in-out;
    transition-duration: $switchAT;
    transform: translate3d($formW,0,0);
  }
}

.sign-up {
  transform: translate3d($contW * -1,0,0);

  @include signUpActive {
    transform: translate3d(0,0,0);
  }
}

.icon-link {
  position: absolute;
  left: 5px;
  bottom: 5px;
  width: 32px;

  img {
    width: 100%;
    vertical-align: top;
  }

  &--twitter {
    left: auto;
    right: 5px;
  }
}

.link-footer {
  position: absolute;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);
}
.el-form {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.el-form-item {
  width: 260px;
  margin-top: 10px;
  margin-bottom: 10px;
  &::v-deep .el-form-item__label {
    text-align: center!important;
    padding-right: 0;
    color: rgb(207, 207, 207);
  }
}
.ls-form .el-input::v-deep .el-input__wrapper {
  box-shadow: none;
  border-bottom: 1px solid #999;
  border-radius: 0;
  & > .el-input__inner {
    text-align: center;
    font-size: 16px;
    color: #000;
  }
}
.ls-form .el-input::v-deep .el-input__wrapper.is-focus {
  box-shadow: none;
}
.ls-form .is-error .el-input::v-deep .el-input__wrapper.is-focus {
  border-color: red;
}
</style>