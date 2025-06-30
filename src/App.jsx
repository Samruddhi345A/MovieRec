import { useState, useEffect } from 'react'
import { useDebounce } from 'use-debounce'
import './App.css'

import SearchBar from './components/SearchBar'
import Spinner from './components/Spinner'
import MovieCard from './components/MovieCard'
import { getTrendingMovies, updateSearchCount } from '../appwrite'


const API_BASE_URL = "https://api.themoviedb.org/3"
const API_KEY = import.meta.env.VITE_TMDB_API_KEY

const API_OPTIONS = {
  method: "GET",
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
}
function App() {
  const [searchTerm, setSearchTerm] = useState("")
  const [errorMessage, setErrorMessage] = useState("")


  const [debounceSearchTerm] = useDebounce(searchTerm, 500)

  const [movieList, setMovieList] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [trendingMovies, setTrendingMovies] = useState([])

  const fetchMovies = async (query = '') => {
    setIsLoading(true)
    setErrorMessage("")
    try {
      const endpoint = query ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}` : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`
      const response = await fetch(endpoint, API_OPTIONS)

      if (!response.ok) {
        throw new Error("Failed To fetch Movies")
      }

      const data = await response.json()
      if (data.Response === 'False') {
        setErrorMessage(data.Error || "Failed to Fetch movies")
        setMovieList([])
        return;
      }
      setMovieList(data.results || [])

      if (query && data.results.length > 0) {
        await updateSearchCount(query, data.results[0])
      }

    }
    catch (error) {
      console.log(`error fetching movies: ${error}`)
      setErrorMessage("Error fetching movies. Please try again")
    }
    finally {
      setIsLoading(false)
    }
  }

  const loadTrendingMovies = async () => {
    try {
      const movies = await getTrendingMovies()
      setTrendingMovies(movies)
    } catch (error) {
      console.log(`Error fecthing trending movies: &{error}`)
    }
  }

  useEffect(() => {
    loadTrendingMovies()
  }, [])

  useEffect(() => {
    fetchMovies(debounceSearchTerm)
  }, [debounceSearchTerm])
  return (
    <main>
      <div className='pattern' />
      <div className='wrapper'>
        <header>
          <img src="/hero.png" alt="hero banner" />
          <h1>
            Find <span className='text-gradient'>Movies</span> you enjoy without the hassel
          </h1>
          <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>

       {trendingMovies.length >0 ?
       (<section className='trending'>
        <h2>
          Trending Movies
        </h2>
        <ul>
          {trendingMovies.map((movie,index)=>(
            <li key={movie.$id}>
              <p>
                {index+1}
              </p>
              <img src={movie.poster_url} alt={movie.title}/>
            </li>
          ))}
        </ul>
       </section>):null
      }

        <section className='all-movies'>
          <h2 >
            All Movies
          </h2>
          {isLoading ? (

            <Spinner />

          ) :
            errorMessage ? (
              <p className='text-red-500'>
                {errorMessage}
              </p>
            ) :
              <ul>
                {movieList.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </ul>
          }
        </section >


      </div>

    </main>
  )
}

export default App
