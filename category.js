const jwtToken = localStorage.getItem("jwtToken");
const BASE_PATH = "http://localhost:8080/"

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
        displayCategories(categories);
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
                <button class="btn btn-warning" onclick="updateCategory(${category.id})">Update</button>
                <button class="btn btn-danger" onclick="deleteCategory(${category.id})">Delete</button>
            </td>
        `;
    });     
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