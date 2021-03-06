import Dotenv from 'dotenv';
import Boom from 'boom';
import fs from 'fs';
import goodGuyHttp from 'good-guy-http';
import he from 'he';
import moment from 'moment';
import url from 'url';
import goodGuyCache from '../utils/good-guy-cache';

Dotenv.config();

// List: "DMIRS accounts"
// https://twitter.com/CommerceWA/lists/dmirs-accounts
const dmirsEndpointUrl = url.format({
  protocol: 'https',
  hostname: 'api.twitter.com',
  pathname: '1.1/lists/statuses.json',
  query: {
    count: 50,
    include_rts: true,
    // If this is passed as a Number, JavaScript will "round it" and break the URL
    list_id: '864326054462095361',
  },
});

// List: "Perth transport"
// https://twitter.com/CommerceWA/lists/perth-transport
const transportEndpointUrl = url.format({
  protocol: 'https',
  hostname: 'api.twitter.com',
  pathname: '1.1/lists/statuses.json',
  // pathname: '1.1/lists/',
  query: {
    count: 20,
    include_rts: true,
    // If this is passed as a Number, JavaScript will "round it" and break the URL
    list_id: '864392667689398272',
  },
});

exports.getTweets = async function getTweets(request, reply) {
  if (!process.env.TWITTER_BEARER_TOKEN) {
    throw Error('Error: Twitter bearer token must be set in TWITTER_BEARER_TOKEN environment variable.');
  }

  let caFile = '';
  if (process.env.NODE_ENV === 'production') {
    caFile = fs.readFileSync('/etc/pki/tls/cert.pem');
  }

  const goodGuy = goodGuyHttp({
    cache: goodGuyCache(60),
    forceCaching: {
      cached: true,
      timeToLive: 60000,
    },
    ca: caFile,
    headers: {
      Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
    },
    json: true,
    proxy: process.env.HTTP_PROXY,
    timeout: 15000,
  });

  let twitterEndpointUrl = '';
  if (request.params.list === 'dmirs') {
    twitterEndpointUrl = dmirsEndpointUrl;
  } else if (request.params.list === 'transport') {
    twitterEndpointUrl = transportEndpointUrl;
  }
  try {
    const response = await goodGuy(twitterEndpointUrl);
    const tweets = response.body;
    const updates = [];
    tweets.forEach((status) => {
      const dateParsed = moment(status.created_at.toString().trim(), 'ddd MMM DD HH:mm:ss Z YYYY');
      const dateTime = moment(dateParsed).format();
      const displayName = status.user.name;
      const username = status.user.screen_name;
      const statusId = status.id_str;
      const buildUrl = `https://twitter.com/${username}/status/${statusId}`;
      updates.push({
        id: statusId,
        author: username,
        contents: he.decode(status.text),
        dateTime,
        displayName,
        source: 'twitter',
        type: 'tweet',
        url: buildUrl,
      });
    }, this);
    reply(updates);
  } catch (error) {
    Boom.boomify(error, { statusCode: 501, message: 'A decent network was not implemented. Fetch of tweets failed.' });
    reply(error);
  }
};
