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

const validateRegister = input => {
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

const validateLogin = input => {
  switch (input.id) {
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
  }
}

const signInUser = userObj => {
  const db = JSON.parse(localStorage.db)
  const foundUser = db.find(
    user =>
      user.email === userObj.email && atob(user.password) === userObj.password
  )
  if (foundUser) {
    localStorage.session = foundUser.id
    onlineView()
  }
  //email is valid but user not found so we suggest making account
  else console.log('Make account?')
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
  const inputs = Array(...document.querySelectorAll('input'))
  //remove old Errors and validate again
  inputs.forEach(el => {
    el.classList.remove('error')
    //last element is error div
    el.parentElement.lastElementChild.textContent = ''
  })

  const [email, password] = inputs
  validateLogin(email)
  validateLogin(password)

  //if no errors
  if (!inputs.some(el => el.classList.contains('error')))
    signInUser({ email: email.value, password: password.value })
}

const register = event => {
  event.preventDefault()
  //TODO MAYBE ON CHANGE REMOVE ?

  const inputs = Array(...document.querySelectorAll('input'))
  //remove old Errors and validate again
  inputs.forEach(el => {
    el.classList.remove('error')
    //last element is error div
    el.parentElement.lastElementChild.textContent = ''
  })

  const [username, password, email, rep_email] = inputs
  validateRegister(username)
  validateRegister(password)
  validateRegister(email)
  validateRegister(rep_email)

  //if no errors
  if (!inputs.some(el => el.classList.contains('error')))
    createUser({
      id: crypto.randomUUID(),
      username: username.value,
      password: btoa(password.value),
      email: email.value,
    })
}

const offlineView = () => {
  const app = document.querySelector('#app')
  app.innerHTML = view('notification')
  const actionBtns = document.querySelector('.btn-wrapper')
  actionBtns.innerHTML = `<button class="btn login" id="login">Zaloguj</button>
  <button class="btn register" id="register">Rejestracja</button>`
  //grab previous html state in case someone wants to return from form
  const prevHtmlState = app.innerHTML

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
        app.innerHTML = prevHtmlState
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

const onlineView = () => {
  const app = document.querySelector('#app')
  const actionBtns = document.querySelector('.btn-wrapper')
  actionBtns.innerHTML = `<button class="btn logout" onclick="logout()">Wyloguj</button>`
}

//return html based on what user clicked
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
    <button class="btn submit" >Utwórz konto</button>
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
    case 'notification':
      html = `<p class="notif">Zaloguj się, by sprawdzić swoje transakcje.</p>`
      break
  }

  return html
}
