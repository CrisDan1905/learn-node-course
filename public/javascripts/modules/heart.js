import axios from 'axios';
import { $ } from './bling';

function ajaxHeart(e) {
    e.preventDefault();
    axios
        .post(this.action)
        .then(res => {
            const isHearted = this.heart.classList.toggle('heart__button--hearted'); // Se puede acceder a .heart porque es el nombre que tiene un elemento dentro de la etiqueta form (en este caso un boton)
            $('.heart-count').textContent = res.data.hearts.length;
            if (isHearted)
                this.heart.classList.add('heart__button--float');
                setTimeout(() =>  this.heart.classList.remove('heart__button--float'), 2500);
        })
        .catch(console.error);
}

export default ajaxHeart;