document.addEventListener("DOMContentLoaded", function () {
    fetchProducts();
    initializeSessionStorage();
});

function fetchProducts() {
    axios
        .get("./api_test/products_details.json")
        .then((response) => {
            const products = response.data;
            console.info("Products Info Received from Server");
            const productsSection = document.getElementById("products-section");
            const fragment = document.createDocumentFragment(); // Create a document fragment
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
                        cartItems.push(product);
                        updateCartCount();
                        saveCartItems();
                        console.log(`Added to cart:`, product);
                    }
                }
            });

            // Load cart items from sessionStorage
            loadCartItems();
            updateCartCount();
        })
        .catch((error) =>
            console.error("Error fetching products from Server:", error),
        );
}

function createProductItem(product) {
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
                    <img class="img-fluid w-100" src="${product.imageUrl}" alt="${product.name}">
                    <div class="bg-secondary rounded text-white position-absolute start-0 top-0 m-4 py-1 px-3">${product.primaryStatus}</div>
                    <div class="position-absolute bottom-0 end-0 m-2 py-1 px-3">
                        ${generateBadges(product.secondaryStatus || [])}
                    </div>                
                </div>
                <div class="text-center p-4">
                    <a class="d-block h5 mb-2" href="${product.url}">${product.name}</a>
                    <span class="text-primary me-1">$${product.price}</span>
                    <span class="text-body text-decoration-line-through">${product.oldPrice !== 0 ? `$${product.oldPrice}` : ""}
    </span>
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
            (
                label,
            ) => `<span class="bg-primary rounded text-white badge">${label}</span>
`,
        )
        .join(" ");
}

// Array to store products in cart
let cartItems = [];

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

// Function to update the cart count
function updateCartCount() {
    const checkoutCount = cartItems.length;
    $("#checkout_No").text(checkoutCount);
    sessionStorage.setItem("JIKcheckoutCount", checkoutCount);
}

// Function to save cart items to sessionStorage
function saveCartItems() {
    sessionStorage.setItem("JIKcartItems", JSON.stringify(cartItems));
}

// Function to load cart items from sessionStorage
function loadCartItems() {
    const savedCartItems = sessionStorage.getItem("JIKcartItems");
    if (savedCartItems) {
        cartItems = JSON.parse(savedCartItems);
    }
}

// Initialize sessionStorage keys if not exist
function initializeSessionStorage() {
    if (!sessionStorage.getItem("JIKcheckoutCount")) {
        sessionStorage.setItem("JIKcheckoutCount", "0");
    }

    if (!sessionStorage.getItem("JIKcartItems")) {
        sessionStorage.setItem("JIKcartItems", "[]");
    }
}

// Function to update the checkout modal with cart items in a form format
function updateCheckoutModal() {
    const modalBody = $('#checkoutModal .modal-body');
    modalBody.empty(); // Clear existing content

    if (cartItems.length === 0) {
        modalBody.append('<p>No items in cart.</p>');
    } else {
        const totalPrice = cartItems.reduce((total, item) => total + item.price, 0);
        modalBody.append(`<p>Total Price: $${totalPrice.toFixed(2)}</p>`);

        // Create a form for checkout items
        const form = $('<form id="checkoutForm">');
        cartItems.forEach((item, index) => {
            const itemDetails = {
                item_id: item.item_id,
                name: item.name,
                price: item.price.toFixed(2),
            };
            
            const itemListDetails = $(`<div>${item.name} - $${item.price.toFixed(2)}</div>`);
            const hiddenInputItems = $(`<input type="hidden" name="checkoutItem_${item.item_id}">`);
            hiddenInputItems.val(JSON.stringify(itemDetails));
            const removeButton = $('<button type="button" class="btn btn-sm btn-outline-danger ms-2 remove-item-btn">&times;</button>');

            // Event listener for remove button
            removeButton.on('click', function() {
                cartItems.splice(index, 1);
                updateCartCount();
                saveCartItems();
                updateCheckoutModal();
            });

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
};

// Handle Checkout form submission
$(document).on('submit', '#checkoutForm', function(event) {
    event.preventDefault();
    // You can add your form submission logic here
    // eg, you can get form data and send it to a server
    const formData = $(this).serializeArray();
    console.log('Form data:', formData);

    // Clear cartItems from sessionStorage and cartItems array
    sessionStorage.removeItem('cartItems');
    cartItems = [];

    // Update cart count & checkout modal
    updateCartCount();
    updateCheckoutModal();

    // Optionally, you can close the modal after form submission
    $('#checkoutModal').modal('hide');
});

// Open Checkout Modal when checkout button is clicked
$("#checkoutButton").click(function () {
    updateCheckoutModal();
});

