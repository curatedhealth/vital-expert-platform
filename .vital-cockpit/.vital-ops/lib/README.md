# lib/ - Shared Libraries

Reusable code libraries for scripts and tools.

## Structure

```
lib/
├── shell/      - Shell script libraries
├── python/     - Python libraries
└── node/       - Node.js libraries
```

## Shell Libraries (`lib/shell/`)

Common shell functions for scripts:

```bash
# In your script
source "$(dirname "$0")/../../lib/shell/common.sh"
source "$(dirname "$0")/../../lib/shell/logging.sh"

# Use library functions
log_info "Starting deployment..."
validate_environment "production"
```

## Python Libraries (`lib/python/`)

Shared Python modules:

```python
# In your Python script
import sys
sys.path.append('../lib/python')
from vital_ops import logger, config

logger.info("Starting process...")
```

## Node.js Libraries (`lib/node/`)

Shared Node.js modules:

```javascript
// In your Node script
const { logger, config } = require('../../lib/node/vital-ops');

logger.info('Starting process...');
```

## Best Practices

- Keep libraries focused and modular
- Document all functions with comments
- Write tests for library functions
- Version libraries appropriately
- Don't include environment-specific code

