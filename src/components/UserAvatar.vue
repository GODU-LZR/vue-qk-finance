<!-- src/components/UserAvatar.vue -->
<template>
  <div class="user-avatar-component">
    <div 
      class="avatar-container"
      :class="{'is-editable': editable}"
      :style="{width: size + 'px', height: size + 'px'}"
    >
      <img 
        v-if="avatarUrl" 
        :src="avatarUrl" 
        alt="用户头像"
        class="avatar-image"
      >
      <div v-else class="avatar-placeholder">
        <span v-if="username">{{ usernameInitial }}</span>
        <i v-else class="el-icon-user"></i>
      </div>
      
      <div v-if="editable" class="avatar-edit-overlay" @click="handleEditClick">
        <i class="el-icon-camera"></i>
      </div>
    </div>
    
    <!-- 头像上传对话框 -->
    <el-dialog
      title="更新头像"
      :visible.sync="dialogVisible"
      width="400px"
      class="avatar-dialog"
    >
      <image-uploader
        category="avatar"
        :userId="userId"
        :initialImageUrl="avatarUrl"
        @upload-success="handleUploadSuccess"
        @upload-error="handleUploadError"
      />
      
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmAvatarUpdate">确认</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import ImageUploader from './ImageUploader.vue'
import imageManager from '@/utils/imageManager'

export default {
  name: 'UserAvatar',
  components: {
    ImageUploader
  },
  props: {
    /**
     * 用户ID
     */
    userId: {
      type: String,
      required: true
    },
    /**
     * 图片ID
     */
    imageId: {
      type: String,
      default: ''
    },
    /**
     * 用户名
     */
    username: {
      type: String,
      default: ''
    },
    /**
     * 头像尺寸(像素)
     */
    size: {
      type: Number,
      default: 40
    },
    /**
     * 是否可编辑
     */
    editable: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      avatarUrl: '',
      dialogVisible: false,
      newImageId: '',
      newAvatarUrl: ''
    }
  },
  computed: {
    /**
     * 用户名首字母(用于无头像时显示)
     */
    usernameInitial() {
      return this.username ? this.username.charAt(0).toUpperCase() : ''
    }
  },
  watch: {
    imageId: {
      immediate: true,
      handler(val) {
        if (val) {
          this.loadAvatarUrl()
        }
      }
    }
  },
  methods: {
    /**
     * 加载头像URL
     */
    async loadAvatarUrl() {
      if (!this.userId || !this.imageId) return
      
      try {
        const url = await imageManager.getUserAvatar(this.userId, this.imageId)
        this.avatarUrl = url
      } catch (error) {
        console.error('加载头像失败:', error)
      }
    },
    
    /**
     * 处理编辑点击
     */
    handleEditClick() {
      if (!this.editable) return
      this.dialogVisible = true
    },
    
    /**
     * 处理上传成功
     */
    handleUploadSuccess(data) {
      this.newImageId = data.imageId
      this.newAvatarUrl = data.imageUrl
    },
    
    /**
     * 处理上传错误
     */
    handleUploadError(error) {
      this.$message.error('头像上传失败，请重试')
      console.error('头像上传失败:', error)
    },
    
    /**
     * 确认头像更新
     */
    confirmAvatarUpdate() {
      if (!this.newImageId) {
        this.$message.warning('请先上传新头像')
        return
      }
      
      // 更新头像
      this.avatarUrl = this.newAvatarUrl
      
      // 缓存新头像URL
      imageManager.cacheAvatarUrl(this.userId, this.newImageId, this.newAvatarUrl)
      
      // 触发更新事件
      this.$emit('avatar-updated', {
        userId: this.userId,
        imageId: this.newImageId,
        imageUrl: this.newAvatarUrl
      })
      
      // 关闭对话框
      this.dialogVisible = false
    }
  }
}
</script>

<style scoped>
.avatar-container {
  position: relative;
  border-radius: 50%;
  overflow: hidden;
  background-color: #ecf5ff;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 2px solid #d9ecff;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #409EFF;
  font-weight: bold;
  font-size: 40%;
}

.avatar-placeholder i {
  font-size: 60%;
}

.avatar-container.is-editable {
  cursor: pointer;
}

.avatar-edit-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.avatar-container:hover .avatar-edit-overlay {
  opacity: 1;
}

.avatar-edit-overlay i {
  color: white;
  font-size: 40%;
}

.avatar-dialog >>> .el-dialog {
  background-color: #f5faff;
  border-radius: 8px;
}

.avatar-dialog >>> .el-dialog__header {
  background-color: #ecf5ff;
  padding: 15px 20px;
  border-bottom: 1px solid #d9ecff;
  border-radius: 8px 8px 0 0;
}

.avatar-dialog >>> .el-dialog__title {
  color: #409EFF;
  font-weight: 500;
}
</style>