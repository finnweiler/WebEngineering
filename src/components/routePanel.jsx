import { Block, BlockTitle, Navbar, Page, Panel, useStore, View } from 'framework7-react'
import L from 'leaflet'
import React from 'react'
import store from '../js/store'

const RoutePanel = () => {
  const routeInstructions = useStore('routeInstructions')
  const isRoutePanelOpen = useStore('isRoutePanelOpen')

  const formatter = new L.Routing.Formatter({ language: 'de' })

  function panelClosing() {
    store.dispatch('closeRoutePanel')
  }

  return (
    <Panel right cover themeDark opened={isRoutePanelOpen} onPanelClose={() => panelClosing()}>
      <View>
        <Page>
          <Navbar title="Wegbeschreibung" />
          <Block>
            <BlockTitle>{routeInstructions?.name}</BlockTitle>
            <Block strong>
              <BlockTitle>Zusammenfassung</BlockTitle>
              <p>Distanz: {formatter.formatDistance(routeInstructions?.summary.totalDistance, 10)}</p>
              <p>Zeit: {formatter.formatTime(routeInstructions?.summary.totalTime)}</p>
            </Block>
            <Block strong>
              <BlockTitle>Wegbeschreibung</BlockTitle>
              {routeInstructions?.instructions?.map((instruction, i) => {
                return (
                  <p key={instruction + i}>
                    {i + 1}. {formatter.formatInstruction(instruction)}
                  </p>
                )
              })}
            </Block>
          </Block>
        </Page>
      </View>
    </Panel>
  )
}

export default RoutePanel
