<template>
	<div class="params">
		<el-breadcrumb separator-class="el-icon-arrow-right">
			<el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
			<el-breadcrumb-item>商品管理</el-breadcrumb-item>
			<el-breadcrumb-item>商品参数</el-breadcrumb-item>
		</el-breadcrumb>

		<el-card class="box-card">
			<el-alert show-icon title="注意：只允许为第三级分类设置相关参数!" type="error"></el-alert>

			<el-row class="cat_opt">
				<el-col>
					<span>选择商品分类：</span>
					<el-cascader
						v-model="selectKeys"
						:options="catelist"
						:props="{ expandTrigger: 'hover', value: 'cat_id', label: 'cat_name', children: 'children' }"
						@change="handleChange"
					></el-cascader>
				</el-col>
			</el-row>

			<el-tabs v-model="activeName" @tab-click="handleClick">
				<!--动态表格-->
				<el-tab-pane label="动态参数" name="many">
					<el-button type="primary" :disabled="isbtndis" size="mini" @click="adddialogVisable = true">动态参数</el-button>
					<el-table :data="manyData" border stripe>
						<!--获取attr_vals-->
						<el-table-column type="expand">
							<template slot-scope="scope">
								<el-tag :key="index" v-for="(tag, index) in scope.row.attr_vals" closable :disable-transitions="false" @close="handleClose(index, scope.row)">
									{{ tag }}
								</el-tag>
								<el-input
									class="input-new-tag"
									v-if="scope.row.inputVisible"
									v-model="scope.row.inputValue"
									ref="saveTagInput"
									size="small"
									@keyup.enter.native="handleInputConfirm(scope.row)"
									@blur="handleInputConfirm(scope.row)"
								></el-input>
								<el-button v-else size="small" @click="showInput(scope.row)">+ New Tag</el-button>
							</template>
						</el-table-column>
						<el-table-column prop="attr_name" label="参数名称" width="180"></el-table-column>
						<el-table-column label="参数内容">
							<template slot-scope="scope">
								{{ scope.row.attr_vals.join(',') }}
							</template>
						</el-table-column>
						<el-table-column label="操作">
							<template slot-scope="scope">
								<el-button type="primary" size="mini" @click="editShow(scope.row.attr_id)">
									<i class="el-icon-edit"></i>
									编辑
								</el-button>
								<el-button type="danger" size="mini" @click="editRemove(scope.row.attr_id)">
									<i class="el-icon-delete"></i>
									删除
								</el-button>
							</template>
						</el-table-column>
					</el-table>
				</el-tab-pane>

				<!-- 静态表格 -->
				<el-tab-pane label="静态参数" name="only">
					<el-button size="mini" :disabled="isbtndis" type="primary" @click="adddialogVisable = true">静态参数</el-button>
					<el-table :data="onlyData" border stripe>
						<!--获取attr_vals-->
						<el-table-column type="expand">
							<template slot-scope="scope">
								<el-tag :key="index" v-for="(tag, index) in scope.row.attr_vals" closable :disable-transitions="false" @close="handleClose(index, scope.row)">
									{{ tag }}
								</el-tag>
								<el-input
									class="input-new-tag"
									v-if="scope.row.inputVisible"
									v-model="scope.row.inputValue"
									ref="saveTagInput"
									size="small"
									@keyup.enter.native="handleInputConfirm(scope.row)"
									@blur="handleInputConfirm(scope.row)"
								></el-input>
								<el-button v-else size="small" @click="showInput(scope.row)">+ New Tag</el-button>
							</template>
						</el-table-column>
						<el-table-column prop="attr_name" label="参数名称" width="180"></el-table-column>
						<el-table-column prop="attr_vals" label="参数内容"></el-table-column>
						<el-table-column label="操作">
							<template slot-scope="scope">
								<el-button type="primary" size="mini" @click="editShow(scope.row.attr_id)">
									<i class="el-icon-edit"></i>
									编辑
								</el-button>
								<el-button type="danger" size="mini" @click="editRemove(scope.row.attr_id)">
									<i class="el-icon-delete"></i>
									删除
								</el-button>
							</template>
						</el-table-column>
					</el-table>
				</el-tab-pane>
			</el-tabs>
		</el-card>

		<!--添加参数弹出框-->
		<el-dialog @close="editclosed" :title="titleText" :visible.sync="adddialogVisable" width="50%">
			<el-form :model="paramForm" :rules="paramFormRules" ref="paramFormRef" label-width="100px">
				<el-form-item label="参数名称" prop="attr_name"><el-input v-model="paramForm.attr_name"></el-input></el-form-item>
				<el-form-item label="参数内容" prop="attr_vals">
					<el-input type="textarea" placeholder="如果有多个属性请用,号分隔" v-model="paramForm.attr_vals"></el-input>
				</el-form-item>
			</el-form>
			<span slot="footer" class="dialog-footer">
				<el-button @click="adddialogVisable = false">取 消</el-button>
				<el-button type="primary" @click="addParams">确 定</el-button>
			</span>
		</el-dialog>

		<!--编辑参数弹出框-->
		<el-dialog @click="editclosed" title="编辑参数" :visible.sync="editdialogVisible" width="50%">
			<el-form :model="editForm" :rules="editFormrules" ref="editFormRef" label-width="100px">
				<el-form-item label="参数名称" prop="attr_name"><el-input v-model="editForm.attr_name"></el-input></el-form-item>
			</el-form>
			<span slot="footer" class="dialog-footer">
				<el-button @click="editdialogVisible = false">取 消</el-button>
				<el-button type="primary" @click="editParams">确 定</el-button>
			</span>
		</el-dialog>
	</div>
</template>

<script>
export default {
	data() {
		//自定义规则，判别参数是否重复
		let uniqueAttname = (rule, value, callback) => {
			//
			console.log(rule);
			if (this.hasParam.includes(value.trim()) && value.trim() !== this.editForm.attr_name) {
				callback(new Error('重复的参数名称！请重新命名！'));
			}
			callback();
		};
		return {
			//选中的商品分类id
			selectKeys: [],
			catelist: [],
			activeName: 'many', //默认是动态参数
			manyData: [], //动态参数数据
			onlyData: [], //静态参数数据
			adddialogVisable: false,
			editdialogVisible: false,
			paramForm: {},
			editForm: {
				attr_name: ''
			},
			paramFormRules: {
				attr_name: [
					{
						required: 'true',
						message: '必填!',
						trigger: 'blur'
					},
					{
						min: 1,
						max: 20,
						message: '字符长度在 1 到 20 个字符',
						trigger: 'blur'
					},
					{
						validator: uniqueAttname,
						trigger: 'blur'
					}
				],
				attr_vals: [
					{
						required: 'true',
						message: '必填!',
						trigger: 'blur'
					},
					{
						min: 1,
						max: 50,
						message: '字符长度在 1 到 50 个字符',
						trigger: 'blur'
					}
				]
			},
			editFormrules: {
				attr_name: [
					{ required: true, message: '此选项不能为空！', trigger: 'blur' },
					{
						min: 1,
						max: 20,
						message: '字符长度在 1 到 20 个字符',
						trigger: 'blur'
					},
					{
						validator: uniqueAttname,
						trigger: 'blur'
					}
				]
			},
			hasParam: [] //用来存放数据库里已经有的参数名称
		};
	},
	computed: {
		isbtndis() {
			//判断当前是否有选择分类（3级），没有的禁止点击添加参数按钮
			if (this.selectKeys.length < 3) {
				return true;
			}
			return false;
		},
		cateId() {
			//获取当前选择的分类最后一层的id
			if (this.selectKeys.length == 3) {
				return this.selectKeys[2];
			}
			return null;
		},
		titleText() {
			if (this.activeName == 'many') {
				return '动态参数';
			}
			return '静态参数';
		}
	},
	created() {
		this.getcateList();
	},
	methods: {
		getcateList() {
			this.$axios.get('categories').then(res => {
				if (res.meta.status !== 200) return;
				console.log(res);
				this.catelist = res.data;
			});
		},
		//获取参数
		getParams() {
			//如果当前的选择不是3级
			if (this.selectKeys.length != 3) {
				this.selectKeys = [];
				this.manyData = [];
				this.onlyTData = [];
				return;
			}
			//获取参数列表
			this.$axios
				.get(`categories/${this.cateId}/attributes`, {
					params: {
						sel: this.activeName
					}
				})
				.then(res => {
					if (res.meta.status !== 200) return;
					console.log(res.data);

					this.formatVals = res.data.attr_vals;
					this.$message.success(res.meta.msg);
					//console.log(res.data);
					//用来判断新添加的参数是否已经存在数据库里
					let newArr = res.data;
					for (let i in newArr) {
						this.hasParam.push(newArr[i]['attr_name']);
					}

					//操作attr_vals
					res.data.forEach(item => {
						item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : [];
						item.inputVisible = false;
						item.inputValue = '';
					});

					//判断当前活跃的是动态参数还是静态参数来显示对应的参数详情
					if (this.activeName == 'many') {
						this.manyData = res.data;
					} else {
						this.onlyData = res.data;
					}
				});
		},
		handleChange() {
			//选择分类
			console.log(this.selectKeys);
			this.getParams();
		},
		//tab
		handleClick() {
			this.getParams();
		},
		//添加参数
		addParams() {
			this.$refs.paramFormRef.validate(valid => {
				if (!valid) return;
				this.$axios
					.post(`categories/${this.cateId}/attributes`, {
						attr_name: this.paramForm.attr_name,
						attr_sel: this.activeName,
						attr_vals: this.paramForm.attr_vals
					})
					.then(res => {
						console.log(res);
						if (res.meta.status !== 201) return;
						this.$message.success(res.meta.msg);
						this.adddialogVisable = false;
						this.getParams();
					});
			});
		},
		editclosed() {
			this.$refs.paramFormRef.resetFields();
		},
		//关闭tag标签
		handleClose(index, row) {
			//console.log(row)
			row.attr_vals.splice(index, 1);
			//保存attr_vals(服务器删除)
			this.saveAttrVals(row);
		},
		saveAttrVals(row) {
			this.$axios
				.put(`categories/${row.cat_id}/attributes/${row.attr_id}`, {
					attr_name: row.attr_name,
					attr_sel: row.attr_sel,
					attr_vals: row.attr_vals.join(' ')
				})
				.then(res => {
					console.log(res);
					if (res.meta.status !== 200) return;
					this.$message.success(res.meta.msg);
				});
		},
		//显示编辑tag文本框
		showInput(row) {
			row.inputVisible = true;
			this.$nextTick(_ => {
				this.$refs.saveTagInput.$refs.input.focus();
			});
		},
		//确认标签名称
		handleInputConfirm(row) {
			console.log(row);

			let inputValue = row.inputValue;
			if (inputValue.trim().length == 0) {
				row.inputValue = '';
				row.inputVisible = false;
				return;
			}
			row.attr_vals.push(row.inputValue.trim());
			row.inputValue = '';
			row.inputVisible = false;
			this.saveAttrVals(row);
		},
		//显示编辑弹出框
		editShow(id) {
			this.$axios.get(`categories/${this.cateId}/attributes/${id}`, { params: { attr_sel: this.activeName } }).then(res => {
				console.log(res);
				if (res.meta.status !== 200) return;
				this.editForm = res.data;
				this.editdialogVisible = true;
			});
		},
		//编辑确认
		editParams() {
			this.$refs.editFormRef.validate(valid => {
				if (!valid) return;
				this.$axios
					.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`, {
						attr_name: this.editForm.attr_name,
						attr_sel: this.activeName,
						attr_vals: this.editForm.attr_vals
					})
					.then(res => {
						console.log(res);
						if (res.meta.status !== 200) return;
						this.$message.success(res.meta.msg);
						this.editdialogVisible = false;
					});
			});
		},
		//删除参数
		editRemove(id) {
			this.$confirm('确认删除？删除后不可撤销！', '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning',
				confirmButtonType: 'danger'
			})
				.then(_ => {
					this.$axios.delete(`categories/${this.cateId}/attributes/${id}`).then(res => {
						if (res.meta.status !== 200) return;
						this.$message.success(res.meta.msg);
						this.getParams();
					});
				})
				.catch(_ => {
					return this.$message.info('取消删除操作！');
				});
		}
	}
};
</script>

<style lang="scss" scoped>
.cat_opt {
	margin: 15px 0;
}
.el-cascader {
	margin-left: 5px;
	width: 300px;
}
span {
	font-size: 14px;
}
.addparam {
	margin-bottom: 15px;
}
.el-tag {
	margin: 10px;
}
.input-new-tag {
	width: 120px;
}
</style>
