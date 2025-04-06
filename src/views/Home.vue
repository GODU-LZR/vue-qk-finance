<!-- vue-qk-finance/src/views/Home.vue -->
<template>
  <div class="home-container">
    <h2 class="home-title">体育开支模块首页</h2>
    <div class="button-group">
      <el-button type="primary" @click="showMessage">点击测试</el-button>
      <el-button type="success" @click="goToImageService">图片服务示例</el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FinanceHome',
  methods: {
    showMessage() {
      this.$message('体育开支子应用的 ElementUI 按钮点击了！');
    },
    goToImageService() {
      this.$router.push('/image-service');
    }
  }
}
</script>

<style scoped>
.home-container {
  padding: 20px;
  background-color: #f5faff;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.home-title {
  color: #409EFF;
  margin-bottom: 30px;
}

.button-group {
  display: flex;
  gap: 15px;
}
</style>