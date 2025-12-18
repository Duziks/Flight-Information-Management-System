<template>
    <view class="page-container">
        <view class="title">
            请输入出发地和目的地
        </view>
        
        <!-- 输入区域 -->
        <view class="input-section">
            <input type="text" class="input-field" v-model="fp" placeholder="出发地" />
            <input type="text" class="input-field" v-model="tp" placeholder="目的地" />
        </view>

        <!-- 移除了策略选择区域 -->

        <button @click="findPath" class="action-button">查询花费最少的方案</button>
        
        <!-- 结果展示区域 -->
        <view class="results-list" v-if="pathResult.length > 0">
            <view class="results-title">
                为您推荐的最佳行程 (花费最少)
            </view>
            <view v-for="(item, index) in pathResult" :key="item.num" class="flight-item">
                <view class="step-indicator">第 {{ index + 1 }} 段</view>
                <view class="flight-row">
                    <text class="flight-num">航班号: {{ item.num }}</text>
                    <text class="flight-cost">价格: ¥{{ item.cost }}</text>
                </view>
                <view class="flight-row">
                    <text>路线: {{ item.fp }} → {{ item.tp }}</text>
                    <text>飞行时间: {{ item.time }}分钟</text>
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
// --- 模块化辅助函数 ---

/**
 * 根据航班数据构建图的邻接表和所有节点
 */
function buildGraph(flights) {
    const adjList = {};
    const nodes = new Set();
    flights.forEach(flight => {
        nodes.add(flight.fp);
        nodes.add(flight.tp);
        if (!adjList[flight.fp]) {
            adjList[flight.fp] = [];
        }
        adjList[flight.fp].push(flight);
    });
    return { adjList, nodes };
}

/**
 * 解析 "周X:HH:MM" 格式的时间字符串为总分钟数
 */
function parseTime(timeString) {
    const dayMap = { "周一": 0, "周二": 1, "周三": 2, "周四": 3, "周五": 4, "周六": 5, "周日": 6 };
    const parts = timeString.split(':');
    if (parts.length !== 3) return null;
    const dayStr = parts[0];
    const hour = parseInt(parts[1], 10);
    const minute = parseInt(parts[2], 10);
    if (dayMap[dayStr] === undefined || isNaN(hour) || isNaN(minute)) return null;
    const dayIndex = dayMap[dayStr];
    return (dayIndex * 24 * 60) + (hour * 60) + minute;
}


/**
 * Dijkstra算法，寻找花费最少的路径，并遵守严格的时间顺序
 */
function findCheapestPathWithTimeConstraint(adjList, nodes, startNode, endNode) {
    const distances = {}; // 存储 { cost: number, arrivalTime: number }
    const prev = {};
    const pq = new Set(nodes);

    nodes.forEach(node => {
        distances[node] = { cost: Infinity, arrivalTime: Infinity };
        prev[node] = null;
    });
    
    // 起始点的花费为0，到达时间为0（作为计算基准）
    distances[startNode] = { cost: 0, arrivalTime: 0 };

    while (pq.size > 0) {
        let u = null;
        // 在未访问的节点中找到花费最小的那个
        pq.forEach(vertex => {
            if (u === null || distances[vertex].cost < distances[u].cost) {
                u = vertex;
            }
        });
        
        pq.delete(u);

        if (u === endNode) break; // 已找到终点，可以提前结束

        // 检查当前城市是否有出港航班
        if (adjList[u]) {
            adjList[u].forEach(flight => {
                const v = flight.tp; // 下一个城市
                const arrivalTimeAtU = distances[u].arrivalTime;
                const startTimeOfNextFlight = parseTime(flight.start);
                
                // [核心约束]：下一趟航班的起飞时间必须严格晚于当前城市的到达时间
                if (startTimeOfNextFlight > arrivalTimeAtU) {
                    const newCost = distances[u].cost + flight.cost;
                    
                    // 如果找到了更便宜的路径，则更新
                    if (newCost < distances[v].cost) {
                        distances[v].cost = newCost;
                        distances[v].arrivalTime = parseTime(flight.end);
                        prev[v] = { prevCity: u, flight: flight };
                    }
                }
            });
        }
    }

    // 如果无法到达终点，返回空数组
    if (prev[endNode] === null) return [];

    const path = [];
    let current = endNode;
    while (current && prev[current]) {
        path.unshift(prev[current].flight);
        current = prev[current].prevCity;
    }
    return path;
}


export default {
    data() {
        return {
            fp: '',
            tp: '',
            pathResult: []
        }
    },
    methods: {
        findPath() {
            const departureCity = this.fp.trim();
            const destinationCity = this.tp.trim();

            if (!departureCity || !destinationCity) {
                uni.showToast({ title: '请输入出发地和目的地', icon: 'none' });
                return;
            }
            
            uni.showLoading({ title: '正在计算中...' });

            uni.request({
                url: getApp().globalData.baseUrl + '/flights',
                method: 'GET',
                success: (res) => {
                    if (res.statusCode === 200) {
                        const allFlights = res.data;
                        if (!allFlights || allFlights.length === 0) {
                            uni.showToast({ title: '没有航班数据', icon: 'none' });
                            return;
                        }

                        const { adjList, nodes } = buildGraph(allFlights);
                        
                        // 调用带有严格时间约束的寻路算法
                        this.pathResult = findCheapestPathWithTimeConstraint(
                            adjList,
                            nodes,
                            departureCity,
                            destinationCity
                        );

                        if (this.pathResult.length > 0) {
                            uni.showToast({ title: '查询成功！', icon: 'success' });
                        } else {
                            uni.showToast({ title: '未找到符合条件的中转方案', icon: 'none' });
                        }
                    } else {
                        uni.showToast({ title: '获取航班数据失败', icon: 'error' });
                    }
                },
                fail: (err) => {
                    uni.showToast({ title: '网络连接错误', icon: 'error' });
                },
                complete: () => {
                    uni.hideLoading();
                }
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
    justify-content: space-between;
    gap: 20rpx;
    margin-bottom: 40rpx;
}
.input-field {
    flex: 1;
    height: 80rpx;
    background-color: #ffffff;
    border: 1rpx solid #e0e0e0;
    border-radius: 16rpx;
    padding: 0 20rpx;
    font-size: 30rpx;
}
.action-button {
    background-color: #3858e6;
    color: white;
    height: 88rpx;
    line-height: 88rpx;
    border-radius: 44rpx;
    font-size: 32rpx;
    margin-top: 20rpx;
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
.flight-item {
    background-color: #ffffff;
    border-radius: 16rpx;
    padding: 24rpx;
    margin-bottom: 24rpx;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}
.step-indicator {
    font-size: 24rpx;
    font-weight: bold;
    color: #3858e6;
    margin-bottom: 16rpx;
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
.time-row {
    color: #888;
    font-size: 26rpx;
}
</style>
