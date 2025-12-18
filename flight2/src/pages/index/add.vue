<template>
    <view class="page-container">
        <!-- 模式切换 -->
        <view class="mode-switcher">
            <view :class="['mode-tab', mode === 'flight' ? 'active' : '']" @click="switchMode('flight')">添加航班</view>
            <view :class="['mode-tab', mode === 'city' ? 'active' : '']" @click="switchMode('city')">添加城市</view>
        </view>

        <!-- 添加航班的表单 -->
        <view v-if="mode === 'flight'">
            <view class="title">请录入新的航班信息</view>
            <view class="input-section">
                <input type="text" class="input-field" v-model="flightForm.num" placeholder="请输入航班号" />
                <input type="text" class="input-field" v-model="flightForm.fp" placeholder="请输入出发地" />
                <input type="text" class="input-field" v-model="flightForm.tp" placeholder="请输入目的地" />
                <!-- [修改] 更新了 placeholder -->
                <input type="text" class="input-field" v-model="flightForm.start" placeholder="起飞时间 (格式: 周一:08:30)" />
                <input type="text" class="input-field" v-model="flightForm.end" placeholder="落地时间 (格式: 周日:22:00)" />
                <input type="number" class="input-field" v-model="flightForm.cost" placeholder="请输入价格" />
            </view>
            <button @click="saveFlight" class="action-button">保存航班信息</button>
        </view>

        <!-- 添加城市的表单 -->
        <view v-if="mode === 'city'">
            <view class="title">请录入新的城市信息</view>
            <view class="input-section">
                <input type="text" class="input-field" v-model="cityForm.name" placeholder="请输入城市名称" />
                <input type="number" class="input-field" v-model="cityForm.weight" placeholder="请输入城市权重 (数字)" />
            </view>
            <button @click="saveCity" class="action-button">保存城市信息</button>
        </view>
    </view>
</template>

<script>
    // [新增] 辅助函数，用于解析新的时间格式
    /**
     * 解析 "周X:HH:MM" 格式的时间字符串
     * @param {string} timeString - 例如 "周一:08:30"
     * @returns {number|null} - 从周一0点开始的总分钟数，或在格式错误时返回 null
     */
    function parseTime(timeString) {
        const dayMap = { "周一": 0, "周二": 1, "周三": 2, "周四": 3, "周五": 4, "周六": 5, "周日": 6 };
        const parts = timeString.split(':');
        
        if (parts.length !== 3) return null;

        const dayStr = parts[0];
        const hour = parseInt(parts[1], 10);
        const minute = parseInt(parts[2], 10);

        if (dayMap[dayStr] === undefined || isNaN(hour) || isNaN(minute)) {
            return null;
        }

        const dayIndex = dayMap[dayStr];
        return (dayIndex * 24 * 60) + (hour * 60) + minute;
    }


    export default {
        data() {
            return {
                mode: 'flight',
                flightForm: {
                    cost: null,
                    num: "",
                    start: "",
                    end: "",
                    tp: "",
                    fp: "",
                },
                cityForm: {
                    name: "",
                    weight: null
                },
                existingCities: []
            }
        },
        onLoad() {
            this.fetchCities();
        },
        methods: {
            switchMode(newMode) {
                this.mode = newMode;
            },
            async fetchCities() {
                try {
                    const res = await uni.request({ url: getApp().globalData.baseUrl + '/cities' });
                    if (res.statusCode === 200) {
                        this.existingCities = res.data.map(city => city.name);
                    }
                } catch (e) {
                    console.error("获取城市列表失败", e);
                }
            },
            saveFlight() {
                const form = this.flightForm;
                // --- 1. 输入验证 ---
                if (!form.num || !form.fp || !form.tp || !form.start || !form.end || !form.cost) {
                    uni.showToast({ title: '请填写所有航班信息', icon: 'none' });
                    return;
                }
                if (!this.existingCities.includes(form.fp.trim()) || !this.existingCities.includes(form.tp.trim())) {
                    uni.showToast({ title: '出发地或目的地不存在，请先添加城市', icon: 'none' });
                    return;
                }
                
                // [修改] 更新时间格式的正则表达式
                const timeRegex = /^周[一二三四五六日]:\d{1,2}:\d{2}$/;
                if (!timeRegex.test(form.start.trim()) || !timeRegex.test(form.end.trim())) {
                    uni.showToast({ title: '时间格式不正确 (应为 周X:HH:MM)', icon: 'none' });
                    return;
                }

                // --- 2. 计算飞行时间 ---
                let flightDuration = 0;
                try {
                    let startTimeInMinutes = parseTime(form.start.trim());
                    let endTimeInMinutes = parseTime(form.end.trim());

                    // 处理跨周的情况 (例如：周日 -> 周一)
                    if (endTimeInMinutes < startTimeInMinutes) {
                        endTimeInMinutes += 7 * 24 * 60; // 增加一周的分钟数
                    }

                    flightDuration = endTimeInMinutes - startTimeInMinutes;

                } catch(e) {
                    uni.showToast({ title: '时间计算出错，请检查格式', icon: 'none' });
                    return;
                }

                // --- 3. 构造新的航班对象 ---
                const newFlight = {
                    num: form.num.trim(),
                    start: form.start.trim(),
                    end: form.end.trim(),
                    cost: parseInt(form.cost),
                    fp: form.fp.trim(),
                    tp: form.tp.trim(),
                    time: flightDuration
                };

                // --- 4. 发送 POST 请求到后端 ---
                uni.showLoading({ title: '正在保存...' });
                uni.request({
                    url: getApp().globalData.baseUrl + '/flights',
                    method: 'POST',
                    data: newFlight,
                    success: (res) => {
                        if (res.statusCode === 201) {
                            uni.showModal({
                                title: '保存成功',
                                content: `航班 ${newFlight.num} 已成功添加。`,
                                showCancel: false,
                                success: (modalRes) => {
                                    if (modalRes.confirm) uni.navigateBack({ delta: 1 });
                                }
                            });
                        } else {
                            uni.showToast({ title: `保存失败: ${res.data.message || '未知错误'}`, icon: 'error' });
                        }
                    },
                    fail: (err) => {
                        uni.showToast({ title: '网络连接错误，请重试', icon: 'error' });
                    },
                    complete: () => uni.hideLoading()
                });
            },
            saveCity() {
                const form = this.cityForm;
                if (!form.name || form.weight === null) {
                    uni.showToast({ title: '请输入城市名称和权重', icon: 'none' });
                    return;
                }

                uni.showLoading({ title: '正在保存...' });
                uni.request({
                    url: getApp().globalData.baseUrl + '/cities',
                    method: 'POST',
                    data: {
                        name: form.name.trim(),
                        weight: parseInt(form.weight)
                    },
                    success: (res) => {
                        if (res.statusCode === 201) {
                            uni.showToast({ title: '城市添加成功！', icon: 'success' });
                            this.cityForm.name = "";
                            this.cityForm.weight = null;
                            this.fetchCities(); 
                        } else {
                            uni.showToast({ title: `保存失败: ${res.data.message || '未知错误'}`, icon: 'error' });
                        }
                    },
                    fail: (err) => {
                        uni.showToast({ title: '网络连接错误，请重试', icon: 'error' });
                    },
                    complete: () => uni.hideLoading()
                });
            }
        }
    }
</script>

<style>
.page-container {
    padding: 30rpx;
    background-color: #f7f8fa;
    min-height: 100vh;
}
.title {
    font-size: 36rpx;
    text-align: center;
    color: #333;
    font-weight: bold;
    margin-bottom: 40rpx;
}
.input-section {
    display: flex;
    flex-direction: column;
    gap: 24rpx;
    align-items: center;
    margin-bottom: 40rpx;
}
.input-field {
    width: 85%;
    height: 88rpx;
    background-color: #ffffff;
    border: 1rpx solid #e0e0e0;
    border-radius: 16rpx;
    padding: 0 40rpx;
    font-size: 30rpx;
}
.action-button {
    background-color: #3858e6;
    color: white;
    width: 50%;
    height: 88rpx;
    line-height: 88rpx;
    margin: 60rpx auto 0;
    border-radius: 44rpx;
    font-size: 32rpx;
}
.mode-switcher {
    display: flex;
    justify-content: center;
    margin-bottom: 40rpx;
    background-color: #e9ecef;
    border-radius: 44rpx;
    padding: 8rpx;
}
.mode-tab {
    flex: 1;
    text-align: center;
    padding: 16rpx 0;
    font-size: 30rpx;
    color: #555;
    border-radius: 36rpx;
    transition: all 0.3s ease;
}
.mode-tab.active {
    background-color: #ffffff;
    color: #3858e6;
    font-weight: bold;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}
</style>
