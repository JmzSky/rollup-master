import {userConfig, appConfig, lottery, wxJsdkConfig, authorization, prizeList} from './api'
import {getItem, setItem, types} from './store'

const version = '1.0.0'
const dev = window.name === 'dev'
let events = []

window.addEventListener('message', function (event) {
  domReady(() => {
    events.forEach(fn => {
      let data = event.data.data;
      if(event.data.type=='update_page' && data){
        let result = getItem(types.userConfig)
        result.page[event.data.pageKey].data = data;
        setItem(types.userConfig, result)
      }
      if(event.data.type=='update_info' && data){
        let result = getItem(types.appConfig)
        Object.keys(data).forEach(function(key) {
          if(data[key]){
            result[key] = data[key];
          }
        })
        setItem(types.appConfig, result)
      }
      fn(event.data)
    })
  })
})

let domReady = function (callback) {
  if (document.readyState === "complete" ||
    (document.readyState !== "loading" && !document.documentElement.doScroll))
    setTimeout(function () {
      callback()
    }, 0)
  else {
    let handler = function () {
      document.removeEventListener("DOMContentLoaded", handler, false)
      window.removeEventListener("load", handler, false)
      callback()
    }
    document.addEventListener("DOMContentLoaded", handler, false)
    window.addEventListener("load", handler, false)
  }
}

let baseData = function () {
  return new Promise((resolve, reject) => {
    Promise.all([userConfig(), appConfig()]).then(values => {
      let shareData = values[1].wxShare
      wxShare(shareData)
      resolve({
        userConfig: values[0],
        appConfig: values[1]
      })
    }, reason => {
      reject(reason)
    })
  })
}

let wxLogin = function(){
  authorization().then(res=>{
    wxConfig()
  })
}

let wxConfig = function(){
  if(typeof wx == "undefined") return;
  wxJsdkConfig().then(res=>{
    wx.config(res);
  })
}

let wxShare = function(data){
  if(typeof wx == "undefined" || !data.shareActivity) return;
  let link = window.location.href
  wx.ready(function () {
      //自定义分享给朋友
      wx.updateAppMessageShareData({
          title: data.title,
          desc: data.desc,
          link: link,
          imgUrl: data.imgUrl,
          success: function () {}
      })
      //自定义分享到朋友圈
      wx.updateTimelineShareData({
          title: data.title,
          desc: data.desc,
          link: link,
          imgUrl: data.imgUrl,
          success: function () {}
      })
  });
}

const aiagain = {
  version,
  develop: dev,
  devUpdate (callback) {
    events.push(callback)
  },
  appConfig: baseData,
  userConfig,
  lottery,
  prizeList
}

if (window) {
  wxLogin()
  window['aiagain'] = aiagain
}

export default aiagain
