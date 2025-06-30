import React from 'react'

const SearchBar = ({searchTerm,setSearchTerm}) => {
  return (
    <div className='search'>
        
        <div>
            <img src="/search.svg" alt="" />
            <input type="text" placeholder ="Search thousands of movies"
            value={searchTerm}
            onChange={(e)=>setSearchTerm(e.target.value)}
         />
            
        </div>
    </div>
  )
}

export default SearchBar