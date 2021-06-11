import React, { useState } from 'react';
import { fetchSongs } from '../services/fetchSongs';

export default function BuildFetch() {
    const [orderBy, setOrderBy] = useState('viewCount');
    const [amount, setAmount] = useState('50');
    const [channelId, setChannelId] = useState('');
    const [youTubeKey, setYouTubeKey] = useState('');
    const [channelArray, setChannelArray] = useState([channelId]);
    const [resultsMessage, setResultsMessage] = useState('');
    // const [beforeDate, setBeforeDate] = useState('');

    // saveToDB(); write mass post to database function for handling array directly(map and insert may be simplest, set and forget)
    const saveToFile = () => {
        setResultsMessage(`Done getting videos for Channel ID: ${channelId}. You fetched ${channelArray.length} videos. You can save to file and/or post to songs database now.`);

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
    };

    const buildChannelArray = async () => {
        let pageToken = '';
        let mungedSongs = [];

        // YouTube API call built by user inputs
        for (let i = amount; i > 0; i = i - 50) {
            const fetchAmount = i > 50 ? 50 : amount;

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


        console.log('CHANNEL ARRAY', channelArray, 'CHANNEL ARRAY');
    };

    return (
        <>
            <div>
                <select id="order-select" value={orderBy} onChange={({ target }) => setOrderBy(target.value)}>
                    <option value="viewCount">viewCount</option>
                    <option value="rating">rating</option>
                    <option value="date">date</option>
                </select>
                <input type="text" name="channel-id" value={channelId}
                    placeholder="Enter Channel ID" onChange={({ target }) => setChannelId(target.value)} />
                <input type="number" id="quantity" name="quantity" min="1" max="500" value={amount} onChange={({ target }) => setAmount(target.value)} />
                <input type="text" name="you-tube-key" value={youTubeKey}
                    placeholder="Enter YouTube Key" onChange={({ target }) => setYouTubeKey(target.value)} />
                <button onClick={buildChannelArray}>Submit</button>
            </div>
            <div>
                <button onClick={saveToFile}>Prepare Download</button>
                <a id="link" target="_blank" download="file.txt">Download</a>
                <p>{resultsMessage}</p>
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
