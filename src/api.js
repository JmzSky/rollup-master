import fetch from './fetch'
import {getItem, setItem, removeItem,types} from './store'

let filter = function (ajax, cacheType) {
  let result = null
  if (cacheType) {
    result = getItem(cacheType)
  }
  if (result) {
    return Promise.resolve(result)
  } else {
    return new Promise((resolve, reject) => {
      ajax.then(res => {
        let data = res.data.result
        if(cacheType) setItem(cacheType, data)
        resolve(data)
      }).catch(reject)
    })
  }
}

/**
 * 获取系统公共模板数据
 * @param {Object} params -参数
 * @returns {Promise<*>}
 */
export const userConfig = async function (params = {}) {
  let url = '/userConfig'
  return filter(fetch({url: url, method: 'get', params}), types.userConfig)
}

/**
 * 获取系统配置信息
 * @param {Object} params -参数
 * @returns {Promise<*>}
 */
export const appConfig = async function (params = {}) {
  let url = '/appConfig'
  return filter(fetch({url: url, method: 'get', params}), types.appConfig)
}

/**
 * 获取用户信息
 * @param {Object} params
 * @returns {*}
 */
export const userInfo = async function (params = {}) {
  let url = '/userInfo'
  return filter(fetch({url: url, method: 'get', params}), types.userInfo)
}

/**
 * 抽奖
 * @param params
 * @returns {Promise<*>}
 */
export const lottery = async function (params = {}) {
  let url = '/lottery'
  return filter(fetch({url: url, method: 'post', data:params}))
}

/**
 * 获取微信jsdk配置信息
 * @param params
 * @returns {Promise<*>}
 */
export const wxJsdkConfig = async function (params = {}) {
  let url = '/wxJsdk'
  return filter(fetch({url: url, method: 'get', params}))
}

/**
 * 获取用户奖品列表
 * @param params
 * @returns {Promise<*>}
 */
export const prizeList = async function (params = {}) {
  let url = '/prizeList'
  return filter(fetch({url: url, method: 'get', params}))
}

/**
 * 鉴权
 * @param {Object} params -参数
 * @returns {Promise<*>}
 */
export const authorization = async function (params = {}) {
  let url = '/authorization'
  return filter(fetch({url: url, method: 'get', params}), types.token)
}
