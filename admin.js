const BASE_PATH = "http://localhost:8080/"

const jwtToken = localStorage.getItem('jwtToken');


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
        return response.json()
    }).then(data => {
        console.log(data)
    }).catch(error => {
        console.error('Error:', error);
    });
}