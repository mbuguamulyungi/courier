const express = require('express');
const request = require('request');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.get('', (req, res) => {
    res.status(200).json({ text: 'welcome...' })
})

app.post('/api', (req, res) => {
    var options = {
        'method': req.body.method,
        'url': req.body.url,
        'headers': req.body.headers,
        'body': (req.body.body) ? JSON.stringify(req.body?.body) : '',
    };

    request(options, function (error, response) {
        if (JSON.stringify(response.body).includes('Error')) {
                res.status(500).json({ error: JSON.stringify(response) });
        } else {
            res.json({ body: response.body, rawHeaders: response.rawHeaders });

        }
    });
})

const PORT = process.env.PORT || 7388;

app.listen(PORT, () => {
    console.log("Server running on http://localhost:" + PORT);
});
