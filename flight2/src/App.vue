<script>
export default {
    globalData: {
        // 定义后端服务器的基础 URL 地址
        baseUrl: "http://localhost:3000",
        // 航班数据初始化为空数组，将从后端接口动态获取
        ifo: [],
        // 用于存储从后端获取的 token 和其他用户信息
        token: "",
        unitid: "",
        username: "",
    },
    onLaunch: function() {
        console.log('App Launch: 应用启动');
        
        /*
         * 注意：以下登录请求已被暂时注释掉。
         * 原因是我们的后端服务器 (server.js) 并未实现 /auth/oauth/token 这个接口。
         * 直接请求会导致 404 Not Found 错误，并可能中断后续的程序执行。
         * 如果未来后端实现了此登录功能，可以取消此处的注释。
        
        const baseUrl = this.globalData.baseUrl;
        const loginUrl = baseUrl + '/auth/oauth/token?password=123456&grant_type=id_num_pwd&client_id=elevator-admin-app&client_secret=123456&idNum=330303194805121888&unitType=监管单位';

        uni.request({
            url: loginUrl,
            method: 'POST',
            header: {
                'Authorization': 'Basic ZWxldmF0b3ItYWRtaW4tYXBwOjEyMzQ1Ng=='
            },
            success: (res) => {
                console.log('登录请求返回:', res);
                if (res.statusCode === 200 && res.data && res.data.data) {
                    console.log("获取 token 成功！");
                    this.globalData.token = res.data.data.access_token;
                    this.globalData.unitid = res.data.data.unitId;
                    this.globalData.username = res.data.data.username;
                    uni.setStorageSync('token', res.data.data.access_token);
                } else {
                    console.error(`获取 token 失败，状态码: ${res.statusCode}, 错误信息: ${res.data.message || '无'}`);
                }
            },
            fail: (err) => {
                console.error("登录请求网络错误！", err);
                uni.showToast({
                    title: '网络连接失败',
                    icon: 'error'
                });
            }
        });
        */
    },
    onShow: function() {
        console.log('App Show: 应用显示到前台');
    },
    onHide: function() {
        console.log('App Hide: 应用隐藏到后台');
    }
}
</script>

<style>
    /* 每个页面公共css */
    /* 您可以在这里定义全局样式，例如统一的背景色、字体等 */
    page {
        background-color: #f7f8fa;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
    }
</style>
