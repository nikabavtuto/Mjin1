const modal = document.getElementById('myModal');
const loginBtn = document.querySelector('.login-btn');
const closeBtn = document.querySelector('.close');

// Элементы формы
const authForm = modal.querySelector('form');
const modalTitle = modal.querySelector('h2');
const submitBtn = modal.querySelector('.submit-btn');
const switchBtns = document.querySelectorAll('.switch button');
const emailInput = modal.querySelector('input[type="email"]');
const passwordInput = modal.querySelector('input[type="password"]');

// Переменная для отслеживания режима (по умолчанию Регистрация)
let isLoginMode = false;

// Открытие / Закрытие модалки
function openModal() {
  modal.style.display = 'flex';
}

if (closeBtn) {
  closeBtn.onclick = () => (modal.style.display = 'none');
}
window.onclick = (e) => {
  if (e.target == modal) modal.style.display = 'none';
};

// ПЕРЕКЛЮЧЕНИЕ РЕЖИМОВ
switchBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    switchBtns.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');

    if (btn.textContent === 'Вход') {
      isLoginMode = true;
      modalTitle.textContent = 'Sign In';
      submitBtn.textContent = 'Log In';
    } else {
      isLoginMode = false;
      modalTitle.textContent = 'Sign Up';
      submitBtn.textContent = 'Register Now';
    }
  });
});

// РАБОТА С LOCALSTORAGE
authForm.addEventListener('submit', (e) => {
  e.preventDefault(); // Чтобы страница не перезагружалась

  const email = emailInput.value;
  const password = passwordInput.value;

  // Получаем список пользователей из памяти или создаем пустой массив
  let users = JSON.parse(localStorage.getItem('users')) || [];

  if (isLoginMode) {
    // ЛОГИКА ВХОДА
    const user = users.find(
      (u) => u.email === email && u.password === password,
    );

    if (user) {
      alert('Успешный вход! Добро пожаловать, ' + email);
      modal.style.display = 'none';
      loginBtn.textContent = email; // Меняем текст кнопки "Войти" на email
    } else {
      alert('Ошибка: Неверный email или пароль.');
    }
  } else {
    // ЛОГИКА РЕГИСТРАЦИИ
    const userExists = users.some((u) => u.email === email);

    if (userExists) {
      alert('Этот email уже зарегистрирован!');
    } else {
      // Добавляем нового пользователя
      users.push({email, password});
      localStorage.setItem('users', JSON.stringify(users));
      alert('Регистрация успешна! Теперь вы можете войти.');

      // Автоматически переключаем на вкладку "Вход"
      switchBtns[1].click();
    }
  }
});

// Элементы корзины
const cartBtn = document.getElementById('cartBtn');
const cartDrawer = document.getElementById('cart');
const cartOverlay = document.getElementById('cartOverlay');
const closeCart = document.querySelector('.close-cart');
const cartItemsContainer = document.getElementById('cartItems');
const cartTotalElement = document.getElementById('cartTotal');
const cartCountElement = document.getElementById('cartCount');

let cart = JSON.parse(localStorage.getItem('myShopCart')) || [];

// ОТКРЫТИЕ И ЗАКРЫТИЕ
cartBtn.onclick = openCart;
closeCart.onclick = closeCartFunc;
cartOverlay.onclick = closeCartFunc;

function openCart() {
  cartDrawer.classList.add('active');
  cartOverlay.classList.add('active');
  renderCart();
}

function closeCartFunc() {
  cartDrawer.classList.remove('active');
  cartOverlay.classList.remove('active');
}

// ФУНКЦИЯ ДОБАВЛЕНИЯ (можно вешать на кнопки товаров)
function addToCart(name, price, image) {
  cart.push({name, price, image, id: Date.now()});
  saveCart();
  openCart(); // Показываем корзину сразу при добавлении
}

function saveCart() {
  localStorage.setItem('myShopCart', JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount() {
  cartCountElement.textContent = cart.length;
}

// РЕНДЕР ТОВАРОВ
function renderCart() {
  if (cart.length === 0) {
    cartItemsContainer.innerHTML =
      '<p class="empty-msg">Your cart is empty</p>';
    cartTotalElement.textContent = '$0';
    return;
  }

  cartItemsContainer.innerHTML = '';
  let total = 0;

  cart.forEach((item) => {
    total += item.price;
    cartItemsContainer.innerHTML += `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>$${item.price}</p>
                   <span class="remove-item" data-id="${item.id}">Remove</span>
                </div>
            </div>
        `;
  });

  cartTotalElement.textContent = `$${total}`;
}

function removeFromCart(id) {
  cart = cart.filter((item) => item.id !== id);
  saveCart();
  renderCart();
}

// Инициализация счетчика при загрузке
updateCartCount();
document.addEventListener('DOMContentLoaded', () => {
  // =========================
  // GLOBAL CLICK EVENTS
  // =========================

  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('buy-btn')) {
      addToCart(
        e.target.dataset.name,
        Number(e.target.dataset.price),
        e.target.dataset.img,
      );
    }
    if (e.target.classList.contains('remove-item')) {
      removeFromCart(Number(e.target.dataset.id));
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModalFunc();

      closeCartFunc();

      checkoutModal.classList.remove('active');
    }
  });
  const checkoutBtn = document.querySelector('.checkout-btn');
  const checkoutModal = document.getElementById('checkoutModal');
  const closeCheckout = document.getElementById('closeCheckout');
  const checkoutForm = document.getElementById('checkoutForm');

  const checkoutTotal = document.getElementById('checkoutTotal');

  // OPEN CHECKOUT

  checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) {
      alert('Корзина пустая');

      return;
    }

    checkoutModal.classList.add('active');

    checkoutTotal.textContent = cartTotalElement.textContent;
  });

  // CLOSE CHECKOUT

  closeCheckout.addEventListener('click', () => {
    checkoutModal.classList.remove('active');
  });

  checkoutModal.addEventListener('click', (e) => {
    if (e.target === checkoutModal) {
      checkoutModal.classList.remove('active');
    }
  });

  // =========================
  // CARD MASK
  // =========================

  const cardInput = document.getElementById('cardNumber');

  cardInput.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '').substring(0, 16);

    value = value.replace(/(.{4})/g, '$1 ').trim();

    e.target.value = value;
  });

  // =========================
  // EXPIRY MASK
  // =========================

  const expiryInput = document.getElementById('expiry');

  expiryInput.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '').substring(0, 4);

    if (value.length >= 3) {
      value = value.substring(0, 2) + '/' + value.substring(2);
    }

    e.target.value = value;
  });

  // =========================
  // CVV ONLY NUMBERS
  // =========================

  const cvvInput = document.getElementById('cvv');

  cvvInput.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/\D/g, '').substring(0, 3);
  });

  // =========================
  // PAYMENT
  // =========================

  checkoutForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const customerName = document.getElementById('customerName').value;

    alert(`
Спасибо за покупку, ${customerName}!

Оплата прошла успешно.
      `);

    // CLEAR CART

    cart = [];

    saveCart();

    renderCart();

    closeCartFunc();

    checkoutModal.classList.remove('active');

    checkoutForm.reset();
  });

  // =========================
  // INIT
  // =========================

  renderCart();

  updateCartCount();
});
