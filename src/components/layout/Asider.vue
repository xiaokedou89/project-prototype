<template>
  <div class="aside"
    :style="{
      '--item-count': count,
      '--items-height': `${130 + 90 * count}px`,
      '--item-text-at': `${1 - 0.1 * (count -1)}s`
    }"
  >
    <input @change="checkboxChange" ref="checkbox" type="checkbox" class="aside__cb" id="aside__cb">
    <div class="aside__content">
      <ul class="aside__items">
        <li class="aside__item" v-for="i in count" :key="i">
          <span class="aside__item-text">
            HomeT
          </span>
        </li>
      </ul>
    </div>
    <label class="aside__btn" for="aside__cb"></label>
  </div>
</template>
<script setup>
import { ref } from 'vue';

const count = ref([
  { path: '', name: '', meta: { show: true, icon: '', title: '' } }
]);
const checkbox = ref(null);

// 侧边栏展开收起 - 借由checkbox的选中checked实现
function checkboxChange(e){
  const litems = document.querySelectorAll('.aside__item');
  const texts = document.querySelectorAll('.aside__item-text');
  for (let i = 0; i < litems.length; i++){
    litems[i].style.transitionDelay = `${(litems.length - (i + 1)) * 0.1}s`;
    if (e.target.checked){
      texts[i].style.transitionDelay = `${i * 0.1}s`;
      document.documentElement.style.setProperty('--content-width', 'calc(100% - 110px)')
      
    } else {
      document.documentElement.style.setProperty('--content-width', '100px')
    }
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

$cub: cubic-bezier(.48,.43,.29,1.3);
$backCub: cubic-bezier(0.49,-0.3,.68,1.23);
$textCub: cubic-bezier(.48,.43,.7,2.5);

// 外层总容器
.aside {
  position: relative;
  overflow: hidden;
  width: 90px;
  height: auto;
  background: linear-gradient(to bottom, #0F0C29, #302B63, #24243E);
  border-radius: 5px;
  box-shadow: 0 10px 35px rgba(0,0,0,0.2);
  // checkbox复选框控件
  &__cb {
    z-index: -1000;
    position: absolute;
    left: 0;
    top: 0;
    opacity: 0;
    pointer-events: none;
  }
  // ul外层的容器
  &__content {
    position: relative;
    width: 90px;
    height: 90px;
    transition: height 1s cubic-bezier(0.49,-0.3,.68,1.23);
    .aside__cb:checked ~ & {
      transition: height 1s $cub;
      height: var(--items-height);
    }
  }
  &__items {
    position: relative;
    width: 90px;
    height: 90px;
    padding-bottom: 20px;
    padding-top: 110px;
    list-style-type: none;
    font-size: 0;
  }
  &__item {
    display: inline-block;
    vertical-align: top;
    width: 90px;
    text-align: center;
    color: #fff;
    font-size: 14px;
    line-height: 90px;
    font-weight: bold;
    perspective: 1000px;
    transition: color 0.3s!important;
    cursor: pointer;
    &:hover {
      color: darken(#EAFBFF, 50%);
    }
    &-text {
      display: block;
      height: 90px;
      transform: rotateY(-70deg);
      opacity: 0;
      transition: transform var(--item-text-at) $textCub, opacity var(--item-text-at);
      .aside__cb:checked ~ .aside__content & {
        transform: rotateY(0);
        opacity: 1;
        transition: transform var(--item-text-at) $textCub, opacity var(--item-text-at);
      }
    }
  }
  &__btn {
    position: absolute;
    right: 0;
    top: 0;
    width: 90px;
    height: 90px;
    padding: 36px 31px;
    cursor: pointer;

    &:before,
    &:after {
      content: "";
      display: block;
      width: 28px;
      height: 4px;
      border-radius: 2px;
      background: #096DD3;
      transform-origin: 50% 50%;
      transition: transform 1s cubic-bezier(.48,.43,.29,1.3), background-color 0.3s;
    }

    &:before {
      margin-bottom: 10px;
    }

    &:hover {
      &:before,
      &:after {
        background: darken(#EAFBFF, 50%);
      }
    }

    .aside__cb:checked ~ & {

      &:before {
        transform: translateY(7px) rotate(-225deg);
      }

      &:after {
        transform: translateY(-7px) rotate(225deg);
      }
    }
  }
}

</style>