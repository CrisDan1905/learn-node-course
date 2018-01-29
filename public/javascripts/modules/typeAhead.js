import axios from 'axios'; // libreria como un "fetch" pero con algunas mejoras
import dompurify from 'dompurify'; // libreria para evitar ataques XSS
function searchResultsHTML(stores) {
    return stores.map(store => 
    `
        <a href="/store/${store.slug}" class="search__result">
            <strong>${store.name}</strong>
        </a>
    `
    ).join('');
}

function typeAhead(search) {
    if (!search)
        return;

    const searchInput = search.querySelector('input[name="search"]');
    const searchResults = search.querySelector('.search__results');

    searchInput.on('input', function() {
        // if there's no value, quit it!
        if (!this.value) {
            searchResults.style.display = 'none';
            return;
        }
        // Show the search results!
        searchResults.style.display = 'block';

        axios
            .get(`/api/search?q=${this.value}`)
            .then( res => {
                if (res.data.length) {
                    searchResults.innerHTML = dompurify.sanitize(searchResultsHTML(res.data));
                    return;
                }
                // tell them nothing came back
                searchResults.innerHTML = dompurify.sanitize(`<div class="search__result">No result for ${this.value} found</div>`);
                
            })
            .catch(err => console.log(err));
    })

    // handle keyboard inputs
        searchInput.on('keyup', e => {
            // if isn't press enter, keyup or keydown keep on going!
            if (![38, 40, 13].includes(e.keyCode))
                return;
            
            const activeClass = 'search__result--active';
            const current = search.querySelector(`.${activeClass}`);
            const items = search.querySelectorAll('.search__result');
            let next; // Para saber cual será el siguiente en la lista a seleccionar

            // navigation behavior
            if (e.keyCode === 40 && current)
                next = current.nextElementSibling || items[0]; // items[0] en caso de que el seleccionado en ese momento sea el ultimo en la lista
            else if (e.keyCode === 40) // En el caso que no haya ninguno seleccionado aún
                next = items[0];
            else if (e.keyCode === 38 && current)
                next = current.previousElementSibling || items[items.length -1];
            else if (e.keyCode === 38)
                next = items[items.length -1];
            else if (e.keyCode === 13 && current.href)
                window.location = current.href;

            if (current)
                current.classList.remove(activeClass);

            next.classList.add(activeClass);
        })
}


export default typeAhead;