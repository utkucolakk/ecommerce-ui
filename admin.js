const BASE_PATH = "http://localhost:8080/"
const BASE_IMAGE_PATH = "/Users/utii/Documents/GitHub/ecommerce/"

const jwtToken = localStorage.getItem('jwtToken');

async function addProduct() {
    const fileInput = document.getElementById('productImage');
    const productName = document.getElementById('productName').value;
    const productPrice = document.getElementById('productPrice').value;
    const productUnitsInStock = document.getElementById('productUnitsInStock').value;
    const productCategoryId = document.getElementById('productCategoryId').value; 
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
        return response.json()
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
        console.log("productList : ", productList);
        await renderProductTable(productList);
    } catch (error) {
        console.log("error : ", error)
    }
}

async function renderProductTable(productList) {
    const productTableBody =  document.getElementById('productTableBody');
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
                <button class="btn btn-danger" onclick="deleteProduct(${product.id})">Delete</button>
            </td>
        `;
    });
}

function deleteProduct(productId) {
    const confirmed = confirm("Are you sure you want to delete this product?");
    if (confirmed) {
        fetch(BASE_PATH + "product/" + productId, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + jwtToken
            }
        }).then(response => {
            if (!response.ok) {
                throw new Error("Product silme isteği başarısız durum kodu : " + response.status)
            }
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
        document.getElementById('updateProductCategoryId').value = product.categoryId;
        document.getElementById('updateProductActive').checked = product.active;
        const updateProductModal = bootstrap.Modal.getOrCreateInstance(document.getElementById('updateProductModal'));
        updateProductModal.show();
    }).catch(error => {
        console.error('Error:', error);
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

    //update modal'ı kapatmamız gerekiyor.
    // $('#updateProductModal').modal('hide');
}

async function closeUpdateProductModal() {
    const model = bootstrap.Modal.getOrCreateInstance(document.getElementById('updateProductModal'));
    model.hide();
}

document.addEventListener("DOMContentLoaded", async () => {
    await getAllProduct();
});
