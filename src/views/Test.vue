<template>
  <div class="test-nav"></div>
  <div class="container">
    <!-- <AsiderRow /> -->
    <Asider />
    <div class="content">1111</div>
  </div>  
  
</template>
<script setup>
import {ref, watch } from 'vue';
// import AsiderRow from '@/components/layout/AsiderRow.vue';
import Asider from '@/components/layout/Asider.vue';




</script>
<style lang='scss' scoped>
.test-nav {
  width: 100%;
  height: 80px;
  background-color: #573B8A;
  border-bottom: 1px solid #5d5c60;
}
.container {
  // height: calc(100% - 80px);
  min-height: calc(100% - 80px);
  padding: 20px;
  border: 1px solid red;
  overflow-y: auto;
  display: flex;
  align-items:flex-start
}
.content {
  width: var(--content-width);
  height: 1200px;
  background-color: pink;
  transition: width 1s cubic-bezier(0.49,-0.3,.68,1.23)
}
</style>