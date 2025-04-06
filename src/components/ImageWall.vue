<!-- src/components/ImageWall.vue -->
<template>
  <div class="image-wall-component">
    <!-- 图片展示区 -->
    <div class="image-wall" :class="`layout-${layout}`">
      <div 
        v-for="(image, index) in displayImages" 
        :key="index"
        class="image-item"
        @click="handleImageClick(index)"
      >
        <img :src="image.url" :alt="image.name || `图片${index+1}`">
        <div class="image-overlay">
          <i class="el-icon-zoom-in"></i>
        </div>
      </div>
      
      <!-- 上传按钮 -->
      <div v-if="editable && images.length < maxCount" class="upload-item" @click="showUploadDialog">
        <i class="el-icon-plus"></i>
        <span>添加图片</span>
      </div>
    </div>
    
    <!-- 更多图片提示 -->
    <div v-if="hasMoreImages" class="more-images" @click="handleImageClick(maxDisplay - 1)">
      <span>+{{ images.length - maxDisplay }} 张图片</span>
    </div>
    
    <!-- 上传对话框 -->
    <el-dialog
      title="上传图片"
      :visible.sync="uploadDialogVisible"
      width="400px"
      class="upload-dialog"
    >
      <image-uploader
        category="post"
        @upload-success="handleUploadSuccess"
        @upload-error="handleUploadError"
      />
      
      <span slot="footer" class="dialog-footer">
        <el-button @click="uploadDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmUpload">确认</el-button>
      </span>
    </el-dialog>
    
    <!-- 图片预览 -->
    <image-preview
      :visible.sync="previewVisible"
      :images="previewImages"
      :initial-index="previewIndex"
      @close="previewVisible = false"
    />
  </div>
</template>

<script>
import ImageUploader from './ImageUploader.vue'
import ImagePreview from './ImagePreview.vue'
import imageManager from '@/utils/imageManager'

export default {
  name: 'ImageWall',
  components: {
    ImageUploader,
    ImagePreview
  },
  props: {
    /**
     * 图片列表
     * 每个图片对象包含：
     * - id: 图片ID
     * - url: 图片URL(可选，如果没有则通过id获取)
     * - name: 图片名称(可选)
     */
    images: {
      type: Array,
      default: () => []
    },
    /**
     * 最大显示数量
     */
    maxDisplay: {
      type: Number,
      default: 4
    },
    /**
     * 最大图片数量
     */
    maxCount: {
      type: Number,
      default: 9
    },
    /**
     * 布局方式
     * grid: 网格布局
     * flow: 流式布局
     */
    layout: {
      type: String,
      default: 'grid',
      validator: value => ['grid', 'flow'].includes(value)
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
      loadedImages: [],
      uploadDialogVisible: false,
      previewVisible: false,
      previewIndex: 0,
      newImageData: null
    }
  },
  computed: {
    /**
     * 显示的图片列表
     */
    displayImages() {
      return this.images.slice(0, this.maxDisplay)
    },
    
    /**
     * 是否有更多图片
     */
    hasMoreImages() {
      return this.images.length > this.maxDisplay
    },
    
    /**
     * 预览图片列表
     */
    previewImages() {
      return this.images.map(image => ({
        id: image.id,
        url: image.url,
        name: image.name
      }))
    }
  },
  watch: {
    images: {
      immediate: true,
      handler(val) {
        this.loadImageUrls()
      }
    }
  },
  methods: {
    /**
     * 加载图片URL
     */
    async loadImageUrls() {
      const imagesToLoad = this.images.filter(image => image.id && !image.url)
      
      if (imagesToLoad.length === 0) return
      
      try {
        const loadedImages = [...this.images]
        
        for (let i = 0; i < imagesToLoad.length; i++) {
          const image = imagesToLoad[i]
          const index = this.images.findIndex(img => img.id === image.id)
          
          if (index !== -1) {
            const url = await imageManager.getPublicImage(image.id)
            if (url) {
              loadedImages[index] = { ...loadedImages[index], url }
            }
          }
        }
        
        this.$emit('update:images', loadedImages)
      } catch (error) {
        console.error('加载图片URL失败:', error)
      }
    },
    
    /**
     * 处理图片点击
     */
    handleImageClick(index) {
      this.previewIndex = index
      this.previewVisible = true
    },
    
    /**
     * 显示上传对话框
     */
    showUploadDialog() {
      if (!this.editable) return
      this.uploadDialogVisible = true
    },
    
    /**
     * 处理上传成功
     */
    handleUploadSuccess(data) {
      this.newImageData = data
    },
    
    /**
     * 处理上传错误
     */
    handleUploadError(error) {
      this.$message.error('图片上传失败，请重试')
      console.error('图片上传失败:', error)
    },
    
    /**
     * 确认上传
     */
    confirmUpload() {
      if (!this.newImageData) {
        this.$message.warning('请先上传图片')
        return
      }
      
      // 添加新图片
      const newImages = [...this.images, {
        id: this.newImageData.imageId,
        url: this.newImageData.imageUrl,
        name: this.newImageData.fileName
      }]
      
      // 更新图片列表
      this.$emit('update:images', newImages)
      this.$emit('image-added', this.newImageData)
      
      // 重置并关闭对话框
      this.newImageData = null
      this.uploadDialogVisible = false
    },
    
    /**
     * 移除图片
     */
    removeImage(index) {
      if (!this.editable) return
      
      const newImages = [...this.images]
      const removedImage = newImages.splice(index, 1)[0]
      
      this.$emit('update:images', newImages)
      this.$emit('image-removed', removedImage)
    }
  }
}
</script>

<style scoped>
.image-wall-component {
  width: 100%;
}

.image-wall {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

/* 网格布局 */
.image-wall.layout-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  grid-gap: 8px;
}

/* 流式布局 */
.image-wall.layout-flow {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.image-wall.layout-flow .image-item {
  flex: 0 0 auto;
  width: calc(25% - 6px);
}

.image-item {
  position: relative;
  border-radius: 4px;
  overflow: hidden;
  height: 120px;
  background-color: #f5faff;
  cursor: pointer;
}

.image-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.image-overlay i {
  color: white;
  font-size: 24px;
}

.image-item:hover .image-overlay {
  opacity: 1;
}

.upload-item {
  height: 120px;
  border-radius: 4px;
  border: 1px dashed #d9ecff;
  background-color: #f5faff;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s;
}

.upload-item:hover {
  border-color: #409EFF;
  background-color: #ecf5ff;
}

.upload-item i {
  font-size: 24px;
  color: #409EFF;
  margin-bottom: 8px;
}

.upload-item span {
  color: #409EFF;
  font-size: 14px;
}

.more-images {
  margin-top: 8px;
  text-align: center;
  color: #409EFF;
  cursor: pointer;
}

.more-images:hover {
  text-decoration: underline;
}

.upload-dialog >>> .el-dialog {
  background-color: #f5faff;
  border-radius: 8px;
}

.upload-dialog >>> .el-dialog__header {
  background-color: #ecf5ff;
  padding: 15px 20px;
  border-bottom: 1px solid #d9ecff;
  border-radius: 8px 8px 0 0;
}

.upload-dialog >>> .el-dialog__title {
  color: #409EFF;
  font-weight: 500;
}
</style>