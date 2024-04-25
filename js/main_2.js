class Product {
    constructor(item_id, name, price, imageUrl, primaryStatus, secondaryStatus = []) {
        this.item_id = item_id;
        this.name = name;
        this.price = price;
        this.imageUrl = imageUrl;
        this.primaryStatus = primaryStatus;
        this.secondaryStatus = secondaryStatus;
    }

    generateBadges() {
        return this.secondaryStatus.map(label => `<span class="bg-primary rounded text-white badge">${label}</span>`).join('');
    }

    createProductItem() {
        const productItem = document.createElement("div");
        productItem.classList.add(
            "col-xl-3",
            "col-lg-4",
            "col-md-6",
            "wow",
            "fadeInUp",
        );
        productItem.setAttribute("data-wow-delay", "0.1s");
        productItem.innerHTML = `
            <div class="product-item">
                <div class="position-relative bg-light overflow-hidden">
                    <img class="img-fluid w-100" src="${this.imageUrl}" alt="${this.name}">
                    <div class="bg-secondary rounded text-white position-absolute start-0 top-0 m-4 py-1 px-3">${this.primaryStatus}</div>
                    <div class="position-absolute bottom-0 end-0 m-2 py-1 px-3">
                        ${this.generateBadges()}
                    </div>                
                </div>
                <div class="text-center p-4">
                    <a class="d-block h5 mb-2" href="${this.url}">${this.name}</a>
                    <span class="text-primary me-1">$${this.price}</span>
                    <span class="text-body text-decoration-line-through">${this.oldPrice !== 0 ? `$${this.oldPrice}` : ""}
    </span>
                </div>
                <div class="d-flex border-top">
                    <small class="w-50 text-center border-end py-2">
                        <a class="text-body view-detail" href="" data-product-id="${this.item_id}"><i class="fa fa-eye text-primary me-2"></i>View detail</a>
                    </small>
                    <small class="w-50 text-center py-2">
                        <a class="text-body add-to-cart" href="" data-product-id="${this.item_id}"><i class="fa fa-shopping-bag text-primary me-2"></i>Add to cart</a>
                    </small>
                </div>
            </div>
        `;
        return productItem;
    }
}

class Cart {
    constructor() {
        this.items = [];
    }

    addItem(product) {
        this.items.push(product);
    }

    removeItem(index) {
        this.items.splice(index, 1);
    }

    getTotalPrice() {
        return this.items.reduce((total, item) => total + item.price, 0);
    }
}

class Checkout {
    constructor(cart) {
        this.cart = cart;
    }

    updateCartCount() {
        const checkoutCount = this.cart.items.length;
        $("#checkout_No").text(checkoutCount);
        sessionStorage.setItem("JIKcheckoutCount", checkoutCount);
    }

    saveCartItems() {
        sessionStorage.setItem("JIKcartItems", JSON.stringify(this.cart.items));
    }

    loadCartItems() {
        const savedCartItems = sessionStorage.getItem("JIKcartItems");
        if (savedCartItems) {
            this.cart.items = JSON.parse(savedCartItems);
        }
    }

    initializeSessionStorage() {
        if (!sessionStorage.getItem("JIKcheckoutCount")) {
            sessionStorage.setItem("JIKcheckoutCount", "0");
        }

        if (!sessionStorage.getItem("JIKcartItems")) {
            sessionStorage.setItem("JIKcartItems", "[]");
        }
    }

    updateCheckoutModal() {
        $(document).on('click', '#checkoutButton', (event) => {
            const modalBody = $('#checkoutModal .modal-body');
            modalBody.empty(); // Clear existing content
    
            if (this.cart.items.length === 0) {
                modalBody.append('<p>No items in cart.</p>');
            } else {
                const totalPrice = this.cart.getTotalPrice();
                modalBody.append(`<p>Total Price: $${totalPrice.toFixed(2)}</p>`);
    
                // Create a form for checkout items
                const form = $('<form id="checkoutForm">');
                this.cart.items.forEach((item, index) => {
                    const itemDetails = {
                        item_id: item.item_id,
                        name: item.name,
                        price: item.price.toFixed(2),
                    };
    
                    const itemContainer = $('<div class="d-flex align-items-center mb-2">');
                    const itemListDetails = $(`<div>${item.name} - $${item.price.toFixed(2)}</div>`);
                    const hiddenInputItems = $(`<input type="hidden" name="checkoutItem_${item.item_id}">`);
                    hiddenInputItems.val(JSON.stringify(itemDetails));
                    const removeButton = $('<button type="button" class="btn btn-sm btn-outline-danger ms-2 remove-item-btn">&times;</button>');
    
                    // Event listener for remove button
                    removeButton.on('click', () => {
                        this.cart.removeItem(index);
                        this.updateCartCount();
                        this.saveCartItems();
                        this.updateCheckoutModal();
                    });
    
                    itemContainer.append(itemListDetails);
                    itemContainer.append(hiddenInputItems);
                    itemContainer.append(removeButton);
    
                    form.append(itemContainer);
                });
    
                // Add submit button
                const submitButton = $('<button type="submit" class="btn btn-primary mt-3">CheckOut</button>');
                form.append(submitButton);
    
                modalBody.append(form);
            }
    
            $('#checkoutModal').modal('show');
        });
    }

    // Handle Checkout form submission
    handleCheckoutForm() {
        $(document).on('submit', '#checkoutForm', (event) => {
            event.preventDefault();
            // You can add your form submission logic here
            // eg, you can get form data and send it to a server
            const formData = $(event.target).serializeArray();
            console.log('Form data:', formData);

            // Clear cartItems from sessionStorage and cartItems array
            sessionStorage.removeItem('JIKcartItems');
            this.cart.items = [];

            // Update cart count & checkout modal
            this.updateCartCount();
            this.updateCheckoutModal();

            // Optionally, you can close the modal after form submission
            $('#checkoutModal').modal('hide');
        });
    }
}


document.addEventListener("DOMContentLoaded", function () {
    const cart = new Cart();
    const checkout = new Checkout(cart);

    checkout.initializeSessionStorage();
    checkout.loadCartItems();

    fetchProducts();

    function fetchProducts() {
        axios
            .get("./api_test/products_details.json")
            .then((response) => {
                const products = response.data;
                console.info("Products Info Received from Server");
                const productsSection = document.getElementById("products-section");
                const fragment = document.createDocumentFragment(); // Create a document fragment
                products.forEach((product) => {
                    const newProduct = new Product(product.item_id, product.name, product.price, product.imageUrl, product.primaryStatus, product.secondaryStatus);
                    const productItem = newProduct.createProductItem();
                    fragment.appendChild(productItem); // Append product items to the fragment
                });
                productsSection.appendChild(fragment); // Append the fragment to the DOM once
                console.log("JIKONI Product page DOM updated");

                // Attach event listener for click events using event delegation
                productsSection.addEventListener("click", function (event) {
                    if (event.target.classList.contains("view-detail")) {
                        event.preventDefault();
                        const productId = event.target.dataset.productId;
                        console.log(
                            `View detail clicked for product ID: ${productId}`,
                        );
                        // Handle view detail click event
                    }

                    if (event.target.classList.contains("add-to-cart")) {
                        event.preventDefault();
                        const productId = event.target.dataset.productId;
                        const product = getProductById(productId);
                        if (product) {
                            cart.addItem(product);
                            checkout.updateCartCount();
                            checkout.saveCartItems();
                            console.log(`Added to cart:`, product);
                        }
                    }
                });

                // Load cart items from sessionStorage
                checkout.updateCartCount();
            })
            .catch((error) =>
                console.error("Error fetching products from Server:", error),
            );
    }

    // Handle Checkout form submission
    checkout.handleCheckoutForm();

    // Function to get product details by ID (you can replace this with your own method)
    function getProductById(productId) {
        // This is Mockup DataSource
        const products = [
            {
                item_id: "1a5fcb6d-8555-4b67-b64e-8a3e1e2f033e",
                name: "Fresh Tomatoes",
                price: 19.0,
            },
            {
                item_id: "2e7b9c58-3b3a-45e8-80fb-82e0e92f2a7f",
                name: "Fresh Pineapple",
                price: 15.0,
            },
            {
                item_id: "dd54d5dc-8f39-46a0-949f-91462b4b3d29",
                name: "Organic Pilipili",
                price: 12.5,
            },
            {
                item_id: "2",
                name: "Product 2",
                price: 15.99,
            },
            {
                item_id: "2",
                name: "Product 2",
                price: 15.99,
            },
            // Add more products as needed
        ];
        return products.find((product) => product.item_id === productId);
    }
});
