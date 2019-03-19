import os
import json

# Import config file
try:
    with open('config.json', 'r') as f:
        config = json.load(f)
except:
    config = None

print('---> Setting DB environment variables')
print('')

# Set environment variables
if 'DB_USER_NAME' not in os.environ and config is not None:
    os.environ['DB_USER_NAME'] = config['DB_USER_NAME']
if 'DB_PASSWORD' not in os.environ and config is not None:
    os.environ['DB_PASSWORD'] = config['DB_PASSWORD']
if 'DB_NAME' not in os.environ and config is not None:
    os.environ['DB_NAME'] = config['DB_NAME']
if 'DB_PORT' not in os.environ and config is not None:
    os.environ['DB_PORT'] = config['DB_PORT']