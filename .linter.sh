#!/bin/bash
cd /home/kavia/workspace/code-generation/serpentquest-46498-06f8f166/serpentquest
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

