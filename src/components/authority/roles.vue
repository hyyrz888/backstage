<template>
	<div class="roles">
		<el-breadcrumb separator-class="el-icon-arrow-right">
			<el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
			<el-breadcrumb-item>权限管理</el-breadcrumb-item>
			<el-breadcrumb-item>权限列表</el-breadcrumb-item>
		</el-breadcrumb>
		<el-card class="box-card">
			<el-button type="primary" @click="showRoleDialog">添加角色</el-button>
			<el-table :data="rolesList" style="width: 100%" border stripe ref="RoleFormRef">
				<el-table-column type="expand">
					<template slot-scope="scope">
						<el-row v-for="(item, index) in scope.row.children" :key="item.index" :class="['border-bottom', index == 0 ? 'border-top' : '']">
							<el-col :span="4">
								<el-tag @close="removeRight(scope.row, item.id)" closable effect="dark">{{ item.authName }}</el-tag>
								<i class="el-icon-caret-right"></i>
							</el-col>
							<el-col :span="20">
								<el-row v-for="(item2, index) in item.children" :class="[index == 0 ? '' : 'border-top']">
									<el-col :span="6">
										<el-tag @close="removeRight(scope.row, item2.id)" closable type="success" effect="dark">{{ item2.authName }}</el-tag>
										<i class="el-icon-caret-right"></i>
									</el-col>
									<el-col :span="18">
										<el-tag type="warning" @close="removeRight(scope.row, item3.id)" closable v-for="(item3, index) in item2.children" effect="dark">
											{{ item3.authName }}
										</el-tag>
									</el-col>
								</el-row>
							</el-col>
						</el-row>
					</template>
				</el-table-column>
				<el-table-column label="排序" type="index" width="60"></el-table-column>
				<el-table-column label="角色名称" prop="roleName"></el-table-column>
				<el-table-column label="角色描述" prop="roleDesc"></el-table-column>
				<el-table-column label="操作">
					<template slot-scope="data">
						<el-button type="primary" size="mini" @click="EditRoleDialog(data.row.id)">编辑</el-button>
						<el-button type="danger" size="mini" @click="roleClick(data.row.id)">删除</el-button>
						<el-button type="warning" size="mini" @click="showRoles(data.row)">分配权限</el-button>
					</template>
				</el-table-column>
			</el-table>
		</el-card>

		<!--添加角色-->
		<el-dialog @close="dialogClose('add')" title="添加角色" :visible.sync="addroledialogVisable" width="50%">
			<el-form :model="addroleruleForm" status-icon :rules="rolesFormRules" ref="addruleFormref" label-width="100px">
				<el-form-item label="角色名称" prop="roleName"><el-input v-model="addroleruleForm.roleName"></el-input></el-form-item>
				<el-form-item label="角色描述" prop="roleDesc"><el-input type="textarea" rows="3" v-model="addroleruleForm.roleDesc"></el-input></el-form-item>
			</el-form>
			<span slot="footer" class="dialog-footer">
				<el-button @click="addroledialogVisable = false">取 消</el-button>
				<el-button type="primary" @click="addRole">确 定</el-button>
			</span>
		</el-dialog>

		<!--编辑弹出-->
		<el-dialog @close="dialogClose('edit')" title="添加角色" :visible.sync="editroledialogVisable" width="50%">
			<el-form :model="editroleruleForm" status-icon :rules="rolesFormRules" ref="editruleFormref" label-width="100px">
				<el-form-item label="角色名称" prop="roleName"><el-input v-model="editroleruleForm.roleName"></el-input></el-form-item>
				<el-form-item label="角色描述" prop="roleDesc"><el-input type="textarea" rows="3" v-model="editroleruleForm.roleDesc"></el-input></el-form-item>
			</el-form>
			<span slot="footer" class="dialog-footer">
				<el-button @click="editroledialogVisable = false">取 消</el-button>
				<el-button type="primary" @click="editRole">确 定</el-button>
			</span>
		</el-dialog>

		<!--权限分配弹出-->
		<el-dialog @close="dialogClose('roles')" title="分配权限" :visible.sync="setRolesdialogVisable" width="50%">
			<el-tree ref="treeRef" :data="rightsList" show-checkbox node-key="id" default-expand-all  :default-checked-keys="defKeys" :props="trueProps" ></el-tree>

			<span slot="footer" class="dialog-footer">
				<el-button @click="setRolesdialogVisable = false">取 消</el-button>
				<el-button type="primary" @click="allotRights">确 定</el-button>
			</span>
		</el-dialog>
	</div>
</template>

<script>
export default {
	name: 'Roles',
	data() {
		return {
			rolesList: [],
			addroleruleForm: {
				roleName: '',
				roleDesc: ''
			},
			rolesFormRules: {
				roleName: [
					{
						required: true,
						message: '角色名称不为空！',
						trigger: 'blur'
					}
				],
				roleDesc: [
					{
						max: 20,
						message: '不超过20个字符!',
						trigger: 'blur'
					}
				]
			},
			addroledialogVisable: false,
			editroleruleForm: {},
			editroledialogVisable: false,
			setRolesdialogVisable:false,
			rightsList:[],
			roleId:'',
			trueProps:{
				 label:'authName',
				 children:'children'
			},
			defKeys:[]
		};
	},
	created() {
		this.getRoleslist();
	},
	methods: {
		getRoleslist() {
			//获取用户列表数据
			this.$axios.get('roles').then(res => {
				//console.log(res);
				if (res.meta.status !== 200) return this.$message.error(res.meta.msg);

				//this.$message.success(res.meta.msg);
				this.rolesList = res.data;
			});
		},
		dialogClose(info) {
			if (info === 'add') {
				this.$refs.addruleFormref.resetFields();
			} else if (info === 'edit') {
				this.$refs.editruleFormref.resetFields();
			}else if(info === 'roles'){
				this.defKeys=[];
			}
		},
		showRoleDialog() {
			this.addroledialogVisable = true;
		},
		EditRoleDialog(id) {
			this.editroledialogVisable = true;
			this.$axios.get('roles/' + id).then(res => {
				//console.log(res)
				if (res.meta.status !== 200) return this.$message.error('查询失败');
				this.$message.success(res.meta.msg);
				this.editroleruleForm = res.data;
			});
		},
		addRole() {
			this.$refs.addruleFormref.validate(async valid => {
				if (!valid) return;
				//添加权限
				let res = await this.$axios.post('roles', this.addroleruleForm);
				console.log(res);
				if (res.meta.status !== 201) {
					return this.$message({
						type: 'error',
						message: res.meta.msg
					});
				}
				this.addroledialogVisable = false;
				this.$message.success(res.meta.msg);
				this.getRoleslist();
			});
		},
		removeRight(role, rightId) {
			//删除角色
			console.log(role);
			console.log(rightId);
			this.$confirm('确认删除该权限？删除后不可恢复！，是否继续？', '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning',
				confirmButtonType: 'danger'
			})
				.then(_ => {
					//确认删除执行的操作
					this.$axios.delete(`roles/${role.id}/rights/${rightId}`).then(res => {
						//console.log(role);
						//console.log(res);
						if (res.meta.status !== 200) {
							return this.$message({
								type: 'error',
								message: res.meta.msg
							});
						}
						//删除成功
						this.$message.success(res.meta.msg);
						//重新渲染
						role.children = res.data;
					});
				})
				.catch(err => {
					//取消删除
					return this.$message.info('取消操作！');
				});
		},
		editRole() {
			//编辑提交角色
			this.$refs.editruleFormref.validate(valid => {
				if (!valid) return;
				this.$axios
					.put('roles/' + this.editroleruleForm.roleId, {
						roleName: this.editroleruleForm.roleName,
						roleDesc: this.editroleruleForm.roleDesc
					})
					.then(res => {
						if (res.meta.status !== 200) return;
						this.$message.success(res.meta.msg);
						this.getRoleslist();
						this.editroledialogVisable = false;
					});
			});
		},
		roleClick(id) {
			this.$confirm('确认删除？', '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning',
				confirmButtonType: 'danger'
			})
				.then(_ => {
					this.$axios.delete(`roles/${id}`).then(res => {
						if (res.meta.status !== 200) return;
						this.$message.success(res.meta.msg);
						this.getRoleslist();
					});
				})
				.catch(_ => {
					this.$message({
						type: 'info',
						message: '取消操作!'
					});
				});
		},
		showRoles(roles) {
			//展示当前id下的权限树
			//console.log(roles);
			this.roleId = roles.id;
			
			//显示所有的权限列表
			this.$axios.get(`rights/tree`).then(res=>{
				if(res.meta.status!==200) return;
				this.rightsList = res.data;
				this.$message.success(res.meta.msg)
				this.getLeafKeys(roles,this.defKeys)
				this.setRolesdialogVisable = true;
				//console.log(this.defKeys)
			})
			
		},
		getLeafKeys(node,arr){
		      if(!node.children){
		        return arr.push(node.id)
		      }
			  //为数组里每个元素执行回调函数
		      node.children.forEach(item => {
		        this.getLeafKeys(item,arr)
		      });
		},
		async allotRights() {
			//分配权限
			//获取全部的权限id
			const keys=[...this.$refs.treeRef.getCheckedKeys(),...this.$refs.treeRef.getHalfCheckedKeys()];
			//console.log(keys);
			//转为字符串
			 const idStr = keys.join(',')
			 console.log(idStr)
			    const res = await this.$axios.post(`roles/${this.roleId}/rights`,{rids:idStr})
				console.log(res)
			    if(res.meta.status!==200){
			      return this.$message.error('分配权限失败！')
			    }
			    this.$message.success(res.meta.msg);
				this.setRolesdialogVisable = false;
			    this.getRoleslist();
		 }
	}
};
</script>

<style lang="scss" scoped>
.el-tag {
	margin: 6px;
}
</style>
