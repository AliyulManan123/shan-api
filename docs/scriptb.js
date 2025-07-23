/**
 * script.js - Modernized for the new API Page Design
 *
 * Changes:
 * - Removed old loader functions (showLoader, hideLoader) as they are now handled by a simpler inline script in the HTML.
 * - Updated element creation to use new CSS classes for a modern look & feel.
 * - Reworked the API content rendering and filtering logic to be more efficient and compatible with the new CSS Grid layout.
 * - Integrated the new openModal() function for smoother modal pop-ups.
 * - Corrected element ID selectors to match the new HTML structure (e.g., for modal description).
 * - Simplified the search functionality to toggle visibility instead of rebuilding the DOM.
 * - Added dynamic population for navigation bar elements.
 */

document.addEventListener("DOMContentLoaded", async function() {
    try {
        // Fetch initial data for settings and endpoints
        const [set, endpoints] = await Promise.all([
            fetch("/set").then(res => res.json()),
            fetch("/endpoints").then(res => res.json())
        ]);

        // Populate the page with the fetched settings
        setupPageInfo(set);
        
        // Setup the main content area with API endpoints
        setupApiContent(endpoints.endpoints); // Pass the actual array
        
        // Setup event handlers for API buttons
        setupApiButtonHandlers(endpoints.endpoints);
        
        // Initialize the search functionality
        setupSearchFunctionality();

    } catch (error) {
        console.error("Error loading initial configuration:", error);
        // Optionally, display an error message to the user on the page
        const apiContent = document.getElementById("api-content");
        if(apiContent) {
            apiContent.innerHTML = `<p class="text-center text-red-500">Failed to load API data. Please try again later.</p>`;
        }
    }
});

/**
 * Populates static content across the page (nav, header, footer).
 * @param {object} set - The settings object from /set.
 */
function setupPageInfo(set) {
    const setContent = (id, property, value) => {
        const element = document.getElementById(id);
        if (element) element[property] = value;
    };

    // --- Populate Head & Meta Tags ---
    setContent("api-icon", "href", set.icon);
    setContent("api-title", "textContent", set.name.main);
    setContent("api-description", "content", set.description);

    // --- Populate Navigation Bar ---
    setContent("nav-icon", "src", set.icon);
    setContent("nav-title", "textContent", set.name.main);
    
    // --- Populate Banner/Header ---
    setContent("api-name", "textContent", set.name.main);
    setContent("api-author", "textContent", `by ${set.author}`);
    setContent("api-desc", "textContent", set.description);
    setContent("api-copyright", "textContent", `© ${new Date().getFullYear()} ${set.name.copyright}. All rights reserved.`);
    setContent("api-info", "href", set.info_url);

    // --- Populate Custom Links in Banner ---
    const apiLinksContainer = document.getElementById("api-links");
    if (apiLinksContainer && set.links?.length) {
        apiLinksContainer.innerHTML = ""; // Clear existing
        set.links.forEach(link => {
            const linkElement = document.createElement("a");
            linkElement.href = link.url;
            linkElement.target = "_blank";
            linkElement.className = "flex items-center gap-2 text-sm hover:text-[--primary-color] transition-colors";
            linkElement.innerHTML = `
                <i class="fa-solid fa-circle fa-2xs"></i>
                <span>${link.name}</span>
            `;
            apiLinksContainer.appendChild(linkElement);
        });
    }
}


/**
 * Sets up the category navigation and renders the initial API endpoints.
 * @param {Array} endpoints - The array of endpoint categories.
 */
function setupApiContent(endpoints) {
    const mainContent = document.querySelector('main');
    const apiContent = document.getElementById("api-content");
    apiContent.innerHTML = ""; // Clear any placeholders

    // --- Create Category Navigation ---
    const categoryNavContainer = document.createElement("div");
    categoryNavContainer.className = "flex justify-center mb-8";
    
    const categoryNav = document.createElement("div");
    categoryNav.className = "category-nav flex items-center gap-2 p-1 rounded-full border overflow-x-auto";
    categoryNav.style.borderColor = 'var(--border-color)';
    categoryNav.style.backgroundColor = 'var(--bg-color)';


    const allCategory = document.createElement("button");
    allCategory.className = "category-tag active";
    allCategory.textContent = "ALL";
    allCategory.dataset.category = "all";
    categoryNav.appendChild(allCategory);

    const categories = [...new Set(endpoints.map(cat => cat.name))];
    categories.forEach(category => {
        const categoryTag = document.createElement("button");
        categoryTag.className = "category-tag";
        categoryTag.textContent = category.toUpperCase();
        categoryTag.dataset.category = category.toLowerCase();
        categoryNav.appendChild(categoryTag);
    });
    
    categoryNavContainer.appendChild(categoryNav);
    // Insert category nav before the API content grid
    mainContent.insertBefore(categoryNavContainer, apiContent);

    // --- Render All Endpoints ---
    renderEndpoints(endpoints);

    // --- Category Filter Logic ---
    categoryNav.addEventListener("click", function(e) {
        if (e.target.classList.contains("category-tag")) {
            document.querySelectorAll(".category-tag").forEach(tag => tag.classList.remove("active"));
            e.target.classList.add("active");
            
            const selectedCategory = e.target.dataset.category;
            
            document.querySelectorAll('.api-item').forEach(item => {
                const itemCategory = item.dataset.category;
                if (selectedCategory === 'all' || itemCategory === selectedCategory) {
                    item.classList.remove('hidden');
                } else {
                    item.classList.add('hidden');
                }
            });
        }
    });
}

/**
 * Renders all API endpoints into the main grid.
 * @param {Array} endpoints - The array of endpoint categories.
 */
function renderEndpoints(endpoints) {
    const apiContent = document.getElementById("api-content");
    apiContent.innerHTML = ""; // Clear container

    endpoints.forEach(category => {
        const categoryNameLower = category.name.toLowerCase();
        // Sort items alphabetically by name
        const sortedItems = Object.entries(category.items)
            .sort(([, a], [, b]) => (a.name || "").localeCompare(b.name || ""))
            .map(([name, data]) => ({ name, ...data }));

        sortedItems.forEach(item => {
            const itemElement = createApiItemElement(item, categoryNameLower);
            apiContent.appendChild(itemElement);
        });
    });
}

/**
 * Creates a single API item card element.
 * @param {object} item - The API endpoint data object.
 * @param {string} categoryName - The category name for the data attribute.
 * @returns {HTMLElement} - The generated API item card.
 */
function createApiItemElement(item, categoryName) {
    const itemDiv = document.createElement("div");
    itemDiv.className = "api-item flex flex-col p-5 rounded-xl border transition-all duration-300 ease-in-out";
    itemDiv.style.borderLeftWidth = '4px';

    // Set data attributes for filtering and searching
    itemDiv.dataset.category = categoryName;
    itemDiv.dataset.name = item.name || "Unnamed";
    itemDiv.dataset.desc = item.desc || "No description";
    itemDiv.dataset.path = item.path || "";
    itemDiv.dataset.method = item.method || "GET";

    itemDiv.innerHTML = `
        <div class="flex-grow">
            <div class="flex justify-between items-start gap-2">
                <h5 class="text-lg font-bold mb-1">${item.name || "Unnamed"}</h5>
                <span class="endpoint-method text-xs font-bold px-2 py-1 rounded" style="background-color: var(--primary-color); color: white;">${item.method || "GET"}</span>
            </div>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">${item.desc || "No description available."}</p>
        </div>
        <div class="mt-auto">
            <button class="get-api-btn modern-btn w-full text-sm font-semibold py-2 rounded-lg">
                Try API
            </button>
        </div>
    `;
    return itemDiv;
}

/**
 * Sets up the global click handler for the "Try API" buttons.
 */
function setupApiButtonHandlers() {
    document.getElementById('api-content').addEventListener("click", event => {
        const button = event.target.closest(".get-api-btn");
        if (button) {
            const apiItem = button.closest('.api-item');
            const { name, path, desc, method } = apiItem.dataset;
            openApiModal(name, path, desc, method);
        }
    });
}

/**
 * Initializes the search input functionality.
 */
function setupSearchFunctionality() {
    const searchInput = document.getElementById("api-search");
    if (!searchInput) return;

    searchInput.addEventListener("input", function(e) {
        const searchTerm = e.target.value.toLowerCase().trim();
        const activeCategoryTag = document.querySelector('.category-tag.active');
        const currentCategory = activeCategoryTag ? activeCategoryTag.dataset.category : 'all';

        document.querySelectorAll('.api-item').forEach(item => {
            const name = item.dataset.name.toLowerCase();
            const desc = item.dataset.desc.toLowerCase();
            const category = item.dataset.category;

            const categoryMatch = currentCategory === 'all' || category === currentCategory;
            const searchMatch = name.includes(searchTerm) || desc.includes(searchTerm);

            if (categoryMatch && searchMatch) {
                item.classList.remove('hidden');
            } else {
                item.classList.add('hidden');
            }
        });
    });
}

/**
 * Opens and populates the API request modal.
 * @param {string} name - The name of the API.
 * @param {string} endpoint - The API path.
 * @param {string} description - The API description.
 * @param {string} method - The HTTP method (e.g., "GET").
 */
function openApiModal(name, endpoint, description, method) {
    // Get all modal elements
    const modalTitle = document.getElementById("modal-title");
    const apiMethod = document.getElementById("api-method");
    const modalApiDescription = document.getElementById("modal-api-description");
    const paramsContainer = document.getElementById("params-container");
    const responseContainer = document.getElementById("response-container");
    const submitApiBtn = document.getElementById("submit-api");

    // Reset modal state
    responseContainer.classList.add("hidden");
    paramsContainer.innerHTML = "";
    paramsContainer.classList.remove('hidden');
    submitApiBtn.classList.remove('hidden');

    // Populate modal with API info
    modalTitle.textContent = name;
    modalApiDescription.textContent = description;
    apiMethod.textContent = method || "GET";
    // Style the method tag based on method
    apiMethod.className = 'px-3 py-1 text-sm font-bold rounded-md mr-2'; // Reset classes
    switch ((method || 'GET').toUpperCase()) {
        case 'GET': apiMethod.classList.add('bg-blue-100', 'text-blue-800', 'dark:bg-blue-900', 'dark:text-blue-200'); break;
        case 'POST': apiMethod.classList.add('bg-green-100', 'text-green-800', 'dark:bg-green-900', 'dark:text-green-200'); break;
        case 'DELETE': apiMethod.classList.add('bg-red-100', 'text-red-800', 'dark:bg-red-900', 'dark:text-red-200'); break;
        default: apiMethod.classList.add('bg-gray-100', 'text-gray-800', 'dark:bg-gray-700', 'dark:text-gray-200'); break;
    }


    // --- Parameter Fields Generation ---
    // Always add API Key field first
    paramsContainer.innerHTML += `
        <div>
            <label for="param-apikey" class="block text-sm font-medium mb-2">API Key</label>
            <input type="text" id="param-apikey" class="modern-input w-full px-4 py-2 text-sm rounded-lg" value="yoedzx" placeholder="Enter your API key">
            <div id="error-apikey" class="text-red-500 text-xs mt-1 hidden">API key is required.</div>
        </div>
    `;

    // Extract params from the path, e.g., /api/v1/user/{id}?query={name}
    const pathParams = endpoint.match(/{([^}]+)}/g) || [];
    const queryParams = (endpoint.split('?')[1] || '').split('&').filter(p => p);

    const allParams = [
        ...pathParams.map(p => p.slice(1, -1)), // Remove {}
        ...queryParams.map(p => p.split('=')[0])
    ];

    const uniqueParams = [...new Set(allParams)].filter(p => p && p !== 'apikey');

    uniqueParams.forEach(key => {
        const isOptional = key.startsWith("_");
        const cleanKey = isOptional ? key.substring(1) : key;
        const paramField = `
            <div>
                <label for="param-${cleanKey}" class="block text-sm font-medium mb-2">${cleanKey.charAt(0).toUpperCase() + cleanKey.slice(1)}</label>
                <input type="text" id="param-${cleanKey}" class="modern-input w-full px-4 py-2 text-sm rounded-lg" placeholder="Enter ${cleanKey}${isOptional ? " (optional)" : ""}">
                <div id="error-${cleanKey}" class="text-red-500 text-xs mt-1 hidden">This field is required.</div>
            </div>
        `;
        paramsContainer.innerHTML += paramField;
    });

    // --- Handle API Submission ---
    submitApiBtn.onclick = async () => {
        let isValid = true;
        let constructedUrl = endpoint.split('?')[0]; // Base path without query
        const query = new URLSearchParams();

        // Validate and collect parameters
        const inputs = paramsContainer.querySelectorAll('input');
        inputs.forEach(input => {
            const key = input.id.replace('param-', '');
            const value = input.value.trim();
            const errorEl = document.getElementById(`error-${key}`);
            const isOptional = document.querySelector(`label[for="param-${key}"]`)?.textContent.includes('(optional)');

            if (!value && !isOptional) {
                isValid = false;
                if(errorEl) errorEl.classList.remove('hidden');
                input.classList.add('border-red-500');
            } else {
                if(errorEl) errorEl.classList.add('hidden');
                input.classList.remove('border-red-500');
                if (value) {
                    if (constructedUrl.includes(`{${key}}`)) {
                        constructedUrl = constructedUrl.replace(`{${key}}`, encodeURIComponent(value));
                    } else {
                        query.set(key, value);
                    }
                }
            }
        });

        if (!isValid) return;

        // Hide form, show response area
        paramsContainer.classList.add('hidden');
        submitApiBtn.classList.add('hidden');
        responseContainer.classList.remove('hidden');
        
        const responseDataEl = document.getElementById('response-data');
        const responseStatusEl = document.getElementById('response-status');
        const responseTimeEl = document.getElementById('response-time');
        
        responseDataEl.textContent = 'Loading...';
        const startTime = Date.now();

        try {
            const finalUrl = `${constructedUrl}?${query.toString()}`;
            const response = await fetch(finalUrl);
            const duration = Date.now() - startTime;

            // Display status and time
            responseStatusEl.textContent = response.status;
            responseStatusEl.className = `px-3 py-1 text-xs font-medium rounded-full ${response.ok ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`;
            responseTimeEl.textContent = `${duration}ms`;

            const contentType = response.headers.get("content-type");

            if (contentType && contentType.includes("application/json")) {
                const jsonData = await response.json();
                responseDataEl.innerHTML = `<pre class="whitespace-pre-wrap break-words">${JSON.stringify(jsonData, null, 2)}</pre>`;
            } else if (contentType && (contentType.includes("image/") || contentType.includes("video/") || contentType.includes("audio/"))) {
                 const blob = await response.blob();
                 const objectUrl = URL.createObjectURL(blob);
                 if (contentType.includes("image/")) {
                    responseDataEl.innerHTML = `<img src='${objectUrl}' alt='Response Image' class='max-w-full h-auto rounded-lg' />`;
                 } else if (contentType.includes("video/")) {
                    responseDataEl.innerHTML = `<video controls class='max-w-full rounded-lg'><source src='${objectUrl}' type='${contentType}'></video>`;
                 } else if (contentType.includes("audio/")) {
                    responseDataEl.innerHTML = `<audio controls class='w-full'><source src='${objectUrl}' type='${contentType}'></audio>`;
                 }
            } else {
                const text = await response.text();
                responseDataEl.innerHTML = `<pre class="whitespace-pre-wrap break-words">${text}</pre>`;
            }

        } catch (error) {
            const duration = Date.now() - startTime;
            responseStatusEl.textContent = 'Error';
            responseStatusEl.className = 'px-3 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            responseTimeEl.textContent = `${duration}ms`;
            responseDataEl.innerHTML = `<pre class="text-red-500">${error.message}</pre>`;
        }
    };

    // Use the global modal open function from the inline script
    openModal();
}
