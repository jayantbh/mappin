import React, { Component } from 'react';
import ReactMapboxGl, { Marker } from "react-mapbox-gl";

import '../../node_modules/mapbox-gl/dist/mapbox-gl.css';

import './PhotoMap.css';
import logo from '../assets/flickr.svg';
import heart from '../assets/heart.svg';

import { MAPBOX_KEY } from '../keys';

const Map = ReactMapboxGl({
  accessToken: MAPBOX_KEY
});

export default class PhotoMap extends Component {
  constructor(props) {
    super(props);
    this.state = {
      style: 'mapbox://styles/jayantbhawal/cj9yiw8tw7nmi2rlu2nnqzndd',
      zoom: [1],
      center: [0,20],
      maxBounds: [[-180, -60], [180, 80]],
      containerStyle: {
        height: "100vh",
        width: "100vw"
      },
      popupLimit: 12
    }
  }

  centerOnPoint(point, zoom) {
    this.setState({ center: point, zoom: [zoom] });
  }

  handlePopupAutoShow(el, photo) {
    if (!el) return;
    const show = this.props.photos.slice(-1 * this.state.popupLimit).includes(photo);
    setTimeout(() => el.classList.toggle('active', show), 300);
  }

  handleMarkerAddition(el) {
    if (!el) return;
    setTimeout(() => el.classList.remove('shrink'), 100);
  }

  handleMarkerAdditionForFavs(el, photo) {
    if (!el) return;
    let favs = this.props.favs;
    let isFavd = favs.filter((fav) => fav.id === photo.id).length;
    if (isFavd) el.classList.add('is-fave');
  }

  toggleImageFave(e, photo) {
    e.stopPropagation();

    let favs = this.props.favs;
    let isFavd = favs.filter((fav) => fav.id === photo.id).length;
    if (isFavd) {
      e.target.classList.remove('is-fave');
      this.props.handleFaveToggle(photo, false);
    } else {
      photo = Object.assign(photo, {
        addedAt: new Date()
      });
      this.props.handleFaveToggle(photo, true);
    }
  }

  render() {
    return (
      <div>
        <Map
          style={this.state.style}
          center={this.state.center}
          zoom={this.state.zoom}
          maxBounds={this.state.maxBounds}
          containerStyle={this.state.containerStyle}
          >
            {
              this.props.photos.map((photo) => {
                return (
                  <Marker
                    key={photo.id}
                    coordinates={photo.point}
                    anchor="bottom"
                    className="marker-component"
                    onClick={() => this.centerOnPoint(photo.point, 11)}
                  >
                    <div className="provider-marker shrink" ref={(el) => this.handleMarkerAddition(el)}>
                      <img src={logo} alt="marker"/>
                    </div>
                    <div className="provider-marker add-to-favs" ref={(el) => this.handleMarkerAdditionForFavs(el, photo)} onClick={(e) => this.toggleImageFave(e, photo)}>
                      <img src={heart} height="16" width="16" alt="marker"/>
                    </div>
                    <div className="provider-marker--content" ref={(el) => this.handlePopupAutoShow(el, photo)}>
                      <span className="caption">{photo.text}</span>
                      <img className="map-photo loading-photo" src={photo.url} alt={photo.text}/>
                    </div>
                  </Marker>
                );
              })
            }
        </Map>
      </div>
    );
  }
}
