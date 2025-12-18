<template>
    <view class="page-container">
        <view class="title">
            请修改航班信息
        </view>
        
        <!-- 步骤一：查找航班 -->
        <view class="input-section">
            <input type="text" class="input-field" v-model="numToFind" placeholder="请输入要修改的航班号" :disabled="flightToEdit !== null" />
            <button @click="findFlight" class="action-button find-button" :disabled="flightToEdit !== null">查找航班</button>
        </view>

        <view class="divider" v-if="flightToEdit"></view>

        <!-- 步骤二：修改信息 (找到航班后显示) -->
        <view v-if="flightToEdit" class="edit-form">
            <view class="input-section">
                <input type="text" class="input-field" v-model="flightToEdit.fp" placeholder="出发地" />
                <input type="text" class="input-field" v-model="flightToEdit.tp" placeholder="目的地" />
                <!-- [修改] 更新了 placeholder -->
                <input type="text" class="input-field" v-model="flightToEdit.start" placeholder="起飞时间 (格式: 周一:08:30)" />
                <input type="text" class="input-field" v-model="flightToEdit.end" placeholder="落地时间 (格式: 周日:22:00)" />
                <input type="number" class="input-field" v-model.number="flightToEdit.cost" placeholder="价格" />
            </view>
            <button @click="saveChanges" class="action-button">保存修改</button>
        </view>
    </view>
</template>

<script>
    // [新增] 引入与 add.vue 相同的辅助函数
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

    export default {
        data() {
            return {
                numToFind: "",
                flightToEdit: null,
            }
        },
        methods: {
            findFlight() {
                const num = this.numToFind.trim();
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
                                this.flightToEdit = { ...foundFlight };
                                uni.showToast({ title: '查找成功，请修改', icon: 'success' });
                            } else {
                                uni.showToast({ title: '未找到该航班号', icon: 'error' });
                                this.flightToEdit = null;
                            }
                        } else {
                             uni.showToast({ title: '获取数据失败', icon: 'error' });
                        }
                    },
                    fail: () => uni.showToast({ title: '网络错误', icon: 'error' }),
                    complete: () => uni.hideLoading()
                });
            },
            
            saveChanges() {
                const form = this.flightToEdit;
                if (!form.fp || !form.tp || !form.start || !form.end || !form.cost) {
                    uni.showToast({ title: '所有信息均不能为空', icon: 'none' });
                    return;
                }

                // [修改] 更新时间格式的正则表达式
                const timeRegex = /^周[一二三四五六日]:\d{1,2}:\d{2}$/;
                if (!timeRegex.test(form.start.trim()) || !timeRegex.test(form.end.trim())) {
                    uni.showToast({ title: '时间格式不正确 (应为 周X:HH:MM)', icon: 'none' });
                    return;
                }
                
                // [修改] 使用新的 parseTime 函数来计算飞行时间
                try {
                    let startTimeInMinutes = parseTime(form.start.trim());
                    let endTimeInMinutes = parseTime(form.end.trim());
                    if (endTimeInMinutes < startTimeInMinutes) {
                        endTimeInMinutes += 7 * 24 * 60;
                    }
                    form.time = endTimeInMinutes - startTimeInMinutes;
                } catch(e) {
                    uni.showToast({ title: '时间计算出错', icon: 'none' });
                    return;
                }
                
                uni.showLoading({ title: '正在保存...' });
                uni.request({
                    url: getApp().globalData.baseUrl + '/flights/' + this.numToFind,
                    method: 'PUT',
                    data: this.flightToEdit,
                    success: (res) => {
                        if (res.statusCode === 200) {
                            uni.showModal({
                                title: '修改成功',
                                content: `航班 ${this.numToFind} 的信息已更新。`,
                                showCancel: false,
                                success: (res) => {
                                    if (res.confirm) uni.navigateBack({ delta: 1 });
                                }
                            });
                        } else {
                            uni.showToast({ title: `修改失败: ${res.data.message || '未知错误'}`, icon: 'error' });
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
    background-color: #3858e6;
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
    color: #ffffff;
}
.divider {
    height: 2rpx;
    background-color: #e0e0e0;
    margin: 60rpx 0;
}
.edit-form {
    margin-top: 20rpx;
}
</style>
