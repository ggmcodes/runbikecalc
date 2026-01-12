/**
 * Amazon Product Display System
 * Renders product cards with images from Amazon CDN
 *
 * Usage:
 *   1. Include this script in your page
 *   2. Add data-amazon-product="product-slug" to elements
 *   3. Or use renderAmazonProduct(containerId, productSlug)
 */

(function() {
    'use strict';

    const AFFILIATE_TAG = 'runbikecalc-20';

    // Product data - updated via fetch-amazon-images.js script
    // Images are loaded directly from Amazon CDN (not hosted locally)
    let productData = null;

    /**
     * Load product data from JSON file
     */
    async function loadProductData() {
        if (productData) return productData;

        try {
            const response = await fetch('/data/product-images.json');
            if (!response.ok) throw new Error('Product data not found');
            productData = await response.json();
            return productData;
        } catch (error) {
            console.warn('Could not load product images:', error.message);
            return null;
        }
    }

    /**
     * Get product by slug
     */
    async function getProduct(slug) {
        const data = await loadProductData();
        return data?.products?.[slug] || null;
    }

    /**
     * Build Amazon product URL with affiliate tag
     */
    function buildProductUrl(asin) {
        return `https://www.amazon.com/dp/${asin}?tag=${AFFILIATE_TAG}`;
    }

    /**
     * Build Amazon search URL with affiliate tag (fallback)
     */
    function buildSearchUrl(productName) {
        const searchTerms = encodeURIComponent(productName);
        return `https://www.amazon.com/s?k=${searchTerms}&tag=${AFFILIATE_TAG}`;
    }

    /**
     * Create element helper
     */
    function createElement(tag, className, attributes = {}) {
        const el = document.createElement(tag);
        if (className) el.className = className;
        for (const [key, value] of Object.entries(attributes)) {
            el.setAttribute(key, value);
        }
        return el;
    }

    /**
     * Create a product card element using safe DOM methods
     */
    function createProductCard(product, options = {}) {
        const {
            showPrice = true,
            showImage = true,
            imageSize = 'medium', // 'medium' or 'large'
            layout = 'vertical', // 'vertical' or 'horizontal'
            className = ''
        } = options;

        const card = createElement('div', `amazon-product-card amazon-product-${layout} ${className}`.trim());

        const productUrl = product.asin
            ? buildProductUrl(product.asin)
            : buildSearchUrl(product.name);

        // Image
        if (showImage && (product.image || product.imageMedium)) {
            const imageUrl = imageSize === 'large'
                ? (product.image || product.imageMedium)
                : (product.imageMedium || product.image);

            const imageLink = createElement('a', 'amazon-product-image-link', {
                href: productUrl,
                target: '_blank',
                rel: 'noopener sponsored'
            });

            const img = createElement('img', 'amazon-product-image', {
                src: imageUrl,
                alt: product.title || product.name,
                loading: 'lazy',
                width: '160',
                height: '160'
            });

            imageLink.appendChild(img);
            card.appendChild(imageLink);
        }

        // Content container
        const content = createElement('div', 'amazon-product-content');

        // Title
        const titleEl = createElement('h4', 'amazon-product-title');
        const titleLink = createElement('a', '', {
            href: productUrl,
            target: '_blank',
            rel: 'noopener sponsored'
        });
        titleLink.textContent = product.title || product.name;
        titleEl.appendChild(titleLink);
        content.appendChild(titleEl);

        // Price
        if (showPrice && product.price) {
            const priceEl = createElement('p', 'amazon-product-price');
            priceEl.textContent = product.price;
            content.appendChild(priceEl);
        }

        // CTA Button
        const button = createElement('a', 'amazon-product-button', {
            href: productUrl,
            target: '_blank',
            rel: 'noopener sponsored'
        });
        button.textContent = 'Check Price on Amazon';
        content.appendChild(button);

        card.appendChild(content);
        return card;
    }

    /**
     * Render a product into a container
     */
    async function renderAmazonProduct(containerId, productSlug, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.warn(`Container #${containerId} not found`);
            return;
        }

        const product = await getProduct(productSlug);
        if (!product) {
            console.warn(`Product "${productSlug}" not found`);
            return;
        }

        const card = createProductCard(product, options);
        container.appendChild(card);
    }

    /**
     * Render multiple products in a grid
     */
    async function renderProductGrid(containerId, productSlugs, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.warn(`Container #${containerId} not found`);
            return;
        }

        // Add affiliate disclosure
        if (options.showDisclosure !== false) {
            const disclosure = createElement('p', 'amazon-affiliate-disclosure');
            disclosure.textContent = 'As an Amazon Associate, we earn from qualifying purchases.';
            container.appendChild(disclosure);
        }

        // Create grid
        const grid = createElement('div', 'amazon-products-grid');
        container.appendChild(grid);

        // Render each product
        for (const slug of productSlugs) {
            const product = await getProduct(slug);
            if (product) {
                const card = createProductCard(product, options);
                grid.appendChild(card);
            }
        }
    }

    /**
     * Auto-initialize products with data attributes
     */
    async function initDataAttributes() {
        const elements = document.querySelectorAll('[data-amazon-product]');
        for (const el of elements) {
            const slug = el.dataset.amazonProduct;
            const product = await getProduct(slug);
            if (product) {
                const options = {
                    showPrice: el.dataset.showPrice !== 'false',
                    showImage: el.dataset.showImage !== 'false',
                    imageSize: el.dataset.imageSize || 'medium',
                    layout: el.dataset.layout || 'vertical'
                };
                const card = createProductCard(product, options);
                el.appendChild(card);
            }
        }
    }

    /**
     * Create inline product link with image
     * For use within article content
     */
    async function createInlineProductLink(productSlug) {
        const product = await getProduct(productSlug);
        if (!product) return null;

        const productUrl = product.asin
            ? buildProductUrl(product.asin)
            : buildSearchUrl(product.name);

        const span = createElement('span', 'amazon-inline-product');
        const link = createElement('a', 'amazon-inline-link', {
            href: productUrl,
            target: '_blank',
            rel: 'noopener sponsored'
        });

        if (product.imageMedium || product.image) {
            const img = createElement('img', 'amazon-inline-image', {
                src: product.imageMedium || product.image,
                alt: product.name,
                width: '40',
                height: '40'
            });
            link.appendChild(img);
        }

        const nameSpan = document.createElement('span');
        nameSpan.textContent = product.name;
        link.appendChild(nameSpan);

        span.appendChild(link);
        return span;
    }

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDataAttributes);
    } else {
        initDataAttributes();
    }

    // Export to global scope
    window.AmazonProducts = {
        loadProductData,
        getProduct,
        renderAmazonProduct,
        renderProductGrid,
        createProductCard,
        createInlineProductLink,
        buildProductUrl,
        buildSearchUrl,
        AFFILIATE_TAG
    };

})();
