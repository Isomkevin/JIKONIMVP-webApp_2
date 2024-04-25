document.addEventListener("DOMContentLoaded", function () {
    ShoppingCart.initialize();
    fetchProducts();
});


// Authentication object
const Authentication = {
    isAuthenticated: false,
    user: null,

    login(email, password) {
        // This is a mockup login function
        return new Promise((resolve, reject) => {
            // Simulate a delay for demonstration purposes
            setTimeout(() => {
                // Mock user data
                const users = [
                    { id: 1, email: 'user1@example.com', password: 'password1', name: 'User One' },
                    { id: 2, email: 'user2@example.com', password: 'password2', name: 'User Two' },
                    // Add more users as needed
                ];

                // Find user by email and password
                const user = users.find(u => u.email === email && u.password === password);

                if (user) {
                    // Set user and authentication status
                    this.isAuthenticated = true;
                    this.user = user;
                    resolve(user);
                } else {
                    reject(new Error('Invalid email or password'));
                }
            }, 1000); // Simulate a 1 second delay
        });
    },

    logout() {
        this.isAuthenticated = false;
        this.user = null;
    },

    getUser() {
        return this.user;
    },

    isAuthenticatedUser() {
        return this.isAuthenticated;
    },
};

const ShoppingCart = {
    cartItems: [],

    initialize: function () {
        if (!sessionStorage.getItem("JIKcheckoutCount")) {
            sessionStorage.setItem("JIKcheckoutCount", "0");
        }

        if (!sessionStorage.getItem("JIKcartItems")) {
            sessionStorage.setItem("JIKcartItems", "[]");
        }
    },

    addToCart: function (product) {
        this.cartItems.push(product);
        this.updateCartCount();
        this.saveCartItems();
        console.log("Added to cart:", product);
    },

    updateCartCount: function () {
        const checkoutCount = this.cartItems.length;
        $("#checkout_No").text(checkoutCount);
        sessionStorage.setItem("JIKcheckoutCount", checkoutCount);
    },

    saveCartItems: function () {
        sessionStorage.setItem("JIKcartItems", JSON.stringify(this.cartItems));
    },

    loadCartItems: function () {
        const savedCartItems = sessionStorage.getItem("JIKcartItems");
        if (savedCartItems) {
            this.cartItems = JSON.parse(savedCartItems);
        }
    }
};

function fetchProducts() {
    axios
        .get("./api_test/products_details.json")
        .then((response) => {
            const products = response.data;
            console.info("Products Info Received from Server");
            const productsSection = document.getElementById("products-section");
            const fragment = document.createDocumentFragment();
            products.forEach((product) => {
                const productItem = createProductItem(product);
                fragment.appendChild(productItem); // Append product items to the fragment
            });
            productsSection.appendChild(fragment); // Append the fragment to the DOM once
            console.log("JIKONI Product page DOM updated");

            // Attach event listener for click events using event delegation
            productsSection.addEventListener("click", function (event) {
                if (event.target.classList.contains("view-detail")) {
                    event.preventDefault();
                    const productId = event.target.dataset.productId;
                    console.log(`View detail clicked for product ID: ${productId}`);
                    // Handle view detail click event
                }

                if (event.target.classList.contains("add-to-cart")) {
                    event.preventDefault();
                    const productId = event.target.dataset.productId;
                    const product = getProductById(productId);
                    if (product) {
                        ShoppingCart.addToCart(product);
                    }
                }
            });

            // Load cart items from sessionStorage
            ShoppingCart.loadCartItems();
            ShoppingCart.updateCartCount();
        })
        .catch((error) =>
            console.error("Error fetching products from Server:", error)
        );
}

function createProductItem(product) {
    const productItem = document.createElement("div");
    productItem.classList.add(
        "col-xl-3",
        "col-lg-4",
        "col-md-6",
        "wow",
        "fadeInUp"
    );
    productItem.setAttribute("data-wow-delay", "0.1s");
    productItem.innerHTML = `
        <div class="product-item">
            <div class="position-relative bg-light overflow-hidden">
                <img class="img-fluid w-100" src="${product.imageUrl}" alt="${product.name}">
                <div class="bg-secondary rounded text-white position-absolute start-0 top-0 m-4 py-1 px-3">${product.primaryStatus}</div>
                <div class="position-absolute bottom-0 end-0 m-2 py-1 px-3">
                    ${generateBadges(product.secondaryStatus || [])}
                </div>
            </div>
            <div class="text-center p-4">
                <a class="d-block h5 mb-2" href="${product.url}">${product.name}</a>
                <span class="text-primary me-1">$${product.price}</span>
                <span class="text-body text-decoration-line-through">${product.oldPrice !== 0 ? `$${product.oldPrice}` : ""}</span>
            </div>
            <div class="d-flex border-top">
                <small class="w-50 text-center border-end py-2">
                    <a class="text-body view-detail" href="" data-product-id="${product.item_id}"><i class="fa fa-eye text-primary me-2"></i>View detail</a>
                </small>
                <small class="w-50 text-center py-2">
                    <a class="text-body add-to-cart" href="" data-product-id="${product.item_id}"><i class="fa fa-shopping-bag text-primary me-2"></i>Add to cart</a>
                </small>
            </div>
        </div>
    `;

    return productItem;
}

function generateBadges(labels) {
    return labels
        .map(
            (label) => `<span class="bg-primary rounded text-white badge">${label}</span>`
        )
        .join(" ");
}

// Mockup Function
function getProductById(productId) {
    // This is Mockup DataSource
    const products = [
        { item_id: "1a5fcb6d-8555-4b67-b64e-8a3e1e2f033e", name: "Fresh Tomatoes", price: 19.0 },
        { item_id: "2e7b9c58-3b3a-45e8-80fb-82e0e92f2a7f", name: "Fresh Pineapple", price: 15.0 },
        { item_id: "dd54d5dc-8f39-46a0-949f-91462b4b3d29", name: "Organic Pilipili", price: 12.5 },
        { item_id: "2", name: "Product 2", price: 15.99 },
        { item_id: "2", name: "Product 2", price: 15.99 },
        // Add more products as needed
    ];
    return products.find((product) => product.item_id === productId);
}

// Event listener for remove button in checkout modal
$(document).on("click", ".remove-item-btn", function () {
    const index = $(this).closest(".d-flex").index();
    ShoppingCart.cartItems.splice(index, 1);
    ShoppingCart.updateCartCount();
    ShoppingCart.saveCartItems();
    updateCheckoutModal();
});

// Function to update the checkout modal with cart items in a form format
function updateCheckoutModal() {
    const modalBody = $('#checkoutModal .modal-body');
    modalBody.empty(); // Clear existing content

    if (!Authentication.isAuthenticatedUser()) {
        modalBody.append('<p>Please log in to proceed with checkout.</p>');
        // Optionally, you can add a login button to trigger the login modal
        $('#checkoutModal').modal('show')
        return;
    }
    
    if (ShoppingCart.cartItems.length === 0) {
        modalBody.append('<p>No items in cart.</p>');
    } else {
        const totalPrice = ShoppingCart.cartItems.reduce((total, item) => total + item.price, 0);
        modalBody.append(`<p>Total Price: $${totalPrice.toFixed(2)}</p>`);

        // Create a form for checkout items
        const form = $('<form id="checkoutForm">');
        ShoppingCart.cartItems.forEach((item) => {
            const itemDetails = {
                item_id: item.item_id,
                name: item.name,
                price: item.price.toFixed(2),
            };

            const itemListDetails = $(`<div>${item.name} - $${item.price.toFixed(2)}</div>`);
            const hiddenInputItems = $(`<input type="hidden" name="checkoutItem_${item.item_id}">`);
            hiddenInputItems.val(JSON.stringify(itemDetails));
            const removeButton = $('<button type="button" class="btn btn-sm btn-outline-danger ms-2 remove-item-btn">&times;</button>');

            const itemContainer = $('<div class="d-flex align-items-center mb-2">');
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
}

// Handle Checkout form submission
$(document).on('submit', '#checkoutForm', function(event) {
    event.preventDefault();
    const formData = $(this).serializeArray();
    console.log('Form data:', formData);

    // Clear cartItems from sessionStorage and cartItems array
    sessionStorage.removeItem('JIKcartItems');
    ShoppingCart.cartItems = [];

    ShoppingCart.updateCartCount();
    updateCheckoutModal();

    $('#checkoutModal').modal('hide');
});

// Open Checkout Modal when checkout button is clicked
$("#checkoutButton").click(function () {
    updateCheckoutModal();
});

// Event listener for login button
$('#loginButton').click(function() {
    $('#loginModal').modal('show');
});



// Event listener for login form submission
$(document).on('submit', '#loginForm', function(event) {
    event.preventDefault();
    const email = $('#loginEmail').val();
    const password = $('#loginPassword').val();

    Authentication.login(email, password)
        .then(user => {
            console.log('Login successful:', user);
            $('#loginModal').modal('hide');
            // Update UI components for authenticated user
            ShoppingCart.updateCartCount();
            showSuccessToast('Login successful!');
        })
        .catch(error => {
            console.error('Login error:', error.message);
            showErrorToast('Invalid email or password. Please try again.');
        });
});

// Function to show success toast
function showSuccessToast(message) {
    $('.toast-body').removeClass('bg-danger').addClass('bg-success').text(message);
    $('.toast').toast({ delay: 10000 }).toast('show');
}

// Function to show error toast
function showErrorToast(message) {
    $('.toast').removeClass('bg-success').addClass('bg-danger').text(message);
    $('.toast').toast({ delay: 10000 }).toast('show');
}

// Event listener for logout button
$('#logoutButton').click(function() {
    Authentication.logout();
    ShoppingCart.updateCartCount(); // Update cart count after logout
    // Optionally, you can also update other UI components related to authentication
});
