const { MongoClient } = require('mongodb');
const uri = 'mongodb://localhost:27017'; //local
const dbName = 'major';
const client = new MongoClient(uri);

async function insertData(videoId, transcript, summary) {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    const db = client.db(dbName);
    const collection = db.collection('all');
    const result = await collection.insertOne({
      _id: videoId,
      transcript: transcript,
      summary: summary,
      notes: ''
    });

    console.log('Document inserted:', result.insertedId);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  } finally {
    await client.close();
  }
}

async function getData(videoId){
  try{
    await client.connect();
    console.log('Connected to MongoDB');
    const db = client.db(dbName);
    const collection = db.collection('all');

    const data = await collection.findOne({ _id: videoId });
    const transcript = data.transcript;
    const summary = data.summary;

    return { "transcript": transcript, "summary": summary };
  }
  catch(error){
    console.error(error);
  }
}

async function updateSummaryinMongo(videoId, updatedSummary){
    try{
        await client.connect();
        console.log('Connected to mongodb');
        const db = client.db(dbName);
        const collection = db.collection('all');

        const result = await collection.updateOne({_id: videoId}, {$set: {summary: updatedSummary}});
        console.log('Summary updated in mongodb');
        return result.modifiedCount > 0;
    }
    catch(error){
        console.error('Error updating summary: ',error);
    }
}

async function updateNotesInMongo(videoId, notes){
      try{
        await client.connect();
        console.log('Connected to mongodb');
        const db = client.db(dbName);
        const collection = db.collection('all');

        const result = await collection.updateOne({_id: videoId}, {$set: {notes: notes}});
        console.log('Notes updated in mongodb');
        return result.modifiedCount > 0;
    }
    catch(error){
        console.error('Error updating notes: ',error);
    }
}

async function getNotes(videoId){
  try{
    await client.connect();
    console.log('Connected to MongoDB');
    const db = client.db(dbName);
    const collection = db.collection('all');

    const data = await collection.findOne({ _id: videoId });
    const notes = data.notes;

    return { "notes": notes };
  }
  catch(error){
    console.error(error);
  }
}

async function updateKeywords(videoId, keywords){
  try{
    await client.connect();
    console.log('Connected to MongoDB');
    const db = client.db(dbName);
    const collection = db.collection('all');

    const data = await collection.findOne({ _id: videoId });

    const res = await collection.updateOne({_id:videoId}, {$set: {keywords: keywords}});
    console.log('Keywords added in DB');
    return res.modifiedCount>0;
  }
  catch(error){
    console.error('Error updating keywords');
  }
}

async function getKeywords(videoId){
  try{
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection('all');

    const data = await collection.findOne({ _id: videoId });
    const keywordArrays = data.keywords.map(keyword => [keyword[0], keyword[1]]);

    return keywordArrays;
  }
  catch(error){
    console.error('Error fetching keywords from MongoDB');
  }
}

module.exports = {
    insertData: insertData,
    getData: getData,
    updateSummaryinMongo: updateSummaryinMongo,
    updateNotesInMongo: updateNotesInMongo,
    getNotes: getNotes,
    updateKeywords: updateKeywords,
    getKeywords: getKeywords
};