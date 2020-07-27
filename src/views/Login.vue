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
				username: '',
				password: ''
			},
			loginrules: {
				username: [{ required: true, message: '用户名不为空', trigger: 'blur' }, { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' }],
				password: [{ required: true, message: '密码不为空', trigger: 'blur' }]
			}
		};
	},
	mounted() {

	},
	methods: {
		formSubmit() {
			let that = this;
			this.$refs['loginForm'].validate(async valid => {
				if (!valid) return;
				//数据验证
				let { data: res } = await this.$axios({
					method: 'post',
					url: 'login',
					data: this.loginForm //当前数据
				});
				console.log(res)
				if (res.meta.status !== 200) {
					//登陆失败
					this.$message({
						type: 'warning',
						message: "用户名或者密码错误!"
					});
					return;
				} else if (res.meta.status === 200) {
					//登陆成功
					//添加localStorage
					localStorage.setItem('token',res.data.token);
					this.$message({
						type: 'success',
						message: res.meta.msg,
						duration: 1000,
						onClose() {
							return false;
							that.$router.push('about');
						}
					});
				}else{
					this.$message({
						type: 'success',
						message: res.meta.msg,
					});
				}
			});
		},
		formReset() {
			this.$refs['loginForm'].resetFields();
		}
	}
};
</script>

<style scoped lang="scss">
#app {
	.loginContainer {
		height: 100vh;
		background: #044;
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
				margin-top: 10px;
				margin-bottom: 22px;
			}
			.logo {
				position: absolute;
				width: 66px;
				height: 66px;
				border-radius: 50%;
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
