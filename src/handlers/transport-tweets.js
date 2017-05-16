import Dotenv from 'dotenv';
import goodGuyHttp from 'good-guy-http';
import url from 'url';

Dotenv.config();

const twitterEndpointUrl = url.format({
  protocol: 'https',
  hostname: 'api.twitter.com',
  pathname: '1.1/lists/statuses.json',
  query: {
    count: 200,
    include_rts: true,
    // If this is passed as a Number, JavaScript will "round it" and break the URL
    list_id: '864392667689398272',
  },
});

if (!process.env.TWITTER_BEARER_TOKEN) {
  throw Error('Error: Twitter bearer token must be set in TWITTER_BEARER_TOKEN environment variable.');
}

const goodGuy = goodGuyHttp({
  defaultCaching: {
    timeToLive: 60000,
  },
  headers: {
    Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
  },
  json: true,
  proxy: process.env.HTTP_PROXY,
  timeout: 15000,
});

// Transport related tweets from a list owned by @CommerceWA on Twitter
exports.getTweets = async function getTweets(request, reply) {
  try {
    const response = await goodGuy(twitterEndpointUrl);
    const tweets = response.body;
    // console.dir(tweets);
    // console.log(`Number of tweets = ${tweets.length}`);
    reply(tweets);
  } catch (error) {
    console.log('Fetch of tweets failed', error);
  }
};
