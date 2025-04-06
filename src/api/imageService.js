import request from '@/utils/request'

/**
 * 图片服务API模块
 * 处理与图片服务器和业务服务器的交互
 */

/**
 * 获取图片上传URL
 * @param {Object} params - 上传参数
 * @param {String} params.fileName - 文件名
 * @param {String} params.fileType - 文件类型
 * @param {String} params.category - 图片分类(avatar/post/other)
 * @returns {Promise} - 返回上传URL和图片ID
 */
export function getUploadUrl(params) {
  return request({
    url: '/api/image/upload/url',
    method: 'get',
    params
  })
}

/**
 * 获取用户头像URL(私有且可缓存)
 * @param {String} userId - 用户ID
 * @param {String} imageId - 图片ID
 * @returns {Promise} - 返回头像访问URL
 */
export function getUserAvatarUrl(userId, imageId) {
  return request({
    url: '/api/image/avatar',
    method: 'get',
    params: {
      userId,
      imageId
    }
  })
}

/**
 * 获取公共图片URL(帖子和页面图片)
 * @param {String} imageId - 图片ID
 * @returns {Promise} - 返回公共图片访问URL
 */
export function getPublicImageUrl(imageId) {
  return request({
    url: '/api/image/public',
    method: 'get',
    params: {
      imageId
    }
  })
}

/**
 * 获取图片预览信息
 * @param {String} imageId - 图片ID
 * @returns {Promise} - 返回图片预览所需信息
 */
export function getImagePreviewInfo(imageId) {
  return request({
    url: '/api/image/preview',
    method: 'get',
    params: {
      imageId
    }
  })
}

/**
 * 确认图片上传完成
 * @param {String} imageId - 图片ID
 * @returns {Promise}
 */
export function confirmImageUpload(imageId) {
  return request({
    url: '/api/image/confirm',
    method: 'post',
    data: {
      imageId
    }
  })
}