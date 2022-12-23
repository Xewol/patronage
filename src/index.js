'use strict'

//TODO load from storage
const authroize = () => {
  if (!localStorage.session) return undefined

  return 'user'
}

//! USER DATA
let currentUser = authroize()

document.addEventListener('DOMContentLoaded', () => {
  if (!currentUser) {
    offlineView()
  }
})
// /[A-Za-z0-9]{6,16}/
const handleError = input => {
  switch (input.id) {
    case 'username':
      if (!input.value) {
        input.classList.add('error')
        input.parentElement.querySelector(
          '.error-text'
        ).innerHTML = `To pole jest wymagane`
        return
      }
      if (/g/.test(input.value)) {
        input.classList.add('error')
        input.parentElement.querySelector
        '.error-text'.innerHTML = `Pole za krótkie.`
        return
      }
      break
    case 'email':
      if (!input.value) {
        input.classList.add('error')
        input.parentElement.querySelector(
          '.error-text'
        ).innerHTML = `To pole jest wymagane`
        return
      }
      if (!/\w+@\w+.\w+/.test(input.value)) {
        input.classList.add('error')
        return (input.parentElement.querySelector(
          '.error-text'
        ).innerHTML = `Niewłaściwy mail.`)
      }
      break
    case 'rep_email':
      if (!input.value) {
        input.classList.add('error')
        input.parentElement.querySelector(
          '.error-text'
        ).innerHTML = `To pole jest wymagane`
        return
      }
      if (document.querySelector('#email').value !== input.value) {
        input.classList.add('error')
        input.parentElement.querySelector(
          '.error-text'
        ).innerHTML = `Pola email muszą być takie same.`
      }
      break
  }
}

const register = () => {
  const inputs = document.querySelectorAll('input')
  //remove old Errors and validate again
  for (let input of inputs) {
    input.classList.remove('error')
    //last element is error div
    input.parentElement.lastElementChild.textContent = ''
  }

  const [username, password, email, rep_email] = inputs
  handleError(username)
  handleError(password)
  handleError(email)
  handleError(rep_email)
}

const offlineView = () => {
  const app = document.querySelector('#app')
  app.innerHTML = content('notification')
  //get login and register wrapper if user isn't logged in
  const actionBtns = document.querySelector('.btn-wrapper')
  //grab previous html state in case someone wants to return from form
  const prevHtmlState = app.innerHTML

  for (let button of actionBtns.childNodes) {
    button.addEventListener('click', () => {
      //remove class of both at the start
      for (let btn of actionBtns.children) {
        btn.classList.remove('hidden')
      }

      app.innerHTML = content(button.id)
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

//return html based on what user clicked
const content = view => {
  let html = ``

  switch (view) {
    case 'register':
      html = `<form class="form-style">
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
    <button class="btn submit" type="button" onclick="register()">Utwórz konto</button>
      <button class="btn return" id="return" type="button">Powrót</button>
      </div>
    </form>`
      break
    case 'login':
      html = `<form class="form-style"><span class="action">Logowanie</span>
      <div class="wrapper">
        <label for="username">Nazwa użytkownika</label>
        <input type="text" id="username" />
      </div>
      <div class="wrapper">
        <label for="password">Hasło</label>
        <input type="password" id="password" />
      </div>
    <div class="submit-section">
      <button class="btn submit" type="button">Zaloguj</button>
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
