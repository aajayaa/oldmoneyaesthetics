document.addEventListener('DOMContentLoaded', function() {

    const mainImage = document.querySelector('.main-image img');
    const thumbnails = document.querySelectorAll('.thumbnail');

    thumbnails.forEach(thumb => {
        thumb.addEventListener('click', function() {
            // Update main image
            mainImage.src = this.querySelector('img').src;
            // Update active state
            thumbnails.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
        });
    });


    // Size Selection
    const sizeButtons = document.querySelectorAll('.size-option');
    let selectedSize = null;

    sizeButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            sizeButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            selectedSize = this.textContent;
        });
    });

    // Color Selection
    const colorButtons = document.querySelectorAll('.color-option');
    let selectedColor = null;

    colorButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            colorButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            selectedColor = this.getAttribute('title');
        });
    });

    // Quantity Buttons
    const quantityInput = document.querySelector('.quantity-input');
    const quantityBtns = document.querySelectorAll('.quantity-btn');

    quantityBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const currentValue = parseInt(quantityInput.value);
            if (this.textContent === '−' && currentValue > 1) {
                quantityInput.value = currentValue - 1;
            } else if (this.textContent === '+') {
                quantityInput.value = currentValue + 1;
            }
        });
    });

    // Add to Cart Button
    function showNotification(message, type = 'error') {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        
        // Set style based on type
        if (type === 'error') {
            notification.style.backgroundColor = '#f8d7da';
            notification.style.color = '#721c24';
            notification.style.borderColor = '#f5c6cb';
        } else if (type === 'success') {
            notification.style.backgroundColor = '#d4edda';
            notification.style.color = '#155724';
            notification.style.borderColor = '#c3e6cb';
        }

        notification.classList.add('show');
        
        // Hide after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    // Update the validation check
    const addToCartBtn = document.querySelector('.atc-button');
    addToCartBtn.addEventListener('click', async function() {
        if (!selectedSize || !selectedColor) {
            showNotification('Please select both size and color');
            return;
        }

        // Get the product ID from the current URL
        const pathSegments = window.location.pathname.split('/');
        const productId = pathSegments[pathSegments.length - 1];

        const productData = {
            productId: productId,
            size: selectedSize,
            color: selectedColor,
            quantity: parseInt(quantityInput.value)
        };

        console.log('Sending data:', productData); // Debug log

        try {
            const response = await fetch('/cart/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(productData)
            });

            const result = await response.json();
            console.log('Response:', result); // Debug log

            if (response.ok) {
                showNotification('Added to cart successfully!', 'success');
                setTimeout(() => {
                    window.location.href = '/cart';
                }, 1000);
            } else {
                showNotification(result.error || 'Failed to add item to cart');
            }
        } catch (error) {
            console.error('Error:', error);
            showNotification('Failed to add item to cart');
        }
    });
});