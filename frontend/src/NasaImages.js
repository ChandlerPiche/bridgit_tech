import { useState } from 'react';
import {
  useLazyQuery,
  gql
} from "@apollo/client";

// HELPERS
function drawColumns(data) {
    const quarter = Math.ceil(data.images.length / 4)
    const half = Math.ceil(data.images.length / 2);
    const third = Math.ceil(3 * data.images.length / 4);    

    const first_quarter = data.images.slice(0, quarter)
    const second_quarter = data.images.slice(quarter, half)
    const third_quarter = data.images.slice(half, third)
    const fourth_quarter = data.images.slice(third)
    return(
        <div className="row">
            {makeColumn(first_quarter)}
            {makeColumn(second_quarter)}
            {makeColumn(third_quarter)}
            {makeColumn(fourth_quarter)}
        </div>
    )
}

function makeColumn(images) {
    return(
        <div className='column'>
            {images.map(image => {
            return(
                <div className="grid_item" key={image.href}>
                    <h3>
                    {image.title}
                    </h3>
                    <img src={image.href} />
                </div>
            )
            })}
        </div>
    )
}

// QUERIES
const NASA_QUERY = gql`
  query Images($q: String!, $from: Int!) {
    images(q: $q, from: $from) {
      href
      description
      title
    }
  }
`;

export function NasaImages() {

  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("saturn");

  const [getImages, { loading, error, data }] = useLazyQuery(NASA_QUERY);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  return(
    <div id="body">
        <div id="search">
          <input type="text"
            value={ query }
            onChange={(e) => setQuery(e.target.value )} 
          />

          <button onClick={() => {
            getImages({variables:{q:query, from:1}}); 
            setPage(1)
          }}>
            Search
          </button>
        </div>
        

        <div id="pages">
          <button onClick={() => {
            if (page > 1) {
              getImages({variables:{q:query, from:page - 1}}); 
              setPage(page - 1);
            }
            }}>&lt;</button>
          Page {page}
          <button onClick={() => {getImages({variables:{q:query, from:page + 1}}); setPage(page + 1);}}>&gt;</button>
        </div>
      
      {data ? drawColumns(data): null}
    </div>
  )
}