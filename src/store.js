/**
 * 存储KEY
 * @type {{userInfo: string}}
 * @Public
 */
const types = {
  token: 'TOKEN',
  userInfo: 'USER_INFO',
  appConfig: 'APP_CONFIG',
  userConfig: 'USER_CONFIG',
  wxConfig: 'WX_CONFIG'
}

/**
 * 存储KEY
 * @type {string}
 * @private
 */
const StorageKey = 'AIAGAIN_JSDK2019062613'
/**
 * 内存存储
 * @type {{}}
 * @private
 */
let memory = {}
/**
 * 存储类型
 * @type {{memory: number, session: number, local: number}}
 * @private
 */
let cacheType = {
  memory: 1,
  session: 2,
  local: 3
}

/**
 * 存储类型配置
 * @type {{}}
 * @private
 */
let config = {
  [types.token]: {
    cacheType: cacheType.session
  },
  [types.userInfo]: {
    cacheType: cacheType.session
  },
  [types.userConfig]: {
    cacheType: cacheType.session
  },
  [types.appConfig]: {
    cacheType: cacheType.session
  },
  [types.wxConfig]: {
    cacheType: cacheType.session
  }
}
/**
 * 判断是否过期
 * @param value
 * @returns {boolean}
 */
let computeExpires =  function (value) {
  let res = typeof value === 'object'
  if (res) {
    let expires = value.expires
    if (expires && new Date(expires) > new Date()) {
      res = false
    }
  }
  return res
}
/**
 * 读取存储信息
 * @param {Object} storage -存储类型 sessionStorage或 localStorage
 * @returns {function(*): *}
 * @private
 */
let winGetItem = function (storage) {
  return key => {
    let cache = storage['getItem'](StorageKey) || '{}'
    cache = JSON.parse(cache)
    let res = null
    if (computeExpires(cache[key])) {
      res = cache[key]['val'] || null
    } else {
      delete cache[key]
      storage['setItem'](StorageKey, JSON.stringify(cache))
    }
    return res
  }
}
/**
 * 写入存储信息
 * @param {Object} storage -存储类型 sessionStorage或 localStorage
 * @returns {Function}
 * @private
 */
let winSetItem = function (storage) {
  /**
   * @param {String} key -存储key,来源 types
   * @param {*} value -存储值
   * @param {Number|Date|null} [expires=null] -过期时间,可以是秒,指定日期,null永久有效
   */
  return (key, value, expires = null) => {
    let cache = storage['getItem'](StorageKey) || '{}'
    cache = JSON.parse(cache)

    if (typeof expires === 'number') {
      let date = Date.now()
      expires = new Date(parseInt(date.getTime() + expires * 1000))
    } else if (!expires instanceof Date) {
      expires = null
    }
    cache[key] = {
      val: value,
      expires: expires
    }
    storage['setItem'](StorageKey, JSON.stringify(cache))
  }
}
/**
 * 删除存储信息
 * @param {Object} storage -存储类型 sessionStorage或 localStorage
 * @returns {Function}
 * @private
 */
let winRemoveItem = function (storage) {
  /**
   * @param {String} key -存储key,来源 types
   */
  return (key) => {
    let cache = storage['getItem'](StorageKey) || '{}'
    cache = JSON.parse(cache)
    delete cache[key]
    storage['setItem'](StorageKey, JSON.stringify(cache))
  }
}
/**
 * 创建通用存储方法
 * @param storage
 * @returns {{removeItem: *, getItem: (function(*): *), setItem: *}}
 */
let createStore = function (storage) {
  return {
    getItem: winGetItem(storage),
    setItem: winSetItem(storage),
    removeItem: winRemoveItem(storage)
  }
}


/**
 * 存储方法
 * @type {{}}
 * @private
 */
let Cache = {
  /**
   * 内存存储
   */
  [cacheType.memory]: {
    getItem (key) {
      let res = null
      if (computeExpires(memory[key])) {
        res = memory[key].val
      }
      return res
    },
    setItem (key, value, expires = null) {
      if (typeof expires === 'number') {
        let date = Date.now()
        expires = new Date(parseInt(date.getTime() + expires * 1000))
      } else if (!expires instanceof Date) {
        expires = null
      }
      memory[key] = {
        val: value,
        expires: expires
      }
    },
    removeItem (key) {
      delete memory[key]
    }
  },
  /**
   * session存储
   */
  [cacheType.session]: createStore(window.sessionStorage),
  /**
   * 本地存储
   */
  [cacheType.local]: createStore(window.localStorage)
}

/**
 * 获取存储信息
 * @param key
 * @returns {*|SVGPoint|SVGTransform|SVGNumber|string|SVGLength|SVGPathSeg}
 * @public
 */
export const getItem = function (key) {
  let _config = config[key]
  if (!_config) {
    throw new Error(`can not find the ${key}.`)
  } else {
    return Cache[_config.cacheType].getItem(key)
  }
}
/**
 * 写入存储信息
 * @param key
 * @param value
 * @returns {*|void}
 * @public
 */
export const setItem = function (key, value) {
  let _config = config[key]
  if (!_config) {
    throw new Error(`can not find the ${key}.`)
  } else {
    return Cache[_config.cacheType].setItem(key, value)
  }
}


/**
 * 移除存储信息
 * @param {String} key -key
 * @returns {*|void}
 * @public
 */
export const removeItem = function (key) {
  let _config = config[key]
  if (!_config) {
    throw new Error(`can not find the ${key}.`)
  } else {
    return Cache[_config.cacheType].removeItem(key)
  }
}

export { types }
