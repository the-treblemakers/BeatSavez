export const fetchSongs = async (
    youTubeKey,
    channelId,
    fetchAmount,
    orderBy,
    pageToken
) => {
    const res = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&key=${
            youTubeKey || process.env.YOUTUBE_KEY
        }&videoEmbeddable=true&type=video&channelId=${channelId}&maxResults=${fetchAmount}&resultsPerPage=${fetchAmount}&order=${orderBy}&pageToken=${pageToken}`
    );
    const json = await res.json();
    return json;
};

export const postSongs = async (songsArray, endpoint) => {
    console.log(endpoint, songsArray, "ENDPOINT");
    const res = await fetch(`${endpoint}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "*/*",
            "Access-Control-Allow-Origin": "*",
        },
        body: `${songsArray}`,
        mode: "cors",
    });
    const json = await res.json();
    console.log(res, json, "RESPONSE");
    return json;
};

export const getSongs = async (endpoint) => {
    const res = await fetch(`${endpoint}`);
    const json = await res.json();
    return json;
};
