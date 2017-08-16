import goodGuyHttp from 'good-guy-http';

const goodGuy = goodGuyHttp({
  // defaultCaching: {
  //   timeToLive: 300000,
  // },
  // headers: {
  //   'User-Agent': 'Department of Commerce Intranet - request',
  // },
  // proxy: process.env.HTTP_PROXY,
  timeout: 15000,
});

exports.combinedNews = async function collateAllNews(request, reply) {
  // console.dir(request);
  // console.dir(request.connection.server.info);
  // console.dir(server.info);
  const endpointProto = request.connection.server.info.protocol;
  // console.log(endpointProto);
  const endpointPort = request.connection.server.info.port;
  // console.log(endpointPort);
  const checkHost = request.connection.server.info.host;
  // console.log(checkHost);
  let endpointHost = '';
  if (checkHost.indexOf('local') > 0 ) {
    // console.log('localhost fired');
    endpointHost = 'localhost';
  } else {
    // console.log('remote host fired');
    endpointHost = checkHost;
  };
  // const endpointUrl = 'http://localhost:3000';
  const endpointUrl = `${endpointProto}://${endpointHost}:${endpointPort}`;
  // console.log('endpoint url:', endpointUrl);
  let news = [];
  const commerceNews = await goodGuy(`${endpointUrl}/api/v1/statements/commerce`);
  news.push(JSON.parse(commerceNews.body.toString()));
  const ministerials = await goodGuy(`${endpointUrl}/api/v1/statements/ministerials`);
  news.push(JSON.parse(ministerials.body.toString()));
  const governmentNews = await goodGuy(`${endpointUrl}/api/v1/statements/government`);
  news.push(JSON.parse(governmentNews.body.toString()));
  const dmirsTweets = await goodGuy(`${endpointUrl}/api/v1/tweets/dmirs`);
  news.push(JSON.parse(dmirsTweets.body.toString()));
  const combined = news.concat(
    JSON.parse(commerceNews.body.toString()),
    JSON.parse(ministerials.body.toString()),
    JSON.parse(governmentNews.body.toString()),
    JSON.parse(dmirsTweets.body.toString())
  );
  const flattened = combined.reduce((a, b) => {
    return a.concat(b);
  }, []);
  console.log('items count =', flattened.length);
  // console.dir(news);
  // reply('testing');
  // reply(combined);
  reply(flattened);
};