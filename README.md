# async-browser-disk-cache

Testing how SQLite can be run in a browser environment using web workers to implement an asynchronous disk cache solution to support larger cache data. By running SQLite in a web worker, database operations happen off the main thread, preventing UI freezes.
