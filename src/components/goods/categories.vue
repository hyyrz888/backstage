<template>
	<div class="categories">
		<el-breadcrumb separator-class="el-icon-arrow-right">
			<el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
			<el-breadcrumb-item>商品管理</el-breadcrumb-item>
			<el-breadcrumb-item>商品分类</el-breadcrumb-item>
		</el-breadcrumb>

		<el-card class="box-card">
			<el-row><el-button type="primary" @click="addCateDialogShow">添加分类</el-button></el-row>

			<zk-table :data="cateList" :columns="columns" :selection-type="false" :expand-type="false" show-index index-text="#" border>
				<!--是否有效-->
				<template slot="isok" scope="scope">
					<i style="color:lightgreen" class="el-icon-success" v-if="scope.row.cat_deleted == false"></i>
					<i style="color:red" class="el-icon-error" v-else></i>
				</template>

				<!--排序-->
				<template slot="order" scope="scope">
					<el-tag v-if="scope.row.cat_level === 0" size="mini">一级分类</el-tag>
					<el-tag type="success" v-else-if="scope.row.cat_level === 1" size="mini">二级分类</el-tag>
					<el-tag type="warning" v-else-if="scope.row.cat_level === 2" size="mini">三级分类</el-tag>
				</template>

				<!--操作-->
				<template slot="opt" slot-scope="scope">
					<el-button @click="showeditCate(scope.row)" size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
					<el-button @click="showdeleteCate(scope.row)" size="mini" type="danger" icon="el-icon-delete">删除</el-button>
				</template>
			</zk-table>

			<el-pagination
				@size-change="handleSizeChange"
				@current-change="handleCurrentChange"
				:current-page="queryInfo.pagenum"
				:page-sizes="[8, 15, 20, 30]"
				:page-size="queryInfo.pagesize"
				layout="total, sizes, prev, pager, next, jumper"
				:total="total"
			></el-pagination>
		</el-card>

		<!--添加分类-->
		<el-dialog @close="addDialogClose" title="添加分类" :visible.sync="addCateDialogVisable" width="50%">
			<el-form :model="addCateForm" status-icon :rules="CateFormRules" ref="addCateFormRef" label-width="100px">
				<el-form-item label="分类名称" prop="cat_name"><el-input v-model="addCateForm.cat_name"></el-input></el-form-item>
				<el-form-item label="父级分类">
					<el-cascader
						clearable
						v-model="selectedKeys"
						:options="Cateoptions"
						@change="handleChange"
						:props="{ expandTrigger: 'hover', value: 'cat_id', label: 'cat_name', children: 'children' }"
						change-on-select
					></el-cascader>
				</el-form-item>
			</el-form>
			<span slot="footer" class="dialog-footer">
				<el-button @click="addCateDialogVisable = false">取 消</el-button>
				<el-button type="primary" @click="addCate">确 定</el-button>
			</span>
		</el-dialog>

		<!--编辑分类-->
		<el-dialog @close="editdialogVisable = false" title="编辑分类" :visible.sync="editDialogVisable" width="50%">
			<el-form :model="editForm" :rules="CateFormRules" ref="editFormRef" label-width="100px">
				<el-form-item label="分类名称" prop="cat_name"><el-input v-model="editForm.cat_name"></el-input></el-form-item>
			</el-form>
			<span slot="footer" class="dialog-footer">
				<el-button @click="editDialogVisable = false">取 消</el-button>
				<el-button type="primary" @click="editClick">确 定</el-button>
			</span>
		</el-dialog>
	</div>
</template>

<script>
export default {
	name: 'Cate',
	data() {
		return {
			addCateDialogVisable: false,
			editDialogVisable: false,
			addCateForm: {
				cat_name: '',
				cat_pid: '0', //父id
				cat_level: '0' //分类当前层级
			},
			editForm: {},
			cateList: [],
			queryInfo: {
				type: 3,
				pagesize: 8,
				pagenum: 1 //当前页码
			},
			total: 0,
			columns: [
				{
					label: '分类名称',
					prop: 'cat_name'
				},
				{
					label: '是否有效',
					type: 'template',
					template: 'isok'
				},
				{
					label: '排序',
					type: 'template',
					template: 'order'
				},
				{
					label: '操作',
					type: 'template',
					template: 'opt'
				}
			],
			CateFormRules: {
				cat_name: [
					{
						required: true,
						message: '请输入分类名称',
						tigger: 'blur'
					},
					{
						min: 1,
						max: 20,
						message: '分类名称长度在 1 到 20 个字符',
						trigger: 'blur'
					}
				]
			},
			//所有分类
			Cateoptions: [],
			selectedKeys: []
		};
	},
	created() {
		this.getCateList();
	},
	methods: {
		addCateDialogShow() {
			this.addCateDialogVisable = true;
			this.getCateoptions();
		},
		//显示分类
		getCateList() {
			this.$axios.get('categories', { params: this.queryInfo }).then(res => {
				if (res.meta.status !== 200) return;
				//console.log(res);
				this.cateList = res.data.result;
				this.total = res.data.total;
			});
		},
		handleChange() {
			//选择父级元素
			console.log(this.selectedKeys);

			if (this.selectedKeys.length > 0) {
				//有选择分类
				this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1];
				this.addCateForm.cat_level = this.selectedKeys.length;
			} else {
				//没有选择分类
				this.addCateForm.cat_pid = 0;
				this.addCateForm.cat_level = 0;
			}
		},
		//每页条数
		handleSizeChange(size) {
			this.queryInfo.pagesize = size;
			this.getCateList();
		},
		//当前页码
		handleCurrentChange(pagenum) {
			this.queryInfo.pagenum = pagenum;
			this.getCateList();
		},
		//显示2级父分类
		getCateoptions() {
			this.$axios
				.get('categories', {
					params: {
						type: 2
					}
				})
				.then(res => {
					if (res.meta.status !== 200) return;
					//console.log(res);
					this.Cateoptions = res.data;
				});
		},
		addDialogClose() {
			//关闭添加分类的弹出框
			this.$refs.addCateFormRef.resetFields();
			this.addCateForm.cat_level = 0;
			this.addCateForm.cat_level = 0;
			//清楚已经选择的分类
			this.selectedKeys = [];
		},
		addCate() {
			//确认添加分类
			this.$refs.addCateFormRef.validate(valid => {
				if (!valid) return;
				//验证通过
				this.$axios.post('categories', this.addCateForm).then(res => {
					console.log(this.addCateForm);
					if (res.meta.status !== 201) return;
					this.$message.success(res.meta.msg);
					this.addCateDialogVisable = false;
					this.getCateList();
				});
			});
		},
		showdeleteCate(info) {
			//删除
			this.$confirm('确认删除,不可恢复?', '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning',
				confirmButtonType: 'danger'
			})
				.then(_ => {
					this.$axios.delete('categories/' + info.cat_id).then(res => {
						console.log(res);
						if (res.meta.status !== 200) return;
						this.$message({
							type: 'success',
							message: res.meta.msg
						});
						this.getCateList();
					});
				})
				.catch(_ => {
					return this.$message.info('取消删除操作');
				});
		},
		showdeleteCate(info) {
			//删除
			this.$confirm('确认删除,不可恢复?', '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning',
				confirmButtonType: 'danger'
			})
				.then(_res => {
					this.$axios.delete('categories/' + info.cat_id).then(res => {
						//console.log(res);
						if (res.meta.status !== 200) return;
						this.$message({
							type: 'success',
							message: res.meta.msg
						});
						this.getCateList();
					});
				})
				.catch(_ => {
					return this.$message.info('取消删除操作!');
				});
		},
		showeditCate(info) {
			//编辑框弹出
			this.editDialogVisable = true;
			//查询分类
			this.$axios.get(`categories/${info.cat_id}`).then(res => {
				//console.log(res);
				if (res.meta.status !== 200) return;
				this.editForm = res.data;
			});
		},
		editClick() {
			console.log(this.editForm);
			//编辑提交分类
			this.$axios
				.put(`categories/${this.editForm.cat_id}`, {
					cat_name: this.editForm.cat_name
				})
				.then(res => {
					//console.log(res);
					if (res.meta.status !== 200) return;
					this.$message.success(res.meta.msg);
					this.editDialogVisable = false;
					this.getCateList();
				});
		}
	}
};
</script>

<style lang="scss" scoped>
.zk-table {
	margin-top: 15px;
}
.el-cascader {
	width: 100%;
}
</style>
