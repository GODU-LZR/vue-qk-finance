<!-- src/views/ImageDemo.vue -->
<template>
  <div class="image-demo-container">
    <el-card class="demo-card">
      <div slot="header" class="card-header">
        <h2>图片服务模块示例</h2>
      </div>
      
      <el-tabs v-model="activeTab">
        <!-- 用户头像示例 -->
        <el-tab-pane label="用户头像" name="avatar">
          <div class="section">
            <h3>用户头像(私有且可缓存)</h3>
            <p class="section-desc">用户头像是私有资源，支持本地缓存，减少重复请求</p>
            
            <div class="avatar-demo">
              <div class="avatar-item">
                <user-avatar
                  :userId="'user123'"
                  :imageId="avatarImageId"
                  :username="'张三'"
                  :size="80"
                  :editable="true"
                  @avatar-updated="handleAvatarUpdated"
                />
                <div class="avatar-name">可编辑头像</div>
              </div>
              
              <div class="avatar-item">
                <user-avatar
                  :userId="'user456'"
                  :imageId="'default-avatar-id'"
                  :username="'李四'"
                  :size="60"
                />
                <div class="avatar-name">只读头像</div>
              </div>
              
              <div class="avatar-item">
                <user-avatar
                  :userId="'user789'"
                  :imageId="''"
                  :username="'王五'"
                  :size="40"
                />
                <div class="avatar-name">无图片头像</div>
              </div>
            </div>
            
            <div class="demo-info">
              <p><strong>特点：</strong></p>
              <ul>
                <li>私有资源，需要授权访问</li>
                <li>支持本地缓存，减少请求次数</li>
                <li>缓存有效期可配置</li>
                <li>支持默认头像和用户名首字母显示</li>
              </ul>
            </div>
          </div>
        </el-tab-pane>
        
        <!-- 公共图片示例 -->
        <el-tab-pane label="公共图片" name="public">
          <div class="section">
            <h3>公共图片(帖子和页面图片)</h3>
            <p class="section-desc">公共图片可直接访问，适用于帖子、文章等场景</p>
            
            <div class="public-demo">
              <image-wall
                :images="publicImages"
                :max-display="4"
                :max-count="9"
                :editable="true"
                @image-added="handleImageAdded"
                @image-removed="handleImageRemoved"
              />
            </div>
            
            <div class="demo-info">
              <p><strong>特点：</strong></p>
              <ul>
                <li>公共资源，无需授权即可访问</li>
                <li>支持多种布局方式</li>
                <li>支持图片预览和缩放</li>
                <li>适用于帖子、文章等公开内容</li>
              </ul>
            </div>
          </div>
        </el-tab-pane>
        
        <!-- 图片上传示例 -->
        <el-tab-pane label="图片上传" name="upload">
          <div class="section">
            <h3>图片上传</h3>
            <p class="section-desc">支持拖拽上传、预览和进度显示</p>
            
            <div class="upload-demo">
              <image-uploader
                category="other"
                @upload-success="handleUploadSuccess"
                @upload-error="handleUploadError"
                @upload-progress="handleUploadProgress"
              />
            </div>
            
            <div v-if="uploadProgress > 0 && uploadProgress < 100" class="progress-info">
              <el-progress :percentage="uploadProgress" :stroke-width="18" status="success"></el-progress>
            </div>
            
            <div v-if="uploadedImage" class="uploaded-info">
              <p><strong>上传成功：</strong></p>
              <ul>
                <li><strong>图片ID：</strong> {{ uploadedImage.imageId }}</li>
                <li><strong>文件名：</strong> {{ uploadedImage.fileName }}</li>
                <li><strong>类型：</strong> {{ uploadedImage.fileType }}</li>
              </ul>
            </div>
            
            <div class="demo-info">
              <p><strong>特点：</strong></p>
              <ul>
                <li>支持拖拽上传和点击上传</li>
                <li>上传前预签名，安全可靠</li>
                <li>支持上传进度显示</li>
                <li>支持多种图片格式和大小限制</li>
              </ul>
            </div>
          </div>
        </el-tab-pane>
        
        <!-- 图片预览示例 -->
        <el-tab-pane label="图片预览" name="preview">
          <div class="section">
            <h3>图片预览</h3>
            <p class="section-desc">支持图片查看、缩放和信息显示</p>
            
            <div class="preview-demo">
              <el-button type="primary" @click="showPreview">打开预览</el-button>
              
              <image-preview
                :visible.sync="previewVisible"
                :images="previewImages"
                :initial-index="0"
                title="图片预览示例"
                @close="previewVisible = false"
              />
            </div>
            
            <div class="demo-info">
              <p><strong>特点：</strong></p>
              <ul>
                <li>支持多图预览和切换</li>
                <li>显示图片详细信息</li>
                <li>支持图片下载</li>
                <li>响应式设计，适配不同屏幕</li>
              </ul>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script>
import UserAvatar from '@/components/UserAvatar.vue'
import ImageUploader from '@/components/ImageUploader.vue'
import ImagePreview from '@/components/ImagePreview.vue'
import ImageWall from '@/components/ImageWall.vue'

export default {
  name: 'ImageDemo',
  components: {
    UserAvatar,
    ImageUploader,
    ImagePreview,
    ImageWall
  },
  data() {
    return {
      activeTab: 'avatar',
      avatarImageId: 'demo-avatar-id',
      publicImages: [
        {
          id: 'demo-image-1',
          url: 'https://picsum.photos/id/1/300/300',
          name: '示例图片1'
        },
        {
          id: 'demo-image-2',
          url: 'https://picsum.photos/id/2/300/300',
          name: '示例图片2'
        }
      ],
      uploadProgress: 0,
      uploadedImage: null,
      previewVisible: false,
      previewImages: [
        {
          id: 'preview-1',
          url: 'https://picsum.photos/id/10/800/600',
          name: '预览图片1',
          size: 1024 * 1024 * 2.5, // 2.5MB
          dimensions: { width: 800, height: 600 },
          uploadTime: Date.now() - 86400000 // 1天前
        },
        {
          id: 'preview-2',
          url: 'https://picsum.photos/id/20/800/600',
          name: '预览图片2',
          size: 1024 * 1024 * 1.8, // 1.8MB
          dimensions: { width: 800, height: 600 },
          uploadTime: Date.now() - 43200000 // 12小时前
        },
        {
          id: 'preview-3',
          url: 'https://picsum.photos/id/30/800/600',
          name: '预览图片3',
          size: 1024 * 1024 * 3.2, // 3.2MB
          dimensions: { width: 800, height: 600 },
          uploadTime: Date.now() - 3600000 // 1小时前
        }
      ]
    }
  },
  methods: {
    /**
     * 处理头像更新
     */
    handleAvatarUpdated(data) {
      this.avatarImageId = data.imageId
      this.$message.success('头像更新成功')
    },
    
    /**
     * 处理图片添加
     */
    handleImageAdded(data) {
      this.$message.success('图片添加成功')
    },
    
    /**
     * 处理图片移除
     */
    handleImageRemoved(data) {
      this.$message.success('图片移除成功')
    },
    
    /**
     * 处理上传成功
     */
    handleUploadSuccess(data) {
      this.uploadedImage = data
      this.uploadProgress = 100
      this.$message.success('图片上传成功')
    },
    
    /**
     * 处理上传错误
     */
    handleUploadError(error) {
      this.uploadProgress = 0
      this.$message.error('图片上传失败')
    },
    
    /**
     * 处理上传进度
     */
    handleUploadProgress(percentage) {
      this.uploadProgress = percentage
    },
    
    /**
     * 显示预览
     */
    showPreview() {
      this.previewVisible = true
    }
  }
}
</script>

<style scoped>
.image-demo-container {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

.demo-card {
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.demo-card >>> .el-card__header {
  background-color: #ecf5ff;
  padding: 15px 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  margin: 0;
  color: #409EFF;
  font-size: 18px;
  font-weight: 500;
}

.section {
  margin-bottom: 30px;
}

.section h3 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #303133;
  font-size: 16px;
  font-weight: 500;
}

.section-desc {
  color: #606266;
  margin-bottom: 20px;
  font-size: 14px;
}

.avatar-demo {
  display: flex;
  gap: 30px;
  margin-bottom: 20px;
}

.avatar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar-name {
  margin-top: 10px;
  color: #606266;
  font-size: 14px;
}

.public-demo {
  margin-bottom: 20px;
}

.upload-demo {
  max-width: 500px;
  margin-bottom: 20px;
}

.progress-info {
  margin-top: 20px;
  margin-bottom: 20px;
}

.uploaded-info {
  margin-top: 20px;
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f0f9eb;
  border-radius: 4px;
  color: #67c23a;
}

.uploaded-info ul {
  margin: 10px 0 0 0;
  padding-left: 20px;
}

.preview-demo {
  margin-bottom: 20px;
}

.demo-info {
  background-color: #f5faff;
  padding: 15px;
  border-radius: 4px;
  border-left: 4px solid #409EFF;
}

.demo-info p {
  margin-top: 0;
  margin-bottom: 10px;
}

.demo-info ul {
  margin: 0;
  padding-left: 20px;
}

.demo-info li {
  margin-bottom: 5px;
  color: #606266;
}
</style>