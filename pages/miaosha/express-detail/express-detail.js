var o=require("../../../api.js"),n=getApp();Page({data:{},onLoad:function(o){n.pageOnLoad(this),this.loadData(o)},loadData:function(a){var t=this;wx.showLoading({title:"正在加载"}),n.request({url:o.miaosha.express_detail,data:{order_id:a.id},success:function(o){wx.hideLoading(),0==o.code&&t.setData({data:o.data}),1==o.code&&wx.showModal({title:"提示",content:o.msg,showCancel:!1,success:function(o){o.confirm&&wx.navigateBack()}})}})},onReady:function(){},onShow:function(){},onHide:function(){},onUnload:function(){},onPullDownRefresh:function(){},onReachBottom:function(){}}); 
 			