const random = document.querySelector('#random')
const rub = document.querySelector('#categories')
const search = document.querySelector('#search')
const rubChoice = document.querySelector('.wrapper__rub')
const searchInput = document.querySelector('.search-input')
const menu = document.querySelector('.menu')
const menuSpan = menu.querySelector('span')
const aside = document.querySelector('.wrapper-aside')

rub.addEventListener('click', () => {
  rubChoice.style.display = 'block'
  searchInput.style.display = ''
})
search.addEventListener('click', () => {
  searchInput.style.display = 'block'
  rubChoice.style.display = ''
})
random.addEventListener('click', () => {
  rubChoice.style.display = ''
  searchInput.style.display = ''
})

menu.addEventListener('click', () => {
  menuSpan.classList.toggle('close')
  let getClass = menuSpan.getAttribute('class')
  if (getClass === 'close') {
    aside.style.display = 'block'
  } else {
    aside.style.display = ''
  }
})

// // --------------------------

const jokes = []
const favJokes = JSON.parse(localStorage.getItem('Chuck API')) || []

const form = document.forms['getJoke'];
const cards = document.querySelector('.main-cards')
const cardsLoad = document.querySelector('.main-cardsLoad')
const asideCards = document.querySelector('.aside-cards')

const objOfJokes = jokes.map((joke) => {
  joke.id = joke
})


!function localLoad(arrOfJokes) {
  arrOfJokes.map((joke) => {
    const {id, url, value, updated_at, categories} = joke
    jokes.push(joke)
    createNewJoke(id, url, value, updated_at, categories)
    asideCards.insertAdjacentHTML('afterbegin', templateCard(id, url, value, updated_at, categories))
  })
}(favJokes)

form.addEventListener('submit', onFormSubmitHandler)
cards.addEventListener('click', onCardLike)
asideCards.addEventListener('click', onCardLike);

function onFormSubmitHandler(event) {
  event.preventDefault()

  const radio = form.elements['main'].value

  if (radio === 'Random') {
    const url = 'https://api.chucknorris.io/jokes/random'
    fetchAsync(url)
  } else if (radio === 'Categories') {
    const catRub = form.elements.rub.value
    const url = 'https://api.chucknorris.io/jokes/random?category=' + catRub
    fetchAsync(url)
  } else if (radio === 'Search') {
    const searchText = form.elements['search1'].value
    if (searchText.length < 3) {
      alert('Ваш запрос должен содержать не менее 3х букв!')
    } else {
      const url = 'https://api.chucknorris.io/jokes/search?query=' + searchText
      fetchAsyncSearch(url)
    }
  }
}

async function fetchAsync(url) {
  const res = await fetch(url)
  const data = await res.json()
  createNewJoke(data.id, data.url , data.value , data.updated_at, data.categories) 
  cards.insertAdjacentHTML('afterbegin', templateCard(data.id, data.url , data.value , data.updated_at, data.categories))

}
async function fetchAsyncSearch(url) {
  cards.innerHTML = ''
  cardsLoad.innerHTML = ''
  const res = await fetch(url)
  const dataSearch = await res.json()
  const data = dataSearch.result
  let i = 0
  let j = 25
  lazyLoad()
  function lazyLoad() {
    let g = data.length > 25 ? data.length - (data.length - j) : data.length
    for (; i<g; i++) {
      createNewJoke(data[i].id, data[i].url , data[i].value , data[i].updated_at, data[i].categories) 
      cards.insertAdjacentHTML('beforeend', templateCard(data[i].id, data[i].url , data[i].value , data[i].updated_at, data[i].categories))
    }
  j += 25
  }
  if (data.length > 25) {
    cardsLoad.insertAdjacentHTML('afterbegin', templateLoad())
    const lazyLoadButton = document.querySelector('.lazyLoad') || ''
    lazyLoadButton.addEventListener('click', lazyLoad)
  }
}

function templateCard(id, url, value, updated_at, categories) {
  const timeJoke = Date.parse(updated_at)
  const timeNow = Date.parse(new Date())
  const time = ((timeNow - timeJoke) / (1000 * 60 * 60)).toFixed()
  const isFavourite = jokes.filter(joke => joke.id === id)
  const {like} = isFavourite[0] || ''
  if (like) {
    src = 'img/heart.png'
  } else {
    src = 'img/heart1.png'
  }
  const divRub = `<div class="card-rub">${categories}</div>`
  const rub = categories.length !== 0 ? divRub : ''
  return `
    <div class="card" data-joke-id="_${id}">
      <div class="card-id">
        ID: 
        <a href="${url}" target="_blank">
          ${id}
          <img src="img/interface.svg">
        </a>
      </div>
      <div class="card-text">${value}</div>
      <div class="card-info">
        <div class="card-date">
          Last update: 
          <span>${time} hours ago</span>
        </div>
        ${rub}
      </div>
      <img class="card-like" src="${src}">
    </div>
  `
}

function templateLoad() {
  return `
    <div class="lazyLoad">
      Загрузить ещё...
    </div>
  `
}

function createNewJoke(id, url, value, updated_at, categories) {
  const newJoke = {
    id,
    url,
    value,
    updated_at,
    categories
  }

  objOfJokes[newJoke.id] = newJoke
}

function onCardLike({target}) {
  if (target.classList.contains('card-like')) {
    const parents = target.closest('[data-joke-id]')
    const id = parents.dataset.jokeId.substr(1)
    const id2 = parents.dataset.jokeId
    const cardList = cards.querySelector(`[data-joke-id=${id2}]`)
    onLike(id, target, parents, cardList, id2)
  }
}

function onLike(id, target, parents, cardList, id2) {
  const img = target.closest('.card-like')
  const imgSrc = img.getAttribute('src').split('/')[1]
  if (imgSrc === 'heart1.png') {
    img.setAttribute('src', 'img/heart.png')
    objOfJokes[id].like = true
    const localStore = JSON.parse(localStorage.getItem('Chuck API')) || []
    localStore.push(objOfJokes[id])
    localStorage.setItem('Chuck API', JSON.stringify(localStore))
    const cloneParent = parents.cloneNode(true)
    asideCards.insertAdjacentElement('afterbegin', cloneParent)

  } else {
    img.setAttribute('src', 'img/heart1.png')
    objOfJokes[id].like = false
    const removefavJokes = JSON.parse(localStorage.getItem('Chuck API'))
    for (let i = 0; i < removefavJokes.length; i++){
      if (removefavJokes[i].id === id) {
        removefavJokes.splice(i, 1)
        localStorage.setItem('Chuck API', JSON.stringify(removefavJokes))
      }
    }
    if (cardList !== null) {
      const img1 = cardList.querySelector('.card-like') || ''
      img1.setAttribute('src', 'img/heart1.png')
    }
    const parent = asideCards.querySelector(`[data-joke-id=${id2}]`)
    if (parent !== null){
      parent.remove()
    }
  }
}