import React, { Component } from 'react';
import './App.css';

import PhotoMap from './components/PhotoMap';
import loader from './assets/loader.svg';

import { imageLookup, IMAGE_LOOKOUP_LIMIT } from './helpers/utils';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      track: window.localStorage.trackingTerm || 'planets',
      photos: [],
      limit: IMAGE_LOOKOUP_LIMIT,
      arrayLimit: 10000,
      isUpdatingTrackingTerm: false
    };

    this.handleResponse();
  }

  async handleResponse() {
    let photos = await imageLookup(this.state.track);
    photos = photos.photos.photo;
    let processedPhotos = photos.map((photo) => {
      return {
        id: photo.id,
        text: photo.title,
        full_name: '',
        point: [photo.longitude, photo.latitude],
        url: photo.url_z
      };
    });
    this.setState({ photos: processedPhotos, isUpdatingTrackingTerm: false });

    setTimeout(() => this.handleResponse(), 10000)
  }

  lastFewPhotos = () => this.state.photos.slice(-1 * this.state.limit);

  updateTrackingTerm(e, form) {
    e.preventDefault();
    const value = e.currentTarget['tracking-term'].value;
    this.setState({ track: value, isUpdatingTrackingTerm: true });
    window.localStorage.trackingTerm = value;
  }

  render() {
    return (
      <div>
        <PhotoMap photos={this.lastFewPhotos()} />
        <div className="overlay-interface">
          <form className="tracking-term-component" onSubmit={(e, form) => this.updateTrackingTerm(e, form)}>
            <label htmlFor="tracking-term" className="tracking-term-label">Search Term</label>
            <div className="tracking-term-input">
              <input id="tracking-term"
                name="tracking-term"
                placeholder="Enter tracking term here..."
                value={this.state.track}
                onChange={({ target: { value } }) => this.setState({ track: value })}
                onInput={({ target: { value } }) => this.setState({ track: value })}
              />
              <button className="update-term-button" type="submit">
                {
                  this.state.isUpdatingTrackingTerm ? <img className="updating-term" src={loader} alt="Loading..."/> : '➤'
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
}

export default App;
