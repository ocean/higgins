import Collator from '../../handlers/collator';
import CommerceNews from '../../handlers/commerce-news';
import GovernmentNews from '../../handlers/government-news';
import IntranetNews from '../../handlers/intranet-news';
import Ministerials from '../../handlers/ministerials';
import TransportData from '../../handlers/transport-data';
import Tweets from '../../handlers/tweets';
import WeatherData from '../../handlers/weather-data';

module.exports = [
  {
    method: 'GET',
    path: '/api/v1/statements/commerce',
    handler: CommerceNews.getStatements,
  },
  {
    method: 'GET',
    path: '/api/v1/intranet/news/{featured?}',
    handler: IntranetNews.getIntranetNews,
  },
  {
    method: 'GET',
    path: '/api/v1/intranet/news/type/{newsType}/{featured?}',
    handler: IntranetNews.getIntranetNewsByType,
  },
  {
    method: 'GET',
    path: '/api/v1/statements/ministerials',
    handler: Ministerials.getMinisterials,
  },
  {
    method: 'GET',
    path: '/api/v1/statements/government',
    handler: GovernmentNews.getStatements,
  },
  {
    method: 'GET',
    path: '/api/v1/tweets/{list}',
    handler: Tweets.getTweets,
  },
  {
    method: 'GET',
    path: '/api/v1/combined',
    handler: Collator.collate,
  },
  {
    method: 'GET',
    path: '/api/v1/data/transport/departures/{location}',
    handler: TransportData.getDepartures,
    config: {
      cache: {
        expiresIn: 30000,
      },
    },
  },
  {
    method: 'GET',
    path: '/api/v1/data/transport/updates',
    handler: TransportData.getUpdates,
  },
  {
    method: 'GET',
    path: '/api/v1/data/weather/{location}',
    handler: WeatherData.getForecast,
    config: {
      cache: {
        expiresIn: 86400000,
      },
    },
  },
];