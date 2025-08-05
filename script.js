document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('.bookmakers__tab');

  tabs.forEach(tab => {
    tab.addEventListener('click', event => {
      event.preventDefault();

      tabs.forEach(t => t.classList.remove('bookmakers__tab_active'));
      tab.classList.add('bookmakers__tab_active');

      const href = tab.getAttribute('href');
      const url = new URL(href, window.location.origin);
      const type = url.searchParams.get('type') || 'byuser';
      const subratingId = url.searchParams.get('id') || null;

      loadBookmakers(type, subratingId);
    });
  });
});

function loadBookmakers(type, subratingId) {
  fetch('bookmakers.json')
    .then(response => {
      if (!response.ok) throw new Error(`Ошибка загрузки: ${response.status}`);
      return response.json();
    })
    .then(data => {
      if (!Array.isArray(data) || data.length === 0) throw new Error('Данные отсутствуют');
      const sorted = sortBookmakers(data, type, subratingId);
      renderBookmakers(sorted);
    })
    .catch(error => showError(error.message));
}

function sortBookmakers(data, type, subratingId = null) {
  const arr = [...data];

  switch (type) {
    case 'byuser': 
      return arr.sort((a, b) => b.reviews_count - a.reviews_count);

    case 'byeditors':
      return arr.sort((a, b) => b.rating - a.rating);

    case 'bybonus':
      return arr.sort((a, b) => {
        const parseBonus = bonus =>
        parseFloat(String(bonus)) || 0;
        return parseBonus(b.bonus) - parseBonus(a.bonus);
      });

    case 'bysubrating':
      if (subratingId === 'reliability') {
        return arr.sort((a, b) => (b.reliability || 0) - (a.reliability || 0));
      }
      return arr;

    default:
      return arr;
  }
}


function renderBookmakers(data) {
    const container = document.querySelector('.bookmakers__table');
    container.innerHTML = '';
    data.forEach(bk => {
      container.innerHTML += `
        <li class="bookmakers__row">
          <div class="bookmakers__company">
            <img class="bookmakers__logo" src="${bk.logo}" alt="Логотип букмекерской конторы" width="115" height="20">
            ${bk.verified ? '<img class="bookmakers__verified" src="img/icons/verified.svg" alt="Проверено" width="16" height="16">' : ''}
          </div>
          <a class="bookmakers__rating" href="#">
             ${renderStars(bk.rating)}
            <p class="bookmakers__score">${bk.rating}</p>
          </a>
          <div class="bookmakers__reviews">
            <img class="bookmakers__chats" src="img/icons/chat.svg" aria-hidden="true" width="16" height="16">
            <p class="bookmakers__reviews-count">${bk.reviews_count}</p>
          </div>
          <div class="bookmakers__bonus">
            ${bk.badge ? `<div class="bookmakers__badge bookmakers__badge_${bk.badge}">${bk.badge_name}</div>` : ''}
            ${bk.bonus ? `<img class="bookmakers__gift" src="img/icons/gift.svg" aria-hidden="true" width="16" height="16"><p class="bookmakers__amount">${bk.bonus}</p>` : ''}
          </div>
          <div class="bookmakers__actions">
            <a class="bookmakers__button bookmakers__button_review" href="${bk.internal_link}" target="_blank">Обзор</a>
            <a class="bookmakers__button bookmakers__button_site" href="${bk.external_link}" target="_blank">Сайт</a>
          </div>
        </li>`;
    });
}

function renderStars(rating) {
  let starsHTML = '';
  let filled = 0;

  if (rating > 4.5) filled = 5;
  else if (rating > 3.5) filled = 4;
  else if (rating > 2.5) filled = 3;
  else if (rating > 1.5) filled = 2;
  else if (rating > 0.5) filled = 1;
  else filled = 0;

  const empty = 5 - filled;

  for (let i = 0; i < filled; i++) {
    starsHTML += `<img class="bookmakers__star bookmakers__star_filled" src="img/icons/star-filled.svg" alt="" aria-hidden="true" width="16" height="16">\n`;
  }

  for (let i = 0; i < empty; i++) {
    starsHTML += `<img class="bookmakers__star bookmakers__star_empty" src="img/icons/star-empty.svg" alt="" aria-hidden="true" width="16" height="16">\n`;
  }

  return `<div class="bookmakers__stars" aria-label="Рейтинг ${rating} из 5">${starsHTML}</div>`;

}

function showError(message) {
  const container = document.querySelector('.bookmakers__table');
  container.innerHTML = `<li style="color:red; padding:10px; list-style:none;">⚠️ ${message}</li>`;
}
