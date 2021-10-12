import Notiflix from 'notiflix';
import _default from '/../node_modules/simplelightbox/dist/simple-lightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

// UTILS
const l = s => console.log(s);
const qs = s => document.querySelector(s);
const create = s => document.createElement(s);

const API_KEY = '23694047-a2e6262ac35d899e9f10bdeb1';
const PER_PAGE = 40;
let page = 1;
let totalHits = 0;
let firstAlter = 0;

const serchText = () => qs("[type='text']").value;
const serchedImgs = () => getPixabayPhotos(serchText);
const setTotalHits = photos => (totalHits = photos.totalHits);

// when no photo hits total np. 500
const ifNoHits = () => page * PER_PAGE + (totalHits % PER_PAGE) >= totalHits;

function getPixabayPhotos(serch) {
  const URL_PIXABAY = `https://pixabay.com/api/?key=${API_KEY}&q=${serch()}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=${PER_PAGE}`;
  return fetch(URL_PIXABAY)
    .then(imgs => {
      if (!imgs.ok) {
        throw new Error(imgs.status);
      }
      return imgs.json();
    })
    .catch(er => {
      l(`Error: ${er}`);
    });
}

function photosParams(machPhotos) {
  return machPhotos()
    .then(photos => {
      let photosHits = [];
      if (page === 1) setTotalHits(photos);
      // l(photos);

      photos.hits.forEach(photo => {
        const { webformatURL, largeImageURL, tags, likes, views, comments, downloads } = photo;
        photosHits.push({ webformatURL, largeImageURL, tags, likes, views, comments, downloads });
      });

      return photosHits;
    })
    .then(photosHits => {
      if (photosHits.length === 0) {
        Notiflix.Notify.warning(
          'Sorry, there are no images matching your search query. Please try again.',
        );
      } else if (ifNoHits()) {
        Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");
      }

      if (firstAlter === 0 && photosHits.length !== 0) {
        Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
        firstAlter++;
      }

      return photosHits;
    });
}

function displayPhotos(photos) {
  return photos
    .then(photos => {
      const gallery = qs('.gallery');

      photos.forEach(photo => {
        const { webformatURL, largeImageURL, tags, likes, views, comments, downloads } = photo;

        const div = create('div');
        div.classList.add('photo-card');

        const a = create('a');
        a.href = `${largeImageURL}`;

        const img = create('img');
        img.src = `${webformatURL}`;
        img.alt = `${tags}`;
        img.loading = 'lazy';

        const divInfo = create('div');
        divInfo.classList.add('info');

        const categories = { 0: 'likes', 1: 'views', 2: 'comments', 3: 'downloads' }; // names of p elements in forEach
        [likes, views, comments, downloads].forEach((nrInfo, idx) => {
          const p = create('p');
          p.classList.add('info-item');
          p.innerHTML = `<b>${categories[idx]}</b> <p>${nrInfo}</p>`;

          divInfo.append(p);
        });

        a.append(img);
        div.append(a, divInfo);
        gallery.append(div);
      });
      return photos;
    })
    .then(photos => {
      // if (photos.length !== 0) btnLoadMore.classList.remove('hiden');
    })
    .then(photos => {
      let gallery = new SimpleLightbox('.gallery a');
      gallery.on('closed.simplelightbox', function () {
        gallery.refresh();
      });

      return photos;
    });
}

function clearGallery() {
  const gallery = qs('.gallery');
  const cleanGallery = create('div');
  const section = qs('section');

  gallery.remove();
  cleanGallery.classList.add('gallery');
  section.append(cleanGallery);
}

const addPage = () => {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
  const ifEndScroll = () => scrollTop + clientHeight >= scrollHeight;

  if (ifEndScroll()) {
    const { height: cardHeight } = qs('.gallery').firstElementChild.getBoundingClientRect();

    let photos = photosParams(serchedImgs);

    if (!ifNoHits()) {
      displayPhotos(photos).then(() => {
        window.scrollBy({
          top: cardHeight * 2,
          behavior: 'smooth',
        });
      });

      page++;
      l(`ifEndScroll ${ifEndScroll()}`);
      l(`image sum: ${page * PER_PAGE + (totalHits % PER_PAGE)}`); // base on
      l(`page:  ${page}`);
    }
  }
};

window.addEventListener('scroll', addPage);

const btn = qs('button');
// const btnLoadMore = qs('.load-more');

btn.addEventListener('click', event => {
  event.preventDefault();

  clearGallery();
  let photos = photosParams(serchedImgs);
  displayPhotos(photos);
  // btnLoadMore.classList.add('hiden');
  page = 1;
  firstAlter = 0;
});
