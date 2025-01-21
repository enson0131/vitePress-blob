<script>
import { ref } from 'vue'

export default {
  setup() {
    const url = document.URL;
    const urlStr = url?.split('?')?.pop();
    const urlSearchParams = new URLSearchParams(urlStr);
    const res = Object.fromEntries(urlSearchParams.entries());
    const data = fetch(`https://api.github.com/repos/enson0131/learn/contents/${res.url}`, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        // 文件内容是 Base64 编码的，需要解码
        const base64String = data.content;
        // 将 Base64 解码为二进制数据
        const binaryString = Uint8Array.from(atob(base64String), char => char.charCodeAt(0));
        // 使用 TextDecoder 解码
        const decodedString = new TextDecoder('utf-8').decode(binaryString);
        console.log(decodedString);
        document.write(decodedString);
        return decodedString;
    })
   .catch(err => console.error(err));
    const dataRef = ref(data);

    return {
        dataRef,
    }
  },
}
</script>


