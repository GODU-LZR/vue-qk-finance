<!-- src/components/ImagePreview.vue -->
<template>
  <div class="image-preview-component">
    <el-dialog
      :visible.sync="dialogVisible"
      :title="title"
      width="70%"
      class="image-preview-dialog"
      @close="handleClose"
    >
      <div class="preview-container">
        <div class="image-container">
          <img :src="currentImage.url" :alt="currentImage.name" class="preview-image">
        </div>
        
        <div class="image-info" v-if="showInfo">
          <div class="info-item">
            <span class="info-label">文件名：</span>
            <span class="info-value">{{ currentImage.name }}</span>
          </div>
          <div class="info-item" v-if="currentImage.size">
            <span class="info-label">大小：</span>
            <span class="info-value">{{ formatSize(currentImage.size) }}</span>
          </div>
          <div class="info-item" v-if="currentImage.dimensions">
            <span class="info-label">尺寸：</span>
            <span class="info-value">{{ currentImage.dimensions.width }} x {{ currentImage.dimensions.height }}</span>
          </div>
          <div class="info-item" v-if="currentImage.uploadTime">
            <span class="info-label">上传时间：</span>
            <span class="info-value">{{ formatDate(currentImage.uploadTime) }}</span>
          </div>
        </div>
      </div>
      
      <div class="preview-actions">
        <el-button type="primary" size="small" @click="downloadImage" :disabled="!currentImage.url">
          <i class="el-icon-download"></i> 下载
        </el-button>
        <el-button type="info" size="small" @click="toggleInfo">
          <i :class="showInfo ? 'el-icon-close' : 'el-icon-info'"></i> {{ showInfo ? '隐藏信息' : '显示信息' }}
        </el-button>
        <el-button type="danger" size="small" @click="handleClose">
          <i class="el-icon-close"></i> 关闭
        </el-button>
      </div>
      
      <div class="thumbnail-container" v-if="images.length > 1">
        <div 
          v-for="(image, index) in images" 
          :key="index"
          class="thumbnail"
          :class="{ active: index === currentIndex }"
          @click="setCurrentImage(index)"
        >
          <img :src="image.url" :alt="image.name">
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getImagePreviewInfo } from '@/api/imageService'

export default {
  name: 'ImagePreview',
  props: {
    /**
     * 是否显示预览对话框
     */
    visible: {
      type: Boolean,
      default: false
    },
    /**
     * 预览标题
     */
    title: {
      type: String,
      default: '图片预览'
    },
    /**
     * 图片列表
     * 每个图片对象包含：
     * - url: 图片URL
     * - name: 图片名称
     * - id: 图片ID
     * - size: 图片大小(可选)
     * - dimensions: 图片尺寸(可选) {width, height}
     * - uploadTime: 上传时间(可选)
     */
    images: {
      type: Array,
      default: () => []
    },
    /**
     * 初始显示的图片索引
     */
    initialIndex: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      dialogVisible: this.visible,
      currentIndex: this.initialIndex,
      showInfo: false,
      loadingInfo: false
    }
  },
  computed: {
    /**
     * 当前显示的图片
     */
    currentImage() {
      return this.images[this.currentIndex] || {}
    }
  },
  watch: {
    visible(val) {
      this.dialogVisible = val
      if (val && this.currentImage.id && !this.currentImage.size) {
        this.loadImageInfo(this.currentImage.id)
      }
    },
    dialogVisible(val) {
      this.$emit('update:visible', val)
      if (!val) {
        this.$emit('close')
      }
    },
    initialIndex(val) {
      this.currentIndex = val
    }
  },
  methods: {
    /**
     * 设置当前显示的图片
     */
    setCurrentImage(index) {
      this.currentIndex = index
      if (this.currentImage.id && !this.currentImage.size) {
        this.loadImageInfo(this.currentImage.id)
      }
      this.$emit('change', index)
    },
    
    /**
     * 加载图片详细信息
     */
    async loadImageInfo(imageId) {
      if (this.loadingInfo) return
      
      try {
        this.loadingInfo = true
        const response = await getImagePreviewInfo(imageId)
        const imageInfo = response.data
        
        // 更新当前图片信息
        const updatedImages = [...this.images]
        updatedImages[this.currentIndex] = {
          ...this.currentImage,
          size: imageInfo.size,
          dimensions: imageInfo.dimensions,
          uploadTime: imageInfo.uploadTime
        }
        
        this.$emit('update:images', updatedImages)
      } catch (error) {
        console.error('获取图片信息失败:', error)
      } finally {
        this.loadingInfo = false
      }
    },
    
    /**
     * 切换显示/隐藏图片信息
     */
    toggleInfo() {
      this.showInfo = !this.showInfo
    },
    
    /**
     * 下载当前图片
     */
    downloadImage() {
      if (!this.currentImage.url) return
      
      const link = document.createElement('a')
      link.href = this.currentImage.url
      link.download = this.currentImage.name || 'image'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    },
    
    /**
     * 关闭预览对话框
     */
    handleClose() {
      this.dialogVisible = false
    },
    
    /**
     * 格式化文件大小
     */
    formatSize(bytes) {
      if (!bytes) return '未知'
      
      const units = ['B', 'KB', 'MB', 'GB']
      let size = bytes
      let unitIndex = 0
      
      while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024
        unitIndex++
      }
      
      return `${size.toFixed(2)} ${units[unitIndex]}`
    },
    
    /**
     * 格式化日期
     */
    formatDate(timestamp) {
      if (!timestamp) return '未知'
      
      const date = new Date(timestamp)
      return date.toLocaleString()
    }
  }
}
</script>

<style scoped>
.image-preview-dialog >>> .el-dialog {
  background-color: #f5faff;
  border-radius: 8px;
}

.image-preview-dialog >>> .el-dialog__header {
  padding: 15px 20px;
  background-color: #ecf5ff;
  border-bottom: 1px solid #d9ecff;
  border-radius: 8px 8px 0 0;
}

.image-preview-dialog >>> .el-dialog__title {
  color: #409EFF;
  font-weight: 500;
}

.image-preview-dialog >>> .el-dialog__body {
  padding: 20px;
}

.preview-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.image-container {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  max-height: 60vh;
  overflow: hidden;
}

.preview-image {
  max-width: 100%;
  max-height: 60vh;
  object-fit: contain;
}

.image-info {
  width: 100%;
  max-width: 600px;
  background-color: #ecf5ff;
  border-radius: 4px;
  padding: 15px;
  margin-bottom: 20px;
}

.info-item {
  margin-bottom: 8px;
  display: flex;
}

.info-label {
  color: #606266;
  width: 80px;
  flex-shrink: 0;
}

.info-value {
  color: #303133;
  word-break: break-all;
}

.preview-actions {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
}

.thumbnail-container {
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
  gap: 10px;
  padding: 10px 0;
}

.thumbnail {
  width: 80px;
  height: 80px;
  border: 2px solid #d9ecff;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.3s;
}

.thumbnail:hover {
  border-color: #409EFF;
}

.thumbnail.active {
  border-color: #409EFF;
  box-shadow: 0 0 8px rgba(64, 158, 255, 0.5);
}

.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>