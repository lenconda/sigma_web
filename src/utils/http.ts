import http from 'axios';

http.defaults.timeout = 3600000;
http.defaults.baseURL = 'https://raw.githack.com/lenconda/site_description/master';

http.interceptors.response.use((response: any) => {
  return JSON.parse(JSON.stringify(response));
});

export default http;
