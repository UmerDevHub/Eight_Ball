document.addEventListener('DOMContentLoaded', () => {
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

    // Note: VanillaTilt is initialized automatically on elements with data-tilt via the CDN script in index.html
});
