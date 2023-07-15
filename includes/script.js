class Catalog {
    //Setting up the API and class objects.
    product_api = "https://fakestoreapi.com/products";
    backup_product_api = "https://deepblue.camosun.bc.ca/~c0180354/ics128/final/fakestoreapi.json";
    backup_currency_api = "https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies/cad.json";
    currency_api = "https://deepblue.camosun.bc.ca/~c0180354/ics128/final/currencies-cad.json";
    product_data = {};
    currency_data = {};
    choosen_currency = {};
    constructor() {
        this.get_products_from_api();
    }

    get_currency() {
        //Get's the data from the currency API
        fetch(this.currency_api).
            then(response => {
                return response.json();
            }).then(json => {
                //Putting the value of json to currency_data
                this.currency_data = json;
            }).catch(error => {
                //If the first link of the fake store fails it calls the backup
                this.backup_currency_api;
                fetch(this.backup_currency_api).then(response => {
                    return response.json();
                }).then(json => {
                    this.currency_data = json;
                }).catch(error => {
                    //Displayi if all the links are down
                    let currency_backup_fails = `<div class="alert alert-warning alert-dismissible fade show" role="alert">
                    <strong>Our currency servers are down!</strong> We recommend to reload the page or wait until we fix the problems, we apologize for the inconveniences.
                  </div>`;
                    $(".input-group-prepend").html(currency_backup_fails);
                })
            })
    }


    get_products_from_api() {
        //Get's the data from the fake store
        fetch(this.product_api).
            then(response => {
                return response.json();
            }).then(json => {
                this.product_data = json;
                //Calling al Functions
                this.get_currency();
                this.render_products_on_page();
                this.render_items_on_cart();
                this.change_currency();
            }).catch(error => {
                //If the first link of the fake store fails it calls the backup
                this.backup_product_api;
                fetch(this.backup_product_api).then(response => {
                    return response.json();
                }).then(json => {
                    this.product_data = json;
                    //Calling al Functions
                    //   this.get_currency();
                    this.get_currency();
                    this.render_products_on_page();
                    this.render_items_on_cart();
                    this.change_currency();
                }).catch(error => {
                    //Displayi if all the links are down
                    let links_fails = `<div class="alert alert-warning alert-dismissible fade show" role="alert">
                    <strong>Our servers are down!</strong> We recommend to reload the page or wait until we fix the problems, we apologize for the inconveniences.
                  </div>`;
                    $(links_fails).appendTo("#catalog_view");
                })
            })
    }



    //Changing the Currency
    change_currency() {
        // With this method we change the currency by loading the catalog again with the new currency and sign
        jQuery("#currency-info").on("change", { catalog: this }, function (event) {
            let soles = event.data.catalog.currency_data.cad.pen;
            let usd = event.data.catalog.currency_data.cad.usd;
            let sign = ["S/", "$"];
            //This values is the one that is going to be sent to the fetch.
            let fetch_sign = ["sol", "usd", "cad"]
            //Checking the conditions, if the user select usd
            if ($("#currency-info").val() == "usd") {
                //It will render again with the new currency and sign
                event.data.catalog.render_products_on_page(usd, sign[1], fetch_sign[1]);
            } else if ($("#currency-info").val() == "sol") {
                //Checking the conditions, if the user select sol
                //It will render again with the new currency and sign
                event.data.catalog.render_products_on_page(soles, sign[0], fetch_sign[0]);

            } else {
                //The default is cad so it will render the catalog with the normal price
                event.data.catalog.render_products_on_page(1, sign[1], fetch_sign[2]);
            }

        });
    }

    render_products_on_page(currency, sign, fetch_sign) {
        //If its null it wil give a 1
        if (currency == null || currency == undefined) {
            currency = 1;
        }

        if (sign == null || sign == undefined) {
            //If its null it wil give a $
            sign = "$"
        }

        //This will be send when the user clicks on confirm order, as well work on the checkout
        //to tell the user what's the currency is using.
        if (fetch_sign == null || fetch_sign == undefined) {
            fetch_sign = "cad"
        }

        jQuery("#catalog_view").html("");
        //For each product of the fake store it will display it on the page
        for (let product of this.product_data) {
            let { id, title, description, image, price } = product;
            let catalogDisplay = `<div class="col-sm-6 col-lg-4 mb-4">
                        <div class="card">
                            <img src="${image}" alt="${title}">
                            <div class="card-body">
                                        <h5 class="card-title">${title}</h5>
                                        <p class="card-text">${description}</p>
                                        <p class="price">${sign}${((price.toFixed(2) * currency).toFixed(2))}</p>
                                    <button class="btn btn-success add-to-cart-button" data-id="${id}">Add to cart</button>
                            </div >
                        </div >
                    </div > `;
            $(catalogDisplay).appendTo("#catalog_view");
            this.choosen_currency = [currency, sign, fetch_sign];
        }
        let catalog_container = document.getElementById("catalog_view"); // assuming your target is <div class='row' id='catalog'>
        jQuery(catalog_container).imagesLoaded(function () {
            let msnry = new Masonry(catalog_container); // this initializes the masonry container AFTER the product images are loaded
        });
        //Calling the methods
        this.add_event_handlers();
        this.render_items_on_cart();
    }

    render_items_on_cart() {
        let cart_contents = "";
        let order_contents = "";
        var cart_items = get_cookie("shopping_cart_items");
        var subtotal = 0.0;
        let currency = this.choosen_currency[0];
        let fetch_sign = this.choosen_currency[2];
        var sign = this.choosen_currency[1];
        for (var product_id in cart_items) {
            var product = this.get_product(product_id);
            let quantity = cart_items[product_id];
            var item_total = parseFloat(((product.price * quantity) * currency));
            cart_contents += `<tr class="cart_rows" id="${product_id}">
            <td class="cart-row"><button class="delete-row" onclick="catalog.remove_row_cart(${product_id})"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/><path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/></svg></button></td>
            <td>${product.title}</td>
            <td class="quantity">${quantity}</td>
            <td>${sign}${(product.price.toFixed(2) * currency).toFixed(2)}</td>
            <td>${sign}<span class="final-price">${item_total.toFixed(2)}</span></td>
            </tr>`;

            order_contents += `<tr id="${product_id}">
            <td class="cart-row"></td>
            <td>${product.title}</td>
            <td class="quantity">${quantity}</td>
            <td>${sign}${(product.price.toFixed(2) * currency).toFixed(2)}</td>
            <td>${sign}<span class="final-price">${item_total.toFixed(2)}</span></td>
            </tr>`;

            subtotal = parseFloat(item_total.toFixed(2)) + subtotal;
        }
        //If it's not empty it will display the products the user added on their cart.
        if (cart_contents != "") {
            cart_contents = `<table class="table align-middle table-sm" id="cart">
            <thead>
            <tr>
            <th scope="col">&nbsp;</th>
            <th scope="col"> Item </th>
            <th scope="col"> Qty </th>
            <th scope="col"> Price </th>
            <th scope="col" id="fetch-sign" val="${fetch_sign}">Total</th>
            </tr> 
            </thead><tbody>` + cart_contents + `</tbody></table>` + `<table class="table" id="subtotal">
            <thead>
            <tr>
            <th scope="col">Subotal</th>
            <th scope="col" style="padding-left: 165px;">${sign} <span  id="final-cost">${subtotal.toFixed(2)}</span></th>
            </tr> 
            </thead><tbody>` + `</tbody></table>` + `<button class="btn btn-warning" id="empty-cart" onclick="catalog.remove_cart()">Empty Cart</button>
            <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#exampleModal" id="checkout">Checkout</button>`;
        }
        //Getting the order total of the products  with the shipping , tax and subtotal in it.
        let shipping = 15.00
        let tax = (subtotal * 5) / 100;
        let order_total = shipping + tax + subtotal;
        //If it's not empty it will display the products the user added on their cart on the checkout modal.
        if (order_contents != "") {
            order_contents = `<h5>Your Currency is <span id="user-currency-order">${fetch_sign}</span></h5>
            <table class="table align-middle table-sm">
            <thead>
            <tr>
            <th scope="col">&nbsp;</th>
            <th scope="col"> Item </th>
            <th scope="col"> Qty </th>
            <th scope="col"> Price </th>
            <th scope="col">Total</th>
            </tr> 
            </thead><tbody>` + order_contents + `</tbody></table>` + `<table class="table"><tbody><tr>
            <th scope="col">Subtotal</th>
            <th scope="col" class="order-elements">${sign}${subtotal.toFixed(2)}</span></th>
            </tr>
            <tr>
            <th>Shipping</th>
            <th  class="order-elements" id="item_ship">${sign}${shipping.toFixed(2)}</th>
            </tr>
            <tr>
            <th>Tax</th>
            <th  class="order-elements">${sign}${tax.toFixed(2)}</th>
            </tr>
            <tr>
            <th>Order Total</th>
            <th class="order-elements">${sign}<span id="final-total">${order_total.toFixed(2)}</span></th>
            </tr>
            </tbody></table>`;
        }

        //Displaying the products on the checkout part.
        $("#order-details").html(order_contents);

        //Displaying the products on cart
        $(".offcanvas-body").html(cart_contents);
    }
    remove_cart() {
        //Remove all the items on the cart
        let noItems = `<p id="no-items"> Theres no items in your cart</p>`;
        set_cookie("shopping_cart_items", null);
        $("#cart").remove();
        $("#subtotal").remove();
        $("#empty-cart").remove();
        $("#checkout").remove();
        $(noItems).appendTo(".offcanvas-body");
    }
    remove_row_cart(id, sign) {
        //Remove the item if the user clicks on the tras icon
        //Getting the new subtotal because there is less items
        let previous_total = parseFloat($(`#${id} .final-price`).html());
        let subtotal = parseFloat($("#final-cost").html());
        let new_total = subtotal - previous_total;
        $("#final-cost").html(new_total.toFixed(2));
        var cart_items = get_cookie("shopping_cart_items");
        delete cart_items[id];
        set_cookie("shopping_cart_items", cart_items);
        $(`#${id}`).remove();
        this.render_items_on_cart();
        let noItems = `<p id ="no-items"> Theres no items in your cart</p>`;
        //If there is no items on the cart it will display a message that it's empty
        if ($(".cart-row").html() == undefined) {
            $("#subtotal").remove();
            $("#cart").remove();
            $("#empty-cart").remove();
            $("#checkout").remove();
            $(noItems).appendTo(".offcanvas-body");
            set_cookie("shopping_cart_items", null);
        }

    }

    add_event_handlers() {

        jQuery(".add-to-cart-button").click(function () {
            // get the product id from a data attribute of the button that looks like this:
            // Add To Cart
            var product_id = jQuery(this).attr("data-id");
            var cart_items = get_cookie("shopping_cart_items"); // get the data stored as a "cookie"

            // initialize the cart items if it returns null
            if (cart_items === null) {
                cart_items = {};
            }

            // make sure the object is defined;
            if (cart_items[product_id] === undefined) {
                cart_items[product_id] = 0;
            }

            cart_items[product_id]++;

            set_cookie("shopping_cart_items", cart_items); // setting the cart items back to the "cookie" storage
            catalog.get_product(product_id);
            catalog.render_items_on_cart();
        });

    }
    //Get the product
    get_product(product_id) {
        for (let product of this.product_data) {
            // This condition makes sure that if the product_id is the same of one of the product.id it return all the information that product.
            if (product.id == product_id) {
                return product;
            }
        }
        return {};
    }


}
const catalog = new Catalog();

/*********************************************************************************
                                Validation Section
**********************************************************************************/
//Setting up the buttons.
$("#pills-home-tab").click();
$('#billing-button').css('display', 'none');
$('#shipping-button').css('display', 'none');
$('#confirm-button').css('display', 'none');

/*********************************************************************************
 * On This part I set the buttons of of the checkou so when the user click it can access to the information
 * and that the button "Continue" can work for each tab, this because I created 4 button for each tab to make easier the validation. 
**********************************************************************************/
//When the user clicks the tab it will show the button of that tab and hide the other.
jQuery("#pills-home-tab").on("click", function () {
    $('#continue-button').show();
    $('#billing-button').hide();
    $('#shipping-button').hide();
    $('#confirm-button').hide();
});

jQuery("#pills-billing-tab").on("click", function () {
    $('#continue-button').hide();
    $('#billing-button').show();
    $('#shipping-button').hide();
    $('#confirm-button').hide();
});

jQuery("#pills-contact-tab").on("click", function () {
    $('#continue-button').hide();
    $('#billing-button').hide();
    $('#shipping-button').show();
    $('#confirm-button').hide();
});

jQuery("#pills-confirmation-tab").on("click", function () {
    $('#continue-button').hide();
    $('#billing-button').hide();
    $('#shipping-button').hide();
    $('#confirm-button').show();

});

/*********************************************************************************
 * Here if the user clicks on use the same informations that they put on the billing part it autofills the 
 * information withe the data of billing details
**********************************************************************************/
jQuery(document).ready(function () {
    jQuery("#flexCheckDefault").click(function () {
        $("#shipping-details-view").toggle();
        jQuery("#first-name-ship").val(jQuery("#first-name").val());
        jQuery("#last-name-ship").val(jQuery("#last-name").val());
        jQuery("#billing-adrress01-ship").val(jQuery("#billing-adrress01").val());
        jQuery("#billing-adrress02-ship").val(jQuery("#billing-adrress02").val());
        jQuery("#city-ship").val(jQuery("#city").val());
        jQuery("#country-select-ship").val($("#country-select").val());
        $("#prv-state-ship").val($("#prv-state").val());
        jQuery("#postal-code-ship").val(jQuery("#postal-code").val());
    });

    //Getting all the provinces of Canada
    let provinces = new Array();
    provinces = ['AB', 'BC', 'MB', 'NB', 'NL', 'NT', 'NS', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT'];;

    let options = '';
    //Getting all the states of America
    let states = new Array();
    states = ["AK", "AL", "AR", "AS", "AZ", "CA", "CO", "CT", "DC", "DE", "FL", "GA", "GU", "HI", "IA", "ID", "IL", "IN", "KS", "KY", "LA", "MA", "MD", "ME", "MI", "MN", "MO", "MS", "MT", "NC", "ND", "NE", "NH", "NJ", "NM", "NV", "NY", "OH", "OK", "OR", "PA", "PR", "RI", "SC", "SD", "TN", "TX", "UT", "VA", "VI", "VT", "WA", "WI", "WV", "WY"];

    let options02 = '';


    /******************************* Provinces and States for Billing Details ********************/
    jQuery("#country-select").on("change", function () {
        if ($("#country-select").val() == "CA") {
            //It's display the provinces to the user.
            for (let i = 0; i < provinces.length; i++) {
                options += '<option value="' + provinces[i] + '" />';
            }
            $("#province-state-cad-usd").html(options);


        } else if ($("#country-select").val() == "US") {
            //Displaying the states if the user enter USA
            for (let i = 0; i < states.length; i++) {
                options02 += '<option value="' + states[i] + '" />';
            }
            $("#province-state-cad-usd").html(options02);
        } else { }
    });

    /******************************* Provinces and States for Shipping Details ********************/
    jQuery("#country-select-ship").on("change", function () {
        if ($("#country-select-ship").val() == "CA") {
            //Displaying the provinces if the user enter Canada
            for (let i = 0; i < provinces.length; i++) {
                options += '<option value="' + provinces[i] + '" />';
            }
            $("#province-state-cad-usd-ship").html(options);

        } else if ($("#country-select-ship").val() == "US") {
            //Displaying the stats if the user enter USA
            for (let i = 0; i < states.length; i++) {
                options02 += '<option value="' + states[i] + '" />';
            }
            $("#province-state-cad-usd-ship").html(options02);
        } else { }
    });


    //Validation of Payment method
    jQuery("#continue-button").on("click", function (event) {
        event.preventDefault();
        let count = 0;
        let validity = false;
        let good_cart_number = /^(^4[0-9]{12}(?:[0-9]{3})?$)|(^(?:5[1-5][0-9]{2}|222[1-9]|22[3-9][0-9]|2[3-6][0-9]{2}|27[01][0-9]|2720)[0-9]{12}$)|(3[47][0-9]{13})|(^3(?:0[0-5]|[68][0-9])[0-9]{11}$)|(^6(?:011|5[0-9]{2})[0-9]{12}$)|(^(?:2131|1800|35\d{3})\d{11}$)/;
        // For Email.
        if (jQuery("#cart-number").val().match(good_cart_number)) {
            /// remove the is-invalid class,if it exists,from the id field
            jQuery("#cart-number").removeClass("is-invalid");

            // add the css class"is-invalid"to give positive feedback to the user
            jQuery("#cart-number").addClass("is-valid");
            // remove any tooltip on this element
            if (jQuery("#cart-number").tooltip != undefined) {
                jQuery("#cart-number").tooltip("dispose");
            }

            validity = true;

        } else {
            //
            // use the bootstrap built in styles to indicateaproblem with the field
            jQuery("#cart-number").addClass("is-invalid");
            // ensure that the#id field doesn't have the is-valid class applied
            jQuery("#cart-number").removeClass("is-valid");
            // addahover tooltip to the#id field
            let tooltip = new bootstrap.Tooltip("#cart-number", {
                title: "Cart need to be valid and cannot be blank "
            });
            // set the validity to false
            validity = false;


        }
        //For Month.
        let valid_month = /^(0?[1-9]|1[012])$/;
        if (jQuery("#expiration-date").val().match(valid_month)) {
            /// remove the is-invalid class,if it exists,from the id field
            jQuery("#expiration-date").removeClass("is-invalid");

            // add the css class"is-invalid"to give positive feedback to the user
            jQuery("#expiration-date").addClass("is-valid");
            // remove any tooltip on this element
            if (jQuery("#expiration-date").tooltip != undefined) {
                jQuery("#expiration-date").tooltip("dispose");
            }
            validity = true;

        } else {

            // use the bootstrap built in styles to indicateaproblem with the field
            jQuery("#expiration-date").addClass("is-invalid");
            // ensure that the#id field doesn't have the is-valid class applied
            jQuery("#expiration-date").removeClass("is-valid");
            // addahover tooltip to the#id field
            let tooltip = new bootstrap.Tooltip("#expiration-date", {
                title: "Need to be a valid month like 03 OR 10"
            });
            // set the validity to false
            validity = false;

        }
        //For Year
        let year_date = new Date();
        let current_year = year_date.getFullYear();
        let valid_year = /^(?:[0-9]\d|\d{4,})$/;
        if (jQuery("#year").val().match(valid_year) && parseInt(jQuery("#year").val()) >= current_year) {
            count++;
            /// remove the is-invalid class,if it exists,from the id field
            jQuery("#year").removeClass("is-invalid");

            // add the css class"is-invalid"to give positive feedback to the user
            jQuery("#year").addClass("is-valid");
            // remove any tooltip on this element
            if (jQuery("#year").tooltip != undefined) {
                jQuery("#year").tooltip("dispose");
            }
            validity = true;

        } else if (parseInt(jQuery("#year").val()) < current_year) {
            //
            // use the bootstrap built in styles to indicateaproblem with the field
            jQuery("#expiration-date").addClass("is-invalid");
            // ensure that the#id field doesn't have the is-valid class applied
            jQuery("#expiration-date").removeClass("is-valid");
            // addahover tooltip to the#id field
            let tooltip = new bootstrap.Tooltip("#expiration-date", {
                title: "Invalid month"
            });
            // set the validity to false
            //  validity = false;

            jQuery("#year").addClass("is-invalid");
            // ensure that the#id field doesn't have the is-valid class applied
            jQuery("#year").removeClass("is-valid");
            // addahover tooltip to the#id field
            tooltip = new bootstrap.Tooltip("#year", {
                title: "Need to be a valid year."
            });
            // set the validity to false
            validity = false;

        } else {
            //
            // use the bootstrap built in styles to indicateaproblem with the field
            jQuery("#year").addClass("is-invalid");
            // ensure that the#id field doesn't have the is-valid class applied
            jQuery("#year").removeClass("is-valid");
            // addahover tooltip to the#id field
            let tooltip = new bootstrap.Tooltip("#year", {
                title: "Need to be a valid year."
            });
            // set the validity to false
            validity = false;
        }

        //For Security code
        let valid_csc = /^(?:[0-9]\d|\d{3,})$/;
        if (jQuery("#security-code").val().match(valid_csc)) {
            /// remove the is-invalid class,if it exists,from the id field
            jQuery("#security-code").removeClass("is-invalid");

            // add the css class"is-invalid"to give positive feedback to the user
            jQuery("#security-code").addClass("is-valid");
            // remove any tooltip on this element
            if (jQuery("#security-code").tooltip != undefined) {
                jQuery("#security-code").tooltip("dispose");
            }

            validity = true;

        } else {
            //
            // use the bootstrap built in styles to indicateaproblem with the field
            jQuery("#security-code").addClass("is-invalid");
            // ensure that the#id field doesn't have the is-valid class applied
            jQuery("#security-code").removeClass("is-valid");
            // addahover tooltip to the#id field
            let tooltip = new bootstrap.Tooltip("#security-code", {
                title: "It cannot be blank."
            });
            // set the validity to false
            validity = false;
        }

        //Validate if the month and year are valid if it is the current year.

        let month = parseInt(jQuery("#expiration-date").val());
        let year = parseInt(jQuery("#year").val());
        let day = 1;
        // let credit_expiration = new Date(current_year, +month, +day);

        let checking_day_future = (date) => {
            return date > Date.now();
        }
        let checking_valid_expiration = checking_day_future(new Date(year, month, day));

        if (checking_valid_expiration == false) {

            jQuery("#expiration-date").addClass("is-invalid");
            // ensure that the#id field doesn't have the is-valid class applied
            jQuery("#expiration-date").removeClass("is-valid");
            // addahover tooltip to the#id field
            let tooltip = new bootstrap.Tooltip("#expiration-date", {
                title: "Need to be a valid month like 03 OR 10"
            });

            jQuery("#year").addClass("is-invalid");
            // ensure that the#id field doesn't have the is-valid class applied
            jQuery("#year").removeClass("is-valid");
            // addahover tooltip to the#id field
            tooltip = new bootstrap.Tooltip("#year", {
                title: "Need to be a valid year."
            });

            validity = false;
        }

        if (validity == true) {
            $("#pills-billing-tab").click();
        }


    });

    /**************************************   Billing Validation *********************************/
    jQuery("#billing-button").on("click", function (event) {
        event.preventDefault();
        let count = 0;
        let valid_name = /(.*[a-z]){3}/i;
        let validity = false;
        if (jQuery("#first-name").val().match(valid_name)) {
            /// remove the is-invalid class,if it exists,from the id field
            jQuery("#first-name").removeClass("is-invalid");

            // add the css class"is-invalid"to give positive feedback to the user
            jQuery("#first-name").addClass("is-valid");
            // remove any tooltip on this element
            if (jQuery("#first-name").tooltip != undefined) {
                jQuery("#first-name").tooltip("dispose");
            }
            validity = true;

        } else {
            //
            // use the bootstrap built in styles to indicateaproblem with the field
            jQuery("#first-name").addClass("is-invalid");
            // ensure that the#id field doesn't have the is-valid class applied
            jQuery("#first-name").removeClass("is-valid");
            // addahover tooltip to the#id field
            let tooltip = new bootstrap.Tooltip("#first-name", {
                title: "It cannot be blank and cannot be a number."
            });
            // set the validity to false
            validity = false;
        }

        //For Last Name
        let valid_last_name = /(.*[a-z]){3}/i;
        if (jQuery("#last-name").val().match(valid_last_name)) {
            /// remove the is-invalid class,if it exists,from the id field
            jQuery("#last-name").removeClass("is-invalid");

            // add the css class"is-invalid"to give positive feedback to the user
            jQuery("#last-name").addClass("is-valid");
            // remove any tooltip on this element
            if (jQuery("#last-name").tooltip != undefined) {
                jQuery("#last-name").tooltip("dispose");
            }

            validity = true;

        } else {
            //
            // use the bootstrap built in styles to indicateaproblem with the field
            jQuery("#last-name").addClass("is-invalid");
            // ensure that the#id field doesn't have the is-valid class applied
            jQuery("#last-name").removeClass("is-valid");
            // addahover tooltip to the#id field
            let tooltip = new bootstrap.Tooltip("#last-name", {
                title: "It cannot be blank and cannot be a number."
            });
            // set the validity to false
            validity = false;
        }

        //For Billing Address 01 and Billing Address 02
        let valid_billing_address = /^[#.0-9a-zA-Z\s,-]+$/;
        if (jQuery("#billing-adrress01").val().match(valid_billing_address)) {
            /// remove the is-invalid class,if it exists,from the id field
            jQuery("#billing-adrress01").removeClass("is-invalid");

            // add the css class"is-invalid"to give positive feedback to the user
            jQuery("#billing-adrress01").addClass("is-valid");
            // remove any tooltip on this element
            if (jQuery("#billing-adrress01").tooltip != undefined) {
                jQuery("#billing-adrress01").tooltip("dispose");
            }
            validity = true;

        } else {
            //
            // use the bootstrap built in styles to indicateaproblem with the field
            jQuery("#billing-adrress01").addClass("is-invalid");
            // ensure that the#id field doesn't have the is-valid class applied
            jQuery("#billing-adrress01").removeClass("is-valid");
            // addahover tooltip to the#id field
            let tooltip = new bootstrap.Tooltip("#billing-adrress01", {
                title: "Please enter a valid address"
            });
            // set the validity to false
            validity = false;
        }

        if (jQuery("#billing-adrress02").val().match(valid_billing_address) || jQuery("#billing-adrress02").val() == "") {
            /// remove the is-invalid class,if it exists,from the id field
            jQuery("#billing-adrress02").removeClass("is-invalid");

            // add the css class"is-invalid"to give positive feedback to the user
            jQuery("#billing-adrress02").addClass("is-valid");
            // remove any tooltip on this element
            if (jQuery("#billing-adrress02").tooltip != undefined) {
                jQuery("#billing-adrress01").tooltip("dispose");
            }
            validity = true;

        } else {
            //
            // use the bootstrap built in styles to indicateaproblem with the field
            jQuery("#billing-adrress02").addClass("is-invalid");
            // ensure that the#id field doesn't have the is-valid class applied
            jQuery("#billing-adrress02").removeClass("is-valid");
            // addahover tooltip to the#id field
            let tooltip = new bootstrap.Tooltip("#billing-adrress02", {
                title: "Please enter a valid address"
            });
            // set the validity to false
            validity = false;
        }

        //For city
        let valid_city = /^[A-Za-z]+$/;
        if (jQuery("#city").val().match(valid_city)) {
            /// remove the is-invalid class,if it exists,from the id field
            jQuery("#city").removeClass("is-invalid");

            // add the css class"is-invalid"to give positive feedback to the user
            jQuery("#city").addClass("is-valid");
            // remove any tooltip on this element
            if (jQuery("#city").tooltip != undefined) {
                jQuery("#city").tooltip("dispose");
            }
            validity = true;

        } else {
            //
            // use the bootstrap built in styles to indicateaproblem with the field
            jQuery("#city").addClass("is-invalid");
            // ensure that the#id field doesn't have the is-valid class applied
            jQuery("#city").removeClass("is-valid");
            // addahover tooltip to the#id field
            let tooltip = new bootstrap.Tooltip("#city", {
                title: "It cannot be blank and cannot be a number."
            });
            // set the validity to false
            validity = false;
        }
        //For Phone
        let valid_phone = /^[+]?1?[.\s]?[2-9](?!11)\d{2}[.\s]?[2-9](?!11)\d{2}[.\s]?\d{4}$/;
        if (jQuery("#phone").val().match(valid_phone)) {
            /// remove the is-invalid class,if it exists,from the id fiel
            jQuery("#phone").removeClass("is-invalid");

            // add the css class"is-invalid"to give positive feedback to the user
            jQuery("#phone").addClass("is-valid");
            // remove any tooltip on this element
            if (jQuery("#phone").tooltip != undefined) {
                jQuery("#phone").tooltip("dispose");
            }
            validity = true;


        } else {
            //
            // use the bootstrap built in styles to indicateaproblem with the field
            jQuery("#phone").addClass("is-invalid");
            // ensure that the#id field doesn't have the is-valid class applied
            jQuery("#phone").removeClass("is-valid");
            // addahover tooltip to the#id field
            let tooltip = new bootstrap.Tooltip("#phone", {
                title: "Please enter a valid phone."
            });
            // set the validity to false
            validity = false;
        }
        //For Email
        let valid_email = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
        if (jQuery("#email").val().match(valid_email)) {
            /// remove the is-invalid class,if it exists,from the id field
            jQuery("#email").removeClass("is-invalid");

            // add the css class"is-invalid"to give positive feedback to the user
            jQuery("#email").addClass("is-valid");
            // remove any tooltip on this element
            if (jQuery("#email").tooltip != undefined) {
                jQuery("#email").tooltip("dispose");
            }
            validity = true;

        } else {
            //
            // use the bootstrap built in styles to indicateaproblem with the field
            jQuery("#email").addClass("is-invalid");
            // ensure that the#id field doesn't have the is-valid class applied
            jQuery("#email").removeClass("is-valid");
            // addahover tooltip to the#id field
            let tooltip = new bootstrap.Tooltip("#email", {
                title: "Please enter a valid email."
            });
            // set the validity to false
            validity = false;
        }

        //For Province and State
        if (jQuery("#prv-state").val() != "") {
            /// remove the is-invalid class,if it exists,from the id field
            jQuery("#prv-state").removeClass("is-invalid");

            // add the css class"is-invalid"to give positive feedback to the user
            jQuery("#prv-state").addClass("is-valid");
            // remove any tooltip on this element
            if (jQuery("#prv-state").tooltip != undefined) {
                jQuery("#prv-state").tooltip("dispose");
            }
            validity = true;

        } else {
            //
            // use the bootstrap built in styles to indicateaproblem with the field
            jQuery("#prv-state").addClass("is-invalid");
            // ensure that the#id field doesn't have the is-valid class applied
            jQuery("#prv-state").removeClass("is-valid");
            // addahover tooltip to the#id field
            let tooltip = new bootstrap.Tooltip("#prv-state", {
                title: "It cannot be blank."
            });
            // set the validity to false
            validity = false;
        }

        //Postal Code and ZIP code
        let valid_postal_code = /^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z][ -]?\d[ABCEGHJ-NPRSTV-Z]\d$/;
        let valid_zip_code = /^[0-9]{5}(?:-[0-9]{4})?$/;
        if (jQuery("#postal-code").val().match(valid_postal_code) || jQuery("#postal-code").val().match(valid_zip_code)) {
            /// remove the is-invalid class,if it exists,from the id field
            jQuery("#postal-code").removeClass("is-invalid");

            // add the css class"is-invalid"to give positive feedback to the user
            jQuery("#postal-code").addClass("is-valid");
            // remove any tooltip on this element
            if (jQuery("#postal-code").tooltip != undefined) {
                jQuery("#postal-code").tooltip("dispose");
            }
            validity = true;

        } else {
            //
            // use the bootstrap built in styles to indicateaproblem with the field
            jQuery("#postal-code").addClass("is-invalid");
            // ensure that the#id field doesn't have the is-valid class applied
            jQuery("#postal-code").removeClass("is-valid");
            // addahover tooltip to the#id field
            let tooltip = new bootstrap.Tooltip("#postal-code", {
                title: "It cannot be blank. (Check that you dont put spaces at the beginning )"
            });
            // set the validity to false
            validity = false;
        }

        if (validity == true) {
            $("#pills-contact-tab").click();
        }



    });

    /*****************************************************************************************************************
     *                      Shipping Details 
    *******************************************************************************************************************/

    jQuery("#shipping-button").on("click", function (event) {
        event.preventDefault();
        let count = 0;
        let valid_name = /(.*[a-z]){3}/i;
        let validity = true;
        if (jQuery("#first-name-ship").val().match(valid_name)) {
            /// remove the is-invalid class,if it exists,from the id field
            jQuery("#first-name-ship").removeClass("is-invalid");

            // add the css class"is-invalid"to give positive feedback to the user
            jQuery("#first-name-ship").addClass("is-valid");
            // remove any tooltip on this element
            if (jQuery("#first-name-ship").tooltip != undefined) {
                jQuery("#first-name-ship").tooltip("dispose");
            }
            validity = true;

        } else {
            //
            // use the bootstrap built in styles to indicateaproblem with the field
            jQuery("#first-name-ship").addClass("is-invalid");
            // ensure that the id field doesn't have the is-valid class applied
            jQuery("#first-name-ship").removeClass("is-valid");
            // addahover tooltip to the id field
            let tooltip = new bootstrap.Tooltip("#first-name-ship", {
                title: "It cannot be blank and cannot be a number."
            });
            // set the validity to false
            validity = false;
        }

        //For Last Name
        let valid_last_name = /(.*[a-z]){3}/i;
        if (jQuery("#last-name-ship").val().match(valid_last_name)) {
            /// remove the is-invalid class,if it exists,from the id field
            jQuery("#last-name-ship").removeClass("is-invalid");

            // add the css class"is-invalid"to give positive feedback to the user
            jQuery("#last-name-ship").addClass("is-valid");
            // remove any tooltip on this element
            if (jQuery("#last-name-ship").tooltip != undefined) {
                jQuery("#last-name-ship").tooltip("dispose");
            }
            validity = true;

        } else {
            //
            // use the bootstrap built in styles to indicateaproblem with the field
            jQuery("#last-name-ship").addClass("is-invalid");
            // ensure that the id field doesn't have the is-valid class applied
            jQuery("#last-name-ship").removeClass("is-valid");
            // addahover tooltip to the id field
            let tooltip = new bootstrap.Tooltip("#last-name-ship", {
                title: "It cannot be blank and cannot be a number."
            });
            // set the validity to false
            validity = false;
        }

        //For Billing Address 01 and Billing Address 02
        let valid_billing_address = /^[#.0-9a-zA-Z\s,-]+$/;
        if (jQuery("#billing-adrress01-ship").val().match(valid_billing_address)) {
            /// remove the is-invalid class,if it exists,from the id field
            jQuery("#billing-adrress01-ship").removeClass("is-invalid");

            // add the css class"is-invalid"to give positive feedback to the user
            jQuery("#billing-adrress01-ship").addClass("is-valid");
            // remove any tooltip on this element
            if (jQuery("#billing-adrress01-ship").tooltip != undefined) {
                jQuery("#billing-adrress01-ship").tooltip("dispose");
            }
            validity = true;

        } else {
            //
            // use the bootstrap built in styles to indicateaproblem with the field
            jQuery("#billing-adrress01-ship").addClass("is-invalid");
            // ensure that the id field doesn't have the is-valid class applied
            jQuery("#billing-adrress01-ship").removeClass("is-valid");
            // addahover tooltip to the#id field
            let tooltip = new bootstrap.Tooltip("#billing-adrress01-ship", {
                title: "Please enter a valid address"
            });
            // set the validity to false
            validity = false;
        }

        if (jQuery("#billing-adrress02-ship").val().match(valid_billing_address) || jQuery("#billing-adrress02-ship").val() == "") {
            /// remove the is-invalid class,if it exists,from the id field
            count++;
            jQuery("#billing-adrress02-ship").removeClass("is-invalid");

            // add the css class"is-invalid"to give positive feedback to the user
            jQuery("#billing-adrress02-ship").addClass("is-valid");
            // remove any tooltip on this element
            if (jQuery("#billing-adrress02-ship").tooltip != undefined) {
                jQuery("#billing-adrress02-ship").tooltip("dispose");
            }
            validity = true;

        } else {
            //
            // use the bootstrap built in styles to indicateaproblem with the field
            jQuery("#billing-adrress02-ship").addClass("is-invalid");
            // ensure that the#id field doesn't have the is-valid class applied
            jQuery("#billing-adrress02-ship").removeClass("is-valid");
            // addahover tooltip to the#id field
            let tooltip = new bootstrap.Tooltip("#billing-adrress02-ship", {
                title: "Please enter a valid address"
            });
            // set the validity to false
            validity = false;
        }

        //For city
        let valid_city = /^[A-Za-z]+$/;
        if (jQuery("#city-ship").val().match(valid_city)) {
            /// remove the is-invalid class,if it exists,from the id field
            jQuery("#city-ship").removeClass("is-invalid");

            // add the css class"is-invalid"to give positive feedback to the user
            jQuery("#city-ship").addClass("is-valid");
            // remove any tooltip on this element
            if (jQuery("#city-ship").tooltip != undefined) {
                jQuery("#city-ship").tooltip("dispose");
            }
            validity = true;

        } else {
            //
            // use the bootstrap built in styles to indicateaproblem with the field
            jQuery("#city-ship").addClass("is-invalid");
            // ensure that the#id field doesn't have the is-valid class applied
            jQuery("#city-ship").removeClass("is-valid");
            // addahover tooltip to the#id field
            let tooltip = new bootstrap.Tooltip("#city", {
                title: "It cannot be blank and cannot be a number."
            });
            // set the validity to false
            validity = false;
        }
        //For Province and State
        if (jQuery("#province-state-cad-usd-ship").val() != "") {
            /// remove the is-invalid class,if it exists,from the id field
            jQuery("#province-state-cad-usd-ship").removeClass("is-invalid");

            // add the css class"is-invalid"to give positive feedback to the user
            jQuery("#province-state-cad-usd-ship").addClass("is-valid");
            // remove any tooltip on this element
            if (jQuery("#province-state-cad-usd-ship").tooltip != undefined) {
                jQuery("#province-state-cad-usd-ship").tooltip("dispose");
            }
            validity = true;

        } else {
            //
            // use the bootstrap built in styles to indicateaproblem with the field
            jQuery("#province-state-cad-usd-ship").addClass("is-invalid");
            // ensure that the#id field doesn't have the is-valid class applied
            jQuery("#province-state-cad-usd-ship").removeClass("is-valid");
            // addahover tooltip to the#id field
            let tooltip = new bootstrap.Tooltip("#province-state-cad-usd-ship", {
                title: "It cannot be blank."
            });
            // set the validity to false
            validity = false;
        }

        //Postal Code and ZIP code
        let valid_postal_code = /^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z][ -]?\d[ABCEGHJ-NPRSTV-Z]\d$/;
        let valid_zip_code = /^[0-9]{5}(?:-[0-9]{4})?$/;
        if (jQuery("#postal-code-ship").val().match(valid_postal_code) || jQuery("#postal-code-ship").val().match(valid_zip_code)) {
            /// remove the is-invalid class,if it exists,from the id field
            jQuery("#postal-code-ship").removeClass("is-invalid");

            // add the css class"is-invalid"to give positive feedback to the user
            jQuery("#postal-code-ship").addClass("is-valid");
            // remove any tooltip on this element
            if (jQuery("#postal-code-ship").tooltip != undefined) {
                jQuery("#postal-code-ship").tooltip("dispose");
            }
            validity = true;

        } else {
            //
            // use the bootstrap built in styles to indicateaproblem with the field
            jQuery("#postal-code-ship").addClass("is-invalid");
            // ensure that the#id field doesn't have the is-valid class applied
            jQuery("#postal-code-ship").removeClass("is-valid");
            // addahover tooltip to the#id field
            let tooltip = new bootstrap.Tooltip("#postal-code-ship", {
                title: "It cannot be blank. (Check that you dont put spaces at the beginning)"
            });
            // set the validity to false
            validity = false;
        }
        if (validity == true) {
            $("#pills-confirmation-tab").click();
        }



    });

    jQuery("#confirm-button").on("click", function (event) {
        let items_of_cart = get_cookie("shopping_cart_items");
        let submission_data = {
            card_number: $("#cart-number").val(),
            expiry_month: $("#expiration-date").val(),
            expiry_year: $("#year").val(),
            security_code: $("#security-code").val(),
            amount: $("#final-total").html(),
            taxes: $("#user-currency-order").html(),
            shipping_amount: $("#item_ship").html(),
            currency: $("#user-currency-order").html(),
            items: items_of_cart,
            billing: {
                first_name: $("#first-name").val(),
                last_name: $("#last-name").val(),
                address_1: $("#billing-adrress01").val(),
                address_2: $("#billing-adrress02").val(),
                city: $("#city").val(),
                province: $("#prv-state").val(),
                country: $("#country-select").val(),
                postal: $("#postal-code").val(),
                phone: $("#phone").val(),
                email: $("#email").val()
            },
            shipping: {
                first_name: $("#first-name-ship").val(),
                last_name: $("#last-name-ship").val(),
                address_1: $("#billing-adrress01-ship").val(),
                address_2: $("#billing-adrress02-ship").val(),
                city: $("#city-ship").val(),
                province: $("#prv-state-ship").val(),
                country: $("#country-select-ship").val(),
                postal: $("#postal-code-ship").val()
            }
        };
        let payment_details = {
            payment: {
                card_number: $("#cart-number").val(),
                expiry_month: $("#expiration-date").val(),
                expiry_year: $("#year").val(),
                security_code: $("#security-code").val(),
            }
        }

        let form_data = new FormData();
        form_data.append('submission', JSON.stringify(submission_data));
        fetch(`https://deepblue.camosun.bc.ca/~c0180354/ics128/final/`,
            {
                method: "POST",
                cache: 'no-cache',
                body: form_data
            }).then(response => {
                return response.json();
            }).then(json => {
                let checkout = json;
                if (checkout.status == "SUCCESS") {
                    swal("Perfect!", "Your order has been received! it will sent in 7 days", "success");
                    //This will set the cookies to null so it will have 0 and render again the products so it cant clear the items.
                    let noItems = `<p id="no-items"> Theres no items in your cart</p>`;
                    set_cookie("shopping_cart_items", null);
                    catalog.render_items_on_cart();
                    $(".offcanvas-body").html(noItems);
                } else if ($("#order-details").html() == "") {
                    // Dispplay if the user clicks againg on confirm saying that there is no items
                    swal("It's seems that you don't have items on your cart!", "...why no add some!");
                }
                else {
                    //If it's not succes it will not sent the data
                    swal("Please check you information and confirm everthing is ok")
                        .then(() => {
                            swal(`Check for spaces at the beginning or invalid data.`);
                        });
                }

            }).catch(error => {
                //If it's not succes it will not sent the data
                swal("Click on either the button or outside the modal.")
                    .then((value) => {
                        swal(`The returned value is: ${value}`);
                    });
            });
    });

});

