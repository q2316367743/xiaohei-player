import {createApp} from 'vue'
import App from '@/App.vue'
import "@/assets/style/global.less"

import 'virtual:uno.css'
import {createPinia} from "pinia";
import {router} from "@/router";
import {initPath} from "@/global/Constants.ts";
import {useSql} from "@/lib/sql.ts";


initPath().finally(() => {
  useSql().migrate().finally(() => {
    document.getElementById("init")?.remove();
    createApp(App)
      .use(createPinia())
      .use(router)
      .mount('#app')
  })
});