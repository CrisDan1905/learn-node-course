function autocomplete(input, latInput, lngInput) {
    if (!input) return; // Don't run this function if there's no input in the page
    const dropdown = new google.maps.places.Autocomplete(input);

    dropdown.addListener('place_changed', () => {
        const place = dropdown.getPlace(); // Este metodo retorna un objeto con toda la información sobre el lugar
        latInput.value = place.geometry.location.lat();
        lngInput.value = place.geometry.location.lng();
    })

    // Para que al presionarse enter dentro de un input envie el formulario
    input.on('keydown', e => {
        if (e.keyCode === 13)
            e.preventDefault();
    })
}

export default autocomplete;