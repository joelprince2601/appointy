// Fallback if React doesn't load after 3 seconds
setTimeout(() => {
  const root = document.getElementById('root');
  if (root && root.children.length === 1 && root.querySelector('.loading-fallback')) {
    root.innerHTML = `
      <div style="padding: 20px; background: #fff; min-height: 500px;">
        <div style="background: linear-gradient(to right, #7c3aed, #4f46e5); color: white; padding: 16px; border-radius: 8px 8px 0 0; margin: -20px -20px 20px -20px;">
          <h2 style="margin: 0; font-size: 18px;">Synapse Capture</h2>
        </div>
        <div style="padding: 20px;">
          <h3 style="color: #374151; margin-bottom: 16px;">Extension Error</h3>
          <p style="color: #666; font-size: 14px;">The extension UI failed to load. This might be due to:</p>
          <ul style="color: #666; font-size: 14px; text-align: left;">
            <li>Missing build files</li>
            <li>React not loading properly</li>
            <li>Extension needs to be rebuilt</li>
          </ul>
          <p style="color: #666; font-size: 14px; margin-top: 20px;">
            <strong>To use the extension:</strong><br>
            Try reloading the extension or check the browser console for errors.
          </p>
        </div>
      </div>
    `;
  }
}, 3000);
