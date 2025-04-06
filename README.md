# Vue 轻快金融系统

## 项目介绍

本项目是一个基于Vue.js开发的金融系统前端应用，集成了图片服务、数据可视化等功能模块，提供了现代化的用户界面和流畅的用户体验。系统采用组件化开发方式，具有良好的可扩展性和可维护性。

## 技术栈

- **前端框架**：Vue.js 2.6.14
- **UI组件库**：Element UI 2.15.14
- **路由管理**：Vue Router 3.5.1
- **状态管理**：Vuex 3.6.2
- **HTTP客户端**：Axios 1.6.2
- **数据可视化**：ECharts 5.6.0
- **构建工具**：Vue CLI 5.0.0

## 功能模块

### 1. 图片服务模块

系统集成了完整的图片服务功能，支持图片上传、预览、下载和管理。图片服务模块与Java中间层和MinIO对象存储服务交互，实现了高效的图片存储和访问。

#### 主要组件：

- **ImageUploader**：图片上传组件，支持拖拽上传、点击上传，提供上传进度和预览功能
- **ImagePreview**：图片预览组件，支持查看图片详情、下载图片
- **ImageWall**：图片墙组件，用于展示多张图片
- **UserAvatar**：用户头像组件，支持头像上传和展示

#### 图片服务流程：

1. **前端请求上传URL**：通过`imageService.js`中的`getUploadUrl`方法获取预签名URL
2. **直接上传到MinIO**：前端使用预签名URL直接上传文件到MinIO对象存储
3. **确认上传完成**：上传完成后调用`confirmImageUpload`通知后端
4. **获取图片访问URL**：根据图片类型调用不同方法获取访问URL
   - 用户头像：`getUserAvatarUrl`
   - 公共图片：`getPublicImageUrl`

### 2. 数据可视化模块

系统集成了ECharts图表库，提供丰富的数据可视化功能，支持多种图表类型，如折线图、柱状图、饼图等。

### 3. 用户认证模块

实现了基于JWT的用户认证机制，包括登录、注销、token刷新等功能。

## 项目结构

```
├── public/                 # 静态资源
│   ├── favicon.ico        # 网站图标
│   └── index.html         # HTML模板
├── src/                    # 源代码
│   ├── api/               # API请求模块
│   │   └── imageService.js # 图片服务API
│   ├── assets/            # 资源文件
│   ├── components/        # 公共组件
│   │   ├── HelloWorld.vue # 示例组件
│   │   ├── ImagePreview.vue # 图片预览组件
│   │   ├── ImageUploader.vue # 图片上传组件
│   │   ├── ImageWall.vue  # 图片墙组件
│   │   └── UserAvatar.vue # 用户头像组件
│   ├── router/            # 路由配置
│   ├── store/             # Vuex状态管理
│   ├── utils/             # 工具函数
│   │   ├── imageManager.js # 图片管理工具
│   │   └── request.js     # 请求工具
│   ├── views/             # 页面视图
│   │   ├── Home.vue       # 首页
│   │   └── ImageDemo.vue  # 图片功能演示页
│   ├── App.vue            # 根组件
│   ├── main.js            # 入口文件
│   └── public-path.js     # 公共路径配置
├── .browserslistrc        # 浏览器兼容配置
├── .env                   # 环境变量
├── babel.config.js        # Babel配置
├── jsconfig.json          # JS配置
├── package.json           # 项目依赖
└── vue.config.js          # Vue配置
```

## 安装部署

### 环境要求

- Node.js >= 12.0.0
- npm >= 6.0.0

### 安装步骤

1. 克隆项目到本地

```bash
git clone [项目仓库地址]
cd vue-qk-finance
```

2. 安装依赖

```bash
npm install
```

3. 开发环境运行

```bash
npm run serve
```

4. 生产环境构建

```bash
npm run build
```

## 使用指南

### 图片上传组件使用

```vue
<template>
  <div>
    <image-uploader
      category="post"
      :size-limit="5"
      upload-hint="支持jpg、png格式，大小不超过5MB"
      @upload-success="handleUploadSuccess"
      @upload-error="handleUploadError"
    />
  </div>
</template>

<script>
import ImageUploader from '@/components/ImageUploader.vue'

export default {
  components: {
    ImageUploader
  },
  methods: {
    handleUploadSuccess(imageInfo) {
      console.log('上传成功:', imageInfo)
      // imageInfo包含imageId和imageUrl
    },
    handleUploadError(error) {
      console.error('上传失败:', error)
    }
  }
}
</script>
```

### 图片预览组件使用

```vue
<template>
  <div>
    <el-button @click="showPreview">预览图片</el-button>
    <image-preview
      :visible.sync="previewVisible"
      :images="images"
      :initial-index="0"
      title="图片预览"
    />
  </div>
</template>

<script>
import ImagePreview from '@/components/ImagePreview.vue'

export default {
  components: {
    ImagePreview
  },
  data() {
    return {
      previewVisible: false,
      images: [
        {
          url: 'https://example.com/image1.jpg',
          name: '图片1',
          id: 'image1'
        },
        {
          url: 'https://example.com/image2.jpg',
          name: '图片2',
          id: 'image2'
        }
      ]
    }
  },
  methods: {
    showPreview() {
      this.previewVisible = true
    }
  }
}
</script>
```

## 配置说明

### 环境变量配置

在`.env`文件中配置API基础URL：

```
VUE_APP_BASE_API=http://api.example.com
```

### Vue配置

在`vue.config.js`中可以自定义构建配置，如代理设置、打包优化等。

## 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建Pull Request

## 许可证

[MIT](LICENSE)
