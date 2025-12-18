<template>
    <view class="page-container">
        <view class="title">
            查询直达航班
        </view>
        <view class="input-section">
            <input type="text" class="input-field" v-model="fp" placeholder="请输入出发地" />
            <input type="text" class="input-field" v-model="tp" placeholder="请输入目的地" />
        </view>
        <button @click="searchFlights" class="action-button">立即查询</button>
        <button @click="resetSearch" class="action-button reset-button">显示全部</button>

        <!-- 结果展示区域 -->
        <view class="results-list">
            <view class="results-title">
                航班信息 (默认按城市权重排序)
            </view>
            
            <!-- 如果列表为空，显示提示 -->
            <view v-if="displayFlights.length === 0" class="empty-list">
                暂无航班信息，或请尝试不同查询条件
            </view>

            <view v-else v-for="item in displayFlights" :key="item.num" class="flight-item">
                <view class="flight-row">
                    <text class="flight-num">航班号: {{ item.num }}</text>
                    <text class="flight-cost">价格: ¥{{ item.cost }}</text>
                </view>
                <view class="flight-row">
                    <text>路线: {{ item.fp }} → {{ item.tp }}</text>
                </view>
                 <view class="flight-row time-row">
                    <text>起飞: {{ item.start }}</text>
                    <text>落地: {{ item.end }}</text>
                </view>
            </view>
        </view>
    </view>
</template>

<script>
    export default {
        data() {
            return {
                fp: "", // 绑定的出发地
                tp: "", // 绑定的目的地
                allFlights: [], // 存储从后端获取的完整航班列表
                displayFlights: [], // 在页面上实际显示的航班列表
                cityWeights: {} // 新增：用于存储城市权重
            }
        },
        // 页面加载时自动执行
        onLoad() {
            this.fetchInitialData();
        },
        methods: {
            // [新] 获取所有初始数据（航班+城市权重）
            async fetchInitialData() {
                uni.showLoading({ title: '加载中...' });
                try {
                    const [flightRes, cityRes] = await Promise.all([
                        uni.request({ url: getApp().globalData.baseUrl + '/flights' }),
                        uni.request({ url: getApp().globalData.baseUrl + '/cities' })
                    ]);

                    if (flightRes.statusCode !== 200) throw new Error('获取航班数据失败');
                    if (cityRes.statusCode !== 200) throw new Error('获取城市权重失败');

                    // 处理城市权重数据
                    const weights = {};
                    cityRes.data.forEach(city => {
                        weights[city.name] = city.weight;
                    });
                    this.cityWeights = weights;

                    // 处理并排序航班数据
                    this.allFlights = flightRes.data;
                    // 默认就按城市权重排序
                    this.displayFlights = this.sortListByWeight(this.allFlights); 

                } catch (error) {
                    uni.showToast({ title: error.message || '加载初始数据失败', icon: 'none' });
                } finally {
                    uni.hideLoading();
                }
            },
            sortListByWeight(list) {
                const sortedList = [...list]; // 创建副本以避免修改原始数组
                sortedList.sort((a, b) => {
                    const a_fp_weight = this.cityWeights[a.fp] || 0;
                    const b_fp_weight = this.cityWeights[b.fp] || 0;
                    const a_tp_weight = this.cityWeights[a.tp] || 0;
                    const b_tp_weight = this.cityWeights[b.tp] || 0;

                    // 先按出发地权重，从大到小排序
                    if (a_fp_weight !== b_fp_weight) {
                        return b_fp_weight - a_fp_weight;
                    }
                    // 如果出发地权重相等，再按目的地权重，从大到小排序
                    return b_tp_weight - a_tp_weight;
                });
                return sortedList;
            },
            // 执行筛选
            searchFlights() {
                const departure = this.fp.trim();
                const destination = this.tp.trim();

                if (!departure || !destination) {
                    uni.showToast({ title: '请输入出发地和目的地', icon: 'none' });
                    return;
                }

                const filteredFlights = this.allFlights.filter(flight => {
                    return flight.fp === departure && flight.tp === destination;
                });
                
                this.displayFlights = this.sortListByWeight(filteredFlights);
                
                if (filteredFlights.length === 0) {
                    uni.showToast({ title: '未找到相关航班', icon: 'none' });
                } else {
                    uni.showToast({ title: `为您找到 ${filteredFlights.length} 条航班`, icon: 'success' });
                }
            },
            resetSearch() {
                this.fp = "";
                this.tp = "";
                this.displayFlights = this.sortListByWeight(this.allFlights);
                uni.showToast({ title: '已显示全部航班', icon: 'none' });
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
    gap: 20rpx;
    align-items: center;
    margin-bottom: 20rpx;
}
.input-field {
    width: 80%;
    height: 80rpx;
    background-color: #ffffff;
    border: 1rpx solid #e0e0e0;
    border-radius: 16rpx;
    padding: 0 40rpx;
    font-size: 30rpx;
}
.action-button {
    background-color: #3858e6;
    color: white;
    width: 85%;
    height: 88rpx;
    line-height: 88rpx;
    margin: 20rpx auto 0;
    border-radius: 44rpx;
    font-size: 32rpx;
}
.reset-button {
    background-color: #6c757d;
}
.results-list {
    margin-top: 50rpx;
}
.results-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 20rpx;
    padding-left: 10rpx;
    border-left: 8rpx solid #3858e6;
}
.empty-list {
    text-align: center;
    color: #999;
    padding: 60rpx;
    background-color: #fff;
    border-radius: 16rpx;
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
