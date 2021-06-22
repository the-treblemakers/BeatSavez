import React, { useState, useEffect } from 'react';
import { fetchSongs, postSongs, getSongs } from '../services/fetchSongs';
import styles from '../components/app/app.css';

export default function BuildFetch() {
    const [orderBy, setOrderBy] = useState('viewCount');
    const [amount, setAmount] = useState('50');
    const [channelId, setChannelId] = useState('UCrk8mp-ugqtAbjif6JARjlw');
    const [youTubeKey, setYouTubeKey] = useState('');
    const [channelArray, setChannelArray] = useState([]);
    const [resultsMessage, setResultsMessage] = useState('');
    const [endpoint, setEndpoint] = useState(
        'http://localhost:7890/api/v1/songs/'
    );
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
        setResultsMessage(
            `Posted ${databaseReturn.length} videos for Channel ID: ${channelId} to database.`
        );
        setChannelId('');
    };

    const getSongbook = async () => {
        setChannelId('BeatWavez SONGBOOK');
        const songbook = await getSongs(endpoint);
        setChannelArray(songbook);
        saveToFile();
    };

    const saveToFile = () => {
        setResultsMessage(
            `Done getting videos for Channel ID: ${channelId}.You fetched ${channelArray.length} videos.You can save to file now.`
        );

        let file;
        const data = JSON.stringify(channelArray);
        const properties = { type: 'text/plain' };
        try {
            file = new File([data], 'file.txt', properties);
        } catch(e) {
            file = new Blob([data], properties);
        }
        const url = URL.createObjectURL(file);
        document.getElementById('link').href = url;

        setTextareaInput(data);
    };

    const buildChannelArray = async () => {
        setResultsMessage('');
        if(channelId !== '') {
            let pageToken = '';
            let mungedSongs = [];

            // YouTube API call built by user inputs
            for(let i = amount; i > 0; i = i - 50) {
                const fetchAmount = i > 50 ? 50 : i;

                const { items: results, nextPageToken } = await fetchSongs(
                    youTubeKey,
                    channelId,
                    fetchAmount,
                    orderBy,
                    pageToken
                );

                const songs = results.map((song) => {
                    // If song has &#39; in title string, run cleanup in a loop until it doesn't anymore
                    const titleCleanup = () => {
                        const regex = '&#39;';
                        const string = song.snippet.title;
                        const substitution = '\'';
                      
                        // if(string.includes(regex)) {
                        while(string.includes(regex)) {
                            string.replace(regex, substitution);
                            console.log('while loop');
                        }
                        //     return; 
                        // } return string;

                    };
                    
                    const cleanTitle = titleCleanup();

                    return {
                        vidId: song.id.videoId,
                        // title: song.snippet.title,
                        title: cleanTitle,
                        thumbnail: song.snippet.thumbnails.default.url,
                        channelName: song.snippet.channelTitle,
                        channelId,
                        // viewCount
                    };
                });

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
            <div className={styles.controls}>
                <div className={styles.channel}>
                    <button onClick={getSongbook}>BeatSavez</button>
                    <select
                        id="endpoint-select"
                        value={endpoint}
                        onChange={({ target }) => setEndpoint(target.value)}
                    >
                        <option value="http://localhost:7890/api/v1/songs/">
              Local Single
                        </option>
                        <option value="http://localhost:7890/api/v1/songs/all">
              Local Batch
                        </option>
                        <option value="https://beatwavez-dev.herokuapp.com/api/v1/songs/">
              Heroku Single
                        </option>
                        <option value="https://beatwavez-dev.herokuapp.com/api/v1/songs/all">
              Heroku Batch
                        </option>
                    </select>
                    <input
                        type="text"
                        name="channel-id"
                        value={channelId}
                        placeholder="Enter Channel ID"
                        onChange={({ target }) => setChannelId(target.value)}
                        required
                    />
                </div>

                <div className={styles.key}>
                    <select
                        id="order-select"
                        value={orderBy}
                        onChange={({ target }) => setOrderBy(target.value)}
                    >
                        <option value="viewCount">viewCount</option>
                        <option value="rating">rating</option>
                        <option value="date">date</option>
                    </select>
                    <input
                        type="number"
                        id="quantity"
                        name="quantity"
                        min="1"
                        max="500"
                        value={amount}
                        onChange={({ target }) => setAmount(target.value)}
                        required
                    />
                    <input
                        type="text"
                        name="you-tube-key"
                        value={youTubeKey}
                        placeholder="Enter YouTube Key"
                        onChange={({ target }) => setYouTubeKey(target.value)}
                    />
                </div>

                <button onClick={buildChannelArray}>Submit</button>
            </div>

            <div className={styles.file}>
                <div className={styles.data}>
                    <button onClick={apiToSongbook}>Post to Database</button>
                    <button onClick={saveToFile}>Prepare Download</button>
                </div>

                <div className={styles.results}>
                    <a id="link" target="_blank" download="file.txt">
            Download
                    </a>
                    <p>{resultsMessage}</p>
                    <textarea
                        value={textareaInput}
                        onChange={({ target }) => setTextareaInput(target.value)}
                        placeholder="Paste File for Upload"
                    ></textarea>
                    <p>{`${
                        textareaInput === '' ? 0 : textareaInput.split('},{').length
                    } items`}</p>
                </div>

                <button onClick={textareaToSongbook}>Post File to Database</button>
            </div>
        </>
    );
}
