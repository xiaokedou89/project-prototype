<template>
  <div class="toggle checkbox-wrapper-8" :style="{
    '--btn-width': styleObj.width,
    '--btn-height': styleObj.height,
    '--btn-font': styleObj.fontSize,
    '--on-color': styleObj.activeColor,
    '--off-color': styleObj.inactiveColor
  }">
    <input ref="checkbox" class="tgl tgl-skewed" id="cb3-8" type="checkbox" @change="checkboxChange"/>
    <label class="tgl-btn" :data-tg-off="props.inactiveText" :data-tg-on="props.activeText" for="cb3-8"></label>
  </div>
</template>
<script setup>
import { ref, onMounted, watchEffect } from 'vue';
const props = defineProps({
  size: {
    type: String,
    default: 'nothing'
  },
  activeText: {
    type: String,
    default: 'ON'
  },
  inactiveText: {
    type: String,
    default: 'OFF'
  },
  activeColor: {
    type: String,
    default: '#86d993'
  },
  inactiveColor: {
    type: String,
    default: '#888'
  },
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
  disabled: {
    type: Boolean,
    default: false
  },
  trueValue: {
    default: true
  },
  falseValue: {
    default: false
  }
});
const styleObj = ref({
  width: '50px',
  height: '25px',
  fontSize: '12px',
  activeColor: '#86d993',
  inactiveColor: '#888'
});
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

const checkbox = ref(null);

const variable = defineModel();

const emit = defineEmits(['change']);

function checkboxChange(e){
  if (e.target.checked){
    variable.value = props.trueValue;
    emit('change', props.trueValue);
  } else {
    variable.value = props.falseValue;
    emit('change', props.falseValue);
  }
}

onMounted(() => {
  if (variable.value === props.trueValue && checkbox.value){
    checkbox.value.checked = true;
  }
});

</script>
<style lang='scss' scoped>
.checkbox-wrapper-8 .tgl {
  display: none;
}

.checkbox-wrapper-8 .tgl,
.checkbox-wrapper-8 .tgl:after,
.checkbox-wrapper-8 .tgl:before,
.checkbox-wrapper-8 .tgl *,
.checkbox-wrapper-8 .tgl *:after,
.checkbox-wrapper-8 .tgl *:before,
.checkbox-wrapper-8 .tgl+.tgl-btn {
  box-sizing: border-box;
}

.checkbox-wrapper-8 .tgl::-moz-selection,
.checkbox-wrapper-8 .tgl:after::-moz-selection,
.checkbox-wrapper-8 .tgl:before::-moz-selection,
.checkbox-wrapper-8 .tgl *::-moz-selection,
.checkbox-wrapper-8 .tgl *:after::-moz-selection,
.checkbox-wrapper-8 .tgl *:before::-moz-selection,
.checkbox-wrapper-8 .tgl+.tgl-btn::-moz-selection,
.checkbox-wrapper-8 .tgl::selection,
.checkbox-wrapper-8 .tgl:after::selection,
.checkbox-wrapper-8 .tgl:before::selection,
.checkbox-wrapper-8 .tgl *::selection,
.checkbox-wrapper-8 .tgl *:after::selection,
.checkbox-wrapper-8 .tgl *:before::selection,
.checkbox-wrapper-8 .tgl+.tgl-btn::selection {
  background: none;
}

.checkbox-wrapper-8 .tgl+.tgl-btn {
  outline: 0;
  display: inline-block;
  // width: 100px;
  // height: 44px;
  width: var(--btn-width);
  height: var(--btn-height);
  position: relative;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

.checkbox-wrapper-8 .tgl+.tgl-btn:after,
.checkbox-wrapper-8 .tgl+.tgl-btn:before {
  position: relative;
  display: block;
  content: "";
  width: 50%;
  height: 100%;
  // font-size: 20px;
  font-size: var(--btn-font);
}

.checkbox-wrapper-8 .tgl+.tgl-btn:after {
  left: 0;
}

.checkbox-wrapper-8 .tgl+.tgl-btn:before {
  display: none;
}

.checkbox-wrapper-8 .tgl:checked+.tgl-btn:after {
  left: 50%;
}

.checkbox-wrapper-8 .tgl-skewed+.tgl-btn {
  overflow: hidden;
  transform: skew(-10deg);
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  transition: all 0.2s ease;
  font-family: sans-serif;
  background: var(--off-color);
}

.checkbox-wrapper-8 .tgl-skewed+.tgl-btn:after,
.checkbox-wrapper-8 .tgl-skewed+.tgl-btn:before {
  transform: skew(10deg);
  display: inline-block;
  transition: all 0.2s ease;
  width: 100%;
  text-align: center;
  position: absolute;
  // line-height: 48px;
  line-height: var(--btn-height);
  font-weight: bold;
  color: #fff;
  text-shadow: 0 1px 0 rgba(0, 0, 0, 0.4);
}

.checkbox-wrapper-8 .tgl-skewed+.tgl-btn:after {
  left: 100%;
  content: attr(data-tg-on);
}

.checkbox-wrapper-8 .tgl-skewed+.tgl-btn:before {
  left: 0;
  content: attr(data-tg-off);
}

.checkbox-wrapper-8 .tgl-skewed+.tgl-btn:active {
  // background: #888;
  background: var(--off-color);
}

.checkbox-wrapper-8 .tgl-skewed+.tgl-btn:active:before {
  left: -10%;
}

.checkbox-wrapper-8 .tgl-skewed:checked+.tgl-btn {
  background: var(--on-color);
}

.checkbox-wrapper-8 .tgl-skewed:checked+.tgl-btn:before {
  left: -100%;
}

.checkbox-wrapper-8 .tgl-skewed:checked+.tgl-btn:after {
  left: 0;
}

.checkbox-wrapper-8 .tgl-skewed:checked+.tgl-btn:active:after {
  left: 10%;
}
</style>