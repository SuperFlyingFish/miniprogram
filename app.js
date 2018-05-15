var e, t = require("./utils/utils.js"),
    a = require("./commons/order-pay/order-pay.js");
App({
    is_on_launch: !0,
    onLaunch: function() {
        this.setApi(), e = this.api, this.getNavigationBarColor(), console.log(wx.getSystemInfoSync()), this.getStoreData(), this.getCatList()
    },
    getStoreData: function() {
        var t = this;
        this.request({
            url: e.
            default.store,
            success: function(e) {
                0 == e.code && (wx.setStorageSync("store", e.data.store), wx.setStorageSync("store_name", e.data.store_name), wx.setStorageSync("show_customer_service", e.data.show_customer_service), wx.setStorageSync("contact_tel", e.data.contact_tel), wx.setStorageSync("share_setting", e.data.share_setting))
            },
            complete: function() {
                t.login()
            }
        })
    },
    getCatList: function() {
        this.request({
            url: e.
            default.cat_list,
            success: function(e) {
                if (0 == e.code) {
                    var t = e.data.list || [];
                    wx.setStorageSync("cat_list", t)
                }
            }
        })
    },
    login: function() {
        var a = getCurrentPages(),
            o = a[a.length - 1];
        wx.showLoading({
            title: "正在登录",
            mask: !0
        }), wx.login({
            success: function(a) {
                if (a.code) {
                    var n = a.code;
                    wx.getUserInfo({
                        success: function(a) {
                            getApp().request({
                                url: e.passport.login,
                                method: "post",
                                data: {
                                    code: n,
                                    user_info: a.rawData,
                                    encrypted_data: a.encryptedData,
                                    iv: a.iv,
                                    signature: a.signature
                                },
                                success: function(e) {
                                    if (wx.hideLoading(), 0 == e.code) {
                                        wx.setStorageSync("access_token", e.data.access_token), wx.setStorageSync("user_info", e.data);
                                        var a = getCurrentPages(),
                                            n = 0;
                                        if (a[0] && void 0 != a[0].options.user_id) n = a[0].options.user_id;
                                        else if (a[0] && void 0 != a[0].options.scene) n = a[0].options.scene;
                                        if (getApp().bindParent({
                                            parent_id: n || 0
                                        }), void 0 == o) return;
                                        var s = getApp().loginNoRefreshPage;
                                        for (var i in s) if (s[i] === o.route) return;
                                        wx.redirectTo({
                                            url: "/" + o.route + "?" + t.objectToUrlParams(o.options),
                                            fail: function() {
                                                wx.switchTab({
                                                    url: "/" + o.route
                                                })
                                            }
                                        })
                                    } else wx.showToast({
                                        title: e.msg
                                    })
                                }
                            })
                        },
                        fail: function(e) {
                            wx.hideLoading(), getApp().getauth({
                                content: "需要获取您的用户信息授权，请到小程序设置中打开授权",
                                cancel: !0,
                                success: function(e) {
                                    e && getApp().login()
                                }
                            })
                        }
                    })
                }
            }
        })
    },
    request: function(e) {
        e.data || (e.data = {});
        var t = wx.getStorageSync("access_token");
        t && (e.data.access_token = t), e.data._uniacid = this.siteInfo.uniacid, e.data._acid = this.siteInfo.acid, wx.request({
            url: e.url,
            header: e.header || {
                "content-type": "application/x-www-form-urlencoded"
            },
            data: e.data || {},
            method: e.method || "GET",
            dataType: e.dataType || "json",
            success: function(t) {
                -1 == t.data.code ? getApp().login() : e.success && e.success(t.data)
            },
            fail: function(t) {
                console.warn("--- request fail >>>"), console.warn(t), console.warn("<<< request fail ---");
                var a = getApp();
                a.is_on_launch ? (a.is_on_launch = !1, wx.showModal({
                    title: "网络请求出错",
                    content: t.errMsg,
                    showCancel: !1,
                    success: function(t) {
                        t.confirm && e.fail && e.fail(t)
                    }
                })) : (wx.showToast({
                    title: t.errMsg,
                    image: "/images/icon-warning.png"
                }), e.fail && e.fail(t))
            },
            complete: function(t) {
                200 != t.statusCode && (console.log("--- request http error >>>"), console.log(t.statusCode), console.log(t.data), console.log("<<< request http error ---")), e.complete && e.complete(t)
            }
        })
    },
    saveFormId: function(t) {
        this.request({
            url: e.user.save_form_id,
            data: {
                form_id: t
            }
        })
    },
    loginBindParent: function(e) {
        if ("" == wx.getStorageSync("access_token")) return !0;
        getApp().bindParent(e)
    },
    bindParent: function(t) {
        if ("undefined" != t.parent_id && 0 != t.parent_id) {
            console.log("Try To Bind Parent With User Id:" + t.parent_id);
            var a = wx.getStorageSync("user_info");
            wx.getStorageSync("share_setting").level > 0 && 0 != t.parent_id && getApp().request({
                url: e.share.bind_parent,
                data: {
                    parent_id: t.parent_id
                },
                success: function(e) {
                    0 == e.code && (a.parent = e.data, wx.setStorageSync("user_info", a))
                }
            })
        }
    },
    shareSendCoupon: function(t) {
        wx.showLoading({
            mask: !0
        }), t.hideGetCoupon || (t.hideGetCoupon = function(e) {
            var a = e.currentTarget.dataset.url || !1;
            t.setData({
                get_coupon_list: null
            }), a && wx.navigateTo({
                url: a
            })
        }), this.request({
            url: e.coupon.share_send,
            success: function(e) {
                0 == e.code && t.setData({
                    get_coupon_list: e.data.list
                })
            },
            complete: function() {
                wx.hideLoading()
            }
        })
    },
    getauth: function(e) {
        wx.showModal({
            title: "是否打开设置页面重新授权",
            content: e.content,
            confirmText: "去设置",
            success: function(t) {
                t.confirm ? wx.openSetting({
                    success: function(t) {
                        e.success && e.success(t)
                    },
                    fail: function(t) {
                        e.fail && e.fail(t)
                    },
                    complete: function(t) {
                        e.complete && e.complete(t)
                    }
                }) : e.cancel && getApp().getauth(e)
            }
        })
    },
    api: require("api.js"),
    setApi: function() {
        function e(a) {
            for (var o in a) "string" == typeof a[o] ? a[o] = a[o].replace("{$_api_root}", t) : a[o] = e(a[o]);
            return a
        }
        var t = this.siteInfo.siteroot;
        t = t.replace("app/index.php", ""), t += "addons/zjhj_mall/core/web/index.php?store_id=-1&r=api/", this.api = e(this.api);
        var a = this.api.
        default.index, o = a.substr(0, a.indexOf("/index.php"));
        this.webRoot = o
    },
    webRoot: null,
    siteInfo: require("siteinfo.js"),
    currentPage: null,
    pageOnLoad: function(e) {
        this.currentPage = e, console.log("--------pageOnLoad----------"), void 0 === e.openWxapp && (e.openWxapp = this.openWxapp), void 0 === e.showToast && (e.showToast = this.pageShowToast, console.log("--------pageShowToast----------")), this.setNavigationBarColor(), this.setPageNavbar(e);
        var t = this;
        this.currentPage.naveClick = function(e) {
            var a = this;
            t.navigatorClick(e, a)
        }, a.init(this.currentPage, t)
    },
    pageOnReady: function(e) {
        console.log("--------pageOnReady----------")
    },
    pageOnShow: function(e) {
        console.log("--------pageOnShow----------")
    },
    pageOnHide: function(e) {
        console.log("--------pageOnHide----------")
    },
    pageOnUnload: function(e) {
        console.log("--------pageOnUnload----------")
    },
    setPageNavbar: function(t) {
        function a(e) {
            var a = !1,
                o = t.route || t.__route__ || null;
            for (var n in e.navs) e.navs[n].url === "/" + o ? (e.navs[n].active = !0, a = !0) : e.navs[n].active = !1;
            a && t.setData({
                _navbar: e
            })
        }
        console.log("----setPageNavbar----"), console.log(t);
        var o = wx.getStorageSync("_navbar");
        o && a(o);
        var n = !1;
        for (var s in this.navbarPages) if (t.route == this.navbarPages[s]) {
            n = !0;
            break
        }
        n ? this.request({
            url: e.
            default.navbar,
            success: function(e) {
                0 == e.code && (a(e.data), wx.setStorageSync("_navbar", e.data))
            }
        }) : console.log("----setPageNavbar Return----")
    },
    getNavigationBarColor: function() {
        var t = this;
        t.request({
            url: e.
            default.navigation_bar_color,
            success: function(e) {
                0 == e.code && (wx.setStorageSync("_navigation_bar_color", e.data), t.setNavigationBarColor())
            }
        })
    },
    setNavigationBarColor: function() {
        var e = wx.getStorageSync("_navigation_bar_color");
        e && wx.setNavigationBarColor(e)
    },
    loginNoRefreshPage: ["pages/index/index", "mch/shop/shop"],
    navbarPages: ["pages/index/index", "pages/cat/cat", "pages/cart/cart", "pages/user/user", "pages/list/list", "pages/search/search", "pages/topic-list/topic-list", "pages/video/video-list", "pages/miaosha/miaosha", "pages/shop/shop", "pages/pt/index/index", "pages/book/index/index", "pages/share/index", "pages/quick-purchase/index/index"],
    openWxapp: function(e) {
        if (console.log("--openWxapp---"), e.currentTarget.dataset.url) {
            var t = e.currentTarget.dataset.url;
            (t = function(e) {
                var t = /([^&=]+)=([\w\W]*?)(&|$|#)/g,
                    a = /^[^\?]+\?([\w\W]+)$/.exec(e),
                    o = {};
                if (a && a[1]) for (var n, s = a[1]; null != (n = t.exec(s));) o[n[1]] = n[2];
                return o
            }(t)).path = t.path ? decodeURIComponent(t.path) : "", console.log("Open New App"), console.log(t), wx.navigateToMiniProgram({
                appId: t.appId,
                path: t.path,
                complete: function(e) {
                    console.log(e)
                }
            })
        }
    },
    pageShowToast: function(e) {
        console.log("--- pageToast ---");
        var t = this.currentPage,
            a = e.duration || 2500,
            o = e.title || "",
            n = (e.success, e.fail, e.complete || null);
        t._toast_timer && clearTimeout(t._toast_timer), t.setData({
            _toast: {
                title: o
            }
        }), t._toast_timer = setTimeout(function() {
            var e = t.data._toast;
            e.hide = !0, t.setData({
                _toast: e
            }), "function" == typeof n && n()
        }, a)
    },
    uploader: require("utils/uploader"),
    navigatorClick: function(e, t) {
        var a = e.currentTarget.dataset.open_type;
        if ("redirect" == a) return !0;
        if ("wxapp" == a) {
            var o = e.currentTarget.dataset.path;
            "/" != o.substr(0, 1) && (o = "/" + o), wx.navigateToMiniProgram({
                appId: e.currentTarget.dataset.appid,
                path: o,
                complete: function(e) {
                    console.log(e)
                }
            })
        }
        if ("tel" == a) {
            var n = e.currentTarget.dataset.tel;
            wx.makePhoneCall({
                phoneNumber: n
            })
        }
        return !1
    }
});