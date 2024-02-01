<script setup>
import { ref } from 'vue'
defineProps({
  url: String
})
// iframe.setAttribute('src', getUrlParams('url'))
// function getUrlParams (key) {
//     const url = document.URL;
//     const urlStr = url?.split('?')?.pop();
//     const urlSearchParams = new URLSearchParams(urlStr);
//     const res = Object.fromEntries(urlSearchParams.entries());
//     return key && res[key] || res;
// }
// const load = () => {
//   console.log(`load...`)
//   const iframe = document.getElementById("iframe-container");
//   console.log(`iframe`, iframe.contentWindow);
//   const headers = iframe.contentWindow.document.getElementById('headerbar-mindmap-icon')
//   console.log(`header`, headers);
//   Array.from(headers).forEach(header => {
//     header.style.display = 'none';
//   })
// }
</script>

<template>
  <!-- <p class="greeting">{{ greeting }}</p> -->
  <iframe :src="url" id="iframe-container" frameborder="0" allowfullscreen="true" @load="load"></iframe>
</template>

<style>
#iframe-container {
  width: 100%;
  height: 1000px;
}

.sc-gtssRu {
  display: none;
}
</style>

