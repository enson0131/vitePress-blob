<script>
import { ref } from 'vue'

export default {
  setup() {
    const url = document.URL;
    const urlStr = url?.split('?')?.pop();
    const urlSearchParams = new URLSearchParams(urlStr);
    const res = Object.fromEntries(urlSearchParams.entries());
    const data = fetch(`https://api.github.com/repos/enson0131/learn/contents/${res.url}`)
    .then(response => response.json())
    .then(data => {
        // 文件内容是 Base64 编码的，需要解码
        const content = atob(data.content);
        console.log(content);
        document.write(content);
        return content;
    })
   .catch(err => console.error(err));
    const dataRef = ref(data);

    return {
        dataRef,
    }
  },
}
</script>


