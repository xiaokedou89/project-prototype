<template>
  <div class="toggle checkbox-wrapper-10" :style="{
    '--btn-width': styleObj.width,
    '--btn-height': styleObj.height,
    '--btn-font': styleObj.fontSize,
    '--on-color': styleObj.activeColor,
    '--off-color': styleObj.inactiveColor
  }">
    <input class="tgl tgl-flip" 
      ref="checkbox"
      id="cb5" 
      type="checkbox" 
      :disabled="props.disabled"
      @change="change"
    />
    <label class="tgl-btn" :data-tg-off="props.inactiveText" :data-tg-on="props.activeText" for="cb5"></label>
  </div>
</template>
<script setup>
import { ref, watchEffect, onMounted } from 'vue';

const props = defineProps({
  // 指定开关尺寸，可以为small, normal, big
  size: {
    type: String,
    default: 'small'
  },
  // 选中状态的文字
  activeText: {
    type: String,
    default: 'Yes'
  },
  activeColor: {
    type: String,
    default: '#7FC6A6'
  },
  inactiveColor: {
    type: String,
    default: '#FF3A19'
  },
  // 未选中状态的文字
  inactiveText: {
    type: String,
    default: 'No'
  },
  // 在不指定尺寸时可以自定义传入宽度、高度、字体大小
  width: {
    type: String,
    default: '40px'
  },
  height: {
    type: String,
    default: '25px'
  },
  fontSize: {
    type: String,
    default: '12px'
  },
  // 是否禁用
  disabled: {
    type: Boolean,
    default: false
  },
  // 选中时传递的值
  trueValue: {
    default: true
  },
  // 未选中时传递的值
  falseValue: {
    default: false
  }
});
// 通过这个变量对象，将尺寸传递给scss
const styleObj = ref({
  width: '111px',
  height: '48px',
  fontSize: '22px',
  activeColor: null,
  inactiveColor: null
});
// 初始化要传递的尺寸
watchEffect(() => {
  styleObj.value.activeColor = props.activeColor;
  styleObj.value.inactiveColor = props.inactiveColor;
  switch (props.size){
    case 'small':
      styleObj.value.width = '40px';
      styleObj.value.height = '25px';
      styleObj.value.fontSize = '12px';
      break;
    case 'normal':
      styleObj.value.width = '60px';
      styleObj.value.height = '30px';
      styleObj.value.fontSize = '14px';
      break;
    case 'big':
      styleObj.value.width = '100px';
      styleObj.value.height = '48px';
      styleObj.value.fontSize = '22px';
      break;
    default:
      styleObj.value.width = props.width;
      styleObj.value.height = props.height;
      styleObj.value.fontSize = props.fontSize;
  }
});

// 复选框input DOM
const checkbox = ref(null);
// 定义发送的事件
const emit = defineEmits(['change']);
// 外部v-model传递的变量
const variable = defineModel();
function change(e){
  if (e.target.checked){
    // 选中状态修改变量值，将事件发送出去-做一个伪change事件
    // console.log('ischecked: true')
    // console.log(e.target.checked)
    variable.value = props.trueValue;
    emit('change', props.trueValue);
  } else {
    // 未选中状态修改变量值，将事件发送出去-做一个伪change事件
    // console.log('ischecked: false')
    // console.log(e.target.checked)
    variable.value = props.falseValue;
    emit('change', props.falseValue);
  }  
}

onMounted(() => {
  // 初次渲染组件时，设定input - checkbox的选中状态
  if (variable.value === props.trueValue && checkbox.value) {
    checkbox.value.checked = true;
  }
})


</script>
<style lang='scss' scoped>
* {
	box-sizing: border-box;
	&::before, &::after {
		content: '';
		position: absolute;
	}
}
input {
  height: 40px;
  left: 0;
  opacity: 0;
  position: absolute;
  top: 0;
  width: 40px;
}
.checkbox-wrapper-10 .tgl {
    display: none;
  }
  .checkbox-wrapper-10 .tgl,
  .checkbox-wrapper-10 .tgl:after,
  .checkbox-wrapper-10 .tgl:before,
  .checkbox-wrapper-10 .tgl *,
  .checkbox-wrapper-10 .tgl *:after,
  .checkbox-wrapper-10 .tgl *:before,
  .checkbox-wrapper-10 .tgl + .tgl-btn {
    box-sizing: border-box;
  }
  .checkbox-wrapper-10 .tgl::-moz-selection,
  .checkbox-wrapper-10 .tgl:after::-moz-selection,
  .checkbox-wrapper-10 .tgl:before::-moz-selection,
  .checkbox-wrapper-10 .tgl *::-moz-selection,
  .checkbox-wrapper-10 .tgl *:after::-moz-selection,
  .checkbox-wrapper-10 .tgl *:before::-moz-selection,
  .checkbox-wrapper-10 .tgl + .tgl-btn::-moz-selection,
  .checkbox-wrapper-10 .tgl::selection,
  .checkbox-wrapper-10 .tgl:after::selection,
  .checkbox-wrapper-10 .tgl:before::selection,
  .checkbox-wrapper-10 .tgl *::selection,
  .checkbox-wrapper-10 .tgl *:after::selection,
  .checkbox-wrapper-10 .tgl *:before::selection,
  .checkbox-wrapper-10 .tgl + .tgl-btn::selection {
    background: none;
  }
  .checkbox-wrapper-10 .tgl + .tgl-btn {
    outline: 0;
    display: inline-block;
    // width: 111px;
    // height: 48px;
    width: var(--btn-width);
    height: var(--btn-height);
    position: relative;
    cursor: pointer;
    user-select: none;
  }
  .checkbox-wrapper-10 .tgl + .tgl-btn:after,
  .checkbox-wrapper-10 .tgl + .tgl-btn:before {
    position: relative;
    display: block;
    content: "";
    width: 50%;
    height: 100%;
  }
  .checkbox-wrapper-10 .tgl + .tgl-btn:after {
    left: 0;
  }
  .checkbox-wrapper-10 .tgl + .tgl-btn:before {
    display: none;
  }
  .checkbox-wrapper-10 .tgl:checked + .tgl-btn:after {
    left: 50%;
  }

  .checkbox-wrapper-10 .tgl-flip + .tgl-btn {
    padding: 2px;
    transition: all 0.2s ease;
    font-family: sans-serif;
    perspective: 100px;
    // font-size: 22px;
    font-size: var(--btn-font);
  }
  .checkbox-wrapper-10 .tgl-flip + .tgl-btn:after,
  .checkbox-wrapper-10 .tgl-flip + .tgl-btn:before {
    display: inline-block;
    transition: all 0.4s ease;
    width: 100%;
    text-align: center;
    position: absolute;
    // line-height: 2em;
    line-height: var(--btn-height);
    font-weight: bold;
    color: #fff;
    top: 0;
    left: 0;
    backface-visibility: hidden;
    border-radius: 4px;
  }
  .checkbox-wrapper-10 .tgl-flip + .tgl-btn:after {
    content: attr(data-tg-on);
    background: #02C66F;
    transform: rotateY(-180deg);
  }
  .checkbox-wrapper-10 .tgl-flip + .tgl-btn:before {
    // background: #FF3A19;
    background: var(--off-color);
    content: attr(data-tg-off);
  }
  .checkbox-wrapper-10 .tgl-flip + .tgl-btn:active:before {
    transform: rotateY(-20deg);
  }
  .checkbox-wrapper-10 .tgl-flip:checked + .tgl-btn:before {
    transform: rotateY(180deg);
  }
  .checkbox-wrapper-10 .tgl-flip:checked + .tgl-btn:after {
    transform: rotateY(0);
    left: 0;
    // background: #7FC6A6;
    background: var(--on-color);
  }
  .checkbox-wrapper-10 .tgl-flip:checked + .tgl-btn:active:after {
    transform: rotateY(20deg);
  }
.tgl-flip[disabled] + .tgl-btn {
  cursor: not-allowed;
}
</style>