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

const validate = input => {
  if (input.classList.contains('error')) return
  input.classList.add('error')
  const parent = input.parentElement
  const error = document.createElement('p')
  error.textContent = `Błąd`
  error.classList.add('error-text')
  parent.append(error)
}

const register = () => {
  const inputs = document.querySelectorAll('input')

  const [username, password, email, rep_email] = inputs
  validate(username)
  validate(password)
  validate(email)
  validate(rep_email)

  //TODO
  // if (Array(inputs).some(el => el.classList.includes('error')))
  //   return console.log('dalej błędy')
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
      html = `<form class="form-style" ><span class="action">Rejestracja</span>
    <div>
      <label for="username">Nazwa użytkownika</label>
      <input type="text" id="username" />
    </div>
    <div>
      <label for="password">Hasło</label>
      <input type="password" id="password" />
    </div>
    <div>
      <label for="mail">Email</label>
      <input type="text" id="mail" />
    </div>
    <div>
      <label for="rep_mail">Powtórz email</label>
      <input type="text" id="rep_mail" />
    </div>
    <button class="btn submit" type="button" onclick="register()">Utwórz konto</button>
      <button class="btn return" id="return" type="button">Powrót</button>
    </form`
      break
    case 'login':
      html = `<form class="form-style"><span class="action">Logowanie</span>
      <div>
        <label for="username">Nazwa użytkownika</label>
        <input type="text" id="username" />
      </div>
      <div>
        <label for="password">Hasło</label>
        <input type="password" id="password" />
      </div>

      <button class="btn submit" type="button">Zaloguj</button>
      <button class="btn return" id="return" type="button">Powrót</button>
      </form`
      break
    case 'notification':
      html = `<p class="notif">Zaloguj się, by sprawdzić swoje transakcje.</p>`
      break
  }

  return html
}
