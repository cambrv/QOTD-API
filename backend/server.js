const express = require('express');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());

app.get('/frase-del-dia', async (req, res) => {
    try {
        const response = await fetch('https://favqs.com/api/qotd');
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error al obtener la frase del día:', error);
        res.status(500).json({ error: 'Error al obtener la frase del día' });
    }
});

app.listen(port, () => {
    console.log(`Servidor escuchando en el puerto ${port}`);
});
