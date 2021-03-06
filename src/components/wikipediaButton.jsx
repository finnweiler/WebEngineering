import { Button, Icon, useStore } from 'framework7-react'
import React from 'react'
import store from '../js/store'

const WikipediaButton = () => {
  // if destination Adress is present add it into the Searchbar and open WikiPanel
  const destination = useStore('destination')
  function showWikipedia() {
    if (destination != null) {
      store.dispatch('openWikiPanel')
      store.dispatch('newProgrammaticSearch', `${destination.lat}, ${destination.lng}`)
    }
  }

  return (
    <div style={{ zIndex: 1000, position: 'absolute', bottom: '25px', left: '15px' }}>
      <Button fill raised onClick={() => showWikipedia()} disabled={!destination}>
        <Icon size="18" f7="info"></Icon>
      </Button>
    </div>
  )
}

export default WikipediaButton
