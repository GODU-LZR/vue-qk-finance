<!-- src/components/ImageUploader.vue -->
<template>
  <div class="image-uploader">
    <div 
      class="upload-area"
      :class="{'is-dragover': isDragover, 'is-loading': loading}"
      @dragover.prevent="handleDragover"
      @dragleave.prevent="handleDragleave"
      @drop.prevent="handleDrop"
      @click="triggerUpload"
    >
      <input 
        ref="fileInput"
        type="file"
        accept="image/*"
        class="file-input"
        @change="handleFileChange"
      >
      <div v-if="!imageUrl && !loading" class="upload-placeholder">
        <i class="el-icon-upload"></i>
        <div class="upload-text">点击或拖拽图片到此处上传</div>
        <div class="upload-hint">{{ uploadHint }}</div>
      </div>
      <div v-if="loading" class="upload-loading">
        <i class="el-icon-loading"></i>
        <div class="loading-text">上传中...</div>
      </div>
      <div v-if="imageUrl && !loading" class="image-preview">
        <img :src="imageUrl" alt="预览图">
        <div class="image-actions">
          <el-button type="primary" size="mini" icon="el-icon-refresh" circle @click.stop="triggerUpload"></el-button>
          <el-button type="danger" size="mini" icon="el-icon-delete" circle @click.stop="removeImage"></el-button>
        </div>
      </div>
    </div>
    <div v-if="errorMessage" class="upload-error">
      <i class="el-icon-warning-outline"></i>
      {{ errorMessage }}
    </div>
  </div>
</template>

<script>
import { getUploadUrl, confirmImageUpload } from '@/api/imageService'

export default {
  name: 'ImageUploader',
  props: {
    /**
     * 图片分类
     * avatar: 用户头像
     * post: 帖子图片
     * other: 其他图片
     */
    category: {
      type: String,
      default: 'other',
      validator: value => ['avatar', 'post', 'other'].includes(value)
    },
    /**
     * 图片大小限制(MB)
     */
    sizeLimit: {
      type: Number,
      default: 5
    },
    /**
     * 上传提示文本
     */
    uploadHint: {
      type: String,
      default: '支持jpg、png、gif格式，大小不超过5MB'
    },
    /**
     * 初始图片URL
     */
    initialImageUrl: {
      type: String,
      default: ''
    },
    /**
     * 用户ID(用于头像上传)
     */
    userId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      imageUrl: this.initialImageUrl,
      isDragover: false,
      loading: false,
      errorMessage: '',
      imageId: ''
    }
  },
  methods: {
    /**
     * 触发文件选择
     */
    triggerUpload() {
      this.$refs.fileInput.click()
    },
    
    /**
     * 处理拖拽进入
     */
    handleDragover(e) {
      this.isDragover = true
    },
    
    /**
     * 处理拖拽离开
     */
    handleDragleave(e) {
      this.isDragover = false
    },
    
    /**
     * 处理拖拽放置
     */
    handleDrop(e) {
      this.isDragover = false
      const files = e.dataTransfer.files
      if (files.length > 0) {
        this.processFile(files[0])
      }
    },
    
    /**
     * 处理文件选择变化
     */
    handleFileChange(e) {
      const files = e.target.files
      if (files.length > 0) {
        this.processFile(files[0])
      }
    },
    
    /**
     * 处理文件上传
     */
    processFile(file) {
      // 验证文件类型
      if (!file.type.startsWith('image/')) {
        this.errorMessage = '请上传图片文件'
        return
      }
      
      // 验证文件大小
      const fileSizeMB = file.size / (1024 * 1024)
      if (fileSizeMB > this.sizeLimit) {
        this.errorMessage = `图片大小不能超过${this.sizeLimit}MB`
        return
      }
      
      this.errorMessage = ''
      this.uploadFile(file)
    },
    
    /**
     * 上传文件到服务器
     */
    async uploadFile(file) {
      try {
        this.loading = true
        
        // 1. 获取上传URL
        const fileName = file.name
        const fileType = file.type
        const response = await getUploadUrl({
          fileName,
          fileType,
          category: this.category
        })
        
        const { uploadUrl, imageId } = response.data
        this.imageId = imageId
        
        // 2. 上传文件到预签名URL
        await this.uploadToPresignedUrl(uploadUrl, file)
        
        // 3. 确认上传完成
        await confirmImageUpload(imageId)
        
        // 4. 创建本地预览URL
        this.imageUrl = URL.createObjectURL(file)
        
        // 5. 触发上传成功事件
        this.$emit('upload-success', {
          imageId,
          imageUrl: this.imageUrl,
          fileName,
          fileType
        })
      } catch (error) {
        console.error('上传失败:', error)
        this.errorMessage = '图片上传失败，请重试'
        this.$emit('upload-error', error)
      } finally {
        this.loading = false
      }
    },
    
    /**
     * 上传到预签名URL
     */
    uploadToPresignedUrl(url, file) {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open('PUT', url, true)
        xhr.setRequestHeader('Content-Type', file.type)
        
        xhr.onload = () => {
          if (xhr.status === 200) {
            resolve()
          } else {
            reject(new Error(`上传失败: ${xhr.status}`))
          }
        }
        
        xhr.onerror = () => {
          reject(new Error('网络错误'))
        }
        
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const percentComplete = Math.round((e.loaded / e.total) * 100)
            this.$emit('upload-progress', percentComplete)
          }
        }
        
        xhr.send(file)
      })
    },
    
    /**
     * 移除图片
     */
    removeImage() {
      this.imageUrl = ''
      this.imageId = ''
      this.$refs.fileInput.value = ''
      this.$emit('image-removed')
    }
  }
}
</script>

<style scoped>
.image-uploader {
  width: 100%;
}

.upload-area {
  position: relative;
  width: 100%;
  height: 200px;
  border: 2px dashed #d9ecff;
  border-radius: 6px;
  background-color: #f5faff;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s;
  overflow: hidden;
}

.upload-area:hover {
  border-color: #409EFF;
  background-color: #ecf5ff;
}

.upload-area.is-dragover {
  border-color: #409EFF;
  background-color: #ecf5ff;
}

.upload-area.is-loading {
  cursor: wait;
}

.file-input {
  display: none;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #909399;
}

.upload-placeholder i {
  font-size: 40px;
  color: #c0c4cc;
  margin-bottom: 10px;
}

.upload-text {
  font-size: 16px;
  margin-bottom: 6px;
}

.upload-hint {
  font-size: 12px;
  color: #909399;
}

.upload-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.upload-loading i {
  font-size: 40px;
  color: #409EFF;
  margin-bottom: 10px;
}

.loading-text {
  font-size: 14px;
  color: #409EFF;
}

.image-preview {
  width: 100%;
  height: 100%;
  position: relative;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-actions {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.3s;
}

.image-preview:hover .image-actions {
  opacity: 1;
}

.upload-error {
  margin-top: 8px;
  color: #f56c6c;
  font-size: 12px;
  display: flex;
  align-items: center;
}

.upload-error i {
  margin-right: 4px;
}
</style>