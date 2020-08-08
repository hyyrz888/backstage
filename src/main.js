import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './plugin/element.js'

import axios from 'axios'
import ZkTable from 'mds-table-with-tree-grid'

//配置请求根路径
axios.defaults.baseURL = "http://118.24.219.139:8888/api/private/v1"
axios.interceptors.request.use(config => {
	config.headers.Authorization = sessionStorage.getItem('token');
	//console.log(sessionStorage.getItem('token'))
	return config;
})

//响应reponse拦截器
axios.interceptors.response.use(res => {
	return res.data; //获取响应的数据
}, err => {
	console.log(err)
})

Vue.prototype.$axios = axios
Vue.config.productionTip = false

Vue.component(ZkTable.name,ZkTable)
new Vue({
	router,
	store,
	render: h => h(App)
}).$mount('#app')
