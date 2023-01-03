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
  <div class="item "><img src='${renderIcon(transaction.type)}'/></div>
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

    const expandDiv = document.createElement('div')
    expandDiv.ariaExpanded = 'false'
    expandDiv.innerHTML = `
    <div class="row"><div>Data: ${
      transaction.date
    }</div><div>Kwota transakcji: ${transaction.amount} zł</div></div>
    <div> Saldo przed transakcją: ${transaction.balance} zł</div>
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
        button.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        })
    }
    button.innerHTML = `
    <div class="item icon"><img src='${renderIcon(transaction.type)}'/></div>
    <div class="item">${transaction.description}</div>
    <div class="item">${transaction.amount} zł</div>
    `

    transactionListMobile.append(button, expandDiv)
  }
}

const renderIcon = type => {
  let src

  switch (type) {
    case 2:
      src = '../public/basket-shopping.svg'
      break

    case 3:
      src = `../public/cash-payment-icon.svg
      `
      break
    //others
    default:
      src = `../public/money-bill-transfer.svg`
      break
  }
  return src
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
      <label for="rep_email">Potwierdź email</label>
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
        <label for="email">Nazwa użytkownika / Email</label>
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
      <section class="charts" id="bars">
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

      </section>
      <section class="transaction-list-section">
          <div class="flex-section">
            <div id="transactions" class="transaction-wrapper desktop-block"></div>
            <div id="transactionsMobile" class="transaction-wrapper mobile"></div>
          </div>
        </section>
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
