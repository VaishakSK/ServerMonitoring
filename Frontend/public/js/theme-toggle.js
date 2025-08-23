(function() {
    let currentTheme = localStorage.getItem('theme') || 'system';
    
    function initTheme() {
        applyTheme(currentTheme);
        updateThemeButton();
        
        // Listen for system theme changes
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', handleSystemThemeChange);
        }
    }
    
    function applyTheme(theme) {
        const body = document.body;
        
        // Remove existing theme classes
        body.classList.remove('light-theme', 'dark-theme');
        
        if (theme === 'dark') {
            body.setAttribute('data-theme', 'dark');
            body.classList.add('dark-theme');
        } else if (theme === 'light') {
            body.setAttribute('data-theme', 'light');
            body.classList.add('light-theme');
        } else { // system
            body.setAttribute('data-theme', 'system');
            const systemTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            body.setAttribute('data-theme', systemTheme);
            body.classList.add(systemTheme === 'dark' ? 'dark-theme' : 'light-theme');
        }
        
        // Store the theme preference
        localStorage.setItem('theme', theme);
        currentTheme = theme;
    }
    
    function updateThemeButton() {
        const btn = document.getElementById('theme-toggle');
        if (!btn) return;
        
        // Update button appearance based on current theme
        btn.setAttribute('data-theme', currentTheme);
    }
    
    function handleSystemThemeChange(e) {
        if (currentTheme === 'system') {
            const newSystemTheme = e.matches ? 'dark' : 'light';
            document.body.setAttribute('data-theme', newSystemTheme);
            document.body.classList.remove('light-theme', 'dark-theme');
            document.body.classList.add(newSystemTheme === 'dark' ? 'dark-theme' : 'light-theme');
        }
    }
    
    function toggleDropdown() {
        const dropdown = document.getElementById('theme-dropdown');
        if (!dropdown) return;
        
        dropdown.classList.toggle('show');
        
        // Close dropdown when clicking outside
        if (dropdown.classList.contains('show')) {
            setTimeout(() => {
                document.addEventListener('click', closeDropdown, { once: true });
            }, 0);
        }
    }
    
    function closeDropdown() {
        const dropdown = document.getElementById('theme-dropdown');
        if (dropdown) {
            dropdown.classList.remove('show');
        }
    }
    
    function handleThemeSelection(theme) {
        applyTheme(theme);
        updateThemeButton();
        closeDropdown();
        
        // Dispatch custom event for other components
        window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTheme);
    } else {
        initTheme();
    }
    
    // Add event listeners when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        const toggleBtn = document.getElementById('theme-toggle');
        const dropdown = document.getElementById('theme-dropdown');
        
        if (toggleBtn) {
            toggleBtn.addEventListener('click', toggleDropdown);
        }
        
        if (dropdown) {
            dropdown.addEventListener('click', function(e) {
                const themeOption = e.target.closest('.theme-option');
                if (themeOption) {
                    const theme = themeOption.getAttribute('data-theme');
                    handleThemeSelection(theme);
                }
            });
        }
    });
    
    // Expose theme manager globally
    window.themeManager = {
        applyTheme: applyTheme,
        getCurrentTheme: () => currentTheme,
        setTheme: handleThemeSelection
    };
})();
