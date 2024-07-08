<template>
  <button 
    class="custom-del-btn"
    type="button"
    :style="{
      '--btn-width': styleObj.btnWidth,
      '--btn-hover-width': styleObj.btnHoverWidth,
      '--btn-before-top': styleObj.btnBeforeTop,
      '--btn-hover-before-fs': styleObj.btnHoverBeforeFS
    }"
    @click="btnClick"
  >
    <svg viewBox="0 0 448 512" class="svgIcon">
      <path
        d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z">
      </path>
    </svg>
  </button>
</template>
<script setup>
import { ref } from 'vue';
const props = defineProps({
  size: {
    type: String
    // small-20 normal-30 big-50
    // default: 'small'
  },
  btnWidth: {
    type: Number,
    default: 20
  },
  btnHoverWidth: {
    type: Number,
    default: 56
  },
  btnBeforeTop: {
    type: Number,
    default: -32
  },
  btnHoverBeforeFS: {
    type: Number,
    default: 13
  }
})
console.log(props.size)
const styleObj = ref({
  btnWidth: props.btnWidth ? props.btnWidth : 20,
  btnHoverWidth: props.btnHoverWidth ? props.btnHoverWidth : 56,
  btnBeforeTop: props.btnBeforeTop ? props.btnBeforeTop : -32,
  btnHoverBeforeFS: props.btnHoverBeforeFS ? props.btnHoverBeforeFS : 10,
})
switch (props.size){
  case 'small':
    styleObj.value.btnWidth = 20;
    styleObj.value.btnHoverWidth = 56;
    styleObj.value.btnBeforeTop = -32;
    styleObj.value.btnHoverBeforeFS = 10;
    break;
  case 'normal':
    styleObj.value.btnWidth = 30;
    styleObj.value.btnHoverWidth = 84;
    styleObj.value.btnBeforeTop = -30;
    styleObj.value.btnHoverBeforeFS = 10;
    break;
  case 'big':
    styleObj.value.btnWidth = 50;
    styleObj.value.btnHoverWidth = 140;
    styleObj.value.btnBeforeTop = -20;
    styleObj.value.btnHoverBeforeFS = 13;
    break;
  default: 
    styleObj.value.btnWidth = props.btnWidth;
    styleObj.value.btnHoverWidth = props.btnHoverWidth;
    styleObj.value.btnBeforeTop = props.btnBeforeTop;
    styleObj.value.btnHoverBeforeFS = props.btnHoverBeforeFS;
}
for (let key in styleObj.value){
  styleObj.value[key] += 'px'
}

const emit = defineEmits(['click']);
function btnClick(){
  emit('click');
}

</script>
<style lang='scss' scoped>

.custom-del-btn {
  // small
  // width: 20px;
  // height: 20px;

  // normal
  // width: 30px;
  // height: 30px;

  // big
  // width: 50px;
  // height: 50px;
  width: var(--btn-width);
  height: var(--btn-width);
  border-radius: 50%;
  background-color: rgb(20, 20, 20);
  border: none;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.164);
  cursor: pointer;
  transition-duration: .3s;
  overflow: hidden;
  position: relative;
}

.svgIcon {
  width: 12px;
  transition-duration: .3s;
}

.svgIcon path {
  fill: white;
}

.custom-del-btn:hover {
  // small
  // width: 56px;

  // normal
  // width: 84px;

  // big
  // width: 140px;
  width: var(--btn-hover-width);
  border-radius: 50px;
  transition-duration: .3s;
  
  background-color: rgb(255, 69, 69);
  align-items: center;
}

.custom-del-btn:hover .svgIcon {
  // small
  // width: 20px;

  // normal
  // width: 30px;

  // big
  // width: 50px;
  width: var(--btn-width);
  transition-duration: .3s;
  transform: translateY(60%);
}

.custom-del-btn::before {
  position: absolute;
  // small
  // top: -32px;

  // nromal
  // top: -30px;

  // big
  // top: -20px;
  top: var(--btn-before-top);
  content: "删除";
  color: white;
  transition-duration: .3s;
  font-size: 2px;
}

.custom-del-btn:hover::before {
  // small normal
  // font-size: 13px;

  // big
  // font-size: 10px;
  font-size: var(--btn-hover-before-fs);
  opacity: 1;
  transform: translateY(30px);
  transition-duration: .3s;
}
</style>