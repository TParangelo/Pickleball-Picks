// Keep track of loaded stylesheets and their reference counts
const loadedStylesheets = new Map();

// Function to dynamically load CSS
export const loadCSS = async (cssPath) => {
  try {
    // Check if the stylesheet is already loaded
    if (loadedStylesheets.has(cssPath)) {
      // Increment reference count
      loadedStylesheets.set(cssPath, loadedStylesheets.get(cssPath) + 1);
      return;
    }

    // Create a new link element
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = cssPath;

    // Create a promise that resolves when the CSS is loaded
    const loadPromise = new Promise((resolve, reject) => {
      link.onload = resolve;
      link.onerror = reject;
    });

    // Add the link element to the head
    document.head.appendChild(link);
    
    // Initialize reference count to 1
    loadedStylesheets.set(cssPath, 1);

    // Wait for the CSS to load
    await loadPromise;
  } catch (error) {
    console.error(`Error loading CSS file ${cssPath}:`, error);
  }
};

// Function to cleanup CSS
export const unloadCSS = (cssPath) => {
  if (!loadedStylesheets.has(cssPath)) return;

  // Decrement reference count
  const count = loadedStylesheets.get(cssPath) - 1;
  loadedStylesheets.set(cssPath, count);

  // Only remove if no components are using it
  if (count <= 0) {
    const link = document.querySelector(`link[href="${cssPath}"]`);
    if (link) {
      document.head.removeChild(link);
    }
    loadedStylesheets.delete(cssPath);
  }
}; 