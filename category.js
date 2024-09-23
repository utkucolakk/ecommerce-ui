const jwtToken = localStorage.getItem('jwtToken');
const BASE_PATH = "http://localhost:8080/"

var currentCategoryId = 0;
function getAllCategory() {
    fetch(BASE_PATH + "category", {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + jwtToken
        }
    }).then(response => {
        if (!response.ok) {
            throw new Error("Failed to get categories, response status : " + response.status)
        }
        return response.json();
    }).then(categories => {
        displayCategories(categories)
    }).catch(error => {
        console.error('Error:', error);
    });
}

function displayCategories(categories) {
    const categoryTableBody = document.getElementById("categoryTableBody");
    categoryTableBody.innerHTML = "";
    categories.forEach(category => {
        const row = categoryTableBody.insertRow();
        row.innerHTML = `
            <td>${category.id}</td>
            <td>${category.name}</td>
            <td>
                <button class="btn btn-warning" onclick="getCategoryAndShowModal (${category.id})">Update</button>
                <button class="btn btn-danger" onclick="showDeleteCategoryModal(${category.id})">Delete</button>
            </td>
        `;
    });     
}

function getCategoryAndShowModal(categoryId) {
    fetch(BASE_PATH + "category/" + categoryId, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + jwtToken
        }
    }).then(response => {
        if (!response.ok) {
            throw new Error("Category getirme isteği başarısız durum kodu : " + response.status)
        }
        return response.json();
    }).then(category => {
        document.getElementById('updateCategoryId').value = category.id;
        document.getElementById('updateCategoryName').value = category.name;
        const updateCategoryModal = bootstrap.Modal.getOrCreateInstance(document.getElementById('updateCategoryModal'));
        updateCategoryModal.show();
    }).catch(error => {
        console.error('Error:', error);
    });
}


function updateCategory() {
    const categoryId = document.getElementById('updateCategoryId').value
    const categoryName = document.getElementById('updateCategoryName').value

    bodyData =JSON.stringify({ 
        id: categoryId,
        name: categoryName
    })

    fetch(BASE_PATH + "category/update", {
        method: 'PUT',
        body: bodyData,  
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + jwtToken
        }
    }).then(response => {
        if (!response.ok) {
            throw new Error("Category PUT isteği başarısız durum kodu : " + response.status)
        }
        return response.json();
    }).then(category => {
        hideModal('updateCategoryModal');
        showSuccessAlert("Category updated successfully!");
        getAllCategory();
    }).catch(error => {
        console.error('Error:', error);
    });
}


function hideModal(modalId) {
    const deleteProductModal = bootstrap.Modal.getOrCreateInstance(document.getElementById(modalId))
    deleteProductModal.hide();
}


function showDeleteCategoryModal(categoryId) {
    currentCategoryId = categoryId;
    const deleteProductModal = bootstrap.Modal.getOrCreateInstance(document.getElementById('deleteCategoryModal'))
    deleteProductModal.show();
}

function deleteCategory() {    
    if (currentCategoryId !== 0) {
        fetch(BASE_PATH + "category/" + currentCategoryId, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + jwtToken
            }
        }).then(async response => {
            if (!response.ok) {
                const data = await response.json();
                showFailAlert(data.message);
                throw new Error(data.message);
            }
            //hideModal('deleteProductModal');
            getAllProduct();
        }).catch(error => {
            hideModal('deleteProductModal'); //TODO does not work..
        });
    }
}
function showSuccessAlert (message) {
    let alert = document.getElementById('success-alert');
    alert.style.display = 'block';
    alert.style.opacity = 1;
    
    let alertMessage = document.getElementById('successAlertMessage');
    alertMessage.textContent = message;
    setTimeout(() => {
        let opacity = 1;
        let timer = setInterval(() => {
            if (opacity <= 0.1) {
                clearInterval(timer);
                alert.style.display = 'none';
            } 
            alert.style.opacity = opacity;
            opacity -= opacity * 0.1;
        }, 50)
    }, 3000)
}
        

function showFailAlert (message) {
    let alert = document.getElementById('fail-alert');
    alert.style.display = 'block';
    alert.style.opacity = 1;
    
    let alertMessage = document.getElementById('failAlertMessage');
    alertMessage.textContent = message;
    setTimeout(() => {
        let opacity = 1;
        let timer = setInterval(() => {
            if (opacity <= 0.1) {
                clearInterval(timer);
                alert.style.display = 'none';
            } 
            alert.style.opacity = opacity;
            opacity -= opacity * 0.1;
        }, 50)
    }, 3000)
}
    


document.addEventListener("DOMContentLoaded", async () => {
    await getAllCategory();


    //category add, form listener
    document.getElementById("addCategoryBtn").addEventListener("click", function () {
        //form verilerini al
        const categoryName = document.getElementById("categoryName").value;
        fetch(BASE_PATH + "category/create", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + jwtToken
            },
            body: JSON.stringify({ 
                name: categoryName
            })
        }).then(response => {
                if (!response.ok) {
                    throw new Error("Category create isteği basarısız durum kodu : " + response.status)
                }
                return response.json();
            }).then(category => {
                getAllCategory();
            }).catch(error => {
                console.error('Error:', error);
            })
        })

        

});