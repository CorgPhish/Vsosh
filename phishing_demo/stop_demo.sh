#!/bin/bash
echo "Останавливаем демонстрационный сервер CorgPhish..."
if ps -p 40042 > /dev/null; then
    kill 40042
    echo "Сервер остановлен."
else
    echo "Сервер уже остановлен."
fi
