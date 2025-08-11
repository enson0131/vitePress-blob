<script setup>
import { ref } from 'vue'
defineProps({
  url: String
})
</script>

<template>
  <iframe :src="url.endsWith('#m') ? url : `${url}#m`" id="iframe-container" frameborder="0" allowfullscreen="true" @load="load"></iframe>
</template>

<style>
#iframe-container {
  width: 100%;
  height: 1000px;
}

::-webkit-scrollbar {
        display: none;
}

.sc-gtssRu {
  display: none;
}
</style>

