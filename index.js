const express = require('express');
const fs = require('fs');
const app = express();
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

let dataStore = [];
fs.readFile('dataStore.json', 'utf8', (err, data) => {
   if (err) {
      console.error(err);
   } else {
      dataStore = JSON.parse(data);
   }
});

function saveData(filename = 'dataStore.json') {
   const jsonString = JSON.stringify(dataStore, null, 2);
   fs.writeFile(filename, jsonString, (err) => {
      if (err) {
         console.error('Ошибка записи', err);
      } else {
         console.log('Файл записан');
      }
   });
}

app.get('/logs', (req, res) => {
   const interval = req.query.interval;
   let filePath = 'logsStore.json';

   if (interval === '60') {
      filePath = 'logsStore60.json';
   }

   fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
         console.error(err);
         res.status(500).json({ error: 'Failed to read logs file' });
      } else {
         const logsStore = JSON.parse(data);
         res.json(logsStore);
      }
   });
});

app.get('/db-collection', (req, res) => {
   res.json(dataStore);
});

app.post('/db/:id', (req, res) => {
   const id = req.params.id;
   const [title, receiverRegion] = id.split('_');
   const updatedData = req.body.data;

   console.log(title);

   if (!updatedData || !updatedData.title || !updatedData.receiverRegion) {
      return res.status(400).json({ error: 'Invalid data' });
   }

   const existingIndex = dataStore.findIndex(
      (item) => item.title === title && item.receiverRegion === receiverRegion
   );

   if (existingIndex !== -1) {
      dataStore[existingIndex] = updatedData;
      saveData();
      res.json({ message: 'Data updated' });
   } else {
      res.status(404).json({ error: 'Data not found' });
   }
});

app.delete('/db/:id', (req, res) => {
   const id = req.params.id;
   const [title, receiverRegion] = id.split('_');

   const initialLength = dataStore.length;
   dataStore = dataStore.filter(
      (item) =>
         !(item.title === title && item.receiverRegion === receiverRegion)
   );

   if (dataStore.length < initialLength) {
      saveData();
      res.json({ message: 'Data successfully deleted' });
   } else {
      res.status(404).json({ error: 'Data not found' });
   }
});

app.post('/db', (req, res) => {
   const newData = req.body.data;
   dataStore.unshift(newData);
   saveData();
   res.json({ message: 'Data successfully added' });
});

if (fs.existsSync('data.json')) {
   dataStore = JSON.parse(fs.readFileSync('data.json', 'utf8'));
}

app.listen(PORT, () => {
   console.log(`Server is running on port ${PORT}`);
});
