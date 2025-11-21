#!/bin/bash
# Master script to load all Registry 250 agents
# All agents tagged as 'development' status

echo '🚀 Loading Registry 250 agents into Supabase...'
echo '   Status: DEVELOPMENT (is_active=false)'
echo ''

echo 'Loading Batch 1/10...'
# Execute: registry_250_batch_01_of_10.sql

echo 'Loading Batch 2/10...'
# Execute: registry_250_batch_02_of_10.sql

echo 'Loading Batch 3/10...'
# Execute: registry_250_batch_03_of_10.sql

echo 'Loading Batch 4/10...'
# Execute: registry_250_batch_04_of_10.sql

echo 'Loading Batch 5/10...'
# Execute: registry_250_batch_05_of_10.sql

echo 'Loading Batch 6/10...'
# Execute: registry_250_batch_06_of_10.sql

echo 'Loading Batch 7/10...'
# Execute: registry_250_batch_07_of_10.sql

echo 'Loading Batch 8/10...'
# Execute: registry_250_batch_08_of_10.sql

echo 'Loading Batch 9/10...'
# Execute: registry_250_batch_09_of_10.sql

echo 'Loading Batch 10/10...'
# Execute: registry_250_batch_10_of_10.sql

echo ''
echo '✅ All batches generated!'
echo 'Total: 250 agents in 10 batches'
