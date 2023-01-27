import axios from 'axios';
import Notiflix, { Notify } from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const refs = {
  form: document.querySelector('.search-form'),
  input: document.querySelector('input'),
  gallery: document.querySelector('.gallery'),
  loadMoreBtn: document.querySelector('.load-more'),
};

refs.loadMoreBtn.style.display = 'none';
let page = 1;
let cardsDisplayed = 0;

refs.form.addEventListener('submit', onSearch);
refs.loadMoreBtn.addEventListener('click', onloadMoreBtn);

function onloadMoreBtn() {
  refs.loadMoreBtn.style.display = 'none';
  const name = refs.input.value.trim();
  page += 1;
  pixabayAPI(name, page);
  refs.loadMoreBtn.style.display = 'flex';
}

function onSearch(evt) {
  evt.preventDefault();
  cardsDisplayed = 0;
  refs.gallery.innerHTML = '';
  const name = refs.input.value.trim();

  if (name !== '') {
    pixabayAPI(name);
     refs.loadMoreBtn.style.display = 'none';
  } else {
    refs.loadMoreBtn.style.display = 'none';
    return Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  }
}

async function pixabayAPI(name, page) {
  const API_URL = 'https://pixabay.com/api/';

  const options = {
    params: {
      key: '33068363-7af952915bf6f1bda302967fe',
      q: name,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: 'true',
      page: page,
      per_page: 40,
    },
  };

  try {
    const response = await axios.get(API_URL, options);
    cardsDisplayed += response.data.hits.length;

    message(
      response.data.hits.length,
      cardsDisplayed,
      options.params.per_page,
      response.data.total
    );

    createMarkup(response.data);
  } catch (error) {
    console.log(error);
  }
}

const simpleLightBox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
});

function createMarkup(arr) {
  const markup = arr.hits
    .map(
      item =>
        `<a class="photo-link" href="${item.largeImageURL}">
            <div class="photo-card">
            <div class="photo">
            <img src="${item.webformatURL}" alt="${item.tags}" loading="lazy"/>
            </div>
                    <div class="info">
                        <p class="info-item">
                            <b>Likes</b>
                            ${item.likes}
                        </p>
                        <p class="info-item">
                            <b>Views</b>
                            ${item.views}
                        </p>
                        <p class="info-item">
                            <b>Comments</b>
                            ${item.comments}
                        </p>
                        <p class="info-item">
                            <b>Downloads</b>
                            ${item.downloads}
                        </p>
                    </div>
            </div>
        </a>`
    )
    .join('');
  refs.gallery.insertAdjacentHTML('beforeend', markup);
  simpleLightBox.refresh();
}

function message(length, cardsDisplayed, per_page, totalHits) {
  if (!length) {
    refs.loadMoreBtn.style.display = 'none';
    Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  }
  if (length === cardsDisplayed) {
    refs.loadMoreBtn.style.display = 'flex';
    Notify.success(`Hooray! We found ${totalHits} images.`);
  }
  // if (cardsDisplayed >= totalHits) {
  //   Notify.info("We're sorry, but you've reached the end of search results.");
  //   refs.loadMoreBtn.style.display = 'none';
  // }
  if (length < 40) {
    refs.loadMoreBtn.style.display = 'none';
    return Notify.info(
      "We're sorry, but you've reached the end of search results."
    );
  }
}
