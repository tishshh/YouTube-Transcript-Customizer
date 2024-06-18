const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { insertData, getData, updateSummaryinMongo, updateNotesInMongo, getNotes, updateKeywords, getKeywords } = require('./database.js');
const translate = require('translate-google');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/ckeditor', express.static(path.join(__dirname, 'ckeditor')));
app.use((req, res, next) => {
    if (req.url.endsWith('.js')) res.type('text/javascript');
    next();
});

app.use('/images', express.static(path.join(__dirname, 'images')));

app.get('/summary_audio.mp3', (req, res) => {
    res.sendFile(path.join(__dirname, 'summary_audio.mp3'));
});

app.get('/form-event.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'form-event.js'));
});

app.get('/response-events.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'response-events.js'));
});

app.get('/notes-response.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'notes-response.js'));
});

app.get('/keywords.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'keywords.js'));
});

app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'notes.html'));
});

app.post('/process', async (req, res) => {
    const videoId = req.body.videoId;
    exec(`python python-scripts/script.py "${videoId}"`, async (error, stdout, stderr) => {
        if (error)  {
            console.error(`Error executing script.py: ${error}`);
            return res.status(500).json({ error: 'Error processing video' });
        }

        const data = JSON.parse(stdout);
        const transcript = data.transcript;
        const summary = data.summary;

        await insertData(videoId, transcript, summary);

        const htmlContent = fs.readFileSync(path.join(__dirname, 'public', 'response.html'), 'utf8');

        const renderedHtml = htmlContent
            .replace('{{transcript}}', transcript)
            .replace('{{summary}}', summary);
        
        res.send(renderedHtml);
    });
});

app.get('/process', async (req,res) => {
    try {
        const videoId = req.query.videoId;
        const { transcript, summary } = await getData(videoId);

        const htmlContent = fs.readFileSync(path.join(__dirname, 'public', 'response.html'), 'utf8');
        const renderedHtml = htmlContent
            .replace('{{transcript}}', transcript)
            .replace('{{summary}}', summary)
        
        res.send(renderedHtml);
    } catch (error) {
        res.status(500).json({ error: 'Error processing request' });
    }
})

app.post('/updateSummary', async(req,res) => {
    const { videoId, updatedSummary } = req.body;
    await updateSummaryinMongo(videoId, updatedSummary);
    res.sendStatus(200);
})

app.post('/accuracy', async(req,res) => {
    const { videoId } = req.body;
    const { transcript, summary } = await getData(videoId);

    fs.writeFileSync('transcript.txt', transcript);
    fs.writeFileSync('summary.txt',summary);

    try{
        exec(`python python-scripts/accuracy.py "transcript.txt" "summary.txt"`, (error, stdout, stderr) => {
            if (error) {
                console.error('Error executing Python script:', error);
                return res.status(500).json({ error: 'Error calculating word overlap' });
            }

            console.log('Python script output:', stdout);
    
            const overlapPercentage = parseFloat(stdout);
            console.log('Parsed overlap percentage:', overlapPercentage);
    
            res.json({ overlapPercentage });
        });
    }
    catch(error){
        console.error('Error calculating accuracy: ',error);
        res.status(500).json({ error: 'Error calculating accuracy '} );
    }
})

app.post('/updateNotes', async(req,res) => {
    const {videoId, userNotes} = req.body;

    try{
        await updateNotesInMongo(videoId, userNotes);
        res.sendStatus(200);
    }
    catch(error){
        console.error('Error updating notes in MongoDB: ',error);
        res.status(500).json({ error: 'Error updating notes in MongoDB' });
    }
})

app.post('/getNotes', async(req,res) =>{
    const { videoId } = req.body;

    try{
        const { notes } = await getNotes(videoId);
        res.json({ notes });        
    }
    catch(error){
        console.error('Error getting notes in MongoDB: ',error);
        res.status(500).json({ error: 'Error getting notes in MongoDB' });
    }
})

app.post('/keyword', async(req,res) => {
    const {videoId, summary} = req.body;
    exec(`python python-scripts/frequency.py "${summary}"`, async (error, stdout, stdin) => {
        if(error){
            console.error(`Error executing frequency.py: ${error}`);
            return res.status(500).json({ error: 'Error getting keywords' });
        }
        const keywords = JSON.parse(stdout);

        await updateKeywords(videoId, keywords);

        const htmlContent = fs.readFileSync(path.join(__dirname, 'public', 'keywords.html'), 'utf8');

        const renderedHtml = htmlContent.replace('<div id="keywordsContainer"></div>', generateKeywordBoxes(keywords)) 
        
        res.send(renderedHtml);
    })
})

app.get('/keyword', async(req,res) =>{
    const { videoId } = req.query;

    try {
        let retries = 10; // Maximum number of retries
        let keywords;
        while (retries > 0) {
            keywords = await getKeywords(videoId);
            
            if (keywords.length > 0) { 
                break; 
            }

            await new Promise(resolve => setTimeout(resolve, 1000));
            retries--;
        }
        if (keywords.length === 0) {
            return res.status(500).json({ error: 'Error fetching keywords: Keywords not available' });
        }
        const htmlContent = fs.readFileSync(path.join(__dirname, 'public', 'keywords.html'), 'utf8');
        const renderedHtml = htmlContent.replace('<div id="keywordsContainer"></div>', generateKeywordBoxes(keywords));
        
        res.send(renderedHtml);
    } catch (error) {
        console.error('Error fetching keywords:', error);
        res.status(500).json({ error: 'Error fetching keywords' });
    }
})

app.post('/visualize', async(req,res) => {
    const {videoId} = req.body;
    const keywords = await getKeywords(videoId);

    const tempFilePath = path.join(__dirname, 'temp', 'keywords.json');
    fs.writeFileSync(tempFilePath, JSON.stringify(keywords));
    exec(`python python-scripts/visualize.py "${tempFilePath}"`,async(error, stdout, stdin) => {
        if(error){
            console.error(`Error fetching visualizations: ${error}`);
            return res.status(500).json({ error: 'Error getting visualizations' });
        }
        const images =  {
            top_keywords_plot: '/images/top_keywords_plot.png',
            word_cloud: '/images/word_cloud.png'
        }        
        res.json(images);
    })
})

app.post('/recommendation', async(req,res) => {
    const {videoId} = req.body;
    const keywords = await getKeywords(videoId);
    const tempFilePath = path.join(__dirname, 'temp', 'keywords.json');
    fs.writeFileSync(tempFilePath, JSON.stringify(keywords));

    exec(`python python-scripts/recommendation.py "${tempFilePath}"`, async(error, stdout, stdin) => {
        if(error){
            console.error(`Error fetching recommendations: ${error}`);
            return res.status(500).json({ error: 'Error getting recommendations' });
        }

        console.log('Python script output:', stdout);
        let images;
        try {
            images = JSON.parse(stdout);
        } catch (parseError) {
            console.error(`Error parsing JSON response: ${parseError}`);
            return res.status(500).json({ error: 'Error parsing JSON response' });
        }

        res.json(images);
    })
})

app.post('/translate', async(req,res) => {
    const {summary, language} = req.body;

    try {
        const translation = await translate(summary, { to: language });
        res.json(translation);
    } catch (error) {
        console.error("Error translating:", error);
    }
})

function generateKeywordBoxes(keywords) {
    const keywordBoxes = keywords.slice(0, 10).map(entry => {
        const keyword = entry[0].replace(',', '-');
        const score = entry[1];
        return `<span class="keyword-box" data-keyword="${keyword}">${keyword} - ${score}</span>`;
    }).join('');
    return `<div id="keywordsContainer">${keywordBoxes}</div>`;
}

app.listen(3000, () => {
    console.log(`Server is running on http://localhost:3000`);
});