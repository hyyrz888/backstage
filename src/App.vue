<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<style lang="scss">
@import "assets/css/base.css";
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
.el-breadcrumb{
	margin-bottom: 15px;
}
.el-table{
	margin-top: 15px;
	font-size: 12px;
}
.el-pagination{
	margin-top:15px
}
</style>
