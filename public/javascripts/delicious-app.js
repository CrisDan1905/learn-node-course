import '../sass/style.scss';

import { $, $$ } from './modules/bling';
import autocomplet from './modules/autocomplete';

autocomplet( $('#address'), $('#lat'), $('#lng') );