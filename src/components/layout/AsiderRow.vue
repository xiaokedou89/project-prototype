<template>
  <nav class="nav">
    <input type="checkbox" @change="checkboxChange" class="nav__cb" id="menu-cb"/>
    <div class="nav__content">
      <ul class="nav__items">
        <li class="nav__item">
          <span class="nav__item-text">
            Home
          </span>
        </li>
        <li class="nav__item">
          <span span class="nav__item-text">
            Works
          </span>
        </li>
        <li class="nav__item">
          <span class="nav__item-text">
            About
          </span>
        </li>
        <li class="nav__item">
          <span class="nav__item-text">
            Contact
          </span>
        </li>
      </ul>
    </div>
    <label class="nav__btn" for="menu-cb"></label>
  </nav>
</template>
<script setup>
import { ref,  watchEffect } from 'vue';

const checkbox = ref(null);
function checkboxChange(e){

  if (e.target.checked) {
    console.log(e.target.checked)
    console.log(`checkbox is checked`)
  } else {
    console.log(checkbox.value.checked)
    console.log(`checkbox is not checked`)
  }
}


</script>
<style lang='scss' scoped>
*, *:before, *:after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body {
  height: 100%;
}

$lightBlue: darken(#EAFBFF, 50%);
$darkBlue: #208FF9;


// 组件设置变量
// 导航一级项目数量
$numOfItems: 4;
$navAT: 1s;
$textDelayStep: 0.1s;
/* -------------------------------- */

$font: Helvetica, Arial, sans-serif;

// 总体按钮大小
$btnSize: 90px;
// 收缩按钮伪类宽/高尺寸
$lineW: 28px;
// 收缩按钮伪类高/宽尺寸
$lineH: 4px;
// 两条线间的距离
$linesGap: 10px;
// 两条线总体的高度(宽)
$linesTotalH: $lineH*2 + $linesGap;
$btnHorPad: ($btnSize - $lineW) / 2;
$btnVertPad: ($btnSize - $linesTotalH) / 2;

// ul小的一边的外侧尺寸，用于设置ul一边的内边距
$itemsLeftPad: 20px;
// ul大的一边的外侧尺寸，用于设置ul一边的内边距
$itemsRightPad: $itemsLeftPad + $btnSize;
// 每一项的宽度
$itemWidth: 70px;
// ul的总宽度
$navItemsWidth: $itemsLeftPad + $itemsRightPad + $itemWidth * $numOfItems;

$textAT: $navAT - $textDelayStep * ($numOfItems - 1);
$textFadeAT: 0.2s;
$cub: cubic-bezier(.48,.43,.29,1.3);
$backCub: cubic-bezier(0.49,-0.3,.68,1.23);
$textCub: cubic-bezier(.48,.43,.7,2.5);

.nav {
  overflow: hidden;
  position: absolute;
  left: 50%;
  top: 50%;
  width: auto;
  height: $btnSize;
  margin-top: $btnSize/-2;
  background: #fff;
  border-radius: 5px;
  transform: translate3d(-50%,0,0);
  box-shadow: 0 10px 35px rgba(0,0,0,0.2);

  &__cb {
    z-index: -1000;
    position: absolute;
    left: 0;
    top: 0;
    opacity: 0;
    pointer-events: none;
  }
  // ul外层的div容器
  &__content {
    position: relative;
    width: $btnSize;
    height: 100%;
    transition: width $navAT $backCub;

    .nav__cb:checked ~ & {
      transition: width $navAT $cub;
      width: $navItemsWidth;
    }
  }
  // ul
  &__items {
    position: relative;
    width: $navItemsWidth;
    height: 100%;
    padding-left: $itemsLeftPad;
    padding-right: $itemsRightPad;
    list-style-type: none;
    font-size: 0;
  }

  &__item {
    display: inline-block;
    vertical-align: top;
    width: $itemWidth;
    text-align: center;
    color: #6C7784;
    font-size: 14px;
    line-height: $btnSize;
    font-family: $font;
    font-weight: bold;
    perspective: 1000px;
    transition: color 0.3s;
    cursor: pointer;

    &:hover {
      color: $lightBlue;
    }

    &-text {
      display: block;
      height: 100%;
      transform: rotateY(-70deg);
      opacity: 0;
      transition: transform $textAT $textCub, opacity $textAT;

      .nav__cb:checked ~ .nav__content & {
        transform: rotateY(0);
        opacity: 1;
        transition: transform $textAT $textCub, opacity $textFadeAT;
      }

      @for $i from 1 through $numOfItems {
        .nav__item:nth-child(#{$i}) & {
          transition-delay: ($numOfItems - $i) * $textDelayStep;
        }

        .nav__cb:checked ~ .nav__content .nav__item:nth-child(#{$i}) & {
          transition-delay: ($i - 1) * $textDelayStep;
        }
      }
    }
  }

  &__btn {
    position: absolute;
    right: 0;
    top: 0;
    width: $btnSize;
    height: $btnSize;
    padding: $btnVertPad $btnHorPad;
    cursor: pointer;

    &:before,
    &:after {
      content: "";
      display: block;
      width: $lineW;
      height: $lineH;
      border-radius: 2px;
      background: #096DD3;
      transform-origin: 50% 50%;
      transition: transform $navAT $cub, background-color 0.3s;
    }

    &:before {
      margin-bottom: $linesGap;
    }

    &:hover {
      &:before,
      &:after {
        background: $lightBlue;
      }
    }

    .nav__cb:checked ~ & {

      &:before {
        transform: translateY($linesGap/2 + $lineH/2) rotate(-225deg);
      }

      &:after {
        transform: translateY($linesGap/-2 + $lineH/-2) rotate(225deg);
      }
    }
  }
}
</style>