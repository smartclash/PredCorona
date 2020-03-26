import * as express from 'express';

const app: express.Application = express();

app.get('/api/about', async (req, res) => {
    res.json({ creator: 'xXAlphaManXx', });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log('Listening on port 8080'));
