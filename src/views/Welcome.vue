<template>
	<el-container class="container">
		<el-header>
			<div class="logo">
				<img src="../assets/logo.png" alt="" />
				<span>后台管理系统</span>
			</div>
			<div class="header-right">
				<el-button @click="toggleClick" size="mini"><i :class="isCollapse ? 'el-icon-s-fold' : 'el-icon-s-unfold'"></i></el-button>
				<div class="logout" @click="logout">退出</div>
			</div>
		</el-header>
		<el-container>
			<el-aside :width="isCollapse ? '64px' : '200px'">
				<el-menu
					:default-active="activePath"
					unique-opened
					class="el-menu-vertical-demo"
					background-color="#333744"
					text-color="#fff"
					active-text-color="#42a5f5"
					@open="handleOpen"
					@close="handleClose"
					router
					:collapse="isCollapse"
					:collapse-transition="false"
				>
					<el-submenu :index="item.id+''" v-for="item in menulist" :key="item.id">
						<template slot="title">
							<i :class="iconList[item.id]"></i>
							<span>{{item.authName}}</span>
						</template>
						<el-menu-item :index="subitem.path" v-for="subitem in item.children" :key="subitem.id" @click="savePath(subitem.path)">
							<i class="el-icon-s-operation"></i>
							{{subitem.authName}}
						</el-menu-item>
					</el-submenu>
				</el-menu>
			</el-aside>
			<el-main>
				<router-view />
			</el-main>
		</el-container>
	</el-container>
</template>

<script>
export default {
	name:'Welcome',
	data() {
		return {
			menulist:[],
			iconList:{
				'125':'el-icon-user-solid',
				'103':'el-icon-setting',
				'101':'el-icon-goods',
				'102':'el-icon-s-order',
				'145':'el-icon-s-marketing'
			},
			isCollapse: false,
			activePath:''  //当前的路径  选中状态
		};
	},
	created() {
		//console.log(this.$route.path);
		this.activePath = sessionStorage.getItem('activePath');  //临时存储
		this.getMenulist();
	},
	methods: {
		handleOpen(key, keyPath) {
			console.log(key, keyPath);
		},
		handleClose(key, keyPath) {
			console.log(key, keyPath);
		},
		toggleClick() {
			this.isCollapse = !this.isCollapse;
		},
		logout() {
			sessionStorage.clear();
			this.$router.push('/login');
		},
		async getMenulist(){	
			let res = await this.$axios.get('menus');
			if(res.meta.status !==200 ) return;
			//console.log(res.data);
			this.menulist = res.data;
		},
		//保存当前的路径，以便组件挂载created()后添加给导航添加当前状态
		savePath(path){
			sessionStorage.setItem('activePath',path); //临时存储
			this.activePath = path;
		}
	}
};
</script>

<style lang="scss" scoped>
.container {
	height: 100vh;
}
.el-header {
	background: #3f4558;
	display: flex;
	align-items: center;
	.logo {
		width: 180px;
		height: 60px;
		display: flex;
		align-items: center;
		img {
			height: 90%;
			display: block;
		}
		span {
			color: #fff;
			font-size: 16px;
		}
	}
	.header-right {
		display: flex;
		width: calc(100% - 180px);
		justify-content: space-between;
		align-items: center;
		.logout {
			color: #fff;
		}
	}
}
.el-aside {
	background-color: rgb(51, 55, 68);
}
.el-main {
	background-color: rgb(234, 237, 241);
}
</style>
