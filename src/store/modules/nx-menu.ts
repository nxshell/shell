import { defineStore } from "pinia";
import { ref } from "vue";


const useMenuStore = defineStore('menu', () => {
    const menus = ref([])
})

export default useMenuStore