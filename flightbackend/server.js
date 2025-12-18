const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 3000;
const dbPath = path.join(__dirname, 'db.json');
const citiesDbPath = path.join(__dirname, 'cities.json'); // 城市数据文件路径

// --- 中间件配置 ---
app.use(cors());
app.use(express.json());

// --- 工具函数 ---
const readData = (filePath) => {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
};

const writeData = (filePath, data) => {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

// --- API 接口定义 ---

// GET /flights - 获取所有航班
app.get('/flights', (req, res) => {
    console.log('收到请求: 获取所有航班');
    const flights = readData(dbPath);
    res.json(flights);
});

// POST /flights - 添加新航班
app.post('/flights', (req, res) => {
    console.log('收到请求: 添加新航班', req.body);
    const flights = readData(dbPath);
    const newFlight = req.body;
    flights.push(newFlight);
    writeData(dbPath, flights);
    res.status(201).json({ message: '航班添加成功', flight: newFlight });
});

// DELETE /flights/:num - 删除指定航班
app.delete('/flights/:num', (req, res) => {
    const flightNumToDelete = req.params.num;
    console.log('收到请求: 删除航班', flightNumToDelete);
    let flights = readData(dbPath);
    const initialLength = flights.length;
    flights = flights.filter(flight => flight.num !== flightNumToDelete);
    if (flights.length < initialLength) {
        writeData(dbPath, flights);
        res.json({ message: `航班 ${flightNumToDelete} 删除成功` });
    } else {
        res.status(404).json({ message: '未找到要删除的航班' });
    }
});

// PUT /flights/:num - 更新一个指定航班的信息
app.put('/flights/:num', (req, res) => {
    const flightNumToUpdate = req.params.num;
    const updatedFlightData = req.body;
    console.log('收到请求: 更新航班', flightNumToUpdate, updatedFlightData);

    const flights = readData(dbPath);
    const index = flights.findIndex(flight => flight.num === flightNumToUpdate);

    if (index !== -1) {
        flights[index] = updatedFlightData;
        writeData(dbPath, flights);
        res.json({ message: '航班信息更新成功', flight: updatedFlightData });
    } else {
        res.status(404).json({ message: '未找到要更新的航班' });
    }
});

// GET /cities - 获取所有城市及其权重信息
app.get('/cities', (req, res) => {
    console.log('收到请求: 获取所有城市权重');
    const citiesData = readData(citiesDbPath);
    res.json(citiesData);
});

// --- [新增] POST /cities - 添加一个新城市 ---
app.post('/cities', (req, res) => {
    const { name, weight } = req.body;
    console.log('收到请求: 添加新城市', { name, weight });

    // 简单验证
    if (!name || weight === undefined) {
        return res.status(400).json({ message: '城市名称和权重不能为空' });
    }

    const cities = readData(citiesDbPath);

    // 检查城市是否已存在
    const cityExists = cities.some(city => city.name === name);
    if (cityExists) {
        return res.status(409).json({ message: '该城市已存在' }); // 409 Conflict
    }

    // 添加新城市
    const newCity = { name, weight: parseInt(weight) };
    cities.push(newCity);
    writeData(citiesDbPath, cities);

    res.status(201).json({ message: '城市添加成功', city: newCity });
});


// --- 启动服务器 ---
app.listen(PORT, () => {
    console.log(`后端服务器已启动，正在监听 http://localhost:${PORT}`);
});
