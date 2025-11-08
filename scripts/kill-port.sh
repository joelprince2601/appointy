#!/bin/bash
# Script to kill process on port 3001
PORT=3001
PID=$(lsof -ti:$PORT)

if [ -z "$PID" ]; then
    echo "No process found using port $PORT"
else
    echo "Found process $PID using port $PORT"
    kill -9 $PID
    echo "Process $PID killed successfully"
fi

