<template>
    <view class="page-container">
        <view class="title">
            请输入需要删除的航班号
        </view>

        <!-- 步骤一：查找航班 -->
        <view class="input-section">
            <input type="text" class="input-field" v-model="numToDelete" placeholder="请输入航班号" :disabled="flightInfo !== null" />
            <button @click="findFlight" class="action-button find-button" :disabled="flightInfo !== null">查找航班</button>
        </view>

        <view class="divider" v-if="flightInfo"></view>

        <!-- 步骤二：显示找到的航班信息并确认删除 -->
        <view v-if="flightInfo" class="results-list">
            <view class="results-title">请确认航班信息：</view>
            <view class="flight-item">
                <view class="flight-row">
                    <text class="flight-num">航班号: {{ flightInfo.num }}</text>
                    <text class="flight-cost">价格: ¥{{ flightInfo.cost }}</text>
                </view>
                <view class="flight-row">
                    <text>路线: {{ flightInfo.fp }} → {{ flightInfo.tp }}</text>
                </view>
                 <view class="flight-row time-row">
                    <text>起飞: {{ flightInfo.start }}</text>
                    <text>落地: {{ flightInfo.end }}</text>
                </view>
            </view>
            
            <!-- 确认删除按钮 -->
            <button @click="confirmDelete" class="action-button delete-button">确认删除此航班</button>
        </view>
    </view>
</template>

<script>
    export default {
        data() {
            return {
                numToDelete: "", // 绑定的要删除的航班号
                flightInfo: null // 用于存储找到的航班信息
            }
        },
        methods: {
            // 步骤一：根据航班号查找航班
            findFlight() {
                const num = this.numToDelete.trim();
                if (!num) {
                    uni.showToast({ title: '请输入航班号', icon: 'none' });
                    return;
                }
                
                uni.showLoading({ title: '正在查找...' });
                uni.request({
                    url: getApp().globalData.baseUrl + '/flights',
                    method: 'GET',
                    success: (res) => {
                        if (res.statusCode === 200) {
                            const foundFlight = res.data.find(flight => flight.num === num);
                            if (foundFlight) {
                                this.flightInfo = foundFlight;
                                uni.showToast({ title: '查找成功', icon: 'success' });
                            } else {
                                uni.showToast({ title: '未找到该航班号', icon: 'error' });
                                this.flightInfo = null;
                            }
                        } else {
                             uni.showToast({ title: '获取数据失败', icon: 'error' });
                        }
                    },
                    fail: () => uni.showToast({ title: '网络错误', icon: 'error' }),
                    complete: () => uni.hideLoading()
                });
            },

            // 步骤二：弹出最终确认框
            confirmDelete() {
                if (!this.flightInfo) return;

                uni.showModal({
                    title: '最终确认',
                    content: `您确定要永久删除航班 ${this.flightInfo.num} 吗？`,
                    confirmColor: '#fa3534', // 确认按钮用红色警示
                    success: (res) => {
                        if (res.confirm) {
                            this.executeDelete();
                        }
                    }
                });
            },

            // 步骤三：执行真正的删除请求
            executeDelete() {
                uni.showLoading({ title: '正在删除...' });
                uni.request({
                    url: getApp().globalData.baseUrl + '/flights/' + this.flightInfo.num,
                    method: 'DELETE',
                    success: (res) => {
                        if (res.statusCode === 200) {
                            uni.showToast({ title: '删除成功！', icon: 'success' });
                            setTimeout(() => {
                                uni.navigateBack({ delta: 1 });
                            }, 1500);
                        } else {
                            uni.showToast({ title: `删除失败: ${res.data.message || '未知错误'}`, icon: 'error' });
                        }
                    },
                    fail: () => uni.showToast({ title: '网络错误', icon: 'error' }),
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
    color: white;
    width: 50%;
    height: 88rpx;
    line-height: 88rpx;
    margin: 40rpx auto 0;
    border-radius: 44rpx;
    font-size: 32rpx;
}
.find-button {
    background-color: #19be6b;
    width: 85%;
    margin-top: 10rpx;
}
.action-button[disabled] {
    background-color: #c8c9cc;
}
.delete-button {
    background-color: #fa3534; 
}
.divider {
    height: 2rpx;
    background-color: #e0e0e0;
    margin: 60rpx 0;
}
.results-list {
    margin-top: 20rpx;
}
.results-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 20rpx;
    padding-left: 10rpx;
    border-left: 8rpx solid #fa3534;
}
.flight-item {
    background-color: #ffffff;
    border-radius: 16rpx;
    padding: 24rpx;
    margin-bottom: 24rpx;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}
.flight-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16rpx;
    font-size: 28rpx;
    color: #555;
}
.flight-row:last-child {
    margin-bottom: 0;
}
.time-row {
    color: #888;
    font-size: 26rpx;
}
.flight-num {
    font-weight: bold;
    color: #333;
}
.flight-cost {
    font-weight: bold;
    color: #ff5500;
}
</style>
