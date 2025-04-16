// Define config to locate wasm file
const config = {
    locateFile: filename => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/${filename}`
  };
  
  // Import SQL.js with specific configuration
  self.importScripts('https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/sql-wasm.js');
  
  let db;
  
  // Initialize with the config
  initSqlJs(config).then(SQL => {
    db = new SQL.Database();
    self.postMessage({ type: 'ready' });
  }).catch(err => {
    self.postMessage({ type: 'error', error: `SQL.js initialization failed: ${err.message}` });
    console.error('SQL.js initialization failed:', err);
  });
  
  self.onmessage = (e) => {
    const { action, payload, requestId } = e.data;
  
    try {
      if (action === 'exec') {
        db.exec(payload);
        self.postMessage({ type: 'exec-done', requestId });
      }
  
      if (action === 'insert') {
        // Use prepared statement with parameter binding
        const stmt = db.prepare('INSERT INTO items (content) VALUES (?)');
        stmt.run([payload]); // Pass parameters as array
        stmt.free();
        self.postMessage({ type: 'insert-done' });
      }
  
      if (action === 'select') {
        const results = db.exec(payload);
        console.log('Select results:', results); // Debug output
        self.postMessage({ type: 'select-result', data: results, requestId });
      }
    } catch (err) {
      self.postMessage({ type: 'error', error: err.message });
      console.error('Worker error:', err);
    }
  };