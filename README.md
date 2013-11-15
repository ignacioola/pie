pie
===

SVG pie chart.

Usage
-----

```javascript
pie = require("pie");

p = pie([1, 2, 3, 4]);

el = document.getElementById("parent");
el.appendChild(p.render());
```

Installation
------------

    component install ignacioola/pie

Or include the file:
    
    build/pie.standalone.js

API
---

### pie(data)

Builds a pie instance

### .size(width, height)

Set the pie's size.

### .render()

Renders the pie, returns the element.

Events
------

`pie` includes `EventEmitter`. Available events:

* 'hover' : raised when the mouse hovers a wedge.

