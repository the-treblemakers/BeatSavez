import React, { useState, useEffect } from 'react';
import { fetchSongs, postSongs, getSongs } from '../services/fetchSongs';

export default function BuildFetch() {
    const [orderBy, setOrderBy] = useState('viewCount');
    const [amount, setAmount] = useState('50');
    const [channelId, setChannelId] = useState('UCrk8mp-ugqtAbjif6JARjlw');
    const [youTubeKey, setYouTubeKey] = useState('');
    const [channelArray, setChannelArray] = useState([]);
    const [resultsMessage, setResultsMessage] = useState('');
    const [endpoint, setEndpoint] = useState('http://localhost:7890/api/v1/songs/');
    const [textareaInput, setTextareaInput] = useState('');
    // const [beforeDate, setBeforeDate] = useState('');

    useEffect(() => {
        console.log('CHANNEL ARRAY', JSON.stringify(channelArray), 'CHANNEL ARRAY');
    }, [channelArray, channelId, resultsMessage]);

    const apiToSongbook = async () => {
        const songsArray = JSON.stringify(channelArray);
        await postToSongbook(songsArray);
    };

    const textareaToSongbook = async () => {
        postToSongbook(textareaInput);
    };

    const postToSongbook = async (songsArray) => {
        const databaseReturn = await postSongs(songsArray, endpoint);
        setResultsMessage(`Posted ${databaseReturn.length} videos for Channel ID: ${channelId} to database.`);
        setChannelId('');
    };

    const getSongbook = async () => {
        setChannelId('BeatWavez SONGBOOK');
        const songbook = await getSongs(endpoint);
        setChannelArray(songbook);
        saveToFile();
    };

    const saveToFile = () => {
        setResultsMessage(`Done getting videos for Channel ID: ${channelId}.You fetched ${channelArray.length} videos.You can save to file now.`);

        let file;
        const data = JSON.stringify(channelArray);
        const properties = { type: 'text/plain' };
        try {
            file = new File([data], 'file.txt', properties);
        } catch (e) {
            file = new Blob([data], properties);
        }
        const url = URL.createObjectURL(file);
        document.getElementById('link').href = url;

        setTextareaInput(data);
    };

    const buildChannelArray = async () => {
        setResultsMessage('');
        if (channelId !== '') {
            let pageToken = '';
            let mungedSongs = [];

            // YouTube API call built by user inputs
            for (let i = amount; i > 0; i = i - 50) {
                const fetchAmount = i > 50 ? 50 : i;

                const { items: results, nextPageToken } = await fetchSongs(youTubeKey, channelId, fetchAmount, orderBy, pageToken);

                const songs = results.map(song => ({
                    vidId: song.id.videoId,
                    title: song.snippet.title,
                    thumbnail: song.snippet.thumbnails.default.url,
                    channelName: song.snippet.channelTitle,
                    channelId,
                }));

                pageToken = nextPageToken;
                mungedSongs = [...mungedSongs, ...songs];
            }

            setChannelArray(mungedSongs);


        } else {
            setResultsMessage('ENTER CHANNEL ID BEFORE SUBMITTING');
        }


    };

    return (
        <>
            <div>
                <button onClick={getSongbook}>BeatSavez</button>
                <select id="endpoint-select" value={endpoint} onChange={({ target }) => setEndpoint(target.value)}>
                    <option value="http://localhost:7890/api/v1/songs/">Local Single</option>
                    <option value="http://localhost:7890/api/v1/songs/all">Local Batch</option>
                    <option value="https://beatwavez-dev.herokuapp.com/api/v1/songs/">Heroku Single</option>
                    <option value="https://beatwavez-dev.herokuapp.com/api/v1/songs/all">Heroku Batch</option>
                </select>
                <input type="text" name="channel-id" value={channelId}
                    placeholder="Enter Channel ID" onChange={({ target }) => setChannelId(target.value)} required />
                <select id="order-select" value={orderBy} onChange={({ target }) => setOrderBy(target.value)}>
                    <option value="viewCount">viewCount</option>
                    <option value="rating">rating</option>
                    <option value="date">date</option>
                </select>
                <input type="number" id="quantity" name="quantity" min="1" max="500" value={amount} onChange={({ target }) => setAmount(target.value)} required />
                <input type="text" name="you-tube-key" value={youTubeKey}
                    placeholder="Enter YouTube Key" onChange={({ target }) => setYouTubeKey(target.value)} />
                <button onClick={buildChannelArray}>Submit</button>
            </div>
            <div>
                <button onClick={apiToSongbook}>Post to Database</button>
                <button onClick={saveToFile}>Prepare Download</button>
                <a id="link" target="_blank" download="file.txt">Download</a>
                <p>{resultsMessage}</p>
                <textarea value={textareaInput} onChange={({ target }) => setTextareaInput(target.value)} placeholder="Paste File for Upload"></textarea>
                <p>{`${(textareaInput === '') ? 0 : textareaInput.split('},{').length} items`}</p>
                <button onClick={textareaToSongbook}>Post File to Database</button>
            </div>
        </>
    );
}

// first
// `https://www.googleapis.com/youtube/v3/search?part=snippet&key=${inputKey || process.env.YOUTUBE_KEY}&channelId=${channelId}&pageToken=${nextPageToken}&maxResults=50&resultsPerPage=50&order=date`

// second
// `https://www.googleapis.com/youtube/v3/search?part=snippet&key=${inputKey || process.env.YOUTUBE_KEY}&channelId=${channelId}&maxResults=50&resultsPerPage=50&order=date&publishedBefore=${publishedBeforeDate}`

// original
// `https://www.googleapis.com/youtube/v3/search?part=snippet&key=${process.env.YOUTUBE_KEY}&order=viewCount&channelId=${channelId}&pageToken=${nextPageToken}`


// https://www.googleapis.com/youtube/v3/search?part=snippet&key=AIzaSyB99XT0E9GrvqStZdoNO_GR1X9a-ESzNIE&channelId=UCrk8mp-ugqtAbjif6JARjlw&pageToken=CAUQAA&maxResults=50&resultsPerPage=50&order=date&publishedBefore=2019-21-21T12:57:20Z


// key AIzaSyB99XT0E9GrvqStZdoNO_GR1X9a-ESzNIE
// channel UCrk8mp-ugqtAbjif6JARjlw
// AIzaSyBoI0WPJh-uXnL8dm2XPh1IdelwMMwacCY
