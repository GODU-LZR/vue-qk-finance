/**
 * 图片管理工具
 * 用于处理图片URL的缓存和管理
 */

import { getUserAvatarUrl, getPublicImageUrl } from '@/api/imageService'

// 本地存储键名
const AVATAR_CACHE_KEY = 'avatar_cache'
const AVATAR_CACHE_EXPIRY = 'avatar_cache_expiry'
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24小时

/**
 * 图片管理器
 * 处理图片URL的获取、缓存和管理
 */
export default {
  /**
   * 获取用户头像URL(带缓存)
   * @param {String} userId - 用户ID
   * @param {String} imageId - 图片ID
   * @returns {Promise<String>} - 头像URL
   */
  async getUserAvatar(userId, imageId) {
    if (!userId || !imageId) return ''
    
    // 尝试从缓存获取
    const cachedUrl = this.getAvatarFromCache(userId, imageId)
    if (cachedUrl) return cachedUrl
    
    try {
      // 从服务器获取
      const response = await getUserAvatarUrl(userId, imageId)
      const avatarUrl = response.data.url
      
      // 缓存头像URL
      this.cacheAvatarUrl(userId, imageId, avatarUrl)
      
      return avatarUrl
    } catch (error) {
      console.error('获取用户头像失败:', error)
      return ''
    }
  },
  
  /**
   * 获取公共图片URL
   * @param {String} imageId - 图片ID
   * @returns {Promise<String>} - 图片URL
   */
  async getPublicImage(imageId) {
    if (!imageId) return ''
    
    try {
      const response = await getPublicImageUrl(imageId)
      return response.data.url
    } catch (error) {
      console.error('获取公共图片失败:', error)
      return ''
    }
  },
  
  /**
   * 从缓存获取头像URL
   * @param {String} userId - 用户ID
   * @param {String} imageId - 图片ID
   * @returns {String|null} - 缓存的头像URL或null
   */
  getAvatarFromCache(userId, imageId) {
    // 检查缓存是否过期
    const expiryData = JSON.parse(localStorage.getItem(AVATAR_CACHE_EXPIRY) || '{}')
    const now = Date.now()
    
    if (expiryData[userId] && expiryData[userId] < now) {
      // 缓存已过期，清除
      this.clearAvatarCache(userId)
      return null
    }
    
    // 获取缓存数据
    const cacheData = JSON.parse(localStorage.getItem(AVATAR_CACHE_KEY) || '{}')
    
    // 返回缓存的URL
    return cacheData[userId]?.[imageId] || null
  },
  
  /**
   * 缓存头像URL
   * @param {String} userId - 用户ID
   * @param {String} imageId - 图片ID
   * @param {String} url - 头像URL
   */
  cacheAvatarUrl(userId, imageId, url) {
    // 获取现有缓存
    const cacheData = JSON.parse(localStorage.getItem(AVATAR_CACHE_KEY) || '{}')
    const expiryData = JSON.parse(localStorage.getItem(AVATAR_CACHE_EXPIRY) || '{}')
    
    // 更新缓存
    if (!cacheData[userId]) cacheData[userId] = {}
    cacheData[userId][imageId] = url
    
    // 设置过期时间
    expiryData[userId] = Date.now() + CACHE_DURATION
    
    // 保存到本地存储
    localStorage.setItem(AVATAR_CACHE_KEY, JSON.stringify(cacheData))
    localStorage.setItem(AVATAR_CACHE_EXPIRY, JSON.stringify(expiryData))
  },
  
  /**
   * 清除用户头像缓存
   * @param {String} userId - 用户ID，不传则清除所有缓存
   */
  clearAvatarCache(userId) {
    if (userId) {
      // 清除特定用户的缓存
      const cacheData = JSON.parse(localStorage.getItem(AVATAR_CACHE_KEY) || '{}')
      const expiryData = JSON.parse(localStorage.getItem(AVATAR_CACHE_EXPIRY) || '{}')
      
      if (cacheData[userId]) delete cacheData[userId]
      if (expiryData[userId]) delete expiryData[userId]
      
      localStorage.setItem(AVATAR_CACHE_KEY, JSON.stringify(cacheData))
      localStorage.setItem(AVATAR_CACHE_EXPIRY, JSON.stringify(expiryData))
    } else {
      // 清除所有缓存
      localStorage.removeItem(AVATAR_CACHE_KEY)
      localStorage.removeItem(AVATAR_CACHE_EXPIRY)
    }
  }
}