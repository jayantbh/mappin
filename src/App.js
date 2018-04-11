import React, { Component } from 'react';
import './App.css';

import PhotoMap from './components/PhotoMap';
import loader from './assets/loader.svg';
import heart from './assets/heart.svg';

import firebase from './helpers/firebase';
import { imageLookup, IMAGE_LOOKOUP_LIMIT } from './helpers/utils';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      track: window.localStorage.trackingTerm || 'planets',
      photos: [],
      favs: [],
      limit: IMAGE_LOOKOUP_LIMIT,
      arrayLimit: 10000,
      isUpdatingTrackingTerm: false,
      isLoggedIn: false,
      userProfile: null,
      showFaves: false
    };

    this.lookupImages();
  }

  componentWillMount() {
    firebase.auth().signInAnonymously().then((user) => {
      this.setState({ isLoggedIn: !!user, userProfile: user });
      this.loadFavs();
    });
  }

  componentDidMount() {
    this.unregisterAuthObserver = firebase.auth().onAuthStateChanged((user) => {
      this.setState({ isLoggedIn: !!user, userProfile: user });
    });
  }

  componentWillUnmount() {
    this.unregisterAuthObserver();
  }

  async loadFavs() {
    let favs = await firebase.database().ref(`/${this.state.userProfile.uid}`).once('value');
    favs = favs.val();
    if (!favs) return;

    favs = Object.keys(favs).map(k => Object.assign(favs[k], { generatedKey: k }));

    let photos = this.state.photos.slice(0);

    favs.forEach(fav => {
      let index = photos.map(p => p.id).indexOf(fav.id);
      photos[index] = fav;
    });

    this.setState({ favs, photos });
  }

  async lookupImages() {
    let photos = await imageLookup(this.state.track);
    photos = photos.photos.photo;
    let processedPhotos = photos.map((photo) => {
      return {
        id: photo.id,
        text: photo.title,
        point: [photo.longitude, photo.latitude],
        url: photo.url_z
      };
    });
    this.setState({ photos: processedPhotos, isUpdatingTrackingTerm: false });

    setTimeout(() => this.lookupImages(), 10000)
  }

  lastFewPhotos = () => this.state.photos.slice(-1 * this.state.limit);

  updateTrackingTerm(e) {
    e.preventDefault();
    const value = e.currentTarget['tracking-term'].value;
    this.setState({ track: value, isUpdatingTrackingTerm: true });
    window.localStorage.trackingTerm = value;
  }

  handleFaveToggle(photo, toAdd) {
    let favs = this.state.favs.slice(0);
    let photos = this.state.photos.slice(0);
    let index = photos.map(p => p.id).indexOf(photo.id);

    photo = photos[index];

    if (toAdd) {
      firebase.database().ref().child(`/${this.state.userProfile.uid}`).push(photo).once('value').then((newFav) => {
        photo = Object.assign(photo, { generatedKey: newFav.key });
        favs.push(photo);
        photos[index] = photo;
        this.setState({ favs, photos });
      });
    } else {
      let fi = favs.map(fav => fav.id).indexOf(photo.id);
      favs.splice(fi, 1);
      this.setState({ favs });
      firebase.database().ref().child(`/${this.state.userProfile.uid}/${photo.generatedKey}`).remove();
    }
  }

  render() {
    return (
      <div>
        <PhotoMap photos={this.lastFewPhotos()} favs={this.state.favs} handleFaveToggle={(photo, toAdd) => this.handleFaveToggle(photo, toAdd)} />
        <div className="overlay-interface">
          <header>
            <form className="tracking-term-component" onSubmit={(e) => this.updateTrackingTerm(e)}>
              <label htmlFor="tracking-term" className="header-form-label">Search Term</label>
              <div className="tracking-term-input">
                <input id="tracking-term"
                       name="tracking-term"
                       placeholder="Enter tracking term here..."
                       value={this.state.track}
                       onChange={({ target: { value } }) => this.setState({ track: value })}
                       onInput={({ target: { value } }) => this.setState({ track: value })}
                />
                <button className="header-form-button" type="submit">
                  {
                    this.state.isUpdatingTrackingTerm ? <img className="updating-term" src={loader} alt="Loading..."/> : '➤'
                  }
                </button>
              </div>
            </form>
            <form className="generic-header-item session-control-component" onSubmit={(e, form) => this.handleSession(e, form)}>
              <span className="header-form-label">{ this.state.isLoggedIn ? 'Logged in' : 'Logging in' }</span>
              <div className="tracking-term-input">
                <span className="session-control-label" type="submit">Anonymously</span>
              </div>
            </form>
            <div className="generic-header-item faves-toggle">
              <img className={this.state.showFaves ? "active" : ""} src={heart} height="20" width="20" alt="marker" onClick={() => this.setState({ showFaves: !this.state.showFaves })}/>
            </div>
          </header>
          <div className={"faves-list" + (this.state.showFaves ? "" : " hide-faves")}>
            <div className="faves-list-wrapper">
              {
                this.state.favs.map(fav => {
                  return (
                    <div key={fav.id} className="fav-wrapper">
                      <img src={fav.url} alt={fav.text}/>
                    </div>
                  );
                })
              }
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
