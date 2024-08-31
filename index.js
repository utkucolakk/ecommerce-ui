const jwtToken = localStorage.getItem("jwtToken");
const BASE_PATH = "http://localhost:8080/"

async function fethCategories() {
    console.log("jwt : " + jwtToken);
        const response = await fetch(BASE_PATH + "category", {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + jwtToken
            }
        });
        const data = await response.json();
        console.log(data);

         displayCategories(data)
    
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

document.addEventListener("DOMContentLoaded", async function () {
    //kategorileri yükle
    await fethCategories();

    //kategori seçimini dinle ve product'ları çek.    
})