import { List, ListItem, useStore } from 'framework7-react'
import localforage from 'localforage'
import React, { useEffect, useState } from 'react'
import { FaSearch } from 'react-icons/fa'
import '../css/searchBar.css'
import { geocoding, reverseGeocoding } from '../js/geocoding'
import store from '../js/store'
import getWikiData from '../js/wikipedia'

const SearchBar = () => {
  const [showResults, setShowResults] = useState(true)
  const [searchText, setSearchText] = useState('')
  const [searchHistory, setSearchHistory] = useState([])
  const [height, setHeight] = useState(0)
  const programmaticSearch = useStore('programmaticSearch')

  const loadSearchHistory = () => {
    localforage.getItem('searchHistory').then((array) => {
      if (array) {
        setSearchHistory(array)
      } else {
        console.log('No search history found')
      }
    })
  }

  useEffect(() => {
    if (programmaticSearch) {
      setSearchText(programmaticSearch)
      handleSearch(programmaticSearch)
    }
  }, [programmaticSearch])

  // Prüft ob der Suchbegriff bereits in der Lokalen Datenbank vorhanden ist
  // und fragt andernfalls die Daten ab.
  // Das Ergebnis wird im WikiPanel angezeigt.
  const handleSearch = async (entryText) => {
    console.log('Searching for: ', entryText)

    if (entryText !== '') {
      setShowResults(false)
      let foundSearchTextInSearchHistory = false
      let foundSearchHistoryEntry = {}

      searchHistory.map((entry) => {
        if (entryText === entry.text) {
          foundSearchTextInSearchHistory = true
          foundSearchHistoryEntry = entry
        }
      })

      store.dispatch('newCurrentWikiEntry', null)
      store.dispatch('openWikiPanel')

      if (!foundSearchTextInSearchHistory) {
        // Reguläre Ausdruck um zu überprüfen, ob es sich bei der Nutzereingabe um einen Längen- und Breitengrad handelt.
        // Übernommen aus https://stackoverflow.com/a/18690202/7179628
        const regExGeoCoords = RegExp(
          /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/
        )

        let newCoords
        if (regExGeoCoords.test(entryText)) {
          newCoords = {
            lat: entryText.split(', ')[0],
            lng: entryText.split(', ')[1],
          }
          console.log('regEx', newCoords)
        } else {
          newCoords = await geocoding(entryText)
          console.log('noRegEx', newCoords)
        }

        if (!newCoords) {
          console.log('No coordinates found')
          store.dispatch('newCurrentWikiEntry', 'not found')
          return
        }

        let newGeolocation = await reverseGeocoding(newCoords.lng, newCoords.lat)

        let cityName
        if (newGeolocation.error) {
          cityName = newGeolocation.error
        } else {
          cityName =
            newGeolocation.address.city || newGeolocation.address.town || newGeolocation.address.village || searchText
        }

        let newWikiData
        try {
          newWikiData = await getWikiData(cityName)
        } catch (error) {
          console.log('Fehler Wikidaten: ' + error)
          newWikiData = 'not found'
        }

        // Fügt sowohl die Daten zum Suchbegriff, als auch die Daten zugeordnet zu den Geokoordinaten in die SearchHistory ein.
        let newHistoryEntry = {
          text: entryText,
          coords: newCoords,
          wikiData: newWikiData,
          city: cityName,
          address: newGeolocation.display_name,
        }
        let newHistoryEntryCords = {
          text: `${newCoords.lat}, ${newCoords.lng}`,
          coords: newCoords,
          wikiData: newWikiData,
          city: cityName,
          address: newGeolocation.display_name,
        }
        let newHistory = [...searchHistory, newHistoryEntry, newHistoryEntryCords]

        setSearchHistory(newHistory)

        localforage.setItem('searchHistory', newHistory).then(() => {
          console.log('Saved search history')
          console.table(newHistory)
        })

        store.dispatch('newCurrentWikiEntry', newHistoryEntry)
      } else {
        store.dispatch('newCurrentWikiEntry', foundSearchHistoryEntry)
      }
    }
  }

  useEffect(() => {
    loadSearchHistory()
    setHeight(document.getElementById('customSearchBarInputEl').clientHeight)
  }, [])

  const Results = () => {
    const ResultItems = () => {
      return searchHistory.map((entry, index) => {
        return (
          <div key={index}>
            {/* Filtert die Suchergebnisse in der lokalen Datenbank nach dem Suchstring */}
            {entry.text.toLowerCase().includes(searchText.toLowerCase()) ? (
              <ListItem
                className="searchBarResult"
                title={entry.text}
                onClick={() => {
                  setSearchText(entry.text)
                  handleSearch(entry.text)
                }}
              />
            ) : null}
          </div>
        )
      })
    }

    return searchHistory.length > 0 ? (
      <ResultItems />
    ) : (
      <ListItem className="searchBarResult" title="Kein Ergebnis gefunden" />
    )
  }

  return (
    <div className="search-bar">
      <form
        onSubmit={(event) => {
          event.preventDefault()
          handleSearch(searchText)
        }}
        className={'customSearchBarWrapper'}
      >
        <input
          id={'customSearchBarInputEl'}
          className={'customSearchBarMar'}
          autoComplete={'off'}
          placeholder={'Suche'}
          value={searchText}
          onChange={(event) => {
            setSearchText(event.target.value)
            setShowResults(true)
          }}
        ></input>
        <button style={{ height: height }} className={'customSearchBarButton'}>
          <FaSearch />
        </button>
      </form>
      <div style={{ display: searchText ? 'block' : 'none' }}>
        {showResults ? (
          <List className="search-list searchbar-found" style={{ margin: 0 }}>
            <Results />
          </List>
        ) : null}
      </div>
    </div>
  )
}

export default SearchBar
