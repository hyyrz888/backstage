<template>
	<div class="loginContainer">
		<div class="loginform">
			<div class="logo"><img alt="Vue logo" src="../assets/logo.png" /></div>
			<p>Vue后台管理系统</p>
			<el-form ref="loginForm" :model="loginForm" :rules="loginrules">
				<el-form-item prop="username"><el-input prefix-icon="el-icon-user" v-model="loginForm.username"></el-input></el-form-item>
				<el-form-item prop="password"><el-input prefix-icon="el-icon-lock" v-model="loginForm.password" type="password"></el-input></el-form-item>
				<el-row>
					<el-button type="primary" @click="formSubmit">登陆</el-button>
					<el-button type="info" @click="formReset">重置</el-button>
				</el-row>
			</el-form>
		</div>
	</div>
</template>

<script>
export default {
	name: 'Login',
	data() {
		return {
			loginForm: {
				username: 'admin',
				password: '123456'
			},
			loginrules: {
				username: [{ required: true, message: '用户名不为空', trigger: 'blur' }, { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' }],
				password: [{ required: true, message: '密码不为空', trigger: 'blur' }]
			}
		};
	},
	created() {
		this.welcome();
	},
	methods: {
		formSubmit() {
			let that = this;
			this.$refs['loginForm'].validate(async valid => {
				if (!valid) return;
				//数据验证
				let res = await this.$axios({
					//等待先执行返回结果后再处理
					method: 'post',
					url: 'login',
					data: this.loginForm //当前数据
				});
				console.log(res);
				if (res.meta.status !== 200) {
					//登陆失败
					this.$message({
						type: 'warning',
						message: '用户名或者密码错误!'
					});
					return;
				} else if (res.meta.status === 200) {
					//登陆成功
					//添加localStorage
					sessionStorage.setItem('token', res.data.token);
					this.$message({
						type: 'success',
						message: res.meta.msg,
						duration: 1000,
						onClose() {
							that.$router.push('welcome');
						}
					});
				} else {
					this.$message({
						type: 'success',
						message: res.meta.msg
					});
				}
			});
		},
		formReset() {
			this.$refs['loginForm'].resetFields();
		},
		welcome() {
			console.log(
				'商城后台管理系统，使用vue全家桶+elementUI+axios搭建的SPA，数据库和后台部署在本服务器。完成了用户管理，权限管理，商品管理，订单管理和数据统计的功能，包含各部分前端向数据库的增删改查的请求。'
			);
		}
	}
};
</script>

<style scoped lang="scss">
#app {
	.loginContainer {
		height: 100vh;
		background: #2b4b6b;
		display: flex;
		align-items: center;
		justify-content: center;
		.loginform {
			position: relative;
			background-color: #fff;
			width: 400px;
			padding: 30px;
			box-sizing: border-box;
			p {
				margin-top: 22px;
				margin-bottom: 22px;
			}
			.logo {
				position: absolute;
				height: 88px;
				width: 88px;
				border: 1px solid #eee;
				border-radius: 50%;
				padding: 10px;
				-webkit-box-shadow: 0 0 10px #ddd;
				box-shadow: 0 0 10px #ddd;
				background: #f5f5f5;
				top: 0;
				left: 50%;
				transform: translate(-50%, -50%);
				img {
					border-radius: 50%;
					width: 100%;
					height: 100%;
					display: block;
				}
			}
		}
	}
}
</style>
