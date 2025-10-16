/**
 * Floating AI Chatbot Button
 * Adds a fixed position button that opens an AI chatbot in a new tab
 * Can be easily added to any website or application
 */

(function() {
  // Configuration (can be customized)
  const config = {
    buttonText: "Chat with AI 🤖",
    chatbotUrl: "https://farmcareaichatbot.vercel.app/",
    position: "bottom-right", // options: bottom-right, bottom-left, top-right, top-left
    backgroundColor: "#4CAF50",
    textColor: "#ffffff",
    zIndex: 9999,
    marginBottom: "20px",
    marginRight: "20px",
    fontSize: "16px"
  };

  // Create the button element
  function createChatbotButton() {
    const button = document.createElement("div");
    button.id = "floating-chatbot-button";
    button.innerText = config.buttonText;
    
    // Apply styles to the button
    const styles = {
      position: "fixed",
      padding: "12px 20px",
      backgroundColor: config.backgroundColor,
      color: config.textColor,
      borderRadius: "30px",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
      cursor: "pointer",
      fontFamily: "Arial, sans-serif",
      fontWeight: "bold",
      fontSize: config.fontSize,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: config.zIndex,
      transition: "all 0.3s ease"
    };
    
    // Set position based on configuration
    switch(config.position) {
      case "bottom-right":
        styles.bottom = config.marginBottom;
        styles.right = config.marginRight;
        break;
      case "bottom-left":
        styles.bottom = config.marginBottom;
        styles.left = config.marginRight;
        break;
      case "top-right":
        styles.top = config.marginBottom;
        styles.right = config.marginRight;
        break;
      case "top-left":
        styles.top = config.marginBottom;
        styles.left = config.marginRight;
        break;
      default:
        styles.bottom = config.marginBottom;
        styles.right = config.marginRight;
    }
    
    // Apply all styles to the button
    Object.assign(button.style, styles);
    
    // Add event listeners
    button.addEventListener("click", openChatbot);
    
    // Hover effects
    button.addEventListener("mouseenter", function() {
      this.style.backgroundColor = darkenColor(config.backgroundColor, 10);
      this.style.boxShadow = "0 6px 12px rgba(0, 0, 0, 0.3)";
      this.style.transform = "translateY(-2px)";
    });
    
    button.addEventListener("mouseleave", function() {
      this.style.backgroundColor = config.backgroundColor;
      this.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";
      this.style.transform = "translateY(0)";
    });
    
    return button;
  }
  
  // Function to darken a hex color
  function darkenColor(hex, percent) {
    // Remove # if present
    hex = hex.replace(/^#/, '');
    
    // Parse r, g, b values
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);
    
    // Darken each component
    r = Math.floor(r * (100 - percent) / 100);
    g = Math.floor(g * (100 - percent) / 100);
    b = Math.floor(b * (100 - percent) / 100);
    
    // Convert back to hex
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  // Function to open chatbot in a new tab
  function openChatbot() {
    window.open(config.chatbotUrl, '_blank');
  }

  // Function to add the button to the page
  function addButtonToPage() {
    const button = createChatbotButton();
    document.body.appendChild(button);
  }

  // Add button when DOM is fully loaded
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", addButtonToPage);
  } else {
    addButtonToPage();
  }

  // Create responsive styles
  function createResponsiveStyles() {
    const style = document.createElement("style");
    style.textContent = `
      @media (max-width: 768px) {
        #floating-chatbot-button {
          padding: 10px 16px !important;
          font-size: 14px !important;
          margin-bottom: 15px !important;
          margin-right: 15px !important;
        }
      }
      
      @media (max-width: 480px) {
        #floating-chatbot-button {
          padding: 8px 12px !important;
          font-size: 12px !important;
          margin-bottom: 10px !important;
          margin-right: 10px !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Add responsive styles
  createResponsiveStyles();
})();
