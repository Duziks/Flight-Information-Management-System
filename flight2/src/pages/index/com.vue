<template>
    <view class="page-container">
        <view class="title">
            航班信息列表
        </view>

        <!-- 策略选择区域 -->
        <view class="strategy-section">
            <view class="strategy-title">请选择排序策略：</view>
            <radio-group @change="strategyChange" class="radio-group">
                <!-- v-for 循环会根据 strategyItems 自动生成所有选项 -->
                <label v-for="item in strategyItems" :key="item.value" class="radio-label">
                    <radio :value="item.value" :checked="item.value === sortStrategy" color="#3858e6" />
                    <text>{{item.name}}</text>
                </label>
            </radio-group>
        </view>

        <button @click="sortFlights" class="action-button">按条件排序</button>

        <!-- 结果展示区域 -->
        <view class="results-list">
            <view class="results-title">
                航班列表 ({{ sortStrategy === 'cost' ? '按价格从低到高' : (sortStrategy === 'time' ? '按时间从短到长' : '按城市权重') }}排序)
            </view>
            
            <view v-if="flightList.length === 0" class="empty-list">
                暂无航班信息
            </view>
            
            <view v-else v-for="item in flightList" :key="item.num" class="flight-item">
                <view class="flight-row">
                    <text class="flight-num">航班号: {{ item.num }}</text>
                    <text class="flight-cost">价格: ¥{{ item.cost }}</text>
                </view>
                <view class="flight-row">
                    <text>路线: {{ item.fp }} → {{ item.tp }}</text>
                    <text>飞行时间: {{ item.time }}分钟</text>
                </view>
                <!-- [新增] 新增一行用于显示城市权重 -->
                <view class="flight-row weight-row">
                    <text class="city-weight">出发地权重: {{ cityWeights[item.fp] || 0 }}</text>
                    <text class="city-weight">目的地权重: {{ cityWeights[item.tp] || 0 }}</text>
                </view>
            </view>
        </view>
    </view>
</template>

<script>
// --- 可复用的堆排序函数 (用于时间和价格) ---
function HeapAdjust(h, s, m, key) {
    let j;
    let temp = h[s - 1];
    for (j = 2 * s; j <= m; j *= 2) {
        if (j < m && h[j - 1][key] < h[j][key]) {
            ++j;
        }
        if (temp[key] >= h[j - 1][key]) {
            break;
        }
        h[s - 1] = h[j - 1];
        s = j;
    }
    h[s - 1] = temp;
}

function HeapSort(arr, key) {
    const sortedArr = [...arr];
    const n = sortedArr.length;
    for (let i = Math.floor(n / 2); i > 0; --i) {
        HeapAdjust(sortedArr, i, n, key);
    }
    for (let i = n; i > 1; --i) {
        [sortedArr[i - 1], sortedArr[0]] = [sortedArr[0], sortedArr[i - 1]];
        HeapAdjust(sortedArr, 1, i - 1, key);
    }
    return sortedArr;
}
// ------------------------------------------

export default {
    data() {
        return {
            // 增加了新的排序选项
            strategyItems: [
                { value: 'time', name: '时间最短' },
                { value: 'cost', name: '花费最少' },
                { value: 'weight', name: '城市权重' }
            ],
            sortStrategy: 'time', 
            flightList: [], 
            // 新增：用于存储城市权重, 例如 {'北京': 100, '上海': 95}
            cityWeights: {} 
        }
    },
    onLoad() {
        // 页面加载时，获取所有需要的数据
        this.fetchInitialData();
    },
    methods: {
        // 封装的、用于获取所有初始数据的新方法
        async fetchInitialData() {
            uni.showLoading({ title: '正在加载...' });
            try {
                // 并行发起获取航班和城市权重的两个请求
                const [flightRes, cityRes] = await Promise.all([
                    uni.request({ url: getApp().globalData.baseUrl + '/flights' }),
                    uni.request({ url: getApp().globalData.baseUrl + '/cities' })
                ]);

                // 检查并处理航班数据
                if (flightRes.statusCode === 200) {
                    this.flightList = flightRes.data;
                } else {
                    throw new Error('获取航班数据失败');
                }

                // 检查并处理城市权重数据
                if (cityRes.statusCode === 200) {
                    // 将城市数组转换为 "城市名: 权重" 的对象格式，方便快速查找
                    const weights = {};
                    cityRes.data.forEach(city => {
                        weights[city.name] = city.weight;
                    });
                    this.cityWeights = weights;
                } else {
                    throw new Error('获取城市权重失败');
                }
            } catch (error) {
                uni.showToast({ title: error.message || '加载初始数据失败', icon: 'none' });
            } finally {
                uni.hideLoading();
            }
        },
        // 监听单选按钮的变化
        strategyChange(evt) {
            this.sortStrategy = evt.detail.value;
        },
        // 点击按钮时执行排序
        sortFlights() {
            if (!this.flightList || this.flightList.length === 0) {
                uni.showToast({ title: '没有可排序的数据', icon: 'none' });
                return;
            }
            
            // 根据选择的策略执行不同的排序逻辑
            if (this.sortStrategy === 'weight') {
                // --- 按城市权重排序的特殊逻辑 ---
                this.flightList.sort((a, b) => {
                    // 获取 a 和 b 航班的出发地和目的地权重，如果城市不存在于权重表里，则默认为0
                    const a_fp_weight = this.cityWeights[a.fp] || 0;
                    const b_fp_weight = this.cityWeights[b.fp] || 0;
                    const a_tp_weight = this.cityWeights[a.tp] || 0;
                    const b_tp_weight = this.cityWeights[b.tp] || 0;

                    // 规则1: 先按出发地权重，从大到小排序
                    if (a_fp_weight !== b_fp_weight) {
                        return b_fp_weight - a_fp_weight;
                    }
                    
                    // 规则2: 如果出发地权重相等，再按目的地权重，从大到小排序
                    return b_tp_weight - a_tp_weight;
                });
            } else {
                // --- 原有的按时间和价格排序逻辑（使用堆排序） ---
                this.flightList = HeapSort(this.flightList, this.sortStrategy);
            }

            uni.showToast({
                title: '排序完成！',
                icon: 'success'
            });
        }
    }
}
</script>

<style>
/* 样式部分保持不变 */
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
.strategy-section {
    margin-bottom: 40rpx;
    background-color: #fff;
    padding: 20rpx;
    border-radius: 16rpx;
}
.strategy-title {
    font-size: 30rpx;
    color: #555;
    margin-bottom: 20rpx;
}
.radio-group {
    display: flex;
    justify-content: space-around;
}
.radio-label {
    display: flex;
    align-items: center;
    font-size: 30rpx;
}
.action-button {
    background-color: #3858e6;
    color: white;
    width: 50%;
    height: 88rpx;
    line-height: 88rpx;
    margin: 40rpx auto;
    border-radius: 44rpx;
    font-size: 32rpx;
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
    padding: 40rpx;
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
    margin-bottom: 12rpx;
    font-size: 28rpx;
    color: #555;
}
.flight-row:last-child {
    margin-bottom: 0;
}
.flight-num {
    font-weight: bold;
    color: #333;
}
.flight-cost {
    font-weight: bold;
    color: #ff5500;
}
/* [新增] 城市权重行的样式 */
.weight-row {
    margin-top: 16rpx;
    padding-top: 12rpx;
    border-top: 1rpx solid #f0f0f0;
}
.city-weight {
    font-size: 26rpx;
    color: #888;
}
</style>
