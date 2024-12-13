const data = {
  items: [],
};

const itemCtrl = (function () {
  const Item = function (id, description, amount, type) {
    this.id = id;
    this.description = description;
    this.amount = amount;
    this.type = type;
  };

  return {
    logData: function () {
      return data;
    },
    addMoney: function (description, amount, type) {
      let ID = this.createID();
      const newMoney = new Item(ID, description, amount, type);
      data.items.push(newMoney);
      this.saveToStorage();
      return newMoney;
    },
    createID: function () {
      const idNum = Math.floor(Math.random() * 10000);
      return idNum;
    },
    saveToStorage: function () {
      localStorage.setItem("items", JSON.stringify(data.items));
    },
    getIdNumber: function (item) {
      const amountId = item.parentElement.id;
      const itemArr = amountId.split("-");
      const id = parseInt(itemArr[1]);
      return id;
    },
    deleteAmountArr: function (id) {
      const ids = data.items.map(function (item) {
        return item.id;
      });
      const index = ids.indexOf(id);
      data.items.splice(index, 1);
      this.saveToStorage();
    },
  };
})();

const UICtrl = (function () {
  const UISelectors = {
    incomeBtn: "#add__income",
    expenseBtn: "#add__expense",
    itemsContainer: ".items__container",
    descriptionInput: "#description",
    amountInput: "#amount",
    totalIncome: "#amount__earned",
    totalExpense: "#amount__spent",
    availableMoney: "#amount__available",
  };

  return {
    getSelectors: function () {
      return UISelectors;
    },
    getDescriptionInput: function () {
      return {
        descriptionInput: document.querySelector(UISelectors.descriptionInput)
          .value,
      };
    },
    getValueInput: function () {
      return {
        amountInput: parseFloat(
          document.querySelector(UISelectors.amountInput).value
        ),
      };
    },
    addIncomeItem: function (item) {
      const html = `<div class="item" id="income-${item.id}">
                            <div class="description">${item.description}</div>
                            <div class="amount">${item.amount}</div>
                            <button class="delete-btn">Delete</button>
                          </div>`;
      document
        .querySelector(UISelectors.itemsContainer)
        .insertAdjacentHTML("beforeend", html);
    },
    addExpenseItem: function (item) {
      const html = `<div class="item" id="expense-${item.id}">
                            <div class="description">${item.description}</div>
                            <div class="amount">${item.amount}</div>
                            <button class="delete-btn">Delete</button>
                          </div>`;
      document
        .querySelector(UISelectors.itemsContainer)
        .insertAdjacentHTML("beforeend", html);
    },
    deleteAmount: function (id) {
      
      const ids = data.items.map(function (item) {
        return item.id;
      });
      const index = ids.indexOf(id);

      
      if (index !== -1) {
        data.items.splice(index, 1);
      }

     
      this.saveToStorage();


      const itemToDelete = document.getElementById(id);
      
      location.reload();

      itemToDelete.remove();

    },
    saveToStorage: function() {
        localStorage.setItem('items', JSON.stringify(data.items)); 
    },
    clearInputs: function () {
      document.querySelector(UISelectors.descriptionInput).value = "";
      document.querySelector(UISelectors.amountInput).value = "";
    },
    updateEarned: function () {
      let totalIncome = 0;
      data.items.forEach(function (item) {
        if (item.type === "income") totalIncome += item.amount;
      });
      document.querySelector(UISelectors.totalIncome).textContent = totalIncome;
      this.updateAvailable();
    },
    updateSpent: function () {
      let totalExpense = 0;
      data.items.forEach(function (item) {
        if (item.type === "expense") totalExpense += item.amount;
      });
      document.querySelector(UISelectors.totalExpense).textContent =
        totalExpense;
      this.updateAvailable();
    },
    updateAvailable: function () {
      const totalIncome = parseFloat(
        document.querySelector(UISelectors.totalIncome).textContent
      );
      const totalExpense = parseFloat(
        document.querySelector(UISelectors.totalExpense).textContent
      );
      const available = totalIncome + totalExpense;
      document.querySelector(UISelectors.availableMoney).textContent =
        available;
    },
  };
})();

const App = (function () {
  const loadEventListeners = function () {
    const UISelectors = UICtrl.getSelectors();
    document
      .querySelector(UISelectors.incomeBtn)
      .addEventListener("click", addIncome);
    document
      .querySelector(UISelectors.expenseBtn)
      .addEventListener("click", addExpense);
    document
      .querySelector(UISelectors.itemsContainer)
      .addEventListener("click", deleteItem);
  };

  const addIncome = function () {
    const description = UICtrl.getDescriptionInput();
    const amount = UICtrl.getValueInput();
    if (description.descriptionInput !== "" && amount.amountInput !== "") {
      const newMoney = itemCtrl.addMoney(
        description.descriptionInput,
        amount.amountInput,
        "income"
      );
      UICtrl.addIncomeItem(newMoney);
      UICtrl.clearInputs();
      UICtrl.updateEarned();
      UICtrl.updateAvailable();
    }
  };

  const addExpense = function () {
    const description = UICtrl.getDescriptionInput();
    const amount = UICtrl.getValueInput();
    if (description.descriptionInput !== "" && amount.amountInput !== "") {
      const newMoney = itemCtrl.addMoney(
        description.descriptionInput,
        -amount.amountInput,
        "expense"
      );
      UICtrl.addExpenseItem(newMoney);
      UICtrl.clearInputs();
      UICtrl.updateSpent();
      UICtrl.updateAvailable();
    }
  };

  const deleteItem = function (e) {
    if (e.target.classList.contains("delete-btn")) {
      const id = itemCtrl.getIdNumber(e.target);
      console.log("ID del presupuesto:", id);
      UICtrl.deleteAmount(id);
      itemCtrl.deleteAmountArr(id);
      UICtrl.updateEarned();
      UICtrl.updateSpent();
      UICtrl.updateAvailable();
    }
    e.preventDefault();
  };

  return {
    init: function () {
      App.loadFromStorage();
      loadEventListeners();
    },
    loadFromStorage: function () {
      try {
        const storedItems = JSON.parse(localStorage.getItem("items")) || [];
        storedItems.forEach(function (item) {
          if (item.type === "income") {
            UICtrl.addIncomeItem(item);
          } else {
            UICtrl.addExpenseItem(item);
          }
        });
        data.items = storedItems;
        UICtrl.updateEarned();
        UICtrl.updateSpent();
        UICtrl.updateAvailable();
      } catch (ex) {
        console.log(ex);
      }
    },
  };
})(itemCtrl, UICtrl);

App.init();
