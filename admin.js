const BASE_PATH = "http://localhost:8080/"
const BASE_IMAGE_PATH = "/Users/utii/Documents/GitHub/ecommerce/"
const jwtToken = localStorage.getItem('jwtToken');

var currentId = 0;
var categories = [];

async function addProduct() {
    const fileInput = document.getElementById('productImage');
    const productName = document.getElementById('productName').value;
    const productPrice = document.getElementById('productPrice').value;
    const productUnitsInStock = document.getElementById('productUnitsInStock').value;
    const productCategoryId = document.getElementById('categorySelect').value;
    const productActive = document.getElementById('productActive').checked;

    const formData = new FormData();
    console.log("formData")
    formData.append('file', fileInput.files[0]);

    const productData = {
        name: productName,
        price: productPrice,
        unitsInStock: productUnitsInStock,
        categoryId: productCategoryId,
        active: productActive
    };

    formData.append('product', new Blob([JSON.stringify(productData)], { type: 'application/json' }));
    console.log("post product")
    await fetch(BASE_PATH + "product/create", {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + jwtToken
        },
        body: formData
    }).then(response => {
        if (!response.ok) {
            throw new Error("Product ekleme isteği başarısız durum kodu : " + response.status)
        }
        hideModal('addProductModal');
        clearModalValues();
        getAllProduct();
    }).then(data => {
        console.log(data)
    }).catch(error => {
        console.error('Error:', error);
    });
}

async function getAllProduct() {
    try {

        const response = await fetch(BASE_PATH + "product/all", {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + jwtToken
            }
        });
        if (!response.ok) {
            throw new Error("Failed to get products, response status : " + response.status)
        }
        const productList = await response.json();
        console.log("productList : ", productList)
        await renderProductTable(productList);

    } catch (error) {
        console.log("error : ", error)
    }
}

async function renderProductTable(productList) {
    const productTableBody = document.getElementById('productTableBody');
    productTableBody.innerHTML = "";

    productList.forEach(product => {
        const row = productTableBody.insertRow();
        row.innerHTML = `
            <td>${product.name}</td>
            <td>${product.price}</td>
            <td>${product.unitsInStock}</td>
            <td>${product.categoryId}</td>
            <td><img src="${BASE_IMAGE_PATH}${product.image}" alt="${product.name}" width="100"></td>
            <td>${product.active ? "Yes" : "No"}</td>
            <td>
                <button class="btn btn-warning" onclick="updateProduct(${product.id})">Update</button>
                <button class="btn btn-danger" onclick="showDeleteProductModal(${product.id})">Delete</button>
            </td>
            `;
    });
}

function showDeleteProductModal(productId) {
    currentId = productId;
    const deleteProductModal = bootstrap.Modal.getOrCreateInstance(document.getElementById('deleteProductModal'))
    deleteProductModal.show();
}

function hideModal(modalId) {
    const deleteProductModal = bootstrap.Modal.getOrCreateInstance(document.getElementById(modalId))
    deleteProductModal.hide();
}


function clearModalValues() { 
    document.getElementById('productImage').value = '';
    document.getElementById('productName').value = '';
    document.getElementById('productPrice').value = '';
    document.getElementById('productUnitsInStock').value = '';
    document.getElementById('categorySelect').value = '';
    document.getElementById('productActive').checked = '';
}

function deleteProduct() {    
    if (currentId !== 0) {
        fetch(BASE_PATH + "product/" + currentId, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + jwtToken
            }
        }).then(response => {
            if (!response.ok) {
                throw new Error("Product silme isteği başarısız durum kodu : " + response.status)
            }
            hideModal('deleteProductModal');
            getAllProduct();
        }).catch(error => {
            console.error('Error:', error);
        });
    }
}

function updateProduct(productId) {
    fetch(BASE_PATH + "product/" + productId, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + jwtToken
        }
    }).then(response => {
        if (!response.ok) {
            throw new Error("Product getirme isteği başarısız durum kodu : " + response.status)
        }
        return response.json();
    }).then(product => {
        document.getElementById('updateProductId').value = product.id;
        document.getElementById('updateProductName').value = product.name;
        document.getElementById('updateProductPrice').value = product.price;
        document.getElementById('updateProductUnitsInStock').value = product.unitsInStock;

        sortCategoriesById(categories, product.categoryId)
        renderCategorySelectOption(categories, 'updateCategorySelect');

        document.getElementById('updateProductActive').checked = product.active;
        const updateProductModal = bootstrap.Modal.getOrCreateInstance(document.getElementById('updateProductModal')) // Returns a Bootstrap modal instance
        updateProductModal.show();
    }).catch(error => {
        console.error('Error:', error);
    });
}

function sortCategoriesById(categories, targetId) {
    return categories.sort((a, b) => {
        if (a.id === targetId) return -1; // 'a' öğesi hedef id'ye sahipse, 'a' önce gelir.
        if (b.id === targetId) return 1;  // 'b' öğesi hedef id'ye sahipse, 'b' sonra gelir.
        return 0; // Diğer öğeler sıralı kalır.
    });
}

function saveUpdatedProduct() {
    const updateProductId = document.getElementById('updateProductId').value;
    const updateProductName = document.getElementById('updateProductName').value;
    const updateProductPrice = document.getElementById('updateProductPrice').value;
    const updateProductUnitsInStock = document.getElementById('updateProductUnitsInStock').value;
    const updateProductCategoryId = document.getElementById('updateProductCategoryId').value;
    const updateProductActive = document.getElementById('updateProductActive').checked;

    const updateProductImage = document.getElementById('updateProductImage');
    const productData = {
        id: updateProductId,
        name: updateProductName,
        price: updateProductPrice,
        unitsInStock: updateProductUnitsInStock,
        categoryId: updateProductCategoryId,
        active: updateProductActive
    };

    const formData = new FormData();
    formData.append('file', feditedSelectedImage = updateProductImage.files[0]);
    formData.append('product', new Blob([JSON.stringify(productData)], { type: 'application/json' }));

    fetch(BASE_PATH + "product/update", {
        method: 'PUT',
        body: formData,
        headers: {
            'Authorization': 'Bearer ' + jwtToken
        }
    }).then(response => {
        if (!response.ok) {
            throw new Error("Product guncelleme isteği başarısız durum kodu : " + response.status)
        }
        getAllProduct();
        closeUpdateProductModal();
    }).catch(error => {
        console.error('Error:', error);
    });

}

async function getCategoryList() {
    const response = await fetch(BASE_PATH + "category", {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + jwtToken
        }
    });
    if (!response.ok) {
        throw new Error("Failed to get categories, response status : " + response.status)
    }
    const categoryList = await response.json();
    categories = categoryList;
    renderCategorySelectOption(categoryList, "categorySelect");
}

function renderCategorySelectOption(categoryList, elementId) {
    const categorySelect = document.getElementById(elementId);
    categorySelect.innerHTML = ''; // öncedeki kategorileri temizle.

    categoryList.forEach(category => {
        const option = document.createElement("option");
        option.value = category.id;
        option.text = category.name;
        categorySelect.appendChild(option);
    });
}

async function closeUpdateProductModal() {
    const model = bootstrap.Modal.getOrCreateInstance(document.getElementById('updateProductModal'));
    model.hide();
}

document.addEventListener("DOMContentLoaded", async () => {
    await getAllProduct();
    await getCategoryList();
});
