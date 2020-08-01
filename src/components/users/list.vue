<template>
	<div class="users">
		<el-breadcrumb separator-class="el-icon-arrow-right">
			<el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
			<el-breadcrumb-item>用户管理</el-breadcrumb-item>
			<el-breadcrumb-item>用户列表</el-breadcrumb-item>
		</el-breadcrumb>
		<el-card class="box-card">
			<el-row :gutter="20">
				<el-col :span="8">
					<el-input placeholder="请输入内容" v-model="queryInfo.query" class="input-with-select" clearable>
						<el-button slot="append" icon="el-icon-search" @click="searchClick"></el-button>
					</el-input>
				</el-col>
				<el-col :span="4"><el-button type="primary" @click="addClick">添加用户</el-button></el-col>
			</el-row>
			<el-table :data="userList" style="width: 100%" border stripe>
				<el-table-column label="序号" type="index" width="50px"></el-table-column>
				<el-table-column label="姓名" :sortable="true" prop="username" sort-by="username"></el-table-column>
				<el-table-column label="邮箱" prop="email"></el-table-column>
				<el-table-column label="电话" prop="mobile"></el-table-column>
				<el-table-column label="角色" prop="role_name"></el-table-column>
				<el-table-column label="创建时间" prop="create_time" :formatter="dateFormat"></el-table-column>
				<el-table-column label="状态">
					<template slot-scope="scope">
						<el-switch v-model="scope.row.mg_state" @change="stateClick(scope.row)"></el-switch>
					</template>
				</el-table-column>
				<el-table-column label="操作" width="210px">
					<template slot-scope="scope">
						<el-button type="primary" size="mini" @click="showEditDialog(scope.row.id)">修改</el-button>
						<el-button type="danger" size="mini" @click="delClick(scope.row.id)">删除</el-button>
						<el-tooltip content="分配角色" placement="top" :enterable="false" effect="dark">
							<el-button type="warning" size="mini" @click="allotClick(scope.row)">设置</el-button>
						</el-tooltip>
					</template>
				</el-table-column>
			</el-table>
			<el-pagination
				@size-change="handleSizeChange"
				@current-change="handleCurrentChange"
				:current-page="queryInfo.pagenum"
				:page-sizes="[5, 10, 20, 30]"
				:page-size="queryInfo.pagesize"
				layout="total, sizes, prev, pager, next, jumper"
				:total="total"
			></el-pagination>
		</el-card>

		<!--添加用户-->
		<el-dialog @close="dialogClose('add')" title="添加用户" :visible.sync="adddialogVisable" width="50%">
			<el-form :model="addruleForm" status-icon :rules="addruleFormRules" ref="addruleFormref" label-width="70px">
				<el-form-item label="用户名" prop="username"><el-input v-model="addruleForm.username"></el-input></el-form-item>
				<el-form-item label="密码" prop="password"><el-input v-model="addruleForm.password"></el-input></el-form-item>
				<el-form-item label="邮箱" prop="email"><el-input v-model="addruleForm.email"></el-input></el-form-item>
				<el-form-item label="手机" prop="mobile"><el-input v-model="addruleForm.mobile"></el-input></el-form-item>
			</el-form>
			<span slot="footer" class="dialog-footer">
				<el-button @click="adddialogVisable = false">取 消</el-button>
				<el-button type="primary" @click="addUser">确 定</el-button>
			</span>
		</el-dialog>

		<!--修改用户-->
		<el-dialog @close="dialogClose('edit')" title="修改用户" :visible.sync="editdialogVisable" width="50%">
			<el-form :model="editForm" status-icon :rules="addruleFormRules" ref="editruleFormRef" label-width="70px">
				<el-form-item label="用户名" prop="username"><el-input v-model="editForm.username" disabled></el-input></el-form-item>
				<el-form-item label="邮箱" prop="email"><el-input  v-model="editForm.email"></el-input></el-form-item>
				<el-form-item label="手机" prop="mobile"><el-input v-model="editForm.mobile"></el-input></el-form-item>
			</el-form>
			<span slot="footer" class="dialog-footer">
				<el-button @click="editdialogVisable = false">取 消</el-button>
				<el-button type="primary" @click="editClick">确 定</el-button>
			</span>
		</el-dialog>

		<!--分配角色-->
		<el-dialog @close="setRoleClose" title="分配角色" :visible.sync="roledialogVisable" width="30%">
			<el-form ref="roleFormRef" status-icon>
				<el-form-item  prop="username"><el-input  v-model="userInfo.username" disabled></el-input></el-form-item>
				<el-form-item prop="roleName"><el-input v-model="userInfo.role_name" disabled></el-input></el-form-item>
				<el-select  v-model="selectRoleId" placeholder="请选择角色">
					<el-option v-for="item in roleList" :key="item.id" :label="item.roleName" :value="item.id"></el-option>
				</el-select>
			</el-form>
			<span slot="footer" class="dialog-footer">
				<el-button @click="roledialogVisable = false">取 消</el-button>
				<el-button type="primary" @click="roleClick">确 定</el-button>
			</span>
		</el-dialog>
	</div>
</template>

<script>
import { formatDate, RegObject } from '../../common/utils';
export default {
	name: 'Users',
	data() {
		let checkEmail = (rule, val, callback) => {
			if (RegObject.Email.regStr.test(val)) {
				return callback();
			}
			callback(new Error(RegObject.Email.msg));
		};
		let checkMobile = (rule, val, callback) => {
			if (RegObject.Mobile.regStr.test(val)) {
				return callback();
			}
			callback(new Error(RegObject.Mobile.msg));
		};
		return {
			queryInfo: {
				query: '', //查询参数
				pagenum: 1, //当前页码
				pagesize: 5 //每页显示条数
			},
			userList: [],
			total: 0,
			adddialogVisable: false,
			editdialogVisable: false,
			//添加用户表单
			addruleForm: {
				username: '',
				password: '',
				email: '',
				mobile: ''
			},
			editForm: {},
			//添加用户的弹出表单
			addruleFormRules: {
				username: [
					{
						required: true,
						message: '用户名不为空!',
						trigger: 'blur'
					},
					{
						min: 3,
						max: 8,
						message: '用户名长度在3到8个字符!',
						trigger: 'blur'
					}
				],
				password: [
					{
						required: true,
						message: '密码为空!',
						trigger: 'blur'
					},
					{
						min: 6,
						max: 6,
						message: '密码长度6位数',
						trigger: 'blur'
					}
				],
				email: [
					{
						required: true,
						message: '邮箱不为空',
						trigger: 'blur'
					},
					{ validator: checkEmail, trigger: 'blur' }
				],
				mobile: [
					{
						required: true,
						message: '手机号不为空',
						trigger: 'blur'
					},
					{ validator: checkMobile, trigger: 'blur' }
				]
			},
			roledialogVisable:false,
			userInfo:{},  //用户信息
			roleList:{},  //权限列表
			selectRoleId:''  //当前选择角色的id
		};
	},
	created() {
		this.getUserlist();
	},
	methods: {
		dateFormat(row, column, cellValue, index) {
			const daterc = row[column.property];

			if (daterc != null) {
				let date = new Date(daterc * 1000); //返回时间戳
				return formatDate(date, 'yyyy-MM-dd h:m:s');
				//return formatDate(date, 'yyyy-MM-dd h:m:s');
			}
		},
		getUserlist() {
			//获取用户列表数据
			this.$axios
				.get('users', {
					params: this.queryInfo
				})
				.then(res => {
					if (res.meta.status !== 200) return this.$message.error('获取用户数据失败！');

					//this.$message.success(res.meta.msg);
					this.userList = res.data.users;
					this.total = res.data.total;
				});
		},
		searchClick() {
			//搜索用户
			if (this.queryInfo.query.length == 0) {
				this.$message.error('请输入搜索内容!');
			}
			this.queryInfo.pagenum = 1;
			this.getUserlist();
		},
		dialogClose() {
			//关闭弹出框
			console.log(arguments[0]);
			if (arguments[0] === 'add') {
				this.$refs.addruleFormref.resetFields();
			} else if (arguments[0] === 'edit') {
				this.$refs.editruleFormRef.resetFields();
			}
		},
		addClick() {
			//显示添加用户的弹出框
			this.adddialogVisable = true;
		},
		addUser() {
			//添加用户
			this.$refs.addruleFormref.validate(async valid => {
				if (!valid) return false;
				const res = await this.$axios.post('users', this.addruleForm);
				console.log(res);
				if (res.meta.status == 400) {
					this.$message.error(res.meta.msg);
				}
				this.adddialogVisable = false;
				this.$message.success(res.meta.msg);
				this.getUserlist();
			});
		},
		handleSizeChange(size) {
			//每页条数
			this.queryInfo.pagesize = size;
			this.getUserlist();
		},
		handleCurrentChange(pagenum) {
			//当前页
			this.queryInfo.pagenum = pagenum;
			this.getUserlist();
		},
		async stateClick(userinfo) {
			//更改用户状态
			let res = await this.$axios.put(`users/${userinfo.id}/state/${userinfo.mg_state}`);
			console.log(res);
			if (res.meta.status !== 200) {
				userinfo.mg_state = !userinfo.mg_state;
				return this.$message.error('用户更改状态失败');
			}
			this.$message.success(res.meta.msg);
		},
		showEditDialog(id) {
			//显示修改的弹出框
			//取消用户名的验证，因为其不可写
			this.addruleFormRules.username = '';
			this.editdialogVisable = true;
			this.$axios.get(`users/${id}`).then(res => {
				if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
				this.editForm = res.data;
			});
		},
		editClick() {
			//修改用户
			this.$refs.editruleFormRef.validate(async valid => {
				if (!valid) return;
				let res = await this.$axios.put(`users/${this.editForm.id}`, {
					email: this.editForm.email,
					mobile: this.editForm.mobile
				});
				if (res.meta.status !== 200) {
					this.$message.error('修改用户信息失败！');
				}
				this.editdialogVisable = false;
				this.$message.success(res.meta.msg);
				this.getUserlist();
			});
		},

		delClick(id) {
			//删除用户
			this.$confirm('确认删除该用户？删除后不可恢复!,是否继续？', '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning',
				confirmButtonType: 'danger'
			})
				.then(_ => {
					//确认删除
					this.$axios.delete(`users/${id}`).then(res => {
						//禁止删除管理员
						if (res.meta.status == 400) {
							return this.$message({
								type: 'error',
								message: res.meta.msg
							});
						}
						//删除成功
						this.$message.success(res.meta.msg);
						this.getUserlist();
					});
				})
				.catch(_ => {
					//取消删除
					return this.$message.info('取消操作！');
				});
		},
		allotClick(userinfo) {
			//获取当前用户信息
			this.userInfo = userinfo;
			console.log(this.userInfo)
			this.roledialogVisable = true;
			//显示角色列表
			this.$axios.get('roles').then(res=>{
				if(res.meta.status!==200)return;
				this.roleList = res.data;
			})
		},
		roleClick() {
			//判断是否有id,select的option项
			console.log(this.selectRoleId);
			if(!this.selectRoleId) return this.$message.error("请要分配的角色");
			//修改角色
			this.$axios.put(`users/${this.userInfo.id}/role`,{
				rid:this.selectRoleId
			}).then(res=>{
				console.log(res);
				if(res.meta.status!==200)return this.$message.error(res.meta.msg);
				this.$message.success(res.meta.msg);
				this.roledialogVisable = false;
				this.getUserlist();
			})
		},
		setRoleClose(){
			//清空数据
		      this.selectRoleId=''
		      this.userInfo={}
		}
	}
};
</script>

<style></style>
