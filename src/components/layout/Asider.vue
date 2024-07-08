<template>
  <div class="aside">
    <div class="aside__inner"></div>
  </div>
</template>
<script setup>
</script>
<style lang='scss' scoped>
@import '@/assets/styles/mixin.scss';
.aside {
  width: 80px;
  height: 80px;
  background-color: pink;
  @include flex-all-center;
  &__inner {
    width: 40px;
    height: 40px;
    background-color: red;
  }
}
</style>