mapboxgl.accessToken = '<your-access-token>';

var yourCustomStyle = 'mapbox://styles/edoardograssi/ck42ojmdc7b6w1cl5etew7evc';

class NominatimControl {
    onAdd(map) {
        this._map = map;
        this._container = document.createElement('div');
        this.timeoutId = -1;
        this.input = document.createElement('input');
        this.input.setAttribute('placeholder', 'Search...');
        this.input.onchange = this.searchPlace.bind(this);
        this.results = document.createElement('div');
        this.results.className = 'nominatim-results'
        this._container.appendChild(this.input);
        this._container.appendChild(this.results);
        this._container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group nominatim';
        return this._container;
    }

    onRemove() {
        this._container.parentNode.removeChild(this._container);
        this._map = undefined;
    }
    
    setupInterval() {
        if (this.input.value.length > 3) {
            clearTimeout(this.timeoutId);
            this.intervalId = setTimeout(this.searchPlace.bind(this, this.input.value), 3000);
            this.results.innerHTML = '';
            this.input.classList.remove('results-open');
        }
    }

    searchPlace() {
        fetch(`http://${window.location.hostname}:7070/search?countrycodes=it&q=${this.input.value}&format=json&accept-language=it`)
        .then((response) => response.json())
        .then((json) => {
            this.results.innerHTML = "";
            for (var i = 0; i < Math.min(json.length, 3); i++) {
                var element = document.createElement('div');
                element.innerHTML = json[i].display_name;
                element.onclick = this.pointView.bind(this, json[i].boundingbox, json[i].display_name);
                this.results.appendChild(element);
            }
            this.input.classList.add('results-open');
        });
    }
    
    pointView(boundingbox, name) {
        var newbbox = [boundingbox[3], boundingbox[1], boundingbox[2], boundingbox[0]];
        this._map.fitBounds(newbbox);
        this.input.value = name;
    }
}

class StyleControl {
    onAdd(map) {
        this._map = map;
        this._container = document.createElement('div');
        this._container.innerHTML = `<input type="radio" checked name="style" value="mapbox://styles/mapbox/streets-v11"  onclick="changeStyle(this)"> Mapbox Style <br>` +
            `<input type="radio" name="style" value="${yourCustomStyle}" onclick="changeStyle(this)"> Custom Style`;
        this._container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group style-control';

        return this._container;
    }

    onRemove() {
        this._container.parentNode.removeChild(this._container);
        this._map = undefined;
    }
    
}

var lastStyle = 'mapbox://styles/mapbox/streets-v11';

function changeStyle(e) {
    document.querySelector('input[name=style][value="' + lastStyle + '"]').checked = false;
    map.setStyle(e.value);
    lastStyle = e.value;
}

var map = new mapboxgl.Map({
    container: 'map',
    style: lastStyle,
    center: [42.504154, 12.646361],
    maxZoom: 18,
    hash: true,
    maxBounds: [
        [3.47237, 30.58585], // Southwest coordinates
        [21.57784, 50.55929] // Northeast coordinates
    ]
});

// Remove rotation
map.addControl(new mapboxgl.NavigationControl({
    showCompass: false
}));
map.dragRotate.disable();
map.touchZoomRotate.disableRotation();

// Add geolocation control
map.addControl(new mapboxgl.GeolocateControl({
    positionOptions: {
        enableHighAccuracy: true
    },
    trackUserLocation: true
}));

// Add nominatim control
map.addControl(new NominatimControl(), 'top-left');

// Add style control
map.addControl(new StyleControl());