import { useStore } from 'framework7-react'
import L from 'leaflet'
import 'leaflet-routing-machine'
import { useEffect } from 'react'
import { useMap, useMapEvents } from 'react-leaflet'
import store from '../js/store'

const Routing = (props) => {
  const map = useMap()
  const previousControl = useStore('routeControl')

  const reloadMap = useStore('reloadMap')
  const destination = useStore('destination')

  // Handles creation of markers
  // - adds icon
  // - listens on dragging
  // - handles draggable (true/false)
  const createMarkerHandler = (i, waypoint, _) => {
    let marker = null

    if (i == 0) {
      marker = L.marker(waypoint.latLng, {
        draggable: false,
        icon: L.icon({
          iconUrl: '/icons/red_marker.png',
          iconSize: [29, 50],
          iconAnchor: [15, 49],
        }),
      })

      // when dragging is over set the new destination {lat, lng}
      marker.on('dragend', (e) => {
        store.dispatch('newCurrentPosition', e.target._latlng)
      })
    } else {
      marker = L.marker(waypoint.latLng, {
        draggable: true,
        icon: L.icon({
          iconUrl: '/icons/blue_marker.png',
          iconSize: [29, 50],
          iconAnchor: [15, 49],
        }),
      })

      // when dragging is over set the new destination {lat, lng}
      marker.on('dragend', (e) => {
        store.dispatch('newDestination', e.target._latlng)
      })
    }
    return marker
  }

  function loadRoute(latlng) {
    // creates Route control object
    const control = L.Routing.control({
      language: 'de',
      formatter: new L.Routing.Formatter({ language: 'de' }),
      waypoints: [L.latLng(props.user.lat, props.user.lng), L.latLng(latlng.lat, latlng.lng)],
      fitSelectedRoutes: true,
      addWaypoints: false,
      routeWhileDragging: true,
      createMarker: createMarkerHandler,
    }).addTo(map)

    store.dispatch('newRouteControl', control)

    // when new routes are found then add the instructions to the store
    control.on('routesfound', (e) => {
      store.dispatch('newRouteInstructions', e.routes[0])
    })
  }

  // reload map when triggered by store
  useEffect(() => {
    if (destination != null && props.user != null) {
      if (previousControl) {
        map.removeControl(previousControl)
      }
      loadRoute(destination)
    }
  }, [reloadMap])

  // listen map click event
  useMapEvents({
    click(e) {
      store.dispatch('newDestination', e.latlng)
      store.dispatch('newReloadMap')
    },
  })

  return null
}

export default Routing
