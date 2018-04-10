import React, { Component } from 'react';
import ReactMapboxGl, { Marker } from "react-mapbox-gl";

import '../../node_modules/mapbox-gl/dist/mapbox-gl.css';

import './PhotoMap.css';
import logo from '../assets/flickr.svg';

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
              this.props.photos.map((photo, i) => {
                return (
                  <Marker
                    key={photo.id}
                    coordinates={photo.point}
                    anchor="bottom"
                    className="marker-component"
                    onClick={() => this.centerOnPoint(photo.point, 11)}
                  >
                    <div className="twitter-marker shrink" ref={(el) => this.handleMarkerAddition(el)}>
                      <img src={logo} alt="marker"/>
                    </div>
                    <div className="twitter-marker--content" ref={(el) => this.handlePopupAutoShow(el, photo)}>
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
