document.addEventListener("DOMContentLoaded", function () {
    // Fetch posts from JSON file
    fetch("posts.json")
        .then((response) => response.json())
        .then((data) => {
            const postsContainer = document.getElementById("posts-list");
            const prevButton = document.getElementById("prev");
            const nextButton = document.getElementById("next");
            const searchInput = document.getElementById("search-input");
            const searchButton = document.getElementById("search-button");
            const categoryList = document.getElementById("category-list");
            const tagList = document.getElementById("tag-list");
            const postsPerPage = 10; // Number of posts to display per page
            let currentPostIndex = 0;
            let filteredPosts = data.posts;
            const loadingIndicator = document.createElement("div");
            loadingIndicator.id = "loading-indicator";
            loadingIndicator.textContent = "Loading...";
            document.body.appendChild(loadingIndicator);
            loadingIndicator.style.display = "none";

            // Extract unique categories and tags
            const categories = [...new Set(data.posts.flatMap((post) => post.categories))];
            const tags = [...new Set(data.posts.flatMap((post) => post.tags))];

            // Populate category and tag lists
            categories.forEach((category) => {
                const li = document.createElement("li");
                li.textContent = category;
                li.addEventListener("click", () => filterByCategory(category));
                categoryList.appendChild(li);
            });

            tags.forEach((tag) => {
                const li = document.createElement("li");
                li.textContent = tag;
                li.addEventListener("click", () => filterByTag(tag));
                tagList.appendChild(li);
            });

            // Show loading indicator
            function showLoading() {
                loadingIndicator.style.display = "block";
            }

            // Hide loading indicator
            function hideLoading() {
                loadingIndicator.style.display = "none";
            }

            // Highlight the search term in text
            function highlightText(text, searchTerm) {
                if (!searchTerm) return text; // If no search term, return original text
                const regex = new RegExp(`(${searchTerm})`, "gi"); // Case-insensitive regex
                return text.replace(regex, '<span class="highlight">$1</span>');
            }

            // Display posts
            function displayPosts(posts) {
                postsContainer.innerHTML = ""; // Clear existing posts
                posts.forEach((post) => {
                    const postElement = document.createElement("article");
                    postElement.classList.add("post");

                    // Highlight the search term in title and content
                    const highlightedTitle = highlightText(post.title, searchInput.value);
                    const highlightedContent = highlightText(post.content, searchInput.value);

                    postElement.innerHTML = `
                        <div class="post-content">
                            <h2><a href="${post.url}" class="post-link">${highlightedTitle}</a></h2>
                            <div class="post-body">
                                <pre class="code-block">${highlightedContent}</pre>
                                <footer>
                                    <p>Categories: ${post.categories.join(", ")}</p>
                                    <p>Tags: ${post.tags.join(", ")}</p>
                                    <p>Author: ${post.author}</p>
                                    <p>Date: ${post.date}</p>
                                </footer>
                            </div>
                        </div>
                        <div class="post-image">
                            <img src="${post.image}" alt="${post.title}">
                        </div>
                    `;

                    postsContainer.appendChild(postElement);
                });
            }

            // Filter posts by category
            function filterByCategory(category) {
                filteredPosts = data.posts.filter((post) => post.categories.includes(category));
                currentPostIndex = 0;
                loadPosts();
            }

            // Filter posts by tag
            function filterByTag(tag) {
                filteredPosts = data.posts.filter((post) => post.tags.includes(tag));
                currentPostIndex = 0;
                loadPosts();
            }

            // Load posts with pagination
            function loadPosts() {
                displayPosts(filteredPosts.slice(currentPostIndex, currentPostIndex + postsPerPage));

                // Update visibility of the Next and Previous buttons
                prevButton.style.display = currentPostIndex <= 0 ? "none" : "inline-block";
                nextButton.style.display =
                    currentPostIndex + postsPerPage >= filteredPosts.length
                        ? "none"
                        : "inline-block";
            }

            // Handle Next button click
            nextButton.addEventListener("click", function () {
                currentPostIndex += postsPerPage;
                loadPosts();
            });

            // Handle Previous button click
            prevButton.addEventListener("click", function () {
                currentPostIndex -= postsPerPage;
                loadPosts();
            });

            // Handle search button click
            const handleSearch = debounce(function () {
                const query = searchInput.value.trim().toLowerCase();
                filteredPosts = data.posts.filter(
                    (post) =>
                        post.title.toLowerCase().includes(query) ||
                        post.content.toLowerCase().includes(query)
                );
                currentPostIndex = 0;
                loadPosts();

                // Hide Next and Previous buttons if no posts are found
                if (filteredPosts.length === 0) {
                    postsContainer.innerHTML = "<p>No posts found.</p>";
                    nextButton.style.display = "none";
                    prevButton.style.display = "none";
                }
            }, 300);

            searchButton.addEventListener("click", handleSearch);
            searchInput.addEventListener("input", handleSearch);

            // Handle clicking on post link
            postsContainer.addEventListener("click", function (e) {
                if (e.target && e.target.matches("a.post-link")) {
                    e.preventDefault(); // Prevent default link action
                    const postUrl = e.target.getAttribute("href"); // Get the URL from the post link
                    checkPostExists(postUrl); // Check if the post file exists
                }
            });

            // Check if post exists
            function checkPostExists(url) {
                showLoading();
                fetch(url, { method: "HEAD" })
                    .then((response) => {
                        hideLoading();
                        if (response.ok) {
                            window.location.href = url; // File exists, go to post
                        } else {
                            window.location.href = "/404.html"; // Redirect to 404 page
                        }
                    })
                    .catch(() => {
                        hideLoading();
                        window.location.href = "/404.html"; // Handle fetch error (e.g., network issue)
                    });
            }

            // Debounce function
            function debounce(func, delay) {
                let timer;
                return function (...args) {
                    clearTimeout(timer);
                    timer = setTimeout(() => func.apply(this, args), delay);
                };
            }

            // Initial load
            loadPosts();
        })
        .catch((error) => {
            console.error("Error loading posts:", error);
        });
});
