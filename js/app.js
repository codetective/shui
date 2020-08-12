let loader = document.querySelector('.loader')
const tsbx = document.querySelector('.toastbox')
const spinner = document.querySelector('#spinner-wrapper')

const url = 'https://shoprecord.herokuapp.com'
const showToast = (msg, color) => {
  const toastbx = document.createElement('div')
  toastbx.classList.add('toastbx')
  toastbx.textContent = msg
  toastbx.style.backgroundColor = color
  tsbx.appendChild(toastbx)
  requestAnimationFrame(() => toastbx.classList.add('sh-toastbx'))

  setTimeout(function () {
    requestAnimationFrame(() => toastbx.classList.remove('sh-toastbx'))
    setTimeout(function () {
      requestAnimationFrame(() => tsbx.removeChild(toastbx))
    }, 500)
  }, 3300)
}
let loginForm = document.querySelector('#login-form')
let indicator = document.querySelector('#admin')
let loginSection = document.querySelector('#login')
let main = document.querySelector('main')
let status = localStorage.getItem('shopperutilscode')

window.addEventListener('DOMContentLoaded', () => {
  main.hidden = true
  if (status != null) {
    main.hidden = false
    loginSection.hidden = true
    indicator.innerText = `(${status})`
    app()
  } else {
    main.hidden = true
    loader.style.display = 'none'
  }
})

loginForm.addEventListener('submit', e => {
  e.preventDefault()
  const formdata = new FormData(loginForm)
  const name = formdata.get('name')
  const pass = formdata.get('password')
  let data = JSON.stringify({
    name: name,
    password: pass
  })
  login(data)
})

const login = async data => {
  loader.style.display = ''
  try {
    const response = await fetch(url + '/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: data
    })
    const result = await response.json()
    loader.style.display = 'none'
    if (result.error) {
      showToast(result.error, 'red')
      return
    } else if (result.name === 'admin') {
      showToast(result.msg, 'green')
      localStorage.setItem('shopperutilscode', result.name)
      indicator.innerText = `(${status})`
      main.hidden = false
      loginSection.hidden = true
      loginSection.remove()
      app()
    } else {
      showToast('not allowed', 'red')
    }
  } catch (error) {
    loader.style.display = 'none'
    showToast(error + ', please retry', 'red')
  }
}

let app = () => {
  async function FetchStock () {
    try {
      const fetchResult = fetch(
        new Request(url, { method: 'GET', cache: 'reload' })
      )
      const response = await fetchResult
      if (response.ok) {
        const jsonData = await response.json()
        loader.style.display = 'none'
        spinner.style.display = 'none'
        showToast('stocks updated', 'green')
        mapStocks(jsonData.stocks)
        mapOptions(jsonData.stocks)
      } else {
        showToast('error encountered. Please retry', 'red')
      }
    } catch (e) {
      loader.style.display = 'none'
      spinner.style.display = 'none'

      showToast(e, 'red')
    }
  }
  FetchStock()

  const DeleteStock = async stockname => {
    spinner.style.display = 'flex'
    cartArray = ['']
    cartItems.innerHTML = ''
    mapCartSum()
    regSaleBtn.classList.remove('disabled')

    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: stockname
      })
      const result = await response.json()
      FetchStock()
    } catch (error) {
      showToast(error)
      spinner.style.display = 'none'
    }
  }

  const AddNewStock = async data => {
    spinner.style.display = 'flex'

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: data
      })
      addStockForm.reset()
      const result = await response.json()
      if (result.msg) {
        spinner.style.display = 'none'
        showToast(result.msg, 'red')
      } else {
        FetchStock()
      }
    } catch (error) {
      spinner.style.display = 'none'
      showToast(error, 'red')
    }
  }
  const UpdateStock = async data => {
    spinner.style.display = 'flex'

    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: data
      })
      stockUpdateForm.reset()
      const result = await response.json()
      FetchStock()
    } catch (error) {
      spinner.style.display = 'none'

      showToast(error, 'red')
    }
  }
  const RegisterSale = async sale => {
    spinner.style.display = 'flex'

    try {
      const response = await fetch(url + '/sale', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: sale
      })
      const result = await response.json()
      cartItems.innerHTML = ''
      mapCartSum()
      regSaleBtn.classList.remove('disabled')
      cartArray = ['']
      FetchStock()
    } catch (error) {
      showToast(error)
      regSaleBtn.classList.remove('disabled')
      spinner.style.display = 'none'
    }
  }

  const mapStocks = stocks => {
    stockbox.innerHTML = ''
    stocks.forEach(stock => {
      const div = document.createElement('div')
      div.dataset.stock = stock.name
      div.className = 'stock'
      div.innerHTML = `<div data-stockname="${stock.name}">${stock.name}</div>
          <div>
            <span data-qty="${stock.qty}">${stock.qty}</span>
            <button data-stockname ="${stock.name}" ><img src="./css/trash-fill.svg"></button>
          </div>`

      stockbox.appendChild(div)
    })
  }

  const cart = document.querySelector('.cart')
  const cartItems = document.querySelector('#cart-items')
  const cartToggle = document.getElementById('cart-toggle')
  const cartOverlay = document.querySelector('.cart-overlay')
  cartToggle.onclick = () => {
    cartOverlay.classList.toggle('show-overlay')
    cart.classList.toggle('show-cart')
  }
  cartOverlay.onclick = () => {
    cart.classList.remove('show-cart')
    cartOverlay.classList.remove('show-overlay')
  }

  const labels = document.querySelectorAll('.accordion-item__label')
  const tabs = document.querySelectorAll('.accordion-tab')
  function toggleShow () {
    const target = this
    const item = target.classList.contains('accordion-tab')
      ? target
      : target.parentElement
    const group = item.dataset.actabGroup
    const id = item.dataset.actabId
    tabs.forEach(function (tab) {
      if (tab.dataset.actabGroup === group) {
        if (tab.dataset.actabId === id) {
          tab.classList.add('accordion-active')
        } else {
          tab.classList.remove('accordion-active')
        }
      }
    })
    labels.forEach(function (label) {
      const tabItem = label.parentElement
      if (tabItem.dataset.actabGroup === group) {
        if (tabItem.dataset.actabId === id) {
          tabItem.classList.add('accordion-active')
        } else {
          tabItem.classList.remove('accordion-active')
        }
      }
    })
  }
  labels.forEach(function (label) {
    label.addEventListener('click', toggleShow)
  })
  tabs.forEach(function (tab) {
    tab.addEventListener('click', toggleShow)
  })

  const stockbox = document.querySelector('#stockbox')

  let cartSum = document.querySelector('#cart-sum')
  let cartItemsList = document.getElementsByClassName('cart-item')
  let regSaleBtn = document.querySelector('#cart-submit')
  let addStockForm = document.querySelector('#addStockForm')
  let stockUpdateForm = document.querySelector('#stockUpdateForm')
  let stockUpdateName = document.querySelector('#stockUpdateName')

  const mapOptions = stocks => {
    stockUpdateName.innerHTML = ''
    stocks.forEach(stock => {
      let opt = document.createElement('option')
      opt.innerText = stock.name
      stockUpdateName.appendChild(opt)
    })
  }
  const mapCartSum = () => {
    cartSum.innerText = cartItemsList.length
  }
  mapCartSum()

  let cartArray = []
  stockbox.addEventListener('click', e => {
    if (
      e.target.dataset.hasOwnProperty('stock') &&
      !cartArray.includes(e.target.dataset.stock)
    ) {
      cartArray.push(e.target.dataset.stock)
      let li = document.createElement('li')
      li.className = 'cart-item'
      li.dataset.cartname = e.target.dataset.stock
      li.innerHTML = `<span class="mr-3">${e.target.dataset.stock}</span>
            <input type="number" id="cart-item-qty" min="1" value="1">`
      cartItems.appendChild(li)
      mapCartSum()
    } else if (e.target.tagName === 'BUTTON') {
      DeleteStock(JSON.stringify({ name: e.target.dataset.stockname }))
    }
  })
  addStockForm.addEventListener('submit', e => {
    e.preventDefault()
    const formdata = new FormData(addStockForm)
    const name = formdata.get('name')
    const qty = formdata.get('qty')

    let data = JSON.stringify({
      name: name,
      qty: qty
    })
    AddNewStock(data)
  })
  stockUpdateForm.addEventListener('submit', e => {
    e.preventDefault()
    const formdata = new FormData(stockUpdateForm)
    const name = formdata.get('name')
    const qty = formdata.get('qty')

    let data = JSON.stringify({
      name: name,
      qty: qty
    })

    UpdateStock(data)
  })
  //do cart events

  cartItems.addEventListener('click', e => {
    if (e.target.classList.contains('cart-item')) {
      e.target.parentNode.removeChild(e.target)
      let curr = cartArray.indexOf(e.target.textContent)
      cartArray.splice(curr, 1)
      mapCartSum()
    }
  })

  regSaleBtn.addEventListener('click', () => {
    regSaleBtn.classList.add('disabled')
    const sales = []
    for (let i = 0; i < cartItemsList.length; i++) {
      const element = cartItemsList[i]
      let item = {
        name: element.dataset.cartname,
        qty: parseInt(element.children[1].value)
      }

      if (item.qty < 1) {
        alert('Values cannot be 0')
        setTimeout(() => {
          regSaleBtn.classList.remove('disabled')
        }, 1500)
        return
      } else {
        spinner.style.display = 'block'

        sales.push(item)
      }
    }

    RegisterSale(JSON.stringify(sales))
  })
}
