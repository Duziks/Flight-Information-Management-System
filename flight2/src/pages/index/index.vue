<template>
    <view class="content">

        <view class="backpage"></view>

        <!-- 航班信息功能区 -->
        <view class="elelog">
            <view class="eletxt">航班信息</view>
            <view class="statetab">
                <view class="astate" @click="toarch(0)">
                    <view class="box2">
                        <image src="/static/plus.png" mode="" class="elepic"/>
                    </view>
                    
                    <view class="box2">
                        <text class="statetxt">信息新增</text>
                    </view>
                    
                </view>
        
                <view class="astate" @click="toinspect()">
                    <view class="box2">
                        <image src="/static/shuffle.png" mode="" class="elepic"/>
                    </view>
                    <view class="box2">
                        <text class="statetxt">修改信息</text>
                    </view>
                </view>
                <view class="astate" @click="todelete()">
                    <view class="box2">
                        <image src="/static/delete.png" mode="" class="elepic"/>
                    </view>
                    <view class="box2">
                        <text class="statetxt">删除信息</text>
                    </view>
                </view>
                <view class="astate" @click="tosearch()">
                    <view class="box2">
                        <image src="/static/search.png" mode="" class="elepic"/>
                    </view>
                    <view class="box2">
                        <text class="statetxt">直达查询</text>
                    </view>
                </view>
            </view>
        </view>

        <!-- 航班推荐功能区 -->
        <view class="elelog2">
            <view class="eletxt">航班推荐</view>
            <view class="statetab">
                <view class="astate" @click="tocom()">
                    <view class="box2">
                        <image src="/static/favorite.png" mode="" class="elepic"/>
                    </view>
                    <view class="box2">
                        <text class="statetxt">条件排序</text>
                    </view>
                </view>
        
                <view class="astate" @click="tobindcom()" >
                    <view class="box2">
                        <image src="/static/flights.png" mode="" class="elepic2" />
                    </view>
                    <view class="box2">
                        <text class="statetxt">中转方案</text>
                    </view>
                </view>
            </view>
        </view>
    </view>
</template>

<script>
    export default {
        data() {
            return {
                // 保留原始数据结构，但 onLoad 中不再填充它们
                citylist:[],
                index:9,
                cityrange:[]
            }
        },
        onLoad() {
        },
        methods: {
             citychange(e){
                console.log(e)
                this.index= e.target.value
             },
             notice(){
                 uni.navigateTo({
                    url: '/pages/index/notice',
                 })
             },
             toinfo(){
                 uni.navigateTo({
                    url: '/pages/index/info',
                 })
             },
             toarch(id){
                 uni.navigateTo({
                    url:'/pages/index/add',
                 })
             },
             toapproval(adr){
                 uni.navigateTo({
                    url:'/pages/maintenanceCompany/'+adr
                 })
             },
             toinspect(){
                 uni.navigateTo({
                    url:"/pages/index/change"
                 })
             },
             todelete(){
                     uni.navigateTo({
                        url: '/pages/index/delete',
                        })
             },
             tocom(){
                     uni.navigateTo({
                        url:"/pages/index/com"
                     })
             },
             tobindcom()
             {
                     uni.navigateTo({
                                    url:"/pages/index/bindcom"
                                 })
                     
             },
             tosearch()
             {
                     uni.navigateTo({
                                    url:"/pages/index/search"
                                 })
                                 
             }
            }

        
    }
</script>

<style>
    .content {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }
    page{
        background-color:#f2f2f2;
        display: flex;
        justify-content: center;
      }
      .pick{
          width: 300rpx;
          border: 2rpx solid black;
          height: 50rpx;
          margin-top: 20rpx;
          margin-right: 280rpx;
          border-radius: 2rpx;
      }
      .picktxt{
          margin-left: 16rpx;
          font-size: 28rpx;
      }
      .messagelook{
          width: 317rpx;
          height: 182rpx;
          background-color: white;
          z-index: 1;
          margin-top: 50rpx;
          
          border-radius: 16rpx;
          display: flex;
          justify-content: center;
      }
      .messagepic{
          width: 54rpx;
          height: 54rpx;
          margin-top: 60rpx;
      }
      .messtxt{
          font-size: 40rpx;
          margin-top: 60rpx;
          margin-left: 20rpx;
          font-weight: bold;
      }
      .messtab{
          display: flex;
          height: 227rpx;
          /* margin-right: 40rpx; */
      }
      .elelog{
          background-color: white;
          width: 690rpx;
          height: 310rpx;
          margin-top: 40rpx;
          margin-left: 0rpx;
          border-radius: 20rpx;
          display: flex;
          flex-direction: column ;
          z-index: 1;
      }
      .eletxt{
        font-size: 40rpx;
        margin-left: 30rpx;
        margin-top: 20rpx;
        font-weight: bold;
      }
      .line{
          width: 620rpx;
          margin-left: 35rpx;
          margin-top: 20rpx;
          background-color: gray;
          height: 5rpx;
      }
      .elepic{
          width: 54rpx;
          height: 54rpx;
          
      }
      .astate{
          width: 32%;
          display: flex;
          flex-direction: column;
          margin-top: 40rpx;
      }
      .statetxt{
          margin-top: 30rpx;
          
      }
      .statetab{
        display: flex;
          margin-top: 0rpx;
          width: 690rpx;
      }
      .elelog2{
        background-color: white;
        width: 690rpx;
        height: 321rpx;
        margin-top: 40rpx;
        margin-left: 0rpx;
        border-radius: 20rpx;
        display: flex;
        flex-direction: column ;
        z-index: 1;
    }
    .astate2{
        width: 160rpx;
        display: flex;
        flex-direction: column;
        justify-content: center;
            margin-top: 40rpx;
            margin-left: 0rpx;
    }
    .statetxt2{
        margin-left: -10rpx;
            margin-top: 30rpx;
            font-size: 30rpx;
    }
    .elepic2{
        width: 60rpx;
            height: 60rpx;
            
    }
    .box1{
        width: 375rpx;
        height: 100%;
        display: flex;
        justify-content: center;
        
    }
    .box2{
        top: 20rpx;
        display: flex;
        width: 100%;
        justify-content: center;
    }
    /* .backpage{
        width: 100%;
        background-color: #3858e6;
        position: fixed;
        top: 0;
        height: 473rpx;
        z-index: 0;
    } */
    .backpage{
      width: 140%;
      height: 473rpx; 
      background: #3858e6;
      position: fixed;
      z-index: 0;
      top: 0;
    }

</style>
