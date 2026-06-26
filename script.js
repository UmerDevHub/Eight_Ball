document.addEventListener('DOMContentLoaded', () => {
    // Hamburger Menu Logic
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = hamburger.querySelector('i');
            
            if (navLinks.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-xmark');
            } else {
                icon.classList.remove('fa-xmark');
                icon.classList.add('fa-bars');
            }
        });

        // Close menu when a link is clicked
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                const icon = hamburger.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-xmark');
                    icon.classList.add('fa-bars');
                }
            });
        });
    }

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Copy to clipboard functionality for payment methods
    const copyElements = document.querySelectorAll('.copy-box');
    
    copyElements.forEach(el => {
        el.addEventListener('click', () => {
            if (isAdminActive) return; // Prevent copy overlay while editing in Admin Mode!
            const textToCopy = el.querySelector('strong').innerText;
            const button = el.querySelector('.btn-copy');
            const icon = button.querySelector('i');
            
            navigator.clipboard.writeText(textToCopy).then(() => {
                const originalClass = icon.className;
                const originalBg = el.style.background;
                const originalBorder = el.style.borderColor;
                const originalColor = icon.style.color;
                
                // Change to success state
                icon.className = 'fa-solid fa-check';
                icon.style.color = '#10b981'; // emerald
                el.style.borderColor = 'rgba(16, 185, 129, 0.5)';
                el.style.background = 'rgba(16, 185, 129, 0.1)';
                
                // Revert back after 2 seconds
                setTimeout(() => {
                    icon.className = originalClass;
                    icon.style.color = originalColor;
                    el.style.borderColor = originalBorder;
                    el.style.background = originalBg;
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy text: ', err);
            });
        });
    });

    // Initialize click-to-play video placeholders for ultra-fast loading speed!
    const initVideoPlaceholders = () => {
        document.querySelectorAll('.video-placeholder').forEach(placeholder => {
            placeholder.addEventListener('click', function() {
                const type = this.dataset.videoType;
                const id = this.dataset.videoId;
                let iframeSrc = '';
                
                if (type === 'youtube') {
                    iframeSrc = `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
                } else if (type === 'tiktok') {
                    iframeSrc = `https://www.tiktok.com/embed/v2/${id}?autoplay=1`;
                }
                
                if (iframeSrc) {
                    const iframe = document.createElement('iframe');
                    iframe.setAttribute('src', iframeSrc);
                    iframe.setAttribute('allowfullscreen', 'true');
                    iframe.setAttribute('allow', 'autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
                    
                    this.innerHTML = '';
                    this.appendChild(iframe);
                }
            });
        });
    };
    initVideoPlaceholders();

    // Note: VanillaTilt is initialized automatically on elements with data-tilt via the CDN script in index.html

    // ==========================================
    // PREMIUM ON-PAGE VISUAL ADMIN MODE
    // ==========================================
    const ADMIN_PASSWORD = 'admin123'; // Change your password here!
    const editableElements = document.querySelectorAll('.price-editable');

    // Helper: Safely encode string to Base64 (supports UTF-8 characters)
    const utoa = (str) => {
        return btoa(unescape(encodeURIComponent(str)));
    };

    // Helper: Extract YouTube or TikTok video ID from a full URL or return ID as is
    const extractVideoId = (input) => {
        if (!input) return '';
        input = input.trim();
        
        // If it matches exactly 11 characters (typical YouTube ID) or is a purely numeric ID (typical TikTok ID)
        if (/^[a-zA-Z0-9_-]{11}$/.test(input) || /^[0-9]+$/.test(input)) {
            return input;
        }
        
        // 1. YouTube short link (youtu.be/ID)
        const shortRegex = /youtu\.be\/([a-zA-Z0-9_-]{11})/i;
        const shortMatch = input.match(shortRegex);
        if (shortMatch) return shortMatch[1];
        
        // 2. YouTube shorts link (youtube.com/shorts/ID)
        const shortsRegex = /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/i;
        const shortsMatch = input.match(shortsRegex);
        if (shortsMatch) return shortsMatch[1];
        
        // 3. YouTube embed link (youtube.com/embed/ID)
        const embedRegex = /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/i;
        const embedMatch = input.match(embedRegex);
        if (embedMatch) return embedMatch[1];
        
        // 4. YouTube watch link (youtube.com/watch?v=ID)
        const watchRegex = /[?&]v=([a-zA-Z0-9_-]{11})/i;
        const watchMatch = input.match(watchRegex);
        if (watchMatch) return watchMatch[1];

        // 5. TikTok video link (tiktok.com/@user/video/ID)
        const tiktokRegex = /tiktok\.com\/@[a-zA-Z0-9_.]+\/video\/([0-9]+)/i;
        const tiktokMatch = input.match(tiktokRegex);
        if (tiktokMatch) return tiktokMatch[1];
        
        return input; // Fallback
    };

    // Helper: Let user choose an image from their computer and load it as a Base64 URL
    const chooseImageFromFileSystem = (imgElement) => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        
        fileInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                // Warning if the file is excessively large (e.g. > 4MB) to keep page loading blazing fast
                if (file.size > 4 * 1024 * 1024) {
                    alert('⚠️ WARNING: This image file is quite large (over 4MB).\n\nTo ensure your website loads instantly for all mobile and desktop visitors, we highly recommend selecting web-optimized images (under 1MB).');
                }

                const reader = new FileReader();
                reader.onload = (e) => {
                    imgElement.setAttribute('src', e.target.result);
                };
                reader.readAsDataURL(file);
            }
        });
        
        fileInput.click();
    };

    // Note: Prices are loaded directly from the HTML source code, ensuring 100% layout and text sync.

    // Helper to make an element editable with proper event handlers
    const makeElementEditable = (el) => {
        el.setAttribute('contenteditable', 'true');
        // Prevent click navigation on editable texts
        el.addEventListener('click', preventDefaultClick);
        // Prevent Enter key from creating new lines in editable fields
        el.addEventListener('keydown', preventEnterKey);
    };

    // Helper to set up full, comprehensive CRUD and text editability inside any card
    const setupCardInteractivity = (card) => {
        // 1. Make all text elements inside this card editable
        const textSelectors = 'h1, h2, h3, h4, h5, h6, p, .btn, td, th, .hero-tag, .copy-box strong, .profile-badge, .profile-status, .card-dl-btn';
        card.querySelectorAll(textSelectors).forEach(el => {
            el.classList.add('price-editable');
            makeElementEditable(el);
        });

        // Note: Links and Video clicks are handled globally in the capturing phase to prevent navigation and allow instant single-click editing.

        // 4. Set up all pricing tables inside this card
        card.querySelectorAll('.compact-price-table').forEach(table => {
            // Prepend delete buttons to all existing rows (excluding headers)
            table.querySelectorAll('tr').forEach(row => {
                if (row.querySelector('th')) return; // Skip header row
                const firstCell = row.querySelector('td');
                if (firstCell && !firstCell.querySelector('.admin-delete-row-btn')) {
                    const delBtn = document.createElement('button');
                    delBtn.className = 'admin-delete-row-btn';
                    delBtn.setAttribute('title', 'Delete Row');
                    delBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
                    delBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        row.remove();
                    });
                    firstCell.appendChild(delBtn);
                }
            });

            // Append "Add Row" button below the table
            let addBtn = table.nextElementSibling;
            if (!addBtn || !addBtn.classList.contains('admin-add-row-btn')) {
                addBtn = document.createElement('div');
                addBtn.className = 'admin-add-row-btn';
                addBtn.innerHTML = '<i class="fa-solid fa-plus"></i> Add New Row';
                addBtn.addEventListener('click', () => {
                    const tbody = table.querySelector('tbody') || table;
                    const newRow = document.createElement('tr');
                    newRow.innerHTML = `
                        <td class="price-editable">New Deal</td>
                        <td class="pkr-text"><strong class="price-editable">1,000</strong></td>
                        <td class="inr-text"><strong class="price-editable">300</strong></td>
                    `;
                    
                    // Make new cells editable
                    newRow.querySelectorAll('.price-editable').forEach(cell => makeElementEditable(cell));
                    
                    // Prepend delete button to the new row
                    const delBtn = document.createElement('button');
                    delBtn.className = 'admin-delete-row-btn';
                    delBtn.setAttribute('title', 'Delete Row');
                    delBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
                    delBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        newRow.remove();
                    });
                    const firstCell = newRow.querySelector('td');
                    if (firstCell) {
                        firstCell.appendChild(delBtn);
                    }
                    
                    tbody.appendChild(newRow);
                });
                table.parentNode.insertBefore(addBtn, table.nextSibling);
            }
        });

        // 4.5. Image Management: Add Image and Delete Image features
        const setupImageDeleteButtons = (cardNode) => {
            cardNode.querySelectorAll('.offer-image-container').forEach(container => {
                if (!container.querySelector('.admin-delete-image-btn')) {
                    container.style.position = 'relative';
                    
                    const delImgBtn = document.createElement('button');
                    delImgBtn.className = 'admin-delete-image-btn';
                    delImgBtn.setAttribute('title', 'Delete Image');
                    delImgBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
                    delImgBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (confirm('Are you sure you want to delete the image from this offer card?')) {
                            container.remove();
                            // Toggle visibility of Add Image button
                            const addImgBtnNode = cardNode.querySelector('.admin-add-image-btn');
                            if (addImgBtnNode) addImgBtnNode.style.display = 'inline-flex';
                        }
                    });
                    container.appendChild(delImgBtn);
                }
            });
        };

        // Create "Add Image" button if it doesn't exist
        let addImgBtn = card.querySelector('.admin-add-image-btn');
        if (!addImgBtn) {
            addImgBtn = document.createElement('div');
            addImgBtn.className = 'admin-add-image-btn';
            addImgBtn.innerHTML = '<i class="fa-solid fa-image"></i> Add Image';
            addImgBtn.addEventListener('click', () => {
                const container = document.createElement('div');
                container.className = 'offer-image-container';
                container.style.marginTop = '1rem';
                container.style.marginBottom = '1rem';
                container.innerHTML = `
                    <img src="limitedOffer.jpg" alt="Offer Image" class="hover-zoom-img">
                `;
                
                const cardInner = card.querySelector('.card-inner');
                const table = cardInner.querySelector('.compact-price-table');
                const dlBtn = cardInner.querySelector('.card-dl-btn');
                
                if (table) {
                    cardInner.insertBefore(container, table);
                } else if (dlBtn) {
                    cardInner.insertBefore(container, dlBtn);
                } else {
                    cardInner.appendChild(container);
                }
                
                setupImageDeleteButtons(card);
                addImgBtn.style.display = 'none';

                // Automatically trigger the computer's file chooser for the new image!
                const imgEl = container.querySelector('img');
                if (imgEl) {
                    chooseImageFromFileSystem(imgEl);
                }
            });

            const cardInner = card.querySelector('.card-inner');
            if (cardInner) {
                cardInner.appendChild(addImgBtn);
            }
        }

        // Setup visibility and delete buttons
        if (card.querySelector('.offer-image-container')) {
            addImgBtn.style.display = 'none';
        } else {
            addImgBtn.style.display = 'inline-flex';
        }
        setupImageDeleteButtons(card);

        // 5. Inject a global hovering delete button in the top-right of this card
        if (!card.querySelector('.admin-delete-card-global-btn')) {
            const delBtn = document.createElement('button');
            delBtn.className = 'admin-delete-card-global-btn';
            delBtn.setAttribute('title', 'Delete Offer Card');
            delBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
            delBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (confirm('Are you sure you want to delete this entire offer card? This will remove all its text and tables.')) {
                    card.remove();
                }
            });
            card.appendChild(delBtn);
        }
    };

    // 2. Function to enter Admin Mode
    let isAdminActive = false;
    const enterAdminMode = () => {
        if (isAdminActive) return;

        const password = prompt('Enter Admin Password to Edit Website:');
        if (password === null) return; // User clicked cancel
        if (password !== ADMIN_PASSWORD) {
            alert('Incorrect password! Access denied.');
            return;
        }

        isAdminActive = true;
        document.body.classList.add('admin-mode');

        // Make the Hero section texts and navbar logo editable (since they are outside cards)
        const globalSelectors = '.hero-content h1, .hero-content p, .hero-tag, .logo, .nav-links a, footer p';
        document.querySelectorAll(globalSelectors).forEach(el => {
            el.classList.add('price-editable');
            makeElementEditable(el);
        });

        // Note: Header/footer links are handled by the global Admin click interceptor.

        // Make all existing bento offer cards fully interactive (edit texts, links, tables, delete card)
        document.querySelectorAll('.card').forEach(card => {
            setupCardInteractivity(card);
        });

        // Inject "Add New Offer Card" button to all bento grids (except payment-grid)
        document.querySelectorAll('.bento-grid').forEach(grid => {
            if (grid.classList.contains('payment-grid')) return; // Skip payment grid (has its own card add logic)
            
            let addCardBtn = grid.querySelector('.admin-add-card-btn');
            if (!addCardBtn) {
                addCardBtn = document.createElement('div');
                addCardBtn.className = 'admin-add-card-btn';
                addCardBtn.innerHTML = `
                    <i class="fa-solid fa-plus-circle"></i>
                    <span>Add New Offer Card</span>
                `;
                addCardBtn.addEventListener('click', () => {
                    const newCard = document.createElement('div');
                    newCard.className = 'card bento-card';
                    newCard.innerHTML = `
                        <div class="card-inner">
                            <div class="card-header">
                                <div class="icon-box bg-cyan-10">
                                    <i class="fa-solid fa-gem"></i>
                                </div>
                                <div>
                                    <h3>New Premium Deal</h3>
                                    <span class="badge badge-outline">New Package</span>
                                </div>
                            </div>
                            <p class="desc-text">This is your new package description. Click here to edit and customize this text!</p>
                            
                            <table class="compact-price-table">
                                <thead>
                                    <tr>
                                        <th>Duration</th>
                                        <th class="pkr-text">🇵🇰<br>PKR (₨)</th>
                                        <th class="inr-text">🇮🇳<br>INR (₹)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>7 Days</td>
                                        <td class="pkr-text"><strong class="price-editable">1,000</strong></td>
                                        <td class="inr-text"><strong class="price-editable">300</strong></td>
                                    </tr>
                                    <tr class="row-highlight">
                                        <td>30 Days</td>
                                        <td class="pkr-text"><strong class="price-editable">3,000</strong></td>
                                        <td class="inr-text"><strong class="price-editable">900</strong></td>
                                    </tr>
                                </tbody>
                            </table>
                            
                            <a href="#" target="_blank" class="card-dl-btn" style="margin-top: 1rem;"><i class="fa-solid fa-download"></i> Download Link</a>
                        </div>
                    `;
                    
                    // Set up all editability, table tools, double-click links, and deletion on the new card
                    setupCardInteractivity(newCard);
                    
                    // Insert the new card in the grid right before the "Add Card" button
                    grid.insertBefore(newCard, addCardBtn);
                });
                grid.appendChild(addCardBtn);
            }
        });

        // Inject "Add Payment Method" card at the end of the payment grid (if not already present)
        const paymentGrid = document.querySelector('.payment-grid');
        if (paymentGrid) {
            let addCard = paymentGrid.querySelector('.admin-add-payment-card');
            if (!addCard) {
                addCard = document.createElement('div');
                addCard.className = 'admin-add-payment-card';
                addCard.innerHTML = `
                    <i class="fa-solid fa-plus"></i>
                    <span>Add Payment Method</span>
                `;
                addCard.addEventListener('click', () => {
                    const newCard = document.createElement('div');
                    newCard.className = 'pay-item';
                    newCard.innerHTML = `
                        <h4 class="price-editable">New Bank Account</h4>
                        <div class="copy-box" title="Click to copy account details">
                            <strong class="price-editable">000000000000</strong>
                            <button class="btn-copy" aria-label="Copy account details"><i class="fa-regular fa-copy"></i></button>
                        </div>
                        <p class="text-sm mt-2" style="margin-top: 0.5rem; color:var(--text-muted);">
                            Account Holder: <strong style="color:var(--text-main);" class="price-editable">Holder Name</strong>
                        </p>
                    `;
                    
                    // Make new elements editable
                    newCard.querySelectorAll('.price-editable').forEach(el => makeElementEditable(el));
                    
                    // Inject delete button for the new payment card
                    const delBtn = document.createElement('button');
                    delBtn.className = 'admin-delete-card-btn';
                    delBtn.setAttribute('title', 'Delete Payment Method');
                    delBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
                    delBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        newCard.remove();
                    });
                    newCard.appendChild(delBtn);
                    
                    paymentGrid.insertBefore(newCard, addCard);
                });
                paymentGrid.appendChild(addCard);
            }
        }

        // Create the beautiful glassmorphic Admin Control Bar
        const adminBar = document.createElement('div');
        adminBar.id = 'admin-bar';
        adminBar.innerHTML = `
            <div class="admin-info">
                <i class="fa-solid fa-gear"></i>
                <span>🛠️ Farhan YT Admin Panel</span>
            </div>
            <div class="admin-actions">
                <button class="admin-btn admin-btn-save admin-publish-btn"><i class="fa-solid fa-bolt"></i> Publish Live</button>
                <button class="admin-btn admin-btn-exit admin-settings-btn"><i class="fa-solid fa-cog"></i> Settings</button>
                <button class="admin-btn admin-btn-exit admin-reset-btn" style="background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.4); color: #ef4444;"><i class="fa-solid fa-rotate-left"></i> Reset Defaults</button>
                <button class="admin-btn admin-btn-exit admin-close-btn">Exit</button>
            </div>
        `;

        document.body.appendChild(adminBar);

        // Slide up animation
        setTimeout(() => {
            adminBar.classList.add('active');
        }, 100);

        // Add event listeners to the buttons
        adminBar.querySelector('.admin-close-btn').addEventListener('click', exitAdminMode);
        adminBar.querySelector('.admin-settings-btn').addEventListener('click', openSettingsModal);
        adminBar.querySelector('.admin-publish-btn').addEventListener('click', publishToGitHubVercel);
        adminBar.querySelector('.admin-reset-btn').addEventListener('click', () => {
            if (confirm('Are you sure you want to discard all unsaved edits and reload the page?')) {
                location.reload();
            }
        });

        alert('Success! Admin Mode Activated.\n\n✨ Click & Edit: Click any text, heading, or button to type changes.\n🔗 Edit Links: Double-click any link or button to change its URL.\n🎬 Edit Videos: Double-click video cards to change the YouTube ID.\n➕ Add Items: Click the "+ Add New Offer Card" or "+ Add New Row" buttons.\n🗑️ Delete Items: Hover over cards or rows and click the red trash can!');
    };

    const preventDefaultClick = (e) => {
        if (isAdminActive) {
            e.preventDefault();
        }
    };

    const preventEnterKey = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            e.target.blur();
        }
    };

    // 3. Function to exit Admin Mode
    const exitAdminMode = () => {
        if (!isAdminActive) return;

        isAdminActive = false;
        document.body.classList.remove('admin-mode');

        document.querySelectorAll('[contenteditable]').forEach(el => {
            el.removeAttribute('contenteditable');
        });

        // Clean up CRUD additions
        document.querySelectorAll('.admin-add-row-btn').forEach(el => el.remove());
        document.querySelectorAll('.admin-delete-row-btn').forEach(el => el.remove());
        document.querySelectorAll('.admin-add-payment-card').forEach(el => el.remove());
        document.querySelectorAll('.admin-delete-card-btn').forEach(el => el.remove());
        document.querySelectorAll('.admin-delete-card-global-btn').forEach(el => el.remove());
        document.querySelectorAll('.admin-add-card-btn').forEach(el => el.remove());
        document.querySelectorAll('.admin-add-image-btn').forEach(el => el.remove());
        document.querySelectorAll('.admin-delete-image-btn').forEach(el => el.remove());

        const adminBar = document.getElementById('admin-bar');
        if (adminBar) {
            adminBar.classList.remove('active');
            setTimeout(() => adminBar.remove(), 500);
        }
        
        // Remove settings modal if open
        closeSettingsModal();

        // Reload to restore the clean client view
        location.reload();
    };

    // 4. Function to save edits to localStorage and download updated HTML file
    const getCleanHTMLString = () => {
        // A. Temporarily clean up the DOM for clean export
        document.querySelectorAll('[contenteditable]').forEach(el => {
            el.removeAttribute('contenteditable');
        });

        // Remove all Admin Mode CRUD injections
        document.querySelectorAll('.admin-add-row-btn').forEach(el => el.remove());
        document.querySelectorAll('.admin-delete-row-btn').forEach(el => el.remove());
        document.querySelectorAll('.admin-add-payment-card').forEach(el => el.remove());
        document.querySelectorAll('.admin-delete-card-btn').forEach(el => el.remove());
        document.querySelectorAll('.admin-delete-card-global-btn').forEach(el => el.remove());
        document.querySelectorAll('.admin-add-card-btn').forEach(el => el.remove());
        document.querySelectorAll('.admin-add-image-btn').forEach(el => el.remove());
        document.querySelectorAll('.admin-delete-image-btn').forEach(el => el.remove());

        const adminBar = document.getElementById('admin-bar');
        if (adminBar) adminBar.remove();

        const modalOverlay = document.getElementById('admin-modal-overlay');
        if (modalOverlay) modalOverlay.remove();

        document.body.classList.remove('admin-mode');

        // B. Generate clean HTML string
        const cleanHTML = '<!DOCTYPE html>\n' + document.documentElement.outerHTML;

        // C. Restore Admin Mode state in active page
        document.body.classList.add('admin-mode');
        document.querySelectorAll('.price-editable').forEach(el => {
            el.setAttribute('contenteditable', 'true');
        });
        if (adminBar) {
            document.body.appendChild(adminBar);
        }
        
        return cleanHTML;
    };

    const saveAndDownloadHTML = () => {
        const cleanHTML = getCleanHTMLString();

        // Create file download link
        const blob = new Blob([cleanHTML], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'index.html';
        document.body.appendChild(a);
        a.click();
        
        // Cleanup download link
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        alert('Local File Exported!\n\nYour updated "index.html" file has been downloaded. Simply replace your old index.html file with this new one!');
    };

    // 5. GitHub & Vercel Settings Modal Logic
    const openSettingsModal = () => {
        // Check if modal already exists
        let modalOverlay = document.getElementById('admin-modal-overlay');
        if (modalOverlay) return;

        // Load current config
        const ghUser = localStorage.getItem('gh_username') || 'UmerDevHub';
        const ghRepo = localStorage.getItem('gh_repo') || 'Eight_Ball';
        const ghToken = localStorage.getItem('gh_token') || '';
        const ghBranch = localStorage.getItem('gh_branch') || 'main';

        modalOverlay = document.createElement('div');
        modalOverlay.id = 'admin-modal-overlay';
        modalOverlay.innerHTML = `
            <div id="admin-settings-modal">
                <div class="modal-header">
                    <h3>⚙️ Vercel Deploy Settings</h3>
                    <button class="modal-close"><i class="fa-solid fa-xmark"></i></button>
                </div>
                <div class="modal-help">
                    <strong>How to connect to your Vercel site:</strong>
                    <ol>
                        <li>Deploy this website to Vercel via GitHub.</li>
                        <li>Create a GitHub Classic Token (with <strong>repo</strong> scope) at <a href="https://github.com/settings/tokens" target="_blank">github.com/settings/tokens</a>.</li>
                        <li>Enter your username, repository name, and token below to allow instant deployments!</li>
                    </ol>
                </div>
                <div class="modal-group">
                    <label>GitHub Username</label>
                    <input type="text" id="modal-gh-user" placeholder="e.g., UmerDevHub" value="${ghUser}">
                </div>
                <div class="modal-group">
                    <label>Repository Name</label>
                    <input type="text" id="modal-gh-repo" placeholder="e.g., Eight_Ball" value="${ghRepo}">
                </div>
                <div class="modal-group">
                    <label>Branch Name</label>
                    <input type="text" id="modal-gh-branch" placeholder="e.g., main" value="${ghBranch}">
                </div>
                <div class="modal-group">
                    <label>GitHub Access Token</label>
                    <input type="password" id="modal-gh-token" placeholder="ghp_xxxxxxxxxxxxxxxxxxxx" value="${ghToken}">
                </div>
                <div class="modal-actions">
                    <button class="admin-btn admin-btn-exit modal-cancel-btn">Cancel</button>
                    <button class="admin-btn admin-btn-save modal-save-btn">Save Settings</button>
                </div>
            </div>
        `;

        document.body.appendChild(modalOverlay);

        // Animate in
        setTimeout(() => {
            modalOverlay.classList.add('active');
        }, 50);

        // Listeners
        modalOverlay.querySelector('.modal-close').addEventListener('click', closeSettingsModal);
        modalOverlay.querySelector('.modal-cancel-btn').addEventListener('click', closeSettingsModal);
        modalOverlay.querySelector('.modal-save-btn').addEventListener('click', saveSettings);
    };

    const closeSettingsModal = () => {
        const modalOverlay = document.getElementById('admin-modal-overlay');
        if (modalOverlay) {
            modalOverlay.classList.remove('active');
            setTimeout(() => modalOverlay.remove(), 300);
        }
    };

    const saveSettings = () => {
        const user = document.getElementById('modal-gh-user').value.trim();
        const repo = document.getElementById('modal-gh-repo').value.trim();
        const branch = document.getElementById('modal-gh-branch').value.trim() || 'main';
        const token = document.getElementById('modal-gh-token').value.trim();

        if (!user || !repo || !token) {
            alert('Please fill in all fields to link your GitHub repository!');
            return;
        }

        localStorage.setItem('gh_username', user);
        localStorage.setItem('gh_repo', repo);
        localStorage.setItem('gh_branch', branch);
        localStorage.setItem('gh_token', token);

        alert('Deploy settings saved! You can now click "⚡ Publish Live" to deploy instantly.');
        closeSettingsModal();
    };

    // 6. Deploy to GitHub & Vercel
    const publishToGitHubVercel = async () => {
        const user = localStorage.getItem('gh_username');
        const repo = localStorage.getItem('gh_repo');
        const branch = localStorage.getItem('gh_branch') || 'main';
        const token = localStorage.getItem('gh_token');

        if (!user || !repo || !token) {
            alert('GitHub settings not configured!\n\nPlease click "⚙️ Settings" first to configure your repository connection.');
            openSettingsModal();
            return;
        }

        const publishBtn = document.querySelector('.admin-publish-btn');
        const originalText = publishBtn.innerHTML;
        
        try {
            publishBtn.disabled = true;
            publishBtn.innerHTML = `<span class="loading-spinner"></span> Connecting...`;

            const cleanHTML = getCleanHTMLString();

            // A. Fetch current file SHA from GitHub API
            const getUrl = `https://api.github.com/repos/${user}/${repo}/contents/index.html?ref=${branch}`;
            const headers = {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            };

            const response = await fetch(getUrl, { headers });
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('index.html not found in repository. Make sure the repo name and branch are correct.');
                } else if (response.status === 401) {
                    throw new Error('Invalid GitHub Token. Please check your credentials.');
                } else {
                    throw new Error(`GitHub API Error: ${response.statusText}`);
                }
            }

            const fileData = await response.json();
            const currentSha = fileData.sha;

            // B. Commit updated file to GitHub (this triggers Vercel rebuild)
            publishBtn.innerHTML = `<span class="loading-spinner"></span> Deploying...`;
            const putUrl = `https://api.github.com/repos/${user}/${repo}/contents/index.html`;
            const body = {
                message: 'Update prices & details via Live Admin Panel',
                content: utoa(cleanHTML),
                sha: currentSha,
                branch: branch
            };

            const commitResponse = await fetch(putUrl, {
                method: 'PUT',
                headers: {
                    ...headers,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            if (!commitResponse.ok) {
                const errorData = await commitResponse.json();
                throw new Error(errorData.message || 'Failed to update index.html on GitHub.');
            }

            alert('🎉 SUCCESS! Deploy Triggered.\n\nYour changes have been committed to GitHub. Vercel is now building your site in the background!\n\nYour live website will update automatically in about 15 to 25 seconds.');
            location.reload();

        } catch (error) {
            console.error('Deployment Failed:', error);
            alert(`❌ Deployment Failed:\n\n${error.message}\n\nPlease verify your GitHub settings (username, repo name, branch, and token scope).`);
        } finally {
            publishBtn.disabled = false;
            publishBtn.innerHTML = originalText;
        }
    };

    // 7. Setup triggers: keyboard shortcut (Ctrl + Shift + E) & footer lock click
    window.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'e') {
            e.preventDefault();
            enterAdminMode();
        }
    });

    const adminTrigger = document.getElementById('admin-trigger');
    if (adminTrigger) {
        adminTrigger.addEventListener('click', enterAdminMode);
    }

    // Global click interceptor in capturing phase to edit links and videos in Admin Mode instantly via single-click
    window.addEventListener('click', (e) => {
        if (!isAdminActive) return;

        // A. Intercept Links (<a> tags)
        const link = e.target.closest('a');
        if (link) {
            // Do not intercept admin panel links, modal close, or settings buttons
            if (link.closest('#admin-bar') || link.closest('#admin-settings-modal') || link.closest('#admin-modal-overlay')) {
                return;
            }
            
            // If the link is inside the header (navbar), do NOT prompt for URL editing.
            // Only prevent the default navigation click so the text cursor can focus and edit the link name!
            if (link.closest('header')) {
                e.preventDefault();
                return;
            }
            
            e.preventDefault();
            e.stopPropagation();

            const currentUrl = link.getAttribute('href') || '';
            const newUrl = prompt(`✏️ Edit Link URL:\n\nEnter new URL for "${link.innerText.trim()}":`, currentUrl);
            if (newUrl !== null) {
                link.setAttribute('href', newUrl);
                alert('Link URL updated successfully!');
            }
            return;
        }

        // B. Intercept Videos (.video-placeholder)
        const video = e.target.closest('.video-placeholder');
        if (video) {
            e.preventDefault();
            e.stopPropagation();

            const currentId = video.getAttribute('data-video-id') || '';
            const isTikTok = video.getAttribute('data-video-type') === 'tiktok';
            
            // Build a helpful default display link for the user
            let defaultLink = currentId;
            if (currentId) {
                if (isTikTok) {
                    defaultLink = `https://www.tiktok.com/@user/video/${currentId}`;
                } else {
                    defaultLink = `https://www.youtube.com/watch?v=${currentId}`;
                }
            }

            const inputLink = prompt(
                `🎬 Edit Video Link:\n\nPaste the entire YouTube or TikTok video link (or video ID) here:\n(e.g., https://www.youtube.com/watch?v=ihnsR1blhug)`, 
                defaultLink
            );
            
            if (inputLink !== null) {
                const newId = extractVideoId(inputLink);
                if (newId) {
                    video.setAttribute('data-video-id', newId);
                    const img = video.querySelector('img');
                    if (img) {
                        // If it's YouTube, update the thumbnail to the new video's high-res thumbnail
                        if (!isTikTok) {
                            img.src = `https://img.youtube.com/vi/${newId}/maxresdefault.jpg`;
                        }
                    }
                    alert(`Video updated successfully!\n\nExtracted Video ID: ${newId}`);
                } else {
                    alert('Could not extract a valid Video ID from that link. Please make sure the link is correct.');
                }
            }
            return;
        }

        // C. Intercept Images (<img> tags)
        const img = e.target.closest('img');
        if (img) {
            // Do not intercept admin panel icons or modal images
            if (img.closest('#admin-bar') || img.closest('#admin-settings-modal') || img.closest('#admin-modal-overlay')) {
                return;
            }

            // Do not intercept video thumbnail images (since they are handled by the video placeholder block)
            if (img.closest('.video-placeholder')) {
                return;
            }

            e.preventDefault();
            e.stopPropagation();

            // Trigger computer file selector!
            chooseImageFromFileSystem(img);
            return;
        }
    }, true); // Capturing phase ensures we block the link from opening and intercept the click first!
});
