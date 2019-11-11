//BUDGET CONTROLLER
var budgetController = (function () {

    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.pre = -1;
    };

    Expense.prototype.calcPre = function (totalIncome) {

        if (totalIncome > 0) {
            this.pre = Math.round((this.value / totalIncome) * 100);
        }
    };

    Expense.prototype.getPre = function () {
        return this.pre;
    };

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function (type) {

        var sum = 0;
        data.allItems[type].forEach(function (cur) {
            sum += cur.value;
        });
        data.total[type] = sum;
    };

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        total: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        prece: -1
    }

    return {

        addItem: function (type, des, val) {
            var newItem, ID;

            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            if (type === 'exp') {
                newItem = new Expense(ID, des, val)
            } else {
                newItem = new Income(ID, des, val);
            }

            data.allItems[type].push(newItem);
            //data.total[type] += val;
            return newItem;
        },
        testing: function () {
            return console.log(data);
        },

        deleteItem: function (type, id) {
            var idsArray, index;
            idsArray = data.allItems[type].map(function (current) {
                return current.id;
            });

            index = idsArray.indexOf(id);
            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }

        },

        calcuateBudget: function () {

            //Calculate total income && expenses
            calculateTotal('exp');
            calculateTotal('inc');

            //Calculate the budget : income - expenses
            data.budget = data.total.inc - data.total.exp;

            //Calculate %
            if (data.total.inc > 0) {
                data.prece = Math.round((data.total.exp / data.total.inc) * 100);
            } else {
                data.prece = -1;
            }

            //console.log(data.total.inc);

        },

        calculatePre: function () {

            data.allItems.exp.forEach(function (curr) {
                curr.calcPre(data.total.inc);
            });
        },

        getPre: function () {

            var allpre = data.allItems.exp.map(function (curr) {
                return curr.getPre();
            });

            return allpre;
        },

        getbudget: function () {
            return {
                budget: data.budget,
                totalInc: data.total.inc,
                totalExp: data.total.exp,
                prec: data.prece
            }
        }

    };

})();







//UI CONTROLLER
var UIController = (function () {

    var DOMString = {
        inputType: '.add__type',
        inputDes: '.add__description',
        inputVal: '.add__value',
        inputBtn: '.add__btn',
        incomContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        precLabel: '.budget__expenses--percentage',
        container: '.container',
        expPreLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    var nodeListForEach = function (list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };

    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMString.inputType).value,
                description: document.querySelector(DOMString.inputDes).value,
                value: parseFloat(document.querySelector(DOMString.inputVal).value)
            };

        },

        getDOMString: function () {
            return DOMString;
        },

        addListItem: function (obj, type) {
            var html, newHTML, element;
            //Create HTML String with placeholder text.
            if (type === 'inc') {

                element = DOMString.incomContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'

            } else {

                element = DOMString.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }

            //Replace the palceholder text with data.

            newHTML = html.replace('%id%', obj.id);
            newHTML = newHTML.replace('%value%', this.formateNumber(obj.value, type));
            newHTML = newHTML.replace('%description%', obj.description);


            //Insert the HTML into the DOM.

            document.querySelector(element).insertAdjacentHTML('beforeend', newHTML);
        },

        deleteListItem: function (CSSId) {
            var element;
            element = document.getElementById(CSSId);
            element.parentNode.removeChild(element);

        },

        clearFilds: function () {

            var filds, fildsArray;

            filds = document.querySelectorAll(DOMString.inputDes + ', ' + DOMString.inputVal);

            fildsArray = Array.prototype.slice.call(filds);
            fildsArray.forEach(function (cur, ind, array) {

                cur.value = '';
            });

            fildsArray[0].focus();
        },

        displayBudget: function (obj) {
            var t;
            obj.budget > 0 ? t = 'inc' : t = 'exp';
            document.querySelector(DOMString.budgetLabel).textContent = this.formateNumber(obj.budget, t);
            document.querySelector(DOMString.incomeLabel).textContent = this.formateNumber(obj.totalInc, 'inc');
            document.querySelector(DOMString.expensesLabel).textContent = this.formateNumber(obj.totalExp, 'exp');

            if (obj.prec > 0) {
                document.querySelector(DOMString.precLabel).textContent = obj.prec + '%';
            } else {
                document.querySelector(DOMString.precLabel).textContent = '---';
            }

        },

        displayPre: function (preArray) {

            var fields = document.querySelectorAll(DOMString.expPreLabel);

            nodeListForEach(fields, function (current, index) {

                if (preArray[index] > 0) {
                    current.textContent = preArray[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });

        },

        formateNumber: function (num, type) {
            var numSplit, int, dec, type;

            num = Math.abs(num);
            num = num.toFixed(2);

            numSplit = num.split('.');

            int = numSplit[0];
            if (int.length > 3) {
                int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
            }

            dec = numSplit[1];

            return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;

        },

        displayMonth: function () {
            var now, month, year, months, myString;

            now = new Date();
            year = now.getFullYear();
            month = now.getMonth();

            months = ["January", "February", "March", "April", "May", "June", "July",
            "August", "September", "October", "November", "December"];
            document.querySelector(DOMString.dateLabel).textContent = months[month] + ' ' + year;

        },

        changeType: function () {

            var fields = document.querySelectorAll(
                DOMString.inputType + ',' + DOMString.inputDes + ',' + DOMString.inputVal);

            nodeListForEach(fields, function (curr) {
                curr.classList.toggle('red-focus');
            });

            document.querySelector(DOMString.inputBtn).classList.toggle('red');
        }

    };

})();







//GLOBAL CONTROLLER
var controller = (function (budgetCtrl, UICtrl) {

    var setupEventListeners = function () {

        var DOM = UICtrl.getDOMString();
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function (event) {

            if (event.keyCode === 13) {

                ctrlAddItem();
            }

        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);


        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType);
    };


    var updateBudget = function () {
        var budget;
        //  1. Calculte the budget.
        budgetCtrl.calcuateBudget();

        //  2. Return the budget.
        budget = budgetCtrl.getbudget();

        //  3. Display the budget on the UI.
        UICtrl.displayBudget(budget);

    };

    var updatePre = function () {
        var preArray;

        // 1. Calculate the pre.
        budgetCtrl.calculatePre();

        // 2. Read from the Budgetcontroller.
        preArray = budgetCtrl.getPre();
        console.log(preArray);

        // 3. Update UI.
        //console.log(preArray);
        UICtrl.displayPre(preArray);
    };


    var ctrlAddItem = function () {

        var input, newItem;

        //  1. Get the fild input data.
        input = UICtrl.getInput();
        // console.log(input);
        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            //  2. Add the item to the budget controller.
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            //  3. Add the new item to the UI.
            UICtrl.addListItem(newItem, input.type);

            //  4. Clear the filds.
            UICtrl.clearFilds();

            // 5. Calculate and update the budget.
            updateBudget();

            // 6. Claculate and upddate pre.
            updatePre();
        }
    };

    var ctrlDeleteItem = function (event) {
        var itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        console.log(itemID);
        if (itemID) {
            //itemID exemple : inc-1
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // 1.Delete the item from the DS.
            budgetCtrl.deleteItem(type, ID);

            // 2. Delete the item from the UI.
            UICtrl.deleteListItem(itemID);

            // 3. Update show in the budget.
            updateBudget();

            // 4. Claculate and upddate pre.
            updatePre();
        }

    };

    return {
        init: function () {
            console.log('App Init');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                prec: 0
            })
            setupEventListeners();
        }
    }

})(budgetController, UIController);



controller.init();
