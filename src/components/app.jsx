import { App } from 'framework7-react'
import localforage from 'localforage'
import React from 'react'
import { Helmet } from 'react-helmet'
import store from '../js/store'
import CurrentPositionButton from './currentPositionButton'
import CurrentPositionInfoButton from './currentPositionInfoButton'
// Own components
import Map from './map'
import NotificationButton from './notificationButton'
import RoutePanel from './routePanel'
import SearchBar from './searchBar'
import RoutingButton from './startRoutingButton'
import WikiPanel from './wikiPanel'
import WikipediaButton from './wikipediaButton'

const LocationBasedService = () => {
  // Framework7 Parameters
  const f7params = {
    name: 'DHBW Maps | Der Kartenservice', // App name
    theme: 'auto', // Automatic theme detection
    // App store
    store: store,
    // Register service worker (only on production build)
    // eslint-disable-next-line no-undef
    serviceWorker:
      process.env.NODE_ENV === 'production'
        ? {
          path: '/service-worker.js',
        }
        : {},
  }

  localforage.setDriver(localforage.INDEXEDDB)

  return (
    <App {...f7params} themeDark>
      <Helmet>
        <html lang="de" />
        <meta charSet="utf-8" />
        <title>DHBW Maps | Der Kartenservice</title>
        <meta
          name="description"
          content="Durch eine Karte kann eine Position oder der aktueller Standort mit ihren Geo-Koordinaten ausgewählt werden. Mit Hilfe des Location Based Service können nun die entsprechenden Information zur Örtlichkeit eingesehen werden, sowie eine Route ausgehend vom aktuellen Standort berechnet werden."
        />
        <meta property="og:image" content="/icons/455x256.png" />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="256" />
        <meta property="og:image:height" content="256" />
      </Helmet>
      <SearchBar />
      <NotificationButton />
      <RoutingButton />
      <RoutePanel />
      <WikipediaButton />
      <CurrentPositionInfoButton />
      <CurrentPositionButton />
      <WikiPanel />
      <Map />
    </App>
  )
}

export default LocationBasedService
