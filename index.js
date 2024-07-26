const express = require('express');
const fs = require('fs');
const app = express();
const { v4: uuidv4 } = require('uuid');
const PORT = 4000;

app.use(express.json());

app.use((req, res, next) => {
   res.header('Access-Control-Allow-Origin', '*');
   res.header(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, OPTIONS'
   );
   res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept'
   );
   next();
});

// Чтение данных из файла при запуске сервера
let dataStore = [];
fs.readFile('dataStore.json', 'utf8', (err, data) => {
   if (err) {
      console.error(err);
   } else {
      dataStore = JSON.parse(data);
   }
});

function saveData(filename = 'dataStore.json') {
   const jsonString = JSON.stringify(dataStore);
   fs.writeFile(filename, jsonString, (err) => {
      if (err) {
         console.error('Ошибка записи', err);
      } else {
         console.log('Файл записан');
      }
   });
}

// Получение данных
app.get('/db-collection', (req, res) => {
   res.json(dataStore);
});

app.get('/logs', (req, res) => {
   res.json(dataStore);
});

// Маршрут для добавления нового продукта
app.post('/db', (req, res) => {
   const newData = req.body.data;
   const id = uuidv4();
   const newEntry = {
      [id]: newData,
   };
   dataStore.unshift(newEntry);
   saveData();
   res.json(dataStore);
});

// Маршрут для обновления продукта по ID
app.post('/db/:id', (req, res) => {
   const id = req.params.id;
   const updatedData = req.body.data;

   let found = false;
   for (let i = 0; i < dataStore.length; i++) {
      if (dataStore[i][id]) {
         dataStore[i][id] = { ...dataStore[i][id], ...updatedData };
         found = true;
         break;
      }
   }

   if (found) {
      saveData();
      res.json(dataStore);
   } else {
      res.status(404).json({ error: 'Data not found' });
   }
});

// Маршрут для удаления продукта по ID
app.delete('/db/:id', (req, res) => {
   const id = req.params.id;

   const initialLength = dataStore.length;
   dataStore = dataStore.filter((item) => !item[id]);

   if (dataStore.length < initialLength) {
      saveData();
      res.json(dataStore);
   } else {
      res.status(404).json({ error: 'Data not found' });
   }
});

// Загрузка данных при запуске сервера
if (fs.existsSync('data.json')) {
   dataStore = JSON.parse(fs.readFileSync('data.json', 'utf8'));
}

app.listen(PORT, () => {
   console.log(`Server is running on port ${PORT}`);
});
