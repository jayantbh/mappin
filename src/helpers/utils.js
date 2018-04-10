import request from 'request-promise-native';
import { FLICKR_KEY } from '../keys';

const API_KEY = FLICKR_KEY;
export const IMAGE_LOOKOUP_LIMIT = 40;

export async function imageLookup(term) {
    let url = `https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=${API_KEY}&text=${term}&has_geo=1&extras=geo,url_z&format=json&per_page=${IMAGE_LOOKOUP_LIMIT}&nojsoncallback=1`;
    let data = await request.get(url);
    return JSON.parse(data);
}
