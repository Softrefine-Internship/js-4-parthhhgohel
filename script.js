// write javascript here

const expenseForm = document.getElementById("expenseForm");

const addCategoryForm = document.querySelector(".add-category-form");

const expenseTable = document.getElementById("expenseTable");
const Expname = document.getElementById("name");
const amount = document.getElementById("amount");
const date = document.getElementById("date");
const category = document.getElementById("category");

const tbody = expenseTable.querySelector("tbody");

const categoryFilter = document.getElementById("category-filter");

const btnAddExpense = document.getElementsByClassName("expense--add");
const addCategoryBtn = document.querySelector(".add-category--btn");

let expenseData = [];

let dataNo = 1;

let categoryData = ["Food", "Transport", "Entertainment", "Health", "Personal", "Bills", "Education"];

function replacer(key, value) {
  return typeof value === 'bigint' ? value.toString() + 'n' : value;
}

function reviver(key, value) {
  if (typeof value === 'string' && /^\d+n$/.test(value)) {
    return BigInt(value.slice(0, -1));
  }
  return value;
}

function getExpenseFromLocal() {
  if (localStorage.getItem("expenseData")) {
    expenseData = JSON.parse(localStorage.getItem("expenseData"), reviver);
    showData();
    showTotalExpense();
  }
}

function showData(category = "all") {
  tbody.innerHTML = "";
  let dataNo = 1;
  console.log(expenseData);

  let filteredData = [...expenseData];

  if (category !== "all") {
    filteredData = filteredData.filter(function (data) {
      return data.category === category;
    });
  }
  filteredData.forEach(function (data, index) {
    let dataRow = document.createElement("tr");

    let formatedDate = new Date(data.date);
    let displayDate = "Invalid Date";

    if (!isNaN(formatedDate)) {
      displayDate = String(formatedDate.getDate()).padStart(2, "0") + "/" + 
                    String(formatedDate.getMonth() + 1).padStart(2, "0") + "/" + 
                    formatedDate.getFullYear();
    } else {
      displayDate = data.date;
    }


    // load from local storage
    dataRow.innerHTML = `<tr>
                            <td>${dataNo}</td>
                            <td>${data.name}</td>
                            <td>₹${data.amount}</td>
                            <td>${displayDate}</td>
                            <td>${data.category}</td>
                            <td><button class="btn expense--remove" data-index="${index}">Remove</button></td>
                        </tr>`;

    tbody.appendChild(dataRow);
    dataNo++;
    // if(dataNo > 3){
    //   tbody.style.height = "20rem";
    //   tbody.style.overflowY = "scroll";
    // }
  });
  showTotalExpense(filteredData);
}

function showTotalExpense(data = expenseData) {
  if(data.length === 0){
    document.getElementById("total-expense").innerHTML = "₹0";
    return;
  }
  let totalExpense = BigInt(0);
  for (let i = 0; i < data.length; i++) {
    const value = typeof data[i].amount === 'bigint' ? data[i].amount : BigInt(data[i].amount);
    totalExpense += value;
  }

  document.getElementById("total-expense").innerHTML = `₹${totalExpense.toString()}`;
}


function addData(name, amount, date, category) {
  const data = {
    name: name,
    amount: amount.toString(),
    date: new Date(date).toISOString(),
    category: category,
  };
  expenseData.push(data);
  console.log(expenseData);
  showData();
  storeExpenseToLocal();
  showTotalExpense();
}

function storeExpenseToLocal() {
  localStorage.setItem("expenseData", JSON.stringify(expenseData, replacer));
}

// remove expense from both table and local storage
function removeExpense(index) {
  expenseData.splice(index, 1);
  showData();
  showTotalExpense();
  storeExpenseToLocal();
}

// category local storage
function getCategoryFromLocal() {
  if (localStorage.getItem("categoryData")) {
    categoryData = JSON.parse(localStorage.getItem("categoryData"));
  }

  loadCategory();
}

function loadCategory() {
  category.innerHTML = "";
  categoryData.forEach(function (data) {
    category.innerHTML += `<option value="${data}">${data}</option>`;
  });

  document.getElementById("category-name").value = "";
}
getCategoryFromLocal();

// load filter category
function loadFilterCategory() {
  categoryData.forEach(function (data) {
    categoryFilter.innerHTML += `<option value="${data}">${data}</option>`;
  });
}
loadFilterCategory();

// store category to local storage
function storeCategoryToLocal() {
  localStorage.setItem("categoryData", JSON.stringify(categoryData));
}
storeCategoryToLocal();

// filter by category
categoryFilter.addEventListener("change", function (e) {
  let selectedCategory = e.target.value;
  showData(selectedCategory);
});

addCategoryBtn.addEventListener("click", function (e) {
  e.preventDefault();
  const categoryName = document.getElementById("category-name").value;

  if (categoryName === "") {
    return;
  }

  if(categoryData.includes(categoryName)){
    alert("Category already exist");
    return;
  }

  console.log(categoryName);
  categoryData.push(categoryName);
  storeCategoryToLocal();
  getCategoryFromLocal();
  loadFilterCategory();
})

// Remove expense
tbody.addEventListener("click", function (e) {
  if (e.target.classList.contains("expense--remove")) {
    let index = e.target.getAttribute("data-index");
    removeExpense(index);
  }
});

window.addEventListener("DOMContentLoaded", getExpenseFromLocal);

expenseForm.addEventListener("submit", function (e) {
  e.preventDefault();

  addData(Expname.value, amount.value, date.value, category.value);
  expenseForm.reset();
});