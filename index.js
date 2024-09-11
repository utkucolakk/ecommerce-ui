const jwtToken = localStorage.getItem("jwtToken");
const customerId = localStorage.getItem("customerId");

const BASE_PATH = "http://localhost:8080/"
const BASE_IMAGE_PATH = "/Users/utii/Documents/GitHub/ecommerce/"

let cartItems = [];

//kategorileri backendden çekmek, api-call
async function fethCategories() {
    try {
        const response = await fetch(BASE_PATH + "category", {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + jwtToken
            }
        });
        if(!response.ok) {
            console.error("response status : " + response.status);
            throw new Error("Failed to get categories, response status : " + response.status);
        }
        const data = await response.json();
         displayCategories(data)
    }  catch (error) {
        console.error('Error fetching categories:', error);
       // if (error.status === 403) { TODO status undefined geliyor.
            window.location.href = "login.html";
        //}
    }
}

//seçilen kategoriye göre ürünleri backendden çekmek, api-call

async function fetchProductByCategory(categoryId) {
    const endPointUrl = BASE_PATH + "product/category/" + categoryId;

    try {
        const response = await fetch(endPointUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + jwtToken
            }
        });

        if(!response.ok) {
            throw new Error("Failed to get products by category id, response status : " + response.status);
        }

        const data = await response.json();
        displayProducts(data);
    } catch (error) {
        console.error('Error fetching products:', error);
        if (error.status === 403) { 
            window.location.href = "login.html";
        }
    }
}
 function displayCategories(categories) {
    const categorySelect = document.getElementById("categorySelect");
   categorySelect.innerHTML = ''; // öncedeki kategorileri temizle.
   
    categories.forEach(category => {
        const option = document.createElement("option");
        option.value = category.id;
        option.text = category.categoryEnum;
        categorySelect.appendChild(option);
    });
}

function displayProducts(products) {
    const productList = document.getElementById("productList");
    productList.innerHTML = '';
    products.forEach(product => {
        const productCart = document.createElement("div");
        productCart.classList.add("col-md-6", "mb-4");

        const productImage = document.createElement("img");
        productImage.src = BASE_IMAGE_PATH + product.image
        productImage.alt = product.name;
        productImage.style.maxWidth = "150px";
        productImage.style.maxHeight = "150px";

        const cardBoyd = document.createElement("div");
        cardBoyd.classList.add("card-body");
        cardBoyd.innerHTML = `
            <h5 class="card-title">${product.name}</h5>
            <p class="card-text">${product.price}</p>
            <button class="btn btn-primary" onclick='addToCart(${JSON.stringify(product)})'>Add to Cart</button>
        `;

        productCart.appendChild(productImage);
        productCart.appendChild(cardBoyd);
        
        productList.appendChild(productCart);

    });
}

// ürün stoğunu 1 düşür
function addToCart(product) {
    const productCountInCart = cartItems.filter(item => item.id === product.id).length;
    if (product.unitsInStock > 0 && productCountInCart < product.unitsInStock) {
        cartItems.push(product);
        updateCart();
        updateOrderButtonVisiblity();
    }
}

function updateCart () {
    const cart = document.getElementById("cart");
    cart.innerHTML = '';
    
     cartItems.forEach((item, index) => {   
        const cartItemElement = document.createElement("li");
        cartItemElement.classList.add("list-group-item", "d-flex", "justify-content-between", "align-items-center");

        const itemNameElement = document.createElement("span");
        cartItemElement.textContent = item.name + " - " + item.price;
        const deleteButton = document.createElement("button");
        deleteButton.classList.add("btn", "btn-danger");
        deleteButton.innerHTML = '<i class="bi bi-trash"></i>'; 
        
        deleteButton.onclick = function () {
            removeFromCart(index);
        };

        cartItemElement.appendChild(itemNameElement);
        cartItemElement.appendChild(deleteButton);
        cart.appendChild(cartItemElement);
 })
}

//ürün stoğunu 1 arttır
function removeFromCart(index) {
    cartItems.splice(index, 1)[0];
    updateCart();
    updateOrderButtonVisiblity();
}

function updateOrderButtonVisiblity() {
    if (cartItems.length > 0) {
        document.getElementById("orderButton").style.display = "block";
    } else {
        document.getElementById("orderButton").style.display = "none"; 
    }
}

function orderNow() {
    console.log("orderNow : ", cartItems);

    const idCountMap = new Map();
    cartItems.forEach(item => {
        const {id} = item;

        //Check if the id exist in the map
        if (idCountMap.has(id)) {
            //If yes, increment the count
            idCountMap.set(id, idCountMap.get(id) + 1);
        } else {
            //If it doesn't exist, add it to the map
            idCountMap.set(id, 1);
        }
    })

    idCountMap.forEach((count, id) => {
        console.log("id : ", id, " count : ", count)
    });

    var orderProductInfoList = [...idCountMap].map(([productId, quantity]) => ({ productId, quantity }));
    console.log("orderProductInfoList : ", orderProductInfoList)

    fetch(BASE_PATH + "order", {
        method: 'POST',
        body: JSON.stringify({
            customerId,
            orderList: orderProductInfoList
        }),
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + jwtToken
        }
    }).then(response => {
        if (!response.ok) {
            throw new Error("Order isteği başarısız durum kodu : " + response.status)
        }
        return response.json()
    }).then(data => {
        console.log(data)
        clearCart();
    })
}    

function clearCart() { 
    cartItems = [];
    updateCart();
    updateOrderButtonVisiblity();
    const categorySelect = document.getElementById("categorySelect");
    console.log("categorySelect : ", categorySelect.value)
    fetchProductByCategory(categorySelect.value);
   
}

document.addEventListener("DOMContentLoaded", async function () {
    updateOrderButtonVisiblity();

    //kategorileri yükle
    await fethCategories();

    //kategori seçimini dinle ve product'ları çek.
    const categorySelect = document.getElementById("categorySelect");
    categorySelect.addEventListener ("change", async function () {
        await fetchProductByCategory(categorySelect.value);
    });
})