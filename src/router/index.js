import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../views/Login.vue'
import Welcome from '../views/Welcome.vue'
import Home from '../views/Home.vue'
import Users from '../components/users/list.vue'
import Roles from '../components/authority/roles.vue'
import Rights from '../components/authority/rights.vue'

import Goods from '../components/goods/list.vue'
import Params from '../components/goods/params.vue'
import Categories from '../components/goods/categories.vue'

import Orders from '../components/orders/index.vue'
import Reports from '../components/reports/index.vue'
Vue.use(VueRouter)

const originalPush = VueRouter.prototype.push
VueRouter.prototype.push = function push(location) {
	return originalPush.call(this, location).catch(err => err)
}

const routes = [{
		path: '/',
		redirect: '/login'
	},
	{
		path: '/login',
		name: 'login',
		component: Login
	},
	{
		path: '/welcome',
		component: Welcome,
		redirect:'/home',
		children: [{
				path: "/",
				name: 'Home',
				component: Home
			},
			{
				path: "/users",
				name: 'Users',
				component: Users
			},
			{
				path: "/roles",
				name: 'Roles',
				component: Roles
			},
			{
				path: "/rights",
				name: 'Rights',
				component: Rights
			},
			{
				path: "/goods",
				name: 'Goods',
				component: Goods
			},
			{
				path: "/params",
				name: 'Params',
				component: Params
			},
			{
				path: "/categories",
				name: 'Categories',
				component: Categories
			},
			{
				path: "/orders",
				name: 'Orders',
				component: Orders
			},
			{
				path: "/reports",
				name: 'Reports',
				component: Reports
			}
		]
	},

]

const router = new VueRouter({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes
})

//挂载路由导航守卫
//提示错误Maximum call stack size exceeded
router.beforeEach((to, from, next) => {
	//to将要访问的路径
	//from 代表从哪个路径跳转而来
	//next是一个函数 表示继续执行
	if (to.path === '/login') return next();
	const tokenStr = window.sessionStorage.getItem('token');
	if (!tokenStr) return next('/login');
	next();
})

export default router
