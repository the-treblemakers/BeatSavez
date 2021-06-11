export const fetchSongs = async (youTubeKey, channelId, fetchAmount, orderBy, pageToken) => {
    const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&key=${youTubeKey || process.env.YOUTUBE_KEY}&type=video&channelId=${channelId}&maxResults=${fetchAmount}&resultsPerPage=${fetchAmount}&order=${orderBy}&pageToken=${pageToken}`);
    const json = await res.json();
    return json;
};

export const postSongs = async (songsArray, databaseEndpoint) => {
    const res = await fetch(`${databaseEndpoint}`, {
        method: 'POST',
        body: songsArray
    });
    console.log(res);
    return res;
};
