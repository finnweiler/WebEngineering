import React, { useState, useEffect } from 'react'
import { List, ListItem } from 'framework7-react'
import { FaSearch } from 'react-icons/fa'
import localforage from 'localforage'
import '../css/searchBar.css'
import { Geocoding, ReverseGeocoding } from '../js/geocoding'
import getWikiData from '../js/wikipedia'

const SearchBar = () => {
  const [showResults, setShowResults] = useState(true)
  const [searchText, setSearchText] = useState('')
  const [searchHistory, setSearchHistory] = useState([])
  const [height, setHeight] = useState(0)

  const loadSearchHistory = () => {

    localforage.getItem('searchHistory').then(array => {
      if (array) {
        setSearchHistory(array)
      }else {
        console.log('No search history found')
      }
    })
  }

  const handleSearch = async (entryText) => {

    if (entryText !== '') {
      setShowResults(false)
      let foundSearchTextInSearchHistory = false
      let foundSearchHistoryEntry = {}

      searchHistory.map(entry => {
        if (entryText === entry.text) {
          foundSearchTextInSearchHistory = true
          foundSearchHistoryEntry = entry
        }
      })

      if (!foundSearchTextInSearchHistory) {

        const regExGeoCoords = RegExp(/^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/)
        
        let newCoords
        if (regExGeoCoords.test(searchText)) {
          newCoords = {
            lat: searchText.split(',')[0],
            lng: searchText.split(',')[1]
          }
        } else {
          newCoords = await Geocoding(searchText)
          console.log(newCoords)
        }

        let newGeolocation = await ReverseGeocoding(newCoords.lng, newCoords.lat)
        const cityName = newGeolocation.address.city || newGeolocation.address.town || newGeolocation.address.village || searchText
        
        let newWikiData
        try {
          newWikiData = await getWikiData(cityName)
        } catch (error) {
          console.log('Fehler Wikidaten: '+ error)
          newWikiData = 'not found'
        }

        let newHistoryEntry = {
          text: searchText,
          coords: newCoords,
          wikiData: newWikiData,
          city: cityName,
          address: newGeolocation.display_name,
          lat: newGeolocation.lat,
          lon: newGeolocation.lon
        }
        let newHistory = [...searchHistory, newHistoryEntry]
      
        setSearchHistory(newHistory)
  
        localforage.setItem('searchHistory', newHistory).then(() => {
          console.log('Saved search history')
          console.table(newHistory)
        })

        localforage.setItem('currentSearchHistoryEntry', newHistoryEntry).then(() => {
          console.log('Saved current searched history entry')
          console.table(newHistoryEntry)
        })
        
        localforage.setItem('wikiPanelOpened', true)

      } else {
        localforage.setItem('currentSearchHistoryEntry', foundSearchHistoryEntry).then(() => {
          console.log('Saved current searched history entry')
          console.table(foundSearchHistoryEntry)
        })

        localforage.setItem('wikiPanelOpened', true)
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
            {entry.text.toLowerCase().includes(searchText.toLowerCase()) ?
              <ListItem className="searchBarResult" title={entry.text} onClick={() => {setSearchText(entry.text), handleSearch(entry.text)}} />
              :null}
          </div>
        )
      })
    }

    return (searchHistory.length > 0 ? <ResultItems /> : <ListItem className="searchBarResult" title="Kein Ergebnis gefunden" />)
  }

  return (
    <div className="search-bar">
      <form onSubmit={(event) => {event.preventDefault(), handleSearch(searchText)}} className={'customSearchBarWrapper'}>
        <input
          id={'customSearchBarInputEl'}
          className={'customSearchBarMar'}
          autoComplete={'off'}
          placeholder={'Suche'}
          value={searchText}
          onChange={event => {setSearchText(event.target.value), setShowResults(true)}}
        ></input>
        <button style={{height: height}} className={'customSearchBarButton'}><FaSearch /></button>
      </form>
      <div style={{ display: searchText ? 'block' : 'none' }}>
        {showResults ?
          <List className='search-list searchbar-found' style={{ margin: 0 }}>
            <Results />
          </List>
          :null}
      </div>
    </div>
  )
}

export default SearchBar