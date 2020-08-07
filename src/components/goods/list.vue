<template>
	<div class="list">
	<el-breadcrumb separator-class="el-icon-arrow-right">
		<el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
		<el-breadcrumb-item>商品管理</el-breadcrumb-item>
		<el-breadcrumb-item>商品列表</el-breadcrumb-item>
	</el-breadcrumb>
	
	<el-card class="box-card">
		<el-row :gutter="20">
			<el-col :span="8">
				<el-input placeholder="请输入搜索内容" v-model="queryInfo.query" class="input-with-select" clearable>
					<el-button slot="append" icon="el-icon-search" @click="searchClick"></el-button>
				</el-input>
			</el-col>
			<el-col :span="4"><el-button type="primary" @click="addClick">添加商品</el-button></el-col>
		</el-row>
		<el-table :data="goodList" style="width: 100%" border stripe>
			<el-table-column label="序号" type="index" width="50px"></el-table-column>
			<el-table-column label="缩略图"  prop="goods_small_logo" sort-by="username"></el-table-column>
			<el-table-column label="商品名称"  prop="goods_name" sort-by="username"></el-table-column>
			<el-table-column label="商品价格(元)" width="95px" prop="goods_price"></el-table-column>
			<el-table-column label="商品重量(kg)" width="70px" prop="goods_weight"></el-table-column>
			<el-table-column label="添加时间" prop="add_time" width="160px" :formatter="dateFormat"></el-table-column>
			<el-table-column label="操作" width="150px">
				<template slot-scope="scope">
					<el-button type="primary" size="mini" @click="showEditDialog(scope.row.id)">修改</el-button>
					<el-button type="danger" size="mini" @click="delClick(scope.row.id)">删除</el-button>
				</template>
			</el-table-column>
		</el-table>
		<el-pagination
			@size-change="handleSizeChange"
			@current-change="handleCurrentChange"
			:current-page="queryInfo.pagenum"
			:page-sizes="[10, 20, 50, 80]"
			:page-size="queryInfo.pagesize"
			layout="total, sizes, prev, pager, next, jumper"
			:total="total"
		></el-pagination>
	</el-card>
	</div>
</template>


<script>
	import { formatDate, RegObject } from '../../common/utils';
	export default{
		data(){
			return {
				queryInfo:{
					query:'',
					pagenum:1,
					pagesize:10
				},
				total:0,
				addDialog:false,
				goodList:[]
			}
		},
		created(){
			this.getGoodlist();
		},
		methods:{
			//商品搜索
			searchClick(){
				//搜索用户
				if (this.queryInfo.query.length == 0) {
					this.$message.error('请输入搜索内容!');
				}
				this.queryInfo.pagenum = 1;
				this.getGoodlist();
			},
			addClick(){
				//添加商品
				this.$router.push('goods/add');
			},
			dateFormat(row, column, cellValue, index) {
				const daterc = row[column.property];
			
				if (daterc != null) {
					let date = new Date(daterc * 1000); //返回时间戳
					return formatDate(date, 'yyyy-MM-dd h:m:s');
					//return formatDate(date, 'yyyy-MM-dd h:m:s');
				}
			},
			getGoodlist(){
				//获取商品列表数据
				this.$axios.get('goods', {
						params: this.queryInfo
					})
					.then(res => {
						console.log(res)
						if (res.meta.status !== 200) return this.$message.error('获取商品数据失败！');
				
						//this.$message.success(res.meta.msg);
						this.goodList = res.data.goods;
						this.total = res.data.total;
					});
			},
			handleSizeChange(size) {
				//每页条数
				this.queryInfo.pagesize = size;
				this.getGoodlist();
			},
			handleCurrentChange(pagenum) {
				//当前页
				this.queryInfo.pagenum = pagenum;
				this.getGoodlist();
			},
			showEditDialog(id){
				
			}
		}
	}
</script>

<style></style>
