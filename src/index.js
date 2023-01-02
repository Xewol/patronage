'use strict'

//TODO load from storage
const authroize = () => {
  if (!localStorage.session) return undefined

  return localStorage.session
}

//! USER DATA
let currentUser = authroize()

document.addEventListener('DOMContentLoaded', () => {
  if (!currentUser) {
    offlineView()
  } else onlineView()
})

const setError = (input, msg) => {
  input.classList.add('error')
  input.parentElement.querySelector('.error-text').innerHTML = msg
}

const validate = input => {
  switch (input.id) {
    case 'username':
      if (!input.value) {
        return setError(input, 'To pole jest wymagane')
      }
      if (input.value.length < 6 || input.value.length > 16) {
        return setError(input, 'Dozwolona długośc to 6-16 znaków.')
      }
      if (/[^A-Za-z0-9]+/.test(input.value)) {
        return setError(input, 'Znaki specjalne nie są dozwolone.')
      }
      break

    case 'password':
      if (!input.value) {
        return setError(input, 'To pole jest wymagane.')
      }
      if (input.value.length < 6) {
        return setError(input, 'Minimalna długość to 6 znaków.')
      }
      break

    case 'email':
      if (!input.value) {
        return setError(input, 'To pole jest wymagane.')
      }
      if (!/\w+@\w+.\w+/.test(input.value)) {
        return setError(input, 'Niewłaściwy mail.')
      }
      break
    case 'rep_email':
      if (!input.value) {
        return setError(input, 'To pole jest wymagane.')
      }
      if (document.querySelector('#email').value !== input.value) {
        return setError(input, 'Oba pola muszą być takie same.')
      }
      break
  }
}

const signInUser = userObj => {
  const db = JSON.parse(localStorage.db)
  const foundUser = db.find(
    user => user.email === userObj.email && user.password === userObj.password
  )
  if (foundUser) {
    localStorage.session = foundUser.id
    onlineView()
  }
}

const createUser = userObj => {
  //localstorage.db also possible
  const database = localStorage.getItem('db')
  if (database)
    // if database exist spread across parsed localstorage and append new user at the end
    localStorage.db = JSON.stringify([...JSON.parse(localStorage.db), userObj])
  //if not just create new array with user inside
  else localStorage.db = JSON.stringify([userObj])

  //login user
  localStorage.setItem('session', userObj.id)

  onlineView()
}

const login = event => {
  event.preventDefault()
  //creating array so i can use Array.some later
  const inputs = Array(...document.querySelectorAll('input'))
  //remove old Errors and validate again
  inputs.forEach(el => {
    el.classList.remove('error')
    //last element is error div
    el.parentElement.lastElementChild.textContent = ''
  })

  const [email, password] = inputs
  validate(email)
  validate(password)

  const hashedPassword = btoa(password.value)
  //if errors return
  if (inputs.some(el => el.classList.contains('error'))) return

  //intialize empty db if there is none
  const db = localStorage.db ? JSON.parse(localStorage.db) : []
  let foundUser = db.find(el => el.email === email.value)

  //email is valid but user not found so we suggest making account
  if (!foundUser) {
    const app = document.querySelector('#app')
    app.innerHTML = view('emailNotTaken')
    const [accept, decline] = app.querySelectorAll('button')
    accept.addEventListener('click', () => {
      app.innerHTML = view('register')
      app.querySelector('#email').value = email.value
      app.querySelector('#password').value = password.value
    })
    decline.addEventListener('click', () => {
      app.innerHTML = view('login')
      document.querySelector('#return').addEventListener('click', () => {
        app.innerHTML = currentUser ? view('online') : view('offline')
        const buttons = document.querySelector('.btn-wrapper').children
        for (let button of buttons) {
          button.classList.remove('hidden')
        }
      })
    })
    return
  }

  if (foundUser && foundUser.password !== hashedPassword) {
    setError(document.querySelector('#email'), 'Błędny email lub hasło')
    setError(document.querySelector('#password'), 'Błędny email lub hasło')
    return
  }
  signInUser({ email: email.value, password: hashedPassword })
}

const register = event => {
  event.preventDefault()
  //TODO MAYBE ON CHANGE REMOVE ?
  //creating array so i can use Array.some later
  const inputs = Array(...document.querySelectorAll('input'))
  //remove old Errors and validate again
  inputs.forEach(el => {
    el.classList.remove('error')
    //last element is error div
    el.parentElement.lastElementChild.textContent = ''
  })

  const [username, password, email, rep_email] = inputs
  validate(username)
  validate(password)
  validate(email)
  validate(rep_email)

  //if errors return
  if (inputs.some(el => el.classList.contains('error'))) return

  //intialize empty db if there is none
  const db = localStorage.db ? JSON.parse(localStorage.db) : []

  //find if email is in use
  let foundUser = db.find(el => el.email === email.value)
  if (foundUser) return setError(email, 'Email jest już w użyciu.')

  //find if username is in use
  foundUser = db.find(el => el.username === username.value)
  if (foundUser) return setError(username, 'Nazwa użytkownika jest zajęta')

  //email and username are not used, finalize user creation
  createUser({
    id: crypto.randomUUID(),
    username: username.value,
    password: btoa(password.value),
    email: email.value,
  })
}
const offlineView = () => {
  const app = document.querySelector('#app')
  app.innerHTML = view('offline')
  const actionBtns = document.querySelector('.btn-wrapper')
  actionBtns.innerHTML = `<button class="btn login" id="login">Zaloguj</button>
  <button class="btn register" id="register">Rejestracja</button>`

  for (let button of actionBtns.childNodes) {
    button.addEventListener('click', () => {
      //remove class of both at the start
      for (let btn of actionBtns.children) {
        btn.classList.remove('hidden')
      }

      app.innerHTML = view(button.id)

      //hide buttons when form is on
      button.classList.add('hidden')

      document.querySelector('#return').addEventListener('click', () => {
        app.innerHTML = currentUser ? view('online') : view('offline')
        //unhide buttons when form is off
        button.classList.remove('hidden')
      })
    })
  }
}

const logout = () => {
  localStorage.removeItem('session')
  offlineView()
}

const swap = () => {
  const charts = document.querySelectorAll('[data-active]')

  charts.forEach(
    chart =>
      (chart.dataset.active =
        chart.dataset.active === 'true' ? 'false' : 'true')
  )
}

const onlineView = async () => {
  const app = document.querySelector('#app')
  const actionBtns = document.querySelector('.btn-wrapper')
  actionBtns.innerHTML = `<button class="btn logout" onclick="logout()">Wyloguj</button>`
  app.innerHTML = view('online')
  const ctx1 = document.getElementById('bar-chart')
  const ctx2 = document.getElementById('doughnut-chart')

  //28.12.2022 Requests exhausted.

  // const data = await fetch(
  //   'https://api.jsonbin.io/v3/b/63a092ab15ab31599e2045be',
  //   {
  //     headers: {
  //       'x-access-key':
  //         '$2b$10$5pBRUbFRKdKft/b8qSQ3IeyPQgQ8CLXlvgoQA6GdpYvdWva.pOfGS',
  //     },
  //   }
  // ).then(res => res.json())

  const jsonDummy = {
    meta: {},
    record: {
      transacationTypes: {
        1: 'Wpływy - inne',
        2: 'Wydatki - zakupy',
        3: 'Wpływy - wynagrodzenie',
        4: 'Wydatki - inne',
      },
      transactions: [
        {
          date: '2022-11-12',
          amount: -231.56,
          description: 'Biedronka 13',
          balance: 4337.25,
          type: 2,
        },
        {
          date: '2022-11-12',
          amount: -31.56,
          description: 'PayU Spółka Akcyjna',
          balance: 4572.18,
          type: 4,
        },
        {
          date: '2022-11-12',
          amount: 2137.69,
          description: 'Wynagrodzenie z tytułu Umowy o Pracę',
          balance: 2420.47,
          type: 3,
        },
        {
          date: '2022-11-10',
          amount: -136,
          description: 'Lidl',
          balance: 2555.55,
          type: 2,
        },
        {
          date: '2022-11-10',
          amount: 25,
          description: 'Zrzutka na prezent dla Grażyny',
          balance: 2847.66,
          type: 1,
        },
        {
          date: '2022-11-09',
          amount: -111.11,
          description: 'Biedronka 13',
          balance: 3000,
          type: 2,
        },
        {
          date: '2022-11-09',
          amount: -78.33,
          description: 'PayU Spółka Akcyjna',
          balance: 3027.51,
          type: 4,
        },
      ],
    },
  }
  const data = jsonDummy
  console.log(data)
  const transactions = data.record.transactions
  const transactionTypes = Object.entries(data.record.transacationTypes)
  //spread back to array so i can .reverse(), because days are descending
  const uniqueDates = Array(...new Set(transactions.map(el => el.date)))

  //map through unique days and group them by dates, next since first element in array is latest saldo update we just take it's balance
  const saldo = Array(...uniqueDates)
    .map(day => transactions.filter(el => el.date === day))
    .map(group => group[0].balance)

  const textColor = `#B0C4DE`
  const colors = [
    '#203b52',
    '#122a74',
    '#219e9e',
    '#2d848f',
    '#365782',
    '#2b778f',
    '#127369',
    '#00b176',
    '#186f93',
    '#203c54',
  ]
  new Chart(ctx1, {
    type: 'bar',
    data: {
      labels: uniqueDates.reverse(),
      datasets: [
        {
          label: 'Saldo na koniec dnia',
          data: saldo,
          borderRadius: 4,
          backgroundColor: '#4682B4',
          hoverBackgroundColor: '#203c54',
        },
      ],
    },
    options: {
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: textColor,
          },
        },
      },
      scales: {
        y: {
          title: {
            display: true,
            text: 'Saldo',
          },
          grid: {
            display: false,
          },
          ticks: {
            color: textColor,
          },
          border: {
            display: false,
          },
        },
        x: {
          title: {
            display: true,
            text: 'Dzień',
          },
          border: {
            display: false,
          },
          grid: {
            display: false,
          },
          ticks: {
            color: textColor,
          },
        },
      },
    },
  })

  //create array with the same length as transactions, its value at given index will store occurrence of transactionTypes eg. chartData[n] = 2 -> transactionType(n+1) occurred 2 times
  //then calculate procentage
  const chartData = Array.from({ length: transactionTypes.length })
    .fill(0)
    .map((_, idx) =>
      Math.round(
        (transactions.filter(transaction => idx === transaction.type - 1)
          .length /
          transactions.length) *
          100
      )
    )

  new Chart(ctx2, {
    type: 'doughnut',

    data: {
      labels: transactionTypes.map(transaction => transaction[1]),
      datasets: [
        {
          label: '%',
          data: chartData,
          backgroundColor: colors,
          borderWidth: 0,
        },
      ],
    },
    options: {
      maintainAspectRatio: false,
      legend: {
        position: 'right',
      },
      scales: {
        y: {
          border: {
            display: false,
          },
          grid: {
            display: false,
            tickLength: 0,
          },
          ticks: {
            display: false,
          },
        },
      },
      plugins: {
        legend: {
          position: 'bottom',
          lineWidth: 0,
        },
      },
    },
  })

  const transactionList = document.querySelector('#transactions')
  const transactionListMobile = document.querySelector('#transactionsMobile')
  for (let transaction of transactions) {
    const div = document.createElement('div')
    div.className = 'transaction'
    div.innerHTML = `
  <div class="item">${transaction.date}</div>
  <div class="item ">${renderIcon(transaction.type)}</div>
  <div class="item description">${transaction.description} <div class="type"> ${
      transactionTypes[transaction.type - 1][1]
    }</div></div>
  <div class="item">${transaction.amount} zł</div>
  <div class="item">${transaction.balance} zł</div>
  <div class="item description">
    <div>Numer karty</div>
    <div>Zbliżeniowo/Blik</div>
  </div> 
    `
    transactionList.appendChild(div)

    const wrapper = document.createElement('div')

    const expandDiv = document.createElement('div')
    expandDiv.ariaExpanded = 'false'
    expandDiv.innerHTML = `
    <div class="heading"><div>Data: ${
      transaction.date
    }</div><div>Kwota transakcji: ${transaction.amount} zł</div></div>
    <div> Saldo przed transakcją: ${transaction.balance}</div>
    <div>Opis: ${transaction.description}</div>
    <div>Typ: ${transactionTypes[transaction.type - 1][1]}</div>
    `
    expandDiv.className = 'transaction-details'

    const button = document.createElement('button')
    button.className = 'transaction'
    button.onclick = () => {
      const isExpanded = document.querySelector('[aria-expanded="true"]')

      //check if there is any expanded div and if
      //other transaction is clicked than this one
      //this is done so i can close expanded div when clicked again on transaction
      if (isExpanded && expandDiv.ariaExpanded === 'false')
        isExpanded.ariaExpanded = 'false'

      expandDiv.ariaExpanded =
        expandDiv.ariaExpanded === 'true' ? 'false' : 'true'
      if (expandDiv.ariaExpanded === 'true')
        expandDiv.scrollIntoView({
          behavior: 'smooth',
        })
    }
    button.innerHTML = `
    <div class="item icon">${renderIcon(transaction.type)}</div>
    <div class="item">${transaction.description}</div>
    <div class="item">${transaction.amount} zł</div>
    `

    wrapper.append(button, expandDiv)

    transactionListMobile.appendChild(wrapper)
  }
}

const renderIcon = type => {
  let icon

  switch (type) {
    case 2:
      icon = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="-200 -200 900.000000 900.000000">
    <path 
    fill="currentColor" stroke="currentColor"
    d="M253.3 35.1c6.1-11.8 1.5-26.3-10.2-32.4s-26.3-1.5-32.4 10.2L117.6 192H32c-17.7 0-32 14.3-32 32s14.3 32 32 32L83.9 463.5C91 492 116.6 512 146 512H430c29.4 0 55-20 62.1-48.5L544 256c17.7 0 32-14.3 32-32s-14.3-32-32-32H458.4L365.3 12.9C359.2 1.2 344.7-3.4 332.9 2.7s-16.3 20.6-10.2 32.4L404.3 192H171.7L253.3 35.1zM192 304v96c0 8.8-7.2 16-16 16s-16-7.2-16-16V304c0-8.8 7.2-16 16-16s16 7.2 16 16zm96-16c8.8 0 16 7.2 16 16v96c0 8.8-7.2 16-16 16s-16-7.2-16-16V304c0-8.8 7.2-16 16-16zm128 16v96c0 8.8-7.2 16-16 16s-16-7.2-16-16V304c0-8.8 7.2-16 16-16s16 7.2 16 16z"/></svg>`
      break

    case 3:
      icon = `
      <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
 viewBox="0 0 900.000000 900.000000">
      <g transform="translate(0.000000,900.000000) scale(0.100000,-0.100000)"
fill="currentColor" stroke="currentColor">
<path d="M5688 8257 c-30 -34 -226 -267 -435 -517 -511 -611 -770 -919 -1412
-1683 -152 -181 -284 -339 -293 -351 l-17 -23 392 -219 c369 -206 396 -223
468 -294 62 -63 81 -89 109 -155 29 -69 34 -94 38 -181 3 -76 0 -116 -13 -160
-56 -196 -206 -338 -400 -379 -88 -18 -134 -19 -212 0 -46 11 -737 228 -863
271 -13 5 -13 3 0 -10 8 -8 105 -90 216 -183 458 -384 805 -675 1075 -901
l287 -241 68 82 c38 45 161 192 274 327 336 401 674 803 835 995 359 428 830
990 1224 1460 120 143 295 352 390 464 94 113 171 207 170 210 0 3 -111 98
-246 211 -136 113 -319 266 -407 340 -594 500 -1163 977 -1177 987 -15 11 -24
4 -71 -50z m-370 -1727 c363 -87 628 -400 649 -766 6 -107 -9 -205 -49 -311
-30 -80 -107 -192 -180 -258 -232 -213 -566 -254 -863 -106 -212 105 -354 267
-434 494 -34 97 -35 108 -36 237 0 153 17 228 83 355 55 107 191 240 302 294
47 22 119 50 160 61 103 26 258 26 368 0z"/>
<path d="M4984 6239 c-27 -17 -63 -44 -79 -60 l-30 -28 -49 41 -48 42 -37 -45
c-20 -24 -48 -57 -63 -74 l-26 -30 51 -46 51 -45 -17 -60 c-32 -113 -14 -202
54 -273 105 -109 230 -109 419 1 109 62 170 62 170 -2 0 -57 -85 -143 -197
-198 -29 -14 -53 -29 -53 -33 0 -6 103 -154 120 -172 12 -13 112 40 167 88
l50 44 48 -40 c26 -21 51 -39 55 -39 8 0 99 103 115 129 6 10 -7 28 -45 61
l-53 47 16 48 c23 66 22 178 -2 231 -23 51 -78 107 -134 136 -32 17 -59 22
-114 22 -70 0 -78 -3 -205 -67 -73 -37 -140 -67 -148 -67 -23 0 -40 21 -40 48
0 32 96 132 163 167 28 15 53 29 55 30 7 5 -123 175 -133 175 -6 0 -33 -14
-61 -31z"/>
<path d="M2930 7039 c-80 -17 -762 -208 -1102 -309 -77 -23 -120 -30 -184 -30
l-84 0 0 -774 0 -775 68 19 c37 10 130 35 207 55 77 20 171 45 210 56 91 25
165 25 216 -1 22 -12 90 -73 152 -136 115 -119 195 -183 282 -226 55 -28 315
-115 887 -298 408 -130 445 -137 542 -104 64 22 147 100 177 166 34 78 32 186
-5 261 -14 30 -43 70 -64 89 -20 18 -277 168 -570 332 -416 233 -539 306 -560
334 -24 31 -27 45 -27 107 0 63 3 76 29 109 48 64 89 76 257 76 l145 0 245
292 c134 160 301 359 371 442 70 83 128 153 128 156 0 3 -73 18 -163 34 -89
15 -247 44 -352 63 -473 86 -632 98 -805 62z"/>
<path d="M850 6858 c0 -18 7 -91 14 -163 8 -71 24 -236 36 -365 11 -129 36
-399 55 -600 19 -201 44 -468 55 -595 11 -126 23 -247 26 -267 l6 -38 144 0
144 0 0 1030 0 1030 -240 0 -240 0 0 -32z"/>
<path d="M3005 3201 c-90 -22 -172 -92 -214 -180 -22 -47 -26 -70 -26 -141 0
-126 27 -176 158 -288 237 -204 463 -405 616 -546 322 -297 498 -418 742 -511
182 -70 150 -68 1039 -75 887 -7 850 -4 983 -72 58 -29 163 -124 218 -195 l24
-32 300 29 c165 16 356 34 425 40 69 6 285 26 480 45 195 19 395 37 443 41 75
6 88 9 84 23 -8 26 -243 629 -285 731 -213 512 -403 788 -643 935 -87 54 -228
103 -362 128 -120 22 -136 22 -1007 22 l-885 0 -51 -27 c-110 -58 -164 -145
-164 -264 0 -101 22 -158 89 -225 90 -90 85 -89 563 -89 438 0 457 -2 492 -51
26 -38 20 -77 -18 -115 l-34 -34 -639 0 c-692 0 -749 4 -908 55 -112 37 -178
75 -419 244 -508 355 -781 535 -831 548 -53 14 -122 15 -170 4z"/>
<path d="M8410 1109 c-70 -8 -229 -23 -1370 -129 -239 -22 -462 -42 -495 -45
-33 -3 -75 -8 -92 -11 l-33 -5 0 -139 0 -140 1035 0 1035 0 0 240 c0 132 -1
239 -2 239 -2 -1 -37 -6 -78 -10z"/>
</g>
</svg>
      `
      break
    //others
    default:
      icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-200 -200 900 900"><path fill="currentColor" d="M535 41c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l64 64c4.5 4.5 7 10.6 7 17s-2.5 12.5-7 17l-64 64c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l23-23L384 112c-13.3 0-24-10.7-24-24s10.7-24 24-24l174.1 0L535 41zM105 377l-23 23L256 400c13.3 0 24 10.7 24 24s-10.7 24-24 24L81.9 448l23 23c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0L7 441c-4.5-4.5-7-10.6-7-17s2.5-12.5 7-17l64-64c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9zM96 64H337.9c-3.7 7.2-5.9 15.3-5.9 24c0 28.7 23.3 52 52 52l117.4 0c-4 17 .6 35.5 13.8 48.8c20.3 20.3 53.2 20.3 73.5 0L608 169.5V384c0 35.3-28.7 64-64 64H302.1c3.7-7.2 5.9-15.3 5.9-24c0-28.7-23.3-52-52-52l-117.4 0c4-17-.6-35.5-13.8-48.8c-20.3-20.3-53.2-20.3-73.5 0L32 342.5V128c0-35.3 28.7-64 64-64zm64 64H96v64c35.3 0 64-28.7 64-64zM544 320c-35.3 0-64 28.7-64 64h64V320zM320 352c53 0 96-43 96-96s-43-96-96-96s-96 43-96 96s43 96 96 96z"/></svg>`
      break
  }
  return icon
}

/**
 *
 * @param {string} content
 * @return changes #app's innerHTML based on content passed
 */
const view = content => {
  let html = ``

  switch (content) {
    case 'register':
      html = `<form class="form-style" onsubmit="register(event)">
      <span class="action">Rejestracja</span>
    <div class="wrapper">
      <label for="username">Nazwa użytkownika</label>
      <input type="text" id="username" />
      <div class="error-text"></div>
    </div>
    <div class="wrapper">
      <label for="password">Hasło</label>
      <input type="password" id="password" />
      <div class="error-text"></div>
    </div>
    <div class="wrapper">
      <label for="email">Email</label>
      <input type="text" id="email" />
      <div class="error-text"></div>

    </div>
    <div class="wrapper">
      <label for="rep_email">Powtórz email</label>
      <input type="text" id="rep_email" />
      <div class="error-text"></div>

    </div>
    <div class="submit-section">
    <button class="btn submit" >Zarejestruj</button>
      <button class="btn return" id="return" type="button">Powrót</button>
      </div>
    </form>`
      break
    case 'login':
      html = `<form class="form-style" onsubmit="login(event)">
      <span class="action">Logowanie</span>
      <div class="wrapper">
        <label for="email">Email</label>
        <input type="text" id="email" />
      <div class="error-text"></div>

      </div>
      <div class="wrapper">
        <label for="password">Hasło</label>
        <input type="password" id="password" />
      <div class="error-text"></div>

      </div>
    <div class="submit-section">
      <button class="btn submit">Zaloguj</button>
      <button class="btn return" id="return" type="button">Powrót</button>
      </div>
      </form>`
      break
    case 'offline':
      html = `<p class="notif">Zaloguj się, by sprawdzić swoje transakcje.</p>`
      break

    case 'online':
      html = `<div class="main-section">
      <div class="charts" id="bars">
      <button class="navigation" onclick="swap()">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 512" ><path fill="currentColor" d="M9.4 278.6c-12.5-12.5-12.5-32.8 0-45.3l128-128c9.2-9.2 22.9-11.9 34.9-6.9s19.8 16.6 19.8 29.6l0 256c0 12.9-7.8 24.6-19.8 29.6s-25.7 2.2-34.9-6.9l-128-128z"/></svg>
      </button>
        <div class="chart-wrapper" data-active="true">
          <canvas id="bar-chart" class="bars"></canvas>
        </div>
        <div class="chart-wrapper" data-active="false">
          <canvas id="doughnut-chart" class="doughnut"></canvas>
        </div>
      <button class="navigation"onclick="swap()">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 512"><path fill="currentColor" d="M246.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-128-128c-9.2-9.2-22.9-11.9-34.9-6.9s-19.8 16.6-19.8 29.6l0 256c0 12.9 7.8 24.6 19.8 29.6s25.7 2.2 34.9-6.9l128-128z"/></svg>
      </button>

      </div>
      <div class="transaction-list-section">
          <div class="flex-section">
            <div class="legend desktop-grid">
              <div class="item">Data</div>
              <div class="item">Typ transakcji</div>
              <div class="item"">Opis</div>
              <div class="item">Kwota</div>
              <div class="item">Saldo</div>
              <div class="item">Metoda płatności</div>
            </div>
            <div class="legend mobile">
              <div class="item">Typ transakcji</div>
              <div class="item">Opis</div>
              <div class="item">Kwota</div>
            </div>
            <div id="transactions" class="transaction-wrapper desktop-block"></div>
            <div id="transactionsMobile" class="transaction-wrapper mobile"></div>
          </div>
        </div>
    </div>`
      break

    case 'emailNotTaken':
      html = `
    <div class="suggest-section">
      <div>
        <p>Podany email jest poprawny, ale nie występuje w naszej bazie danych.</p>
        <p>Czy chesz stworzyć nowe konto na jego podstawie ?</p>
      </div>
      <div class="submit-section">
         <button class="btn return">Tak</button>
         <button class="btn return">Nie</button>
      </div>
    </div>`
      break
  }

  return html
}
