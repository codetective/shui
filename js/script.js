// const url = 'https://shoprecord.herokuapp.com'
const url = 'http://localhost:3000'
const showToast = msg => {
  const toastbx = document.createElement('div')
  toastbx.classList.add('toastbx')
  toastbx.textContent = msg
  tsbx.appendChild(toastbx)
  requestAnimationFrame(() => toastbx.classList.add('sh-toastbx'))

  setTimeout(function () {
    requestAnimationFrame(() => toastbx.classList.remove('sh-toastbx'))
    setTimeout(function () {
      requestAnimationFrame(() => tsbx.removeChild(toastbx))
    }, 500)
  }, 3300)
}

async function FetchStock () {
  try {
    const fetchResult = fetch(new Request(url, { method: 'GET', cache: 'reload' })
    )
    const response = await fetchResult
    if (response.ok) {
      const jsonData = await response.json()
      loader.style.display = 'none'
      showToast('stocks updated')
      mapStocks(jsonData.stocks)
    } else {
      showToast('error encountered. Please retry')
    }
  } catch (e) {
    loader.style.display = 'none'
    showToast(e)
  }
}

const AddNewStock = async data => {
  loader.style.display = ''

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: data
    })
    stockForm.reset()
    const result = await response.json()
    console.log(result)
    await FetchStock().then(() => {
      showToast(result.message || result.msg || result.error)
    })
  } catch (error) {
    loader.style.display = 'none'

    showToast(error)
  }
}
const UpdateStock = async data => {
  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: data
    })
    updateForm.reset()
    const result = await response.json()
    console.log(result)
    await FetchStock().then(() => {
      showToast(result.message || result.msg || result.error)
    })
  } catch (error) {
    showToast(error)
  }
}

const RegisterSale = async sale => {
  try {
    const response = await fetch(url + '/sale', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: sale
    })
    const result = await response.json()
    cart.innerHTML = ''
    regSaleBtn.classList.remove('disabled')
    cartArray = ['']
    FetchStock()
  } catch (error) {
    showToast(error)
    regSaleBtn.classList.remove('disabled')
    loader.style.display = 'none'

  }
}
const DeleteStock = async stockname => {
  loader.style.display = ''

  cartArray = ['']
  cart.innerHTML = ''
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
    loader.style.display = 'none'

  }
}

const mapStocks = stocks => {
  stockBox.innerHTML = ''

  stocks.forEach(stock => {
    const div = document.createElement('div')
    div.className = 'stock'
    const p = document.createElement('p')
    p.classList.add('stockName')
    p.textContent = stock.name
    const span = document.createElement('span')
    const delBtn = document.createElement('button')
    delBtn.textContent = 'x'
    delBtn.className = stock.name
    span.classList.add('stockQty')
    span.textContent = stock.qty
    div.appendChild(p)
    div.appendChild(span)
    div.appendChild(delBtn)
    stockBox.appendChild(div)
  })
}
window.addEventListener('DOMContentLoaded', () => {
  FetchStock()
})

const stockBox = document.querySelector('.available-stock')
const loader = document.querySelector('.loader')
const tsbx = document.querySelector('.toastbox')
const stockForm = document.querySelector('.addStockForm')
const updateForm = document.querySelector('.updateStockForm')
const stockFormToggler = document.querySelector('#toggler')
const cart = document.querySelector('#cart')
const cartItems = document.getElementsByClassName('stk')
const regSaleBtn = document.querySelector('#reg-sale-btn')

regSaleBtn.addEventListener('click', () => {
  regSaleBtn.classList.add('disabled')
  const sales = []
  for (let i = 0; i < cartItems.length; i++) {
    const element = cartItems[i]
    let item = {
      name: element.textContent.trim(),
      qty: parseInt(element.children[0].value)
    }
    if (item.qty < 1) {
      alert('Values cannot be 0')
      setTimeout(() => {
        regSaleBtn.classList.remove('disabled')
      }, 1500)
      return
    } else {
      loader.style.display = ''

      sales.push(item)
    }
  }

  RegisterSale(JSON.stringify(sales))
})

let cartArray = []
stockBox.addEventListener('click', e => {

  if (
    e.target.classList.contains('stockName') &&
    !cartArray.includes(e.target.textContent)
  ) {
    
    cartArray.push(e.target.textContent)
    let li = document.createElement('li')
    li.className = 'stk'
    li.textContent = e.target.textContent
    let input = document.createElement('input')
    input.setAttribute('type', 'number')
    input.className = 'qty'
    input.value = 1
    li.appendChild(input)
    cart.appendChild(li)
  } else if (e.target.tagName === 'BUTTON') {
    DeleteStock(JSON.stringify({ name: e.target.className }))
  }
})

stockForm.addEventListener('submit', e => {
  e.preventDefault()
  const formdata = new FormData(stockForm)
  console.log(formdata)
  const name = formdata.get('name')
  const qty = formdata.get('qty')

  let data = JSON.stringify({
    name: name,
    qty: qty
  })
  AddNewStock(data)
})
updateForm.addEventListener('submit', e => {
  loader.style.display = ''

  e.preventDefault()
  const formdata = new FormData(updateForm)
  console.log(formdata)
  const name = formdata.get('name')
  const qty = formdata.get('qty')

  let data = JSON.stringify({
    name: name,
    qty: qty
  })
  UpdateStock(data)
})

cart.addEventListener('click', (e) => {
  if (e.target.classList.contains('stk')) {
    e.target.parentNode.removeChild(e.target)
    let curr = cartArray.indexOf(e.target.textContent)
    cartArray.splice(curr, 1)
  }
})