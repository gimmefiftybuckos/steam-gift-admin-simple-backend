const express = require('express');
const fs = require('fs');
const app = express();
const { v4: uuidv4 } = require('uuid');
const port = 4000;

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
app.get('/data', (req, res) => {
   res.json(dataStore);
});

app.post('/data', (req, res) => {
   const newData = req.body;
   const id = uuidv4();
   const test = {
      [id]: newData,
   };
   dataStore.unshift(test);
   saveData();
   // res.status(201).json({ id, ...newData });
   res.json(dataStore);
});

app.put('/data/:id', (req, res) => {
   const id = req.params.id;
   const updatedData = req.body;

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

app.delete('/data/:id', (req, res) => {
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

app.listen(port, () => {
   console.log(`Server is running on http://localhost:${port}`);
});
